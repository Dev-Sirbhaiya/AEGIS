"""
Audio event classification using PANNs (Cnn14).

Detects 527 sound classes from AudioSet, filtered to security-relevant ones.
"""
import numpy as np
from typing import List
from dataclasses import dataclass
from config.settings import settings

SECURITY_LABELS = {
    0: "Speech", 1: "Male speech", 2: "Female speech",
    19: "Shout", 20: "Scream", 21: "Yell", 22: "Children shouting",
    24: "Crying", 25: "Sobbing",
    72: "Alarm", 73: "Alarm clock", 77: "Siren",
    78: "Civil defense siren", 79: "Fire alarm", 80: "Smoke detector",
    288: "Gunshot", 289: "Machine gun",
    399: "Glass", 400: "Shattering",
    427: "Explosion", 428: "Boom",
    307: "Dog", 308: "Dog bark",
    134: "Run", 135: "Walk, footsteps",
    367: "Crash", 340: "Vehicle horn",
}


@dataclass
class AudioClassification:
    label: str
    confidence: float
    class_index: int


class PANNsClassifier:
    def __init__(self):
        self.model = None
        self._loaded = False

    def load(self):
        """Load PANNs Cnn14 model."""
        try:
            import torch
            from panns_inference import AudioTagging
            self.model = AudioTagging(
                checkpoint_path=None,
                device="cuda" if torch.cuda.is_available() else "cpu"
            )
            self._loaded = True
            print("PANNs model loaded (panns_inference)")
        except ImportError:
            print("panns_inference not installed. Using mock audio classifier.")
            self._loaded = False
        except Exception as e:
            print(f"PANNs load failed: {e}. Using mock classifier.")
            self._loaded = False

    def classify(self, audio_path: str, top_k: int = 5) -> List[AudioClassification]:
        """Classify audio file. Returns top_k security-relevant labels."""
        if self._loaded and self.model is not None:
            return self._classify_real(audio_path, top_k)
        else:
            return self._classify_mock(audio_path, top_k)

    def _classify_real(self, audio_path: str, top_k: int) -> List[AudioClassification]:
        import librosa
        audio, sr = librosa.load(audio_path, sr=32000, mono=True)
        if len(audio) < 32000:
            audio = np.pad(audio, (0, 32000 - len(audio)))

        clipwise_output, _ = self.model.inference(audio[np.newaxis, :])
        probs = clipwise_output[0]

        results = []
        for idx, label in SECURITY_LABELS.items():
            if idx < len(probs):
                results.append(AudioClassification(label=label, confidence=float(probs[idx]), class_index=idx))

        results.sort(key=lambda x: x.confidence, reverse=True)
        return results[:top_k]

    def _classify_mock(self, audio_path: str, top_k: int) -> List[AudioClassification]:
        """Mock classifier for demo."""
        path_lower = audio_path.lower()
        if "distress" in path_lower or "help" in path_lower:
            return [
                AudioClassification("Scream", 0.85, 20),
                AudioClassification("Speech", 0.78, 0),
                AudioClassification("Crying", 0.45, 24),
            ][:top_k]
        elif "alarm" in path_lower:
            return [
                AudioClassification("Fire alarm", 0.92, 79),
                AudioClassification("Siren", 0.67, 77),
                AudioClassification("Alarm", 0.55, 72),
            ][:top_k]
        elif "gunshot" in path_lower or "explosion" in path_lower:
            return [
                AudioClassification("Gunshot", 0.91, 288),
                AudioClassification("Explosion", 0.72, 427),
            ][:top_k]
        else:
            return [
                AudioClassification("Speech", 0.72, 0),
                AudioClassification("Walk, footsteps", 0.35, 135),
            ][:top_k]
