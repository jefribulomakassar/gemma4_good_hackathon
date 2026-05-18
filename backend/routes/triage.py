# backend/routes/triage.py
from flask import Blueprint, request, jsonify, current_app
from middleware.auth import require_auth
from middleware.hmac_verify import require_hmac
from middleware.rate_limit import limiter
from services.gemma_client import run_inference
from services.prompt_builder import build_triage_prompt
from services.response_parser import parse_triage_response

triage_bp = Blueprint('triage', __name__)

REQUIRED_FIELDS = {'age', 'sex', 'symptoms'}

@triage_bp.post('/triage')
@limiter.limit('5 per 10 seconds')
@require_auth
@require_hmac
def triage():
    data = request.get_json(silent=True)

    # ── Validate input ────────────────────────────────────
    if not data:
        return jsonify({'error': 'Request body kosong'}), 400

    missing = REQUIRED_FIELDS - set(data.keys())
    if missing:
        return jsonify({'error': f'Field wajib tidak ada: {", ".join(missing)}'}), 400

    age = data.get('age')
    if not isinstance(age, (int, float)) or not (0 <= age <= 120):
        return jsonify({'error': 'Usia tidak valid'}), 400

    sex = data.get('sex', '')
    if sex not in ('Laki-laki', 'Perempuan'):
        return jsonify({'error': 'Jenis kelamin tidak valid'}), 400

    symptoms = data.get('symptoms', '').strip()
    if not symptoms:
        return jsonify({'error': 'Gejala tidak boleh kosong'}), 400

    temp = data.get('temp')

    # ── Build prompt ──────────────────────────────────────
    prompt = build_triage_prompt({
        'age': age,
        'sex': sex,
        'symptoms': symptoms,
        'temp': temp,
    })

    # ── Run inference ─────────────────────────────────────
    try:
        raw_output = run_inference(
            prompt=prompt,
            ollama_url=current_app.config['OLLAMA_URL'],
            model=current_app.config['OLLAMA_MODEL'],
        )
    except Exception as e:
        current_app.logger.error(f'Inference error: {e}')
        return jsonify({'error': 'Model tidak tersedia, coba lagi'}), 503

    # ── Parse + validate response ─────────────────────────
    result = parse_triage_response(raw_output)
    if result is None:
        return jsonify({'error': 'Output model tidak valid'}), 502

    current_app.logger.info(
        f'Triage selesai | level={result["triage_level"]} '
        f'| kader={getattr(request, "kader_id", "-")} '
        f'| confidence={result.get("confidence")}'
    )

    return jsonify(result), 200