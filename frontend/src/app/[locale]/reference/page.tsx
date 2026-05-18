'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/navigation'
import OfflineBanner from '@/components/OfflineBanner'

interface Disease {
  name: string
  symptoms: string[]
  actions: string[]
  red_flags: string[]
  drugs: string[]
}

interface ReferenceData {
  diseases: Disease[]
  last_updated: string
}

export default function ReferencePage() {
  const t = useTranslations('reference')
  const router = useRouter()
  const [data, setData] = useState<ReferenceData | null>(null)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadReference() }, [])

  const loadReference = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reference`)
      const json = await res.json()
      setData(json)
    } catch {
      const cached = localStorage.getItem('reference_cache')
      if (cached) setData(JSON.parse(cached))
    } finally {
      setLoading(false)
    }
  }

  const filtered = data?.diseases.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.symptoms.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  ) ?? []

  const toggle = (name: string) =>
    setExpanded((prev) => (prev === name ? null : name))

  return (
    <main className="min-h-screen bg-gray-50">
      <OfflineBanner />
      <header className="bg-green-700 text-white px-5 pt-12 pb-5">
        <button onClick={() => router.replace('/')} className="text-green-200 text-sm mb-3 flex items-center gap-1">
          {t('back')}
        </button>
        <h1 className="text-xl font-bold">{t('title')}</h1>
        <div className="mt-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-white/15 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/20 transition-all"
          />
        </div>
      </header>

      <div className="px-5 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">{t('loading')}</div>
        ) : !data ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📡</p>
            <p className="text-gray-500 text-sm">{t('offline_unavailable')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{t('no_results')}</div>
        ) : (
          filtered.map((disease) => (
            <div key={disease.name} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggle(disease.name)}
                className="w-full flex items-center justify-between px-4 py-4 text-left"
              >
                <span className="font-semibold text-gray-800 text-sm">{disease.name}</span>
                <span className="text-gray-400 text-lg">{expanded === disease.name ? '−' : '+'}</span>
              </button>
              {expanded === disease.name && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                  <Section title={`🩺 ${t('symptoms')}`} items={disease.symptoms} color="blue" />
                  <Section title={`✅ ${t('immediate_actions')}`} items={disease.actions} color="green" />
                  <Section title={`🚨 ${t('refer_when')}`} items={disease.red_flags} color="red" />
                  <Section title={`💊 ${t('drugs')}`} items={disease.drugs} color="purple" />
                </div>
              )}
            </div>
          ))
        )}
        {data && (
          <p className="text-center text-gray-400 text-xs pb-6">
            Diperbarui: {new Date(data.last_updated).toLocaleDateString('id-ID')}
          </p>
        )}
      </div>
    </main>
  )
}

function Section({ title, items, color }: {
  title: string
  items: string[]
  color: 'blue' | 'green' | 'red' | 'purple'
}) {
  const bg = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  }[color]

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className={`text-xs px-3 py-1.5 rounded-lg ${bg}`}>{item}</li>
        ))}
      </ul>
    </div>
  )
}