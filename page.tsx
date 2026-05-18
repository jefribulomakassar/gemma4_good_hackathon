// frontend/app/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const [kaderId, setKaderId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!kaderId.trim()) {
      setError('ID Kader wajib diisi')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kader_id: kaderId, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Login gagal')
      }

      const { token } = await res.json()
      localStorage.setItem('jwt_token', token)
      localStorage.setItem('kader_id', kaderId)
      router.push('/triage')
    } catch (err: any) {
      // Offline fallback — allow login with just kader ID
      if (!navigator.onLine) {
        localStorage.setItem('kader_id', kaderId)
        localStorage.setItem('jwt_token', 'offline-mode')
        router.push('/triage')
        return
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-14 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-400/20 border border-green-400/30 mb-4">
          <span className="text-3xl">🏥</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          PuskesmasAI
        </h1>
        <p className="text-green-300 text-sm mt-1">
          Asisten Triase Kesehatan · Offline-First
        </p>
      </header>

      {/* Login Card */}
      <div className="flex-1 flex items-start justify-center px-5 pt-4">
        <div className="w-full max-w-sm">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl">
            <h2 className="text-white font-semibold text-lg mb-1">
              Masuk sebagai Kader
            </h2>
            <p className="text-green-200/70 text-xs mb-5">
              Masuk dengan ID kader Anda untuk mulai triase
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-green-200 text-xs font-medium mb-1.5">
                  ID Kader
                </label>
                <input
                  type="text"
                  value={kaderId}
                  onChange={(e) => setKaderId(e.target.value)}
                  placeholder="Contoh: KDR-2024-001"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-green-400 focus:bg-white/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-green-200 text-xs font-medium mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-green-400 focus:bg-white/15 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2.5">
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-700 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors text-sm shadow-lg shadow-green-900/40"
              >
                {loading ? 'Memverifikasi...' : 'Masuk & Mulai Triase →'}
              </button>
            </form>

            {/* Offline hint */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-center text-green-300/60 text-xs">
                📵 Tidak ada internet? Masuk dengan ID kader saja —
                <br />AI tetap bekerja secara offline.
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/history"
              className="flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 rounded-xl px-4 py-3 text-green-200 text-xs font-medium transition-colors"
            >
              <span>📋</span>
              <span>Riwayat Pasien</span>
            </Link>
            <Link
              href="/reference"
              className="flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/15 rounded-xl px-4 py-3 text-green-200 text-xs font-medium transition-colors"
            >
              <span>📖</span>
              <span>Referensi Medis</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-green-400/40 text-xs">
          PuskesmasAI · Gemma 4 E4B · Offline-First · MIT License
        </p>
      </footer>
    </main>
  )
}