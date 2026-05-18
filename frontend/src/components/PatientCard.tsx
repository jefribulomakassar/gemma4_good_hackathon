// frontend/components/PatientCard.tsx
'use client'

import { PatientRecord } from '@/lib/db'

const LEVEL_STYLE = {
  GREEN:  { badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  icon: '🟢' },
  YELLOW: { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400', icon: '🟡' },
  ORANGE: { badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', icon: '🟠' },
  RED:    { badge: 'bg-red-100 text-red-700',       dot: 'bg-red-500',    icon: '🔴' },
}

export default function PatientCard({ record }: { record: PatientRecord }) {
  const level = record.triage_level as keyof typeof LEVEL_STYLE
  const style = LEVEL_STYLE[level] ?? LEVEL_STYLE.GREEN

  const date = new Date(record.timestamp)
  const dateStr = date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-4 shadow-sm">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{style.icon}</span>
          <div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
              {record.triage_level}
            </span>
          </div>
        </div>

        {/* Sync status */}
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            record.synced
              ? 'bg-gray-100 text-gray-400'
              : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
          }`}
        >
          {record.synced ? '☁️ Tersinkron' : '⏳ Belum sync'}
        </span>
      </div>

      {/* Patient info */}
      <div className="mt-3 flex gap-3">
        <Chip label={`${record.patient_age} tahun`} />
        <Chip label={record.patient_sex} />
      </div>

      {/* Symptoms */}
      <p className="mt-2.5 text-xs text-gray-600 leading-relaxed line-clamp-2">
        {record.symptoms}
      </p>

      {/* Recommendation */}
      <p className="mt-1.5 text-xs font-medium text-gray-700 line-clamp-1">
        → {record.recommendation}
      </p>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {dateStr} · {timeStr}
        </p>
        <p className="text-xs text-gray-400">
          Kader: {record.kader_id}
        </p>
      </div>
    </div>
  )
}

function Chip({ label }: { label: string }) {
  return (
    <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full">
      {label}
    </span>
  )
}