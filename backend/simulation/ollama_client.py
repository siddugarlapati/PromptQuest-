import httpx
import asyncio
from typing import Optional

OLLAMA_BASE = "http://localhost:11434"
DEFAULT_MODEL = "llama3.2"  # fallback: tinyllama


async def is_ollama_available() -> bool:
    """Check if Ollama is running locally."""
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            r = await client.get(f"{OLLAMA_BASE}/api/tags")
            return r.status_code == 200
    except Exception:
        return False


async def get_available_models() -> list[str]:
    """Return list of locally available Ollama models."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{OLLAMA_BASE}/api/tags")
            if r.status_code == 200:
                data = r.json()
                return [m["name"] for m in data.get("models", [])]
    except Exception:
        pass
    return []


async def generate(prompt: str, model: Optional[str] = None, system: Optional[str] = None) -> dict:
    """
    Generate a response from local Ollama.
    Returns dict with 'response', 'model', 'success', 'error'.
    """
    if not model:
        models = await get_available_models()
        model = models[0] if models else DEFAULT_MODEL

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": 512,
        }
    }
    if system:
        payload["system"] = system

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(f"{OLLAMA_BASE}/api/generate", json=payload)
            if r.status_code == 200:
                data = r.json()
                return {
                    "success": True,
                    "response": data.get("response", ""),
                    "model": model,
                    "total_duration_ms": round(data.get("total_duration", 0) / 1e6, 0),
                    "error": None
                }
            else:
                return {"success": False, "response": "", "model": model,
                        "error": f"Ollama returned HTTP {r.status_code}"}
    except httpx.ConnectError:
        return {"success": False, "response": "", "model": model,
                "error": "Ollama is not running. Start it with: ollama serve"}
    except httpx.TimeoutException:
        return {"success": False, "response": "", "model": model,
                "error": "Ollama request timed out. Try a smaller model like tinyllama."}
    except Exception as e:
        return {"success": False, "response": "", "model": model, "error": str(e)}
