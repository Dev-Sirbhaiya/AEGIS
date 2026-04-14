"""Generate heatmap overlays for anomaly visualization."""
import numpy as np
from pathlib import Path


def generate_heatmap_overlay(
    frame: np.ndarray,
    heatmap: np.ndarray,
    alpha: float = 0.4,
    output_path: str = None,
) -> str:
    """
    Blend anomaly heatmap onto the original frame.

    Args:
        frame: Original frame (H, W, 3) BGR
        heatmap: Anomaly heatmap (H, W, 3)
        alpha: Blend factor (0=frame only, 1=heatmap only)
        output_path: Where to save the overlay image

    Returns:
        Path to saved overlay image
    """
    try:
        import cv2

        # Resize heatmap to match frame if needed
        if heatmap.shape[:2] != frame.shape[:2]:
            heatmap = cv2.resize(heatmap, (frame.shape[1], frame.shape[0]))

        # Apply colormap if heatmap is single-channel
        if len(heatmap.shape) == 2:
            heatmap = cv2.applyColorMap(heatmap.astype(np.uint8), cv2.COLORMAP_JET)

        overlay = cv2.addWeighted(frame, 1 - alpha, heatmap, alpha, 0)

        if output_path:
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(output_path, overlay)
            return output_path

        # Auto-generate path
        auto_path = "data/demo/heatmap_overlay.jpg"
        Path(auto_path).parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(auto_path, overlay)
        return auto_path

    except ImportError:
        return ""
