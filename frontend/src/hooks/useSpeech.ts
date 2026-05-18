// frontend/hooks/useSpeech.ts
'use client'

import { useEffect, useRef, useState } from 'react'

interface UseSpeechOptions {
  onResult: (text: string) => void
  lang?: string
}

interface UseSpeechReturn {
  listening: boolean
  supported: boolean
  start: () => void
  stop: () => void
}

export function useSpeech({
  onResult,
  lang = 'id-ID',
}: UseSpeechOptions): UseSpeechReturn {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    setSupported(true)

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0]?.[0]?.transcript ?? ''
      if (transcript) onResult(transcript)
    }

    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [lang, onResult])

  const start = () => {
    if (!recognitionRef.current || listening) return
    recognitionRef.current.start()
    setListening(true)
  }

  const stop = () => {
    if (!recognitionRef.current || !listening) return
    recognitionRef.current.stop()
    setListening(false)
  }

  return { listening, supported, start, stop }
}