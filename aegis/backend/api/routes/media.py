"""Demo media endpoints — serves video and audio for demo/dev mode.

Maps actual Changi camera IDs from the knowledge graph to location-appropriate
video + airport ambience audio.
"""
import os
import re
from fastapi import APIRouter
from config.settings import settings

router = APIRouter()

DEMO_DIR = os.path.join(settings.DATA_DIR, "demo")

# Per-zone media: matches camera ID prefix -> (video, audio) pair.
# Each zone gets a distinct video + location-appropriate airport audio.
# Multiple cameras within a zone still share the zone's video but we vary
# them slightly by camera number via VIDEO_VARIANTS_BY_ZONE.
ZONE_MEDIA = {
    # T2 Boarding Gate B4 — airside gate area
    "CAM_T2_B4":       {"video": "boarding_gate.mp4",     "audio": "announcement_ding.wav"},
    # T2 Lift Lobby B3 — quiet public lobby
    "CAM_T2_LIFT_B3":  {"video": "rolling_corridor.mp4",  "audio": "people_ambience.wav"},
    # T3 Cargo Bay C — freight / conveyor / jet noise
    "CAM_T3_CARGO_C":  {"video": "luggage_conveyor.mp4",  "audio": "jet_arrival.wav"},
    # T1 Check-in Row G — check-in counters, busy crowd
    "CAM_T1_CKG":      {"video": "checkin_counter.mp4",   "audio": "departures_hall.wav"},
    # T3 Arrival Hall — arrivals, crowds
    "CAM_T3_ARR":      {"video": "arrival_hall.mp4",      "audio": "terminal_crowd.wav"},
    # T4 Security Screening A — screening checkpoint
    "CAM_T4_SCR_A":    {"video": "security_screening.mp4", "audio": "departures_hall.wav"},
}

# When a zone has multiple cameras, rotate through secondary videos so each
# camera feels distinct. Falls back to zone default if no variant for that index.
VIDEO_VARIANTS_BY_ZONE = {
    "CAM_T2_B4":      ["boarding_gate.mp4",    "terminal_corridor.mp4", "rolling_corridor.mp4"],
    "CAM_T2_LIFT_B3": ["rolling_corridor.mp4", "terminal_corridor.mp4"],
    "CAM_T3_CARGO_C": ["luggage_conveyor.mp4", "rolling_corridor.mp4", "terminal_corridor.mp4"],
    "CAM_T1_CKG":     ["checkin_counter.mp4",  "arrival_hall.mp4",     "terminal_corridor.mp4", "rolling_corridor.mp4"],
    "CAM_T3_ARR":     ["arrival_hall.mp4",     "terminal_corridor.mp4", "rolling_corridor.mp4", "checkin_counter.mp4", "luggage_conveyor.mp4"],
    "CAM_T4_SCR_A":   ["security_screening.mp4", "checkin_counter.mp4", "terminal_corridor.mp4"],
}

DEFAULT_MEDIA = {"video": "terminal_corridor.mp4", "audio": "terminal_crowd.wav"}

# Pre-compute prefix order once at module load (longest first so e.g.
# CAM_T2_LIFT_B3 wins over a shorter CAM_T2_* prefix).
_PREFIX_ORDER = sorted(ZONE_MEDIA.keys(), key=len, reverse=True)


def _resolve_media(camera_id: str) -> dict:
    """Resolve a camera ID to {video, audio} via zone prefix matching."""
    for zone_prefix in _PREFIX_ORDER:
        if camera_id.startswith(zone_prefix):
            media = dict(ZONE_MEDIA[zone_prefix])
            # Pick variant by trailing camera index
            m = re.search(r"_(\d+)$", camera_id)
            if m:
                idx = int(m.group(1)) - 1
                variants = VIDEO_VARIANTS_BY_ZONE.get(zone_prefix, [])
                if variants and 0 <= idx < len(variants):
                    media["video"] = variants[idx]
            return media
    return dict(DEFAULT_MEDIA)


def verify_media_files() -> list[str]:
    """Return filenames referenced by the map that don't exist on disk.
    Called at startup so missing downloads surface immediately instead of
    silently 404-ing in the browser.
    """
    videos_dir = os.path.join(DEMO_DIR, "videos")
    audio_dir = os.path.join(DEMO_DIR, "audio")
    expected_videos = {DEFAULT_MEDIA["video"]}
    expected_audio = {DEFAULT_MEDIA["audio"]}
    for m in ZONE_MEDIA.values():
        expected_videos.add(m["video"])
        expected_audio.add(m["audio"])
    for variants in VIDEO_VARIANTS_BY_ZONE.values():
        expected_videos.update(variants)
    for a in DEMO_AUDIO:
        expected_audio.add(a["file"])

    missing: list[str] = []
    for v in sorted(expected_videos):
        if not os.path.exists(os.path.join(videos_dir, v)):
            missing.append(f"videos/{v}")
    for a in sorted(expected_audio):
        if not os.path.exists(os.path.join(audio_dir, a)):
            missing.append(f"audio/{a}")
    return missing


# Demo audio files with metadata
DEMO_AUDIO = [
    {"id": "departures_hall",   "file": "departures_hall.wav",   "label": "Airport Departures Hall Ambience", "duration": 130},
    {"id": "terminal_crowd",    "file": "terminal_crowd.wav",    "label": "Busy Terminal Crowd",              "duration": 66},
    {"id": "announcement_ding", "file": "announcement_ding.wav", "label": "PA Announcement Ding",             "duration": 4},
    {"id": "people_ambience",   "file": "people_ambience.wav",   "label": "People in Airport Ambience",       "duration": 23},
    {"id": "jet_arrival",       "file": "jet_arrival.wav",       "label": "Jet Plane Arrival",                "duration": 13},
]


@router.get("/videos")
async def list_demo_videos():
    """List available demo video files."""
    videos_dir = os.path.join(DEMO_DIR, "videos")
    files = []
    if os.path.isdir(videos_dir):
        files = [f for f in os.listdir(videos_dir) if f.endswith(".mp4")]
    return {"videos": files, "base_url": "/media/videos"}


@router.get("/videos/{camera_id}")
async def get_camera_demo_video(camera_id: str):
    """Get demo video + audio URL for a specific camera (zone-aware)."""
    media = _resolve_media(camera_id)
    return {
        "camera_id": camera_id,
        "video_url": f"/media/videos/{media['video']}",
        "audio_url": f"/media/audio/{media['audio']}",
        "type": "mp4",
    }


@router.get("/audio")
async def list_demo_audio():
    """List available demo audio files."""
    return {
        "audio": [
            {**a, "url": f"/media/audio/{a['file']}"} for a in DEMO_AUDIO
        ]
    }
