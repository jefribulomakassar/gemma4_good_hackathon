// frontend/components/SymptomForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signRequest } from '@/lib/crypto'
import { savePatientRecord } from '@/lib/db'
import VoiceInput from '@/components/VoiceInput'
import { useTranslations } from 'next-intl'

interface FormData {
  age: string
  sex: string
  temp: string
  symptoms: string
}

const INITIAL: FormData = { age: '', sex: '', temp: '', symptoms: '' }

export default function SymptomForm() {
  const t = useTranslations('triage')  // ← harus PALING ATAS, sebelum useState
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const onVoiceResult = (text: string) =>
    setForm((prev) => ({ ...prev, symptoms: prev.symptoms + ' ' + text }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.age || !form.sex || !form.symptoms.trim()) {
      setError(t('error_generic'))
      return
    }
    setLoading(true)
    setError('')

    const payload = {
      age: Number(form.age),
      sex: form.sex,
      temp: form.temp || null,
      symptoms: form.symptoms.trim(),
    }

    try {
      const token = localStorage.getItem('jwt_token') ?? ''
      const isOffline = token === 'offline-mode' || !navigator.onLine

      let result

      if (isOffline) {
        // Offline: call local Flask directly (localhost:5000)
        const res = await fetch('http://localhost:5000/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        result = await res.json()
      } else {
        // Online: call Vercel-proxied backend with JWT + HMAC
        const body = JSON.stringify(payload)
        const signature = await signRequest(body)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/triage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Signature': signature,
          },
          body,
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Triage gagal')
        }
        result = await res.json()
      }

      // Save to IndexedDB
      await savePatientRecord({
        kader_id: localStorage.getItem('kader_id') ?? 'unknown',
        patient_age: payload.age,
        patient_sex: payload.sex,
        symptoms: payload.symptoms,
        triage_level: result.triage_level,
        recommendation: result.recommendation,
        timestamp: Date.now(),
        synced: false,
      })

      // Pass result to result page via sessionStorage
      sessionStorage.setItem(
        'triage_result',
        JSON.stringify({
          ...result,
          patient_age: payload.age,
          patient_sex: payload.sex,
          symptoms: payload.symptoms,
          timestamp: Date.now(),
        })
      )

      router.push('/result')
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            {t('age')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={form.age}
            onChange={set('age')}
            placeholder={t('age_placeholder')}
            min={0} max={120}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            {t('sex')} <span className="text-red-500">*</span>
          </label>
          <select
            value={form.sex}
            onChange={set('sex')}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white"
          >
            <option value="">Pilih</option>
            <option value="male">{t('male')}</option>
            <option value="female">{t('female')}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          {t('temperature')}
        </label>
        <input
          type="number"
          value={form.temp}
          onChange={set('temp')}
          placeholder="contoh: 38.5"
          step="0.1" min={30} max={45}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-600">
            {t('symptoms')} <span className="text-red-500">*</span>
          </label>
          <VoiceInput onResult={onVoiceResult} />
        </div>
        <textarea
          value={form.symptoms}
          onChange={set('symptoms')}
          placeholder={t('symptoms_placeholder')}
          rows={5} maxLength={500}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white resize-none"
        />
        <p className="text-right text-xs text-gray-400 mt-1">
          {form.symptoms.length}/500
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-xs">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white font-semibold py-4 rounded-xl text-sm transition-colors shadow-md shadow-green-200"
      >
        {loading ? `⏳ ${t('analyzing')}` : `🔍 ${t('analyze')}`}
      </button>
    </form>
  )
}