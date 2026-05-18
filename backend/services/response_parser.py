# backend/services/response_parser.py
import json
import re
from typing import Optional

VALID_LEVELS = {'GREEN', 'YELLOW', 'ORANGE', 'RED'}

REQUIRED_KEYS = {
    'triage_level',
    'recommendation',
    'possible_conditions',
    'immediate_actions',
    'red_flags',
    'confidence',
    'disclaimer',
}

def extract_json(raw: str) -> Optional[str]:
    # Coba ambil JSON dari dalam blok ```json ... ```
    match = re.search(r'```json\s*(.*?)\s*```', raw, re.DOTALL)
    if match:
        return match.group(1)

    # Coba ambil JSON langsung dari { ... }
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        return match.group(0)

    return None

def parse_triage_response(raw: str) -> Optional[dict]:
    if not raw or not raw.strip():
        return None

    json_str = extract_json(raw)
    if not json_str:
        return None

    try:
        data = json.loads(json_str)
    except json.JSONDecodeError:
        return None

    # Validasi required keys
    if not REQUIRED_KEYS.issubset(data.keys()):
        return None

    # Validasi triage level
    if data['triage_level'] not in VALID_LEVELS:
        return None

    # Validasi + clamp confidence
    try:
        data['confidence'] = round(
            max(0.0, min(1.0, float(data['confidence']))), 2
        )
    except (TypeError, ValueError):
        data['confidence'] = 0.0

    # Pastikan list fields memang list
    for key in ('possible_conditions', 'immediate_actions', 'red_flags'):
        if not isinstance(data[key], list):
            data[key] = [str(data[key])]

    # Truncate string fields
    data['recommendation'] = str(data['recommendation'])[:300]
    data['disclaimer']     = str(data['disclaimer'])[:200]

    return data