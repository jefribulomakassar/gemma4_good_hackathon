// frontend/app/result/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TriageResult from '@/components/TriageResult'
import ReferralNote from '@/components/ReferralNote'
import OfflineBanner from '@/components/OfflineBanner'

export interface TriageData {
  triage_level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'
  recommendation: string
  possible_conditions: string[]
  immediate_actions: string[]
  red_flags: string[]
  confidence: number
  disclaimer: string
  patient_age: number
  patient_sex: string
  symptoms: string
  timestamp: string
}

export default function ResultPage() {
  const router = useRouter()
  const [data, setData] = useState<TriageData | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('triage_result')
    if (!raw) {
      router.replace('/triage')
      return
    }
    try {
      setData(JSON.parse(raw))
    } catch {
      router.replace('/triage')
    }
  }, [router])

  if (!data) return null

  return (
    <main className="min-h-screen bg-gray-50">
      <OfflineBanner />

      {/* Header */}
      <header className="bg-green-700 text-white px-5 pt-12 pb-5">
        <button
          onClick={() => router.replace('/triage')}
          className="text-green-200 text-sm mb-3 flex items-center gap-1"
        >
          ← Triase Baru
        </button>
        <h1 className="text-xl font-bold">Hasil Triase</h1>
        <p className="text-green-200 text-xs mt-0.5">
          {new Date(data.timestamp).toLocaleString('id-ID')}
        </p>
      </header>

      <div className="px-5 py-6 space-y-4">
        <TriageResult data={data} />
        <ReferralNote data={data} />

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              sessionStorage.removeItem('triage_result')
              router.push('/triage')
            }}
            className="bg-green-600 hover:bg-green-500 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
          >
            + Triase Baru
          </button>
          <button
            onClick={() => router.push('/history')}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl text-sm transition-colors"
          >
            📋 Riwayat
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-gray-400 text-xs px-4 pb-4">
          {data.disclaimer}
        </p>
      </div>
    </main>
  )
}