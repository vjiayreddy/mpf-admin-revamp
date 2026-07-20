"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type SpeechRecognitionResultLike = {
  isFinal: boolean
  0: { transcript: string }
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

type SpeechRecognitionErrorEventLike = {
  error: string
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onstart: ((ev: Event) => void) | null
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null
  onend: ((ev: Event) => void) | null
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function browserSupportsSpeechRecognition() {
  return getSpeechRecognitionCtor() != null
}

type UseSpeechToTextOptions = {
  lang?: string
  onFinalTranscript: (transcript: string) => void
  onUnsupported?: () => void
  onPermissionDenied?: () => void
}

export function useSpeechToText({
  lang = "en-IN",
  onFinalTranscript,
  onUnsupported,
  onPermissionDenied,
}: UseSpeechToTextOptions) {
  const [isListening, setIsListening] = useState(false)
  const isSupported = browserSupportsSpeechRecognition()

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const stoppedManuallyRef = useRef(false)
  const onFinalTranscriptRef = useRef(onFinalTranscript)
  const onUnsupportedRef = useRef(onUnsupported)
  const onPermissionDeniedRef = useRef(onPermissionDenied)

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript
  }, [onFinalTranscript])

  useEffect(() => {
    onUnsupportedRef.current = onUnsupported
  }, [onUnsupported])

  useEffect(() => {
    onPermissionDeniedRef.current = onPermissionDenied
  }, [onPermissionDenied])

  const stop = useCallback(() => {
    stoppedManuallyRef.current = true
    const recognition = recognitionRef.current
    if (recognition) {
      try {
        recognition.onend = null
        recognition.stop()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      onUnsupportedRef.current?.()
      return
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }

    const recognition = new Ctor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = lang
    recognition.maxAlternatives = 1

    stoppedManuallyRef.current = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        return
      }
      stoppedManuallyRef.current = true
      setIsListening(false)
      recognitionRef.current = null

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        onPermissionDeniedRef.current?.()
      }
    }

    recognition.onend = () => {
      if (
        !stoppedManuallyRef.current &&
        recognitionRef.current === recognition
      ) {
        try {
          recognition.start()
          return
        } catch {
          // fall through
        }
      }
      setIsListening(false)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result?.isFinal) {
          finalTranscript += result[0]?.transcript ?? ""
        }
      }
      const trimmed = finalTranscript.trim()
      if (trimmed) {
        onFinalTranscriptRef.current(trimmed)
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      setIsListening(false)
      recognitionRef.current = null
    }
  }, [lang])

  const toggle = useCallback(() => {
    if (isListening) {
      stop()
    } else {
      start()
    }
  }, [isListening, start, stop])

  useEffect(() => {
    return () => {
      stoppedManuallyRef.current = true
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null
          recognitionRef.current.stop()
        } catch {
          // ignore
        }
        recognitionRef.current = null
      }
    }
  }, [])

  return {
    isSupported,
    isListening,
    start,
    stop,
    toggle,
  }
}
