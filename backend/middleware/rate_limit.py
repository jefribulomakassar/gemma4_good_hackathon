# backend/middleware/rate_limit.py
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=['200 per day', '30 per minute'],
    storage_uri='memory://',
)

def init_limiter(app: Flask) -> None:
    limiter.init_app(app)