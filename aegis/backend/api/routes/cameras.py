"""Camera management endpoints."""
from fastapi import APIRouter, HTTPException

router = APIRouter()


def get_knowledge_graph():
    from main import knowledge_graph
    return knowledge_graph


@router.get("/")
async def list_cameras():
    """List all cameras from the knowledge graph."""
    kg = get_knowledge_graph()
    if not kg:
        return {"cameras": []}
    cameras = kg.get_all_cameras()
    return {"cameras": cameras, "count": len(cameras)}


@router.get("/{camera_id}/feed")
async def get_camera_feed(camera_id: str):
    """Get camera feed URL (HLS stream)."""
    kg = get_knowledge_graph()
    location_id = kg.find_location_by_camera(camera_id) if kg else None

    return {
        "camera_id": camera_id,
        "location_id": location_id,
        "feed_url": f"/streams/{camera_id}/index.m3u8",
        "status": "active",
        "protocol": "HLS",
    }


@router.get("/{camera_id}/frames")
async def get_camera_frames(camera_id: str, limit: int = 10):
    """Get recent extracted frames from a camera."""
    import os
    from config.settings import settings

    frames_dir = os.path.join(settings.FRAME_OUTPUT_PATH, camera_id)
    frames = []

    if os.path.exists(frames_dir):
        files = sorted(
            [f for f in os.listdir(frames_dir) if f.endswith(".jpg")],
            reverse=True,
        )[:limit]
        frames = [{"path": f"/frames/{camera_id}/{f}", "filename": f} for f in files]

    return {
        "camera_id": camera_id,
        "frames": frames,
        "count": len(frames),
    }
