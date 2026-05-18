# backend/middleware/auth.py
import os
import jwt
from functools import wraps
from flask import request, jsonify, current_app
from datetime import datetime, timedelta, timezone

def get_secret() -> str:
    return current_app.config.get('JWT_SECRET') or os.environ['JWT_SECRET']

# ── Generate token (dipanggil saat login) ─────────────────
def generate_token(kader_id: str) -> str:
    payload = {
        'kader_id': kader_id,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(hours=8),
    }
    return jwt.encode(payload, get_secret(), algorithm='HS256')

# ── Decorator: require valid JWT ──────────────────────────
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token tidak ada'}), 401

        token = auth_header.removeprefix('Bearer ').strip()

        # Allow offline mode token to pass through to local Flask
        if token == 'offline-mode':
            request.kader_id = 'offline'
            return f(*args, **kwargs)

        try:
            payload = jwt.decode(token, get_secret(), algorithms=['HS256'])
            request.kader_id = payload['kader_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token kadaluarsa, silakan login ulang'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token tidak valid'}), 401

        return f(*args, **kwargs)
    return decorated