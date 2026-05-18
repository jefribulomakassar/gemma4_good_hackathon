'use client'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/navigation'
import SymptomForm from '@/components/SymptomForm'
import OfflineBanner from '@/components/OfflineBanner'

export default function TriagePage() {
  const router = useRouter()
  const t = useTranslations('common')  // tambah di atas, sudah ada useTranslations('triage')

  return (
    <main className="min-h-screen bg-gray-50">
      <OfflineBanner />
      <header className="bg-green-700 text-white px-5 pt-12 pb-5">
        <button onClick={() => router.replace('/')} className="text-green-200 text-sm mb-3 flex items-center gap-1">
          {t('back')}
        </button>
        <h1 className="text-xl font-bold">{t('title')}</h1>
        <p className="text-green-200 text-xs mt-0.5">
          {t('symptoms_placeholder')}
        </p>
      </header>
      <div className="px-5 py-6">
        <SymptomForm />
      </div>
    </main>
  )
}