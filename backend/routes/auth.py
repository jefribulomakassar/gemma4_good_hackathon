# backend/routes/auth.py
import os
from flask import Blueprint, request, jsonify
from middleware.auth import generate_token

auth_bp = Blueprint('auth', __name__)

# Simulasi database kader — ganti dengan DB sungguhan di produksi
KADER_DB = {
    'KDR-2024-001': 'password123',
    'KDR-2024-002': 'password456',
}

@auth_bp.post('/login')
def login():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({'error': 'Request body kosong'}), 400

    kader_id = data.get('kader_id', '').strip()
    password  = data.get('password', '').strip()

    if not kader_id:
        return jsonify({'error': 'ID Kader wajib diisi'}), 400

    stored_password = KADER_DB.get(kader_id)

    if stored_password is None:
        return jsonify({'error': 'ID Kader tidak ditemukan'}), 401

    if stored_password != password:
        return jsonify({'error': 'Password salah'}), 401

    token = generate_token(kader_id)
    return jsonify({'token': token, 'kader_id': kader_id}), 200