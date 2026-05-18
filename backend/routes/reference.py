# backend/routes/reference.py
import json
import os
from flask import Blueprint, jsonify

reference_bp = Blueprint('reference', __name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'medical_kb.json')

def load_reference() -> dict:
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

@reference_bp.get('/reference')
def reference():
    try:
        data = load_reference()
        response = jsonify(data)
        # Cache 7 hari di browser / service worker
        response.headers['Cache-Control'] = 'public, max-age=604800'
        return response, 200
    except FileNotFoundError:
        return jsonify({'error': 'Data referensi tidak ditemukan'}), 404
    except json.JSONDecodeError:
        return jsonify({'error': 'Data referensi rusak'}), 500