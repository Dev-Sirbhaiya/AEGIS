"""
Speech-to-text using OpenAI Whisper.

Usage:
    stt = WhisperSTT()
    stt.load()
    result = stt.transcribe("path/to/audio.wav")
"""
from dataclasses import dataclass, field
from typing import List, Optional
from config.settings import settings


@dataclass
class TranscriptionSegment:
    start: float
    end: float
    text: str


@dataclass
class TranscriptionResult:
    text: str
    language: str
    segments: List[TranscriptionSegment]
    duration: float


class WhisperSTT:
    def __init__(self):
        self.model = None
        self._loaded = False
        self.model_size = settings.WHISPER_MODEL

    def load(self):
        """Load Whisper model."""
        try:
            import whisper
            self.model = whisper.load_model(self.model_size)
            self._loaded = True
            print(f"Whisper model loaded: {self.model_size}")
        except Exception as e:
            print(f"Whisper load failed: {e}. Using mock STT.")
            self._loaded = False

    def transcribe(self, audio_path: str, language: str = None) -> TranscriptionResult:
        """Transcribe audio file to text."""
        if self._loaded and self.model is not None:
            return self._transcribe_real(audio_path, language)
        return self._transcribe_mock(audio_path)

    def _transcribe_real(self, audio_path: str, language: str = None) -> TranscriptionResult:
        options = {"task": "transcribe"}
        if language:
            options["language"] = language

        result = self.model.transcribe(audio_path, **options)

        segments = [
            TranscriptionSegment(
                start=seg["start"],
                end=seg["end"],
                text=seg["text"].strip(),
            )
            for seg in result.get("segments", [])
        ]

        return TranscriptionResult(
            text=result["text"].strip(),
            language=result.get("language", "en"),
            segments=segments,
            duration=segments[-1].end if segments else 0.0,
        )

    def _transcribe_mock(self, audio_path: str) -> TranscriptionResult:
        """Mock transcription for demo."""
        path_lower = audio_path.lower()
        if "distress" in path_lower:
            text = "Help! Someone collapsed near Gate B4! Please send help immediately!"
        elif "alarm" in path_lower:
            text = "[Alarm sound detected - no speech content]"
        elif "threat" in path_lower:
            text = "There's someone with a weapon near the check-in area!"
        else:
            text = "This is a test audio recording for the AEGIS system."

        return TranscriptionResult(
            text=text,
            language="en",
            segments=[TranscriptionSegment(0.0, 5.0, text)],
            duration=5.0,
        )
