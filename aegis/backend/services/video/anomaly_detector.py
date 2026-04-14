"""
Video anomaly detection using Anomalib.

Usage:
    detector = VideoAnomalyDetector()
    result = detector.detect(frame)  # numpy array (H, W, 3) BGR
    # result.anomaly_score: float 0.0-1.0
    # result.heatmap: numpy array (H, W, 3)
    # result.is_anomalous: bool
"""
import numpy as np
from pathlib import Path
from PIL import Image
from typing import Optional
from dataclasses import dataclass
from config.settings import settings


@dataclass
class DetectionResult:
    anomaly_score: float
    is_anomalous: bool
    heatmap: Optional[np.ndarray]
    frame: np.ndarray
    bbox: Optional[list]


class VideoAnomalyDetector:
    """Wraps Anomalib for video frame anomaly detection."""

    def __init__(self):
        self.model = None
        self.threshold = settings.ANOMALY_THRESHOLD
        self.model_name = settings.ANOMALIB_MODEL
        self._loaded = False

    def load(self):
        """Load the Anomalib model. Call this once at startup."""
        try:
            from anomalib.deploy import OpenVINOInferencer
            model_path = Path(settings.MODELS_DIR) / "anomalib" / "model.onnx"
            if model_path.exists():
                self.model = OpenVINOInferencer(path=model_path, device="CPU")
                self._loaded = True
                print(f"Anomalib model loaded: {self.model_name} (OpenVINO)")
                return
        except ImportError:
            pass

        try:
            from anomalib.engine import Engine
            from anomalib.models import EfficientAd, Patchcore, Padim

            model_map = {
                "efficient_ad": EfficientAd,
                "patchcore": Patchcore,
                "padim": Padim,
            }
            ModelClass = model_map.get(self.model_name, EfficientAd)

            ckpt_path = Path(settings.MODELS_DIR) / "anomalib" / "model.ckpt"
            if ckpt_path.exists():
                self.model = ModelClass.load_from_checkpoint(str(ckpt_path))
                self._loaded = True
                print(f"Anomalib model loaded: {self.model_name} (checkpoint)")
                return

            print(f"No pre-trained Anomalib model found. Using mock detector.")
            self._loaded = False
        except Exception as e:
            print(f"Anomalib load failed: {e}. Using mock detector.")
            self._loaded = False

    def detect(self, frame: np.ndarray) -> DetectionResult:
        """Detect anomalies in a single frame (H, W, 3) BGR."""
        if self._loaded and self.model is not None:
            return self._detect_real(frame)
        else:
            return self._detect_mock(frame)

    def _detect_real(self, frame: np.ndarray) -> DetectionResult:
        """Real detection using loaded Anomalib model."""
        import cv2
        resized = cv2.resize(frame, (256, 256))
        img = Image.fromarray(cv2.cvtColor(resized, cv2.COLOR_BGR2RGB))

        predictions = self.model.predict(img)
        score = float(predictions.pred_score)
        heatmap = np.array(predictions.anomaly_map) if hasattr(predictions, 'anomaly_map') else None

        bbox = None
        if heatmap is not None:
            binary = (heatmap > 0.5).astype(np.uint8) * 255
            if len(binary.shape) == 3:
                binary = binary[:, :, 0]
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                largest = max(contours, key=cv2.contourArea)
                x, y, w, h = cv2.boundingRect(largest)
                scale_x = frame.shape[1] / 256
                scale_y = frame.shape[0] / 256
                bbox = [int(x * scale_x), int(y * scale_y),
                        int((x + w) * scale_x), int((y + h) * scale_y)]

        return DetectionResult(
            anomaly_score=score,
            is_anomalous=score > self.threshold,
            heatmap=heatmap,
            frame=frame,
            bbox=bbox,
        )

    def _detect_mock(self, frame: np.ndarray) -> DetectionResult:
        """Mock detector using simple heuristics for demo."""
        import cv2
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        variance = np.var(gray) / 10000.0
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.sum(edges > 0) / edges.size

        mock_score = min((variance * 0.3 + edge_density * 0.7), 1.0)

        h, w = gray.shape
        heatmap = np.zeros((h, w, 3), dtype=np.uint8)
        block_h, block_w = h // 8, w // 8
        for i in range(8):
            for j in range(8):
                block = edges[i*block_h:(i+1)*block_h, j*block_w:(j+1)*block_w]
                intensity = int(np.sum(block > 0) / block.size * 255)
                heatmap[i*block_h:(i+1)*block_h, j*block_w:(j+1)*block_w] = [0, 0, intensity]

        return DetectionResult(
            anomaly_score=mock_score,
            is_anomalous=mock_score > self.threshold,
            heatmap=heatmap,
            frame=frame,
            bbox=None,
        )
