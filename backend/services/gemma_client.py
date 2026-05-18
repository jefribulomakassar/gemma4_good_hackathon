# backend/services/gemma_client.py
import requests
import json

TIMEOUT = 60  # detik — Gemma 4 E4B butuh waktu di hardware rendah

def run_inference(prompt: str, ollama_url: str, model: str) -> str:
    url = f"{ollama_url.rstrip('/')}/api/generate"

    payload = {
        'model': model,
        'prompt': prompt,
        'stream': False,
        'options': {
            'temperature': 0.2,      # rendah — kita butuh output konsisten
            'top_p': 0.9,
            'repeat_penalty': 1.1,
            'num_predict': 512,      # cukup untuk JSON triage
        },
    }

    try:
        res = requests.post(url, json=payload, timeout=TIMEOUT)
        res.raise_for_status()
        data = res.json()
        return data.get('response', '')
    except requests.Timeout:
        raise RuntimeError('Model timeout — inference terlalu lama')
    except requests.ConnectionError:
        raise RuntimeError('Ollama tidak berjalan atau tidak dapat dijangkau')
    except requests.HTTPError as e:
        raise RuntimeError(f'Ollama HTTP error: {e}')
    except json.JSONDecodeError:
        raise RuntimeError('Response Ollama bukan JSON valid')