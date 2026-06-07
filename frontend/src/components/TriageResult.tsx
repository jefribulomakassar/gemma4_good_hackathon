'use client'

import { TriageOutput } from '@/app/[locale]/history/page'

const LEVEL_CONFIG = {
  GREEN: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    badge: 'bg-green-500',
    text: 'text-green-700',
    icon: '🟢',
    label: 'HIJAU — Tidak Mendesak',
    desc: 'Pasien dapat ditangani di rumah dengan panduan kader.',
  },
  YELLOW: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    badge: 'bg-yellow-400',
    text: 'text-yellow-700',
    icon: '🟡',
    label: 'KUNING — Perlu Dipantau',
    desc: 'Rujuk ke Puskesmas dalam 24 jam.',
  },
  ORANGE: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    badge: 'bg-orange-500',
    text: 'text-orange-700',
    icon: '🟠',
    label: 'ORANYE — Segera Dirujuk',
    desc: 'Rujuk ke Puskesmas sekarang juga.',
  },
  RED: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    badge: 'bg-red-600',
    text: 'text-red-700',
    icon: '🔴',
    label: 'MERAH — Darurat',
    desc: 'Hubungi ambulans — rujuk ke RS segera.',
  },
}

export default function TriageResult({ data }: { data: TriageOutput }) {
  const cfg = LEVEL_CONFIG[data.triage_level]

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden`}>
      {/* Level banner */}
      <div className={`${cfg.badge} px-5 py-4 text-white`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{cfg.icon}</span>
          <div>
            <p className="font-bold text-base leading-tight">{cfg.label}</p>
            <p className="text-white/80 text-xs mt-0.5">{cfg.desc}</p>
          </div>
        </div>
        {/* Confidence */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-full h-1.5">
            <div
              className="bg-white rounded-full h-1.5 transition-all"
              style={{ width: `${Math.round(data.confidence * 100)}%` }}
            />
          </div>
          <span className="text-white/70 text-xs">
            {Math.round(data.confidence * 100)}% yakin
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Recommendation */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Rekomendasi
          </p>
          <p className={`text-sm font-medium ${cfg.text}`}>{data.recommendation}</p>
        </div>

        {/* Patient info */}
        <div className="flex gap-3">
          <Chip label={`${data.patient_age} tahun`} />
          <Chip label={data.patient_sex} />
        </div>

        {/* Possible conditions */}
        {data.possible_conditions?.length > 0 && (
          <Section title="🩺 Kemungkinan Penyakit">
            <div className="flex flex-wrap gap-2">
              {data.possible_conditions.map((c, i) => (
                <span
                  key={i}
                  className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Immediate actions */}
        {data.immediate_actions?.length > 0 && (
          <Section title="✅ Tindakan Segera">
            <ul className="space-y-1.5">
              {data.immediate_actions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="text-green-500 mt-0.5 shrink-0">•</span>
                  {a}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Red flags */}
        {data.red_flags?.length > 0 && (
          <Section title="🚨 Tanda Bahaya">
            <ul className="space-y-1.5">
              {data.red_flags.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-red-600">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  {f}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Symptoms summary */}
        <Section title="📝 Gejala Dilaporkan">
          <p className="text-xs text-gray-600 leading-relaxed">{data.symptoms}</p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {title}
      </p>
      {children}
    </div>
  )
}

function Chip({ label }: { label: string }) {
  return (
    <span className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
      {label}
    </span>
  )
}
