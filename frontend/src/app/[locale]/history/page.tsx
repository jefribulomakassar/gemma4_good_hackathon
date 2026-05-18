'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import TriageResult from '@/components/TriageResult'
import ReferralNote from '@/components/ReferralNote'

export interface TriageOutput {
  triage_level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'
  recommendation: string
  possible_conditions: string[]
  immediate_actions: string[]
  red_flags: string[]
  confidence: number
  disclaimer: string
  patient_age: number      // tambah
  patient_sex: string      // tambah
  symptoms: string         // tambah
  timestamp: string        // tambah
}

export default function ResultPage() {
  const t = useTranslations('result')
  const router = useRouter()
  const { locale } = useParams()
  const [result, setResult] = useState<TriageOutput | null>(null)
  const [showReferral, setShowReferral] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('triage_result')
    if (!raw) {
      router.replace(`/${locale}/triage`)
      return
    }
    setResult(JSON.parse(raw))
  }, [])

  if (!result) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-700 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.push(`/${locale}/triage`)} className="text-white text-xl">←</button>
        <h1 className="text-white font-bold text-lg">{t('title')}</h1>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        <TriageResult data={result} />

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowReferral(true)}
            className="flex-1 bg-green-700 text-white py-3 rounded-xl font-medium text-sm"
          >
            {t('generate_referral')}
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('triage_result')
              router.push(`/${locale}/triage`)
            }}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium text-sm"
          >
            {t('new_patient')}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center px-2">{result.disclaimer}</p>
      </div>

      {/* Referral note modal */}
      {showReferral && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">{t('referral_note')}</h2>
              <button onClick={() => setShowReferral(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <ReferralNote data={result} />
          </div>
        </div>
      )}
    </div>
  )
}