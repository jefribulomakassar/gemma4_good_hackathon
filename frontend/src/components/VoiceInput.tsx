// frontend/components/VoiceInput.tsx
'use client'

import { useSpeech } from '@/hooks/useSpeech'

interface Props {
  onResult: (text: string) => void
}

export default function VoiceInput({ onResult }: Props) {
  const { listening, supported, start, stop } = useSpeech({ onResult })

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
        listening
          ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-green-50 hover:border-green-300 hover:text-green-600'
      }`}
    >
      <span>{listening ? '⏹' : '🎙️'}</span>
      <span>{listening ? 'Berhenti' : 'Suara'}</span>
    </button>
  )
}