"""
Zero-shot audio classification using CLAP.

Unlike PANNs (fixed 527 classes), CLAP can classify audio against
ANY text description.
"""
import numpy as np
from typing import List, Tuple
from config.settings import settings

DEFAULT_SECURITY_QUERIES = [
    "distress call for help",
    "physical altercation or fight",
    "gunshot or explosion",
    "glass breaking or shattering",
    "fire alarm or smoke alarm",
    "crowd panic or stampede",
    "person crying or sobbing in distress",
    "unauthorized alarm or intrusion alert",
    "vehicle crash or collision",
    "normal ambient noise",
]


class CLAPClassifier:
    def __init__(self):
        self.model = None
        self.processor = None
        self._loaded = False

    def load(self):
        """Load CLAP model from HuggingFace."""
        try:
            from transformers import ClapModel, ClapProcessor
            import torch

            model_name = "laion/clap-htsat-unfused"
            self.processor = ClapProcessor.from_pretrained(model_name)
            self.model = ClapModel.from_pretrained(model_name)
            self.model.eval()

            if torch.cuda.is_available():
                self.model = self.model.cuda()

            self._loaded = True
            print("CLAP model loaded")
        except Exception as e:
            print(f"CLAP load failed: {e}. Using mock.")
            self._loaded = False

    def query(self, audio_path: str, text_query: str) -> float:
        """Score how well an audio clip matches a text description. Returns 0.0-1.0."""
        if self._loaded:
            return self._query_real(audio_path, text_query)
        return 0.5

    def classify_against_queries(
        self, audio_path: str, queries: List[str] = None
    ) -> List[Tuple[str, float]]:
        """Classify audio against multiple text queries. Returns sorted (query, score) pairs."""
        if queries is None:
            queries = DEFAULT_SECURITY_QUERIES

        results = [(q, self.query(audio_path, q)) for q in queries]
        results.sort(key=lambda x: x[1], reverse=True)
        return results

    def _query_real(self, audio_path: str, text_query: str) -> float:
        """Real CLAP inference."""
        import librosa
        import torch

        audio, sr = librosa.load(audio_path, sr=48000, mono=True)

        inputs = self.processor(
            text=[text_query],
            audios=[audio],
            sampling_rate=48000,
            return_tensors="pt",
            padding=True,
        )

        if torch.cuda.is_available():
            inputs = {k: v.cuda() for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)

        similarity = torch.nn.functional.cosine_similarity(
            outputs.text_embeds, outputs.audio_embeds
        )
        score = (similarity.item() + 1) / 2
        return score
