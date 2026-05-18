# backend/routes/sync.py
import os
import libsql_experimental as libsql
from flask import Blueprint, request, jsonify, current_app
from middleware.auth import require_auth

sync_bp = Blueprint('sync', __name__)

def get_turso_conn():
    url   = os.environ['TURSO_DATABASE_URL']
    token = os.environ['TURSO_AUTH_TOKEN']
    return libsql.connect(database=url, auth_token=token)

def ensure_table(conn):
    conn.execute('''
        CREATE TABLE IF NOT EXISTS patient_records (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            kader_id      TEXT    NOT NULL,
            patient_age   INTEGER NOT NULL,
            patient_sex   TEXT    NOT NULL,
            symptoms      TEXT    NOT NULL,
            triage_level  TEXT    NOT NULL,
            recommendation TEXT   NOT NULL,
            timestamp     INTEGER NOT NULL,
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()

@sync_bp.post('/sync')
@require_auth
def sync():
    data = request.get_json(silent=True)

    if not data or 'records' not in data:
        return jsonify({'error': 'Field records tidak ada'}), 400

    records = data['records']
    if not isinstance(records, list) or len(records) == 0:
        return jsonify({'synced_ids': []}), 200

    # Max 100 records per request
    if len(records) > 100:
        return jsonify({'error': 'Maksimal 100 record per sync'}), 400

    REQUIRED = {'kader_id', 'patient_age', 'patient_sex',
                'symptoms', 'triage_level', 'recommendation', 'timestamp'}

    try:
        conn = get_turso_conn()
        ensure_table(conn)

        synced_ids = []

        for rec in records:
            # Validate fields
            if not REQUIRED.issubset(rec.keys()):
                continue

            # Enforce kader_id matches token
            if rec['kader_id'] != request.kader_id:
                continue

            conn.execute('''
                INSERT INTO patient_records
                    (kader_id, patient_age, patient_sex, symptoms,
                     triage_level, recommendation, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                str(rec['kader_id']),
                int(rec['patient_age']),
                str(rec['patient_sex']),
                str(rec['symptoms'])[:500],
                str(rec['triage_level']),
                str(rec['recommendation']),
                int(rec['timestamp']),
            ))

            local_id = rec.get('id')
            if local_id is not None:
                synced_ids.append(local_id)

        conn.commit()

        current_app.logger.info(
            f'Sync selesai | kader={request.kader_id} | count={len(synced_ids)}'
        )

        return jsonify({'synced_ids': synced_ids}), 200

    except Exception as e:
        current_app.logger.error(f'Sync error: {e}')
        return jsonify({'error': 'Sync gagal, coba lagi'}), 500