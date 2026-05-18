# backend/middleware/cors.py
import os
from flask import Flask
from flask_cors import CORS

def init_cors(app: Flask) -> None:
    allowed_origins = [
        origin.strip()
        for origin in os.environ.get(
            'ALLOWED_ORIGINS',
            'https://puskesmasai.vercel.app'
        ).split(',')
        if origin.strip()
    ]

    # Allow localhost in development
    if os.environ.get('FLASK_ENV') == 'development':
        allowed_origins += [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ]

    CORS(
        app,
        origins=allowed_origins,
        methods=['GET', 'POST', 'OPTIONS'],
        allow_headers=['Content-Type', 'Authorization', 'X-Signature'],
        max_age=86400,  # preflight cache 24 jam
    )