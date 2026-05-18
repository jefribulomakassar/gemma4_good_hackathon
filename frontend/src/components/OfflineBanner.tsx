// frontend/components/OfflineBanner.tsx
'use client'

import { useOffline } from '@/hooks/useOffline'

export default function OfflineBanner() {
  const isOffline = useOffline()

  if (!isOffline) return null

  return (
    <div className="bg-yellow-400 text-yellow-900 px-4 py-2 flex items-center justify-center gap-2">
      <span className="text-sm">📵</span>
      <p className="text-xs font-semibold">
        Offline — AI tetap bekerja secara lokal
      </p>
    </div>
  )
}