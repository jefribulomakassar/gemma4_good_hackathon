// frontend/lib/api.ts
import { signRequest } from '@/lib/crypto'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

function getToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('jwt_token') ?? ''
}

function isOfflineMode(): boolean {
  const token = getToken()
  return token === 'offline-mode' || !navigator.onLine
}

async function authHeaders(body?: string): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
  if (body) {
    headers['X-Signature'] = await signRequest(body)
  }
  return headers
}

// ── Triage ────────────────────────────────────────────────
export interface TriagePayload {
  age: number
  sex: string
  temp?: string | null
  symptoms: string
}

export async function postTriage(payload: TriagePayload) {
  const body = JSON.stringify(payload)

  if (isOfflineMode()) {
    const res = await fetch('http://localhost:5000/api/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    if (!res.ok) throw new Error('Triage lokal gagal')
    return res.json()
  }

  const res = await fetch(`${BASE_URL}/api/triage`, {
    method: 'POST',
    headers: await authHeaders(body),
    body,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Triage gagal')
  }
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────
export interface LoginPayload {
  kader_id: string
  password: string
}

export async function postLogin(payload: LoginPayload) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Login gagal')
  }
  return res.json() as Promise<{ token: string }>
}

// ── Reference ─────────────────────────────────────────────
export async function getReference() {
  try {
    const res = await fetch(`${BASE_URL}/api/reference`)
    if (!res.ok) throw new Error('Fetch gagal')
    const data = await res.json()
    // Cache untuk offline
    localStorage.setItem('reference_cache', JSON.stringify(data))
    return data
  } catch {
    const cached = localStorage.getItem('reference_cache')
    if (cached) return JSON.parse(cached)
    throw new Error('Referensi tidak tersedia offline')
  }
}

// ── Sync ──────────────────────────────────────────────────
export async function postSync(records: unknown[]) {
  const body = JSON.stringify({ records })
  const res = await fetch(`${BASE_URL}/api/sync`, {
    method: 'POST',
    headers: await authHeaders(body),
    body,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Sync gagal')
  }
  return res.json() as Promise<{ synced_ids: number[] }>
}