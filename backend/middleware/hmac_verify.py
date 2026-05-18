# backend/middleware/hmac_verify.py
import hmac
import hashlib
import os
from functools import wraps
from flask import request, jsonify, current_app

def get_secret() -> bytes:
    secret = current_app.config.get('HMAC_SECRET') or os.environ['HMAC_SECRET']
    return secret.encode()

def verify_hmac(body: bytes, signature: str) -> bool:
    expected = hmac.new(get_secret(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

# ── Decorator: require valid HMAC signature ───────────────
def require_hmac(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        signature = request.headers.get('X-Signature', '')

        if not signature:
            return jsonify({'error': 'Signature tidak ada'}), 401

        body = request.get_data()

        if not verify_hmac(body, signature):
            return jsonify({'error': 'Signature tidak valid'}), 401

        return f(*args, **kwargs)
    return decorated