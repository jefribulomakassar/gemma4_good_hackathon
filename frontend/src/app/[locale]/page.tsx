'use client'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import { useRouter, usePathname } from '@/navigation'  // ← ganti dari sini

export default function HomePage() {
  const t = useTranslations('home')
  const router = useRouter()
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-green-800 to-green-600">
      {/* Logo & Title */}
      <div className="text-center mb-10">
        <Image
          src="/icons/icon-192.png"
          alt="PuskesmasAI"
          width={96}
          height={96}
          className="mx-auto mb-4"
          style={{ filter: 'brightness(0) invert(1)', background: 'transparent' }}
        />
        <h1 className="text-3xl font-bold text-white">PuskesmasAI</h1>
        <p className="text-green-200 mt-2 text-sm">{t('subtitle')}</p>
      </div>

      {/* Main CTA */}
      <button
        onClick={() => router.push(`/triage`)}
        className="w-full max-w-sm bg-white text-green-800 font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
      >
        {t('start_triage')}
      </button>

      {/* Secondary actions */}
      <div className="flex gap-4 mt-4 w-full max-w-sm">
        <button
          onClick={() => router.push(`/history`)}
          className="flex-1 bg-green-700 text-white py-3 rounded-xl text-sm font-medium"
        >
          {t('history')}
        </button>
        <button
          onClick={() => router.push(`/reference`)}
          className="flex-1 bg-green-700 text-white py-3 rounded-xl text-sm font-medium"
        >
          {t('reference')}
        </button>
      </div>

      {/* Language switcher */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={() => router.replace(pathname, { locale: 'id' })}  // ← fix
          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
            locale === 'id' ? 'bg-white text-green-800' : 'bg-green-700 text-green-200'
          }`}
        >
          🇮🇩 ID
        </button>
        <button
          onClick={() => router.replace(pathname, { locale: 'en' })}  // ← fix
          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
            locale === 'en' ? 'bg-white text-green-800' : 'bg-green-700 text-green-200'
          }`}
        >
          🇬🇧 EN
        </button>
      </div>

      <p className="text-green-300 text-xs mt-8 text-center">{t('offline_note')}</p>
    </div>
  )
}