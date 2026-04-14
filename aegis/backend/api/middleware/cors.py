"""CORS configuration. Applied in main.py via FastAPI middleware."""
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "*",
]
