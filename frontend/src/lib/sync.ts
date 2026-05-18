// frontend/lib/sync.ts
import { getUnsyncedRecords, markAsSynced } from '@/lib/db'

const TURSO_URL = process.env.NEXT_PUBLIC_TURSO_URL ?? ''
const TURSO_TOKEN = process.env.NEXT_PUBLIC_TURSO_TOKEN ?? ''

export async function syncRecords(): Promise<number> {
  if (!navigator.onLine) return 0

  const unsynced = await getUnsyncedRecords()
  if (unsynced.length === 0) return 0

  const token = localStorage.getItem('jwt_token') ?? ''

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ records: unsynced }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? 'Sync gagal')
  }

  const { synced_ids } = await res.json()

  if (synced_ids?.length > 0) {
    await markAsSynced(synced_ids)
  }

  return synced_ids?.length ?? 0
}

// Auto-sync — dipanggil saat navigator.onLine berubah jadi true
export function initAutoSync(): () => void {
  const handler = () => {
    if (navigator.onLine) {
      syncRecords().catch(console.error)
    }
  }

  window.addEventListener('online', handler)

  // Cleanup function
  return () => window.removeEventListener('online', handler)
}