"""Audio processing utilities."""
import numpy as np
from typing import List, Tuple


def load_audio(path: str, sr: int = 32000) -> Tuple[np.ndarray, int]:
    """Load audio file at specified sample rate."""
    try:
        import librosa
        audio, sample_rate = librosa.load(path, sr=sr, mono=True)
        return audio, sample_rate
    except Exception as e:
        print(f"Failed to load audio {path}: {e}")
        return np.zeros(sr, dtype=np.float32), sr


def normalize_audio(audio: np.ndarray) -> np.ndarray:
    """Normalize audio to [-1, 1] range."""
    max_val = np.max(np.abs(audio))
    if max_val > 0:
        return audio / max_val
    return audio


def split_audio_chunks(audio: np.ndarray, sr: int, chunk_seconds: int = 10) -> List[np.ndarray]:
    """Split audio into fixed-length chunks."""
    chunk_size = sr * chunk_seconds
    chunks = []
    for i in range(0, len(audio), chunk_size):
        chunk = audio[i:i + chunk_size]
        if len(chunk) < chunk_size:
            chunk = np.pad(chunk, (0, chunk_size - len(chunk)))
        chunks.append(chunk)
    return chunks
