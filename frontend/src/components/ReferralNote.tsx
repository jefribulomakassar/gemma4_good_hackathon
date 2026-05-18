// frontend/components/ReferralNote.tsx
'use client'

import { useState } from 'react'
import { TriageOutput } from '@/app/[locale]/history/page'

export default function ReferralNote({ data }: { data: TriageOutput }) {
  const [copied, setCopied] = useState(false)

  const kaderId = typeof window !== 'undefined'
    ? localStorage.getItem('kader_id') ?? 'Tidak diketahui'
    : '-'

  const date = new Date(data.timestamp).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const noteText = `
SURAT RUJUKAN KADER POSYANDU
==============================
Tanggal   : ${date}
Kader ID  : ${kaderId}

DATA PASIEN
-----------
Usia      : ${data.patient_age} tahun
Jenis Kelamin : ${data.patient_sex}
Gejala    : ${data.symptoms}

HASIL TRIASE AI
---------------
Level     : ${data.triage_level}
Rekomendasi: ${data.recommendation}

Kemungkinan Penyakit:
${data.possible_conditions?.map((c) => `- ${c}`).join('\n') ?? '-'}

Tindakan yang Sudah Dilakukan:
${data.immediate_actions?.map((a) => `- ${a}`).join('\n') ?? '-'}

Tanda Bahaya yang Dipantau:
${data.red_flags?.map((f) => `- ${f}`).join('\n') ?? '-'}

==============================
${data.disclaimer}
Dibuat otomatis oleh PuskesmasAI · Gemma 4 E4B
`.trim()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(noteText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for older Android
      const el = document.createElement('textarea')
      el.value = noteText
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span>📄</span>
          <p className="text-sm font-semibold text-gray-700">Surat Rujukan</p>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
            copied
              ? 'bg-green-50 border-green-300 text-green-600'
              : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
          }`}
        >
          <span>{copied ? '✅' : '📋'}</span>
          <span>{copied ? 'Tersalin!' : 'Salin'}</span>
        </button>
      </div>

      {/* Note preview */}
      <pre className="px-4 py-4 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 max-h-56 overflow-y-auto">
        {noteText}
      </pre>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Salin teks ini untuk dikirim via WhatsApp ke petugas Puskesmas
        </p>
      </div>
    </div>
  )
}