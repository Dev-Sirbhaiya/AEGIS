"""
Text-to-speech for voice agent responses.

Primary: edge-tts (Microsoft, free, no API key needed)
Alternative: kokoro (open-source, requires GPU for best quality)
"""
import io
from config.settings import settings


class TTSEngine:
    def __init__(self):
        self.engine = settings.TTS_ENGINE

    async def speak(self, text: str, voice: str = None) -> bytes:
        """Convert text to speech audio bytes."""
        if self.engine == "edge_tts":
            return await self._speak_edge(text, voice)
        elif self.engine == "kokoro":
            return await self._speak_kokoro(text, voice)
        else:
            return await self._speak_edge(text, voice)

    async def _speak_edge(self, text: str, voice: str = None) -> bytes:
        """Use Microsoft Edge TTS (free, no API key)."""
        import edge_tts

        if voice is None:
            voice = settings.TTS_VOICE_EDGE

        communicate = edge_tts.Communicate(text, voice)
        audio_bytes = io.BytesIO()

        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes.write(chunk["data"])

        return audio_bytes.getvalue()

    async def _speak_kokoro(self, text: str, voice: str = None) -> bytes:
        """Use Kokoro TTS (open-source). Falls back to edge_tts if unavailable."""
        try:
            from kokoro import KPipeline
            import soundfile as sf
            import numpy as np

            pipeline = KPipeline(lang_code="a")
            generator = pipeline(text, voice=voice or settings.TTS_VOICE_KOKORO, speed=settings.TTS_VOICE_SPEED)

            all_audio = []
            for _, _, audio in generator:
                all_audio.append(audio)

            full_audio = np.concatenate(all_audio)

            buf = io.BytesIO()
            sf.write(buf, full_audio, settings.TTS_SAMPLE_RATE, format="WAV")
            return buf.getvalue()

        except ImportError:
            print("Kokoro not installed. Falling back to edge_tts.")
            return await self._speak_edge(text, voice)
