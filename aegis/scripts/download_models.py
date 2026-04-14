"""
Download AI model weights for AEGIS.

Run from backend directory:
    cd aegis/backend && python ../scripts/download_models.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/backend")

from config.settings import settings


def download_whisper(model_size: str = "base"):
    print(f"\n[Whisper] Downloading model: {model_size}")
    try:
        import whisper
        model = whisper.load_model(model_size)
        print(f"  Whisper {model_size} ready")
    except ImportError:
        print("  openai-whisper not installed. Run: pip install openai-whisper")
    except Exception as e:
        print(f"  Whisper download failed: {e}")


def download_sentence_transformers():
    print("\n[SentenceTransformers] Downloading all-MiniLM-L6-v2...")
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")
        print("  all-MiniLM-L6-v2 ready")
    except ImportError:
        print("  sentence-transformers not installed. Run: pip install sentence-transformers")
    except Exception as e:
        print(f"  SentenceTransformers download failed: {e}")


def download_clap():
    print("\n[CLAP] Downloading laion/clap-htsat-unfused...")
    try:
        from transformers import ClapModel, ClapProcessor
        ClapProcessor.from_pretrained("laion/clap-htsat-unfused")
        ClapModel.from_pretrained("laion/clap-htsat-unfused")
        print("  CLAP model ready")
    except ImportError:
        print("  transformers not installed. Run: pip install transformers")
    except Exception as e:
        print(f"  CLAP download failed: {e}")


def check_panns():
    print("\n[PANNs] Checking panns-inference installation...")
    try:
        import panns_inference
        print("  panns-inference installed. Model weights download on first use.")
        print("  Default weights: Cnn14_mAP=0.431.pth (~300MB, downloaded automatically)")
    except ImportError:
        print("  panns-inference not installed. Run: pip install panns-inference")


def check_anomalib():
    print("\n[Anomalib] Checking anomalib installation...")
    try:
        import anomalib
        print(f"  anomalib installed: {anomalib.__version__}")
        print("  Note: Anomalib requires training on custom data.")
        print("  See notebooks/01_anomalib_demo.ipynb for training instructions.")
    except ImportError:
        print("  anomalib not installed. Run: pip install anomalib")


if __name__ == "__main__":
    print("=== AEGIS Model Downloader ===")

    download_whisper(settings.WHISPER_MODEL)
    download_sentence_transformers()
    download_clap()
    check_panns()
    check_anomalib()

    print("\n=== Download Complete ===")
    print("Note: All AI services have mock fallbacks — AEGIS runs without any models downloaded.")
