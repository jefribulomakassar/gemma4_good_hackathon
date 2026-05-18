# backend/services/prompt_builder.py

BLOCKED_PATTERNS = [
    'ignore previous instructions',
    'ignore all instructions',
    'you are now',
    'forget everything',
    'system:',
    'assistant:',
    'user:',
    '<|im_start|>',
    '<|im_end|>',
    '###',
    'jailbreak',
]

def sanitize(text: str, max_len: int = 500) -> str:
    cleaned = text.strip()[:max_len]
    for pattern in BLOCKED_PATTERNS:
        if pattern.lower() in cleaned.lower():
            return '[INPUT DISANITASI]'
    return cleaned

def build_triage_prompt(data: dict) -> str:
    age      = int(data.get('age', 0))
    sex      = str(data.get('sex', ''))
    symptoms = sanitize(str(data.get('symptoms', '')))
    temp     = data.get('temp')

    temp_str = f'{temp} °C' if temp else 'tidak dicatat'

    return f"""Anda adalah asisten triase klinis untuk kader kesehatan komunitas Indonesia (Puskesmas/Posyandu).
Kader melaporkan pasien berikut:

- Usia       : {age} tahun
- Jenis Kelamin : {sex}
- Suhu Tubuh : {temp_str}
- Gejala     : {symptoms}

Tugas Anda:
1. Tentukan level triase berdasarkan gejala
2. Berikan rekomendasi tindakan yang jelas untuk kader non-medis
3. Sebutkan kemungkinan penyakit (maksimal 3)
4. Berikan tindakan segera yang bisa dilakukan kader
5. Sebutkan tanda bahaya yang harus diwaspadai

Aturan level triase:
- GREEN  : Tidak mendesak, bisa ditangani di rumah
- YELLOW : Perlu dipantau, rujuk ke Puskesmas dalam 24 jam
- ORANGE : Segera rujuk ke Puskesmas hari ini
- RED    : Darurat, hubungi ambulans sekarang

Balas HANYA dengan JSON valid dalam format berikut, tanpa teks lain:
{{
  "triage_level": "GREEN|YELLOW|ORANGE|RED",
  "recommendation": "instruksi singkat untuk kader",
  "possible_conditions": ["penyakit 1", "penyakit 2"],
  "immediate_actions": ["tindakan 1", "tindakan 2", "tindakan 3"],
  "red_flags": ["tanda bahaya 1", "tanda bahaya 2"],
  "confidence": 0.0,
  "disclaimer": "Ini adalah alat bantu keputusan, bukan pengganti dokter."
}}"""