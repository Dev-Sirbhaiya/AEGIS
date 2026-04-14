"""Extract frames from video files at a configurable FPS."""
import numpy as np
from typing import List
from config.settings import settings


def extract_frames(video_path: str, fps: int = None) -> List[np.ndarray]:
    """
    Extract frames from a video file at the configured FPS.

    Args:
        video_path: Path to video file
        fps: Frames per second to extract (default from settings)

    Returns:
        List of numpy arrays (H, W, 3) BGR
    """
    if fps is None:
        fps = settings.VIDEO_FPS

    try:
        import cv2
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Could not open video: {video_path}")
            return _mock_frames()

        video_fps = cap.get(cv2.CAP_PROP_FPS) or 30
        frame_interval = max(int(video_fps / fps), 1)

        frames = []
        frame_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            if frame_count % frame_interval == 0:
                frames.append(frame)
            frame_count += 1

        cap.release()
        return frames if frames else _mock_frames()

    except ImportError:
        print("OpenCV not available. Returning mock frames.")
        return _mock_frames()


def _mock_frames() -> List[np.ndarray]:
    """Return mock frames for demo when video is unavailable."""
    return [np.zeros((480, 640, 3), dtype=np.uint8) for _ in range(5)]
