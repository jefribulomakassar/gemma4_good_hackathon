// page.tsx
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <span className="text-5xl mb-4">📡</span>
      <h1 className="text-xl font-bold text-gray-800 mb-2">Tidak Ada Koneksi</h1>
      <p className="text-sm text-gray-500 text-center">
        Periksa koneksi internet kamu dan coba lagi.
      </p>
    </div>
  )
}