"""
AEGIS Backend — FastAPI Application Entry Point

This is the main entry point. It:
1. Creates the FastAPI app with CORS
2. Mounts all API routers
3. Initializes Socket.IO for real-time events
4. Connects to PostgreSQL and Redis on startup
5. Loads AI models and services on startup
"""
import os
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from config.settings import settings
from db.session import init_db
from api.routes import incidents, cameras, voice, simulation, reports, auth, health, media
from api.websocket.manager import sio
# Import for side-effect: registers `subscribe_camera`, `subscribe_simulation`,
# and `action:incident` handlers onto `sio`. Without this import those
# decorators never run and the handlers silently do not exist.
from api.websocket import events as _ws_events  # noqa: F401

# Global service instances — accessed by route dependencies
knowledge_graph = None
rag_pipeline = None
llm_client = None
fusion_engine = None
response_engine = None
call_manager = None
sim_engine = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    global knowledge_graph, rag_pipeline, llm_client, fusion_engine, response_engine, call_manager, sim_engine

    # Initialize database
    await init_db()
    print("Database initialized")

    # Seed default admin user if no users exist
    from db.session import async_session
    from models.user import User
    from sqlalchemy import select, func
    from passlib.hash import bcrypt as _bcrypt
    async with async_session() as _db:
        count = (await _db.execute(select(func.count()).select_from(User))).scalar_one()
        if count == 0:
            _db.add(User(
                username="admin",
                email="admin@aegis.local",
                hashed_password=_bcrypt.hash("admin"),
                role="admin",
                is_active=True,
            ))
            await _db.commit()
            print("Default admin user created (admin/admin)")
    print(f"LLM Provider: {settings.LLM_PROVIDER}")
    print(f"Anomaly model: {settings.ANOMALIB_MODEL}")
    print(f"Whisper model: {settings.WHISPER_MODEL}")

    # Load knowledge graph
    from services.knowledge.graph import KnowledgeGraph
    knowledge_graph = KnowledgeGraph()
    knowledge_graph.load()

    # Load RAG pipeline
    from services.intelligence.rag import RAGPipeline
    rag_pipeline = RAGPipeline()
    rag_pipeline.load()

    # Initialize LLM client
    from services.intelligence.llm_client import LLMClient
    llm_client = LLMClient()

    # Initialize fusion engine
    from services.fusion.engine import FusionEngine
    fusion_engine = FusionEngine(knowledge_graph=knowledge_graph)

    # Initialize response engine
    from services.intelligence.response_engine import ResponseEngine
    response_engine = ResponseEngine(rag=rag_pipeline, llm=llm_client, knowledge_graph=knowledge_graph)

    # Initialize voice agent and call manager
    from services.audio.whisper_stt import WhisperSTT
    from services.voice.tts import TTSEngine
    from services.voice.agent import VoiceAgent
    from services.voice.call_manager import CallManager

    stt = WhisperSTT()
    stt.load()
    tts = TTSEngine()
    voice_agent = VoiceAgent(stt=stt, tts=tts, llm=llm_client, knowledge_graph=knowledge_graph)
    call_manager = CallManager(agent=voice_agent)

    # Initialize simulation engine
    from services.simulation.generator import SimulationEngine
    sim_engine = SimulationEngine(llm_client=llm_client)
    sim_engine.load_scenarios()

    # Verify demo media files are present so any missing downloads surface
    # immediately instead of silently 404-ing in the browser.
    from api.routes.media import verify_media_files
    missing_media = verify_media_files()
    if missing_media:
        print(f"WARNING: {len(missing_media)} demo media files missing:")
        for path in missing_media:
            print(f"  - {path}")
    else:
        print("Demo media files verified")

    print("All AEGIS services initialized")

    yield

    # Shutdown
    print("Shutting down AEGIS")


app = FastAPI(
    title="AEGIS API",
    description="Adaptive Engagement & Guided Intelligence for Security",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False,
)

# CORS — allow frontend origin
_cors_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(cameras.router, prefix="/api/cameras", tags=["Cameras"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice Agent"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(media.router, prefix="/api/media", tags=["Demo Media"])

# Serve demo media files (videos and audio)
_demo_dir = os.path.join(settings.DATA_DIR, "demo")
if os.path.isdir(_demo_dir):
    app.mount("/media", StaticFiles(directory=_demo_dir), name="demo-media")

# Mount Socket.IO as a sub-app under /socket.io to avoid intercepting other routes
sio_asgi = socketio.ASGIApp(sio, socketio_path="/")
app.mount("/socket.io", sio_asgi)

# To run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
