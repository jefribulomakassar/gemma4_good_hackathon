# backend/app.py
import os
from flask import Flask
from dotenv import load_dotenv

from middleware.cors import init_cors
from middleware.rate_limit import init_limiter
from routes.triage import triage_bp
from routes.reference import reference_bp
from routes.sync import sync_bp

import logging
from logging import Filter

load_dotenv()

# ── Patient data log filter ───────────────────────────────
class PatientDataFilter(Filter):
    SENSITIVE_KEYS = {'symptoms', 'patient_name', 'age', 'sex', 'temp'}

    def filter(self, record):
        if hasattr(record, 'request_body') and isinstance(record.request_body, dict):
            for key in self.SENSITIVE_KEYS:
                record.request_body.pop(key, None)
        return True

# ── App factory ───────────────────────────────────────────
def create_app() -> Flask:
    app = Flask(__name__)

    # Config
    app.config['JWT_SECRET']   = os.environ['JWT_SECRET']
    app.config['HMAC_SECRET']  = os.environ['HMAC_SECRET']
    app.config['OLLAMA_URL']   = os.environ.get('OLLAMA_URL', 'http://localhost:11434')
    app.config['OLLAMA_MODEL'] = os.environ.get('OLLAMA_MODEL', 'gemma4:4b-instruct-q4_K_M')

    # Middleware
    init_cors(app)
    init_limiter(app)

    # Logging
    handler = logging.StreamHandler()
    handler.addFilter(PatientDataFilter())
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)

    # Blueprints
    app.register_blueprint(triage_bp,    url_prefix='/api')
    app.register_blueprint(reference_bp, url_prefix='/api')
    app.register_blueprint(sync_bp,      url_prefix='/api')

    # Auth blueprint (login)
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    @app.get('/health')
    def health():
        return {'status': 'ok', 'model': app.config['OLLAMA_MODEL']}

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=os.environ.get('FLASK_ENV') == 'development',
    )