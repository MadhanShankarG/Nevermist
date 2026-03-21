'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { isSpeechSupported, createRecognition } from '@/lib/speech'
import type { SpeechController } from '@/lib/speech'
import { useCaptureStore } from '@/store/capture'

export interface VoiceState {
  isRecording: boolean
  transcript: string
  error: string | null
  isSupported: boolean
  startRecording: () => void
  stopRecording: () => void
  retry: () => void
  clearError: () => void
}

const TYPEWRITER_INTERVAL_MS = 30

export function useVoice(): VoiceState {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  // Evaluated once on client — useState initialiser is skipped on SSR
  const [isSupported] = useState(isSpeechSupported)

  const controllerRef = useRef<SpeechController | null>(null)
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Tracks the full target value currently being typed — used to flash
  // the previous typewriter to completion when a new result arrives
  const pendingFullRef = useRef<string | null>(null)

  const setInputValue = useCaptureStore((s) => s.setInputValue)
  const setInputMode = useCaptureStore((s) => s.setInputMode)

  // Cleanup typewriter on unmount
  useEffect(() => {
    return () => {
      if (typewriterRef.current !== null) {
        clearInterval(typewriterRef.current)
      }
    }
  }, [])

  /**
   * Streams `text` character by character, appending to whatever is in the
   * input at the time of the call. Called once per final speech result —
   * onResult may fire multiple times during a session (one per utterance).
   *
   * If a previous typewriter is still mid-stream when a new result arrives,
   * it is flushed to its full value immediately before the new stream begins.
   * This prevents a mid-stream snapshot causing truncated output.
   */
  const startTypewriter = useCallback(
    (text: string) => {
      // Flush any in-progress typewriter to its full target value first.
      // Zustand set() is synchronous, so getState() will reflect this
      // immediately on the next line.
      if (typewriterRef.current !== null) {
        clearInterval(typewriterRef.current)
        typewriterRef.current = null
        if (pendingFullRef.current !== null) {
          setInputValue(pendingFullRef.current)
          pendingFullRef.current = null
        }
      }

      // Snapshot current input after any flush above
      const base = useCaptureStore.getState().inputValue
      const prefix = base ? base + ' ' : ''
      const fullTarget = prefix + text
      pendingFullRef.current = fullTarget

      let i = 0
      typewriterRef.current = setInterval(() => {
        i += 1
        setInputValue(prefix + text.slice(0, i))

        if (i >= text.length) {
          clearInterval(typewriterRef.current!)
          typewriterRef.current = null
          pendingFullRef.current = null
        }
      }, TYPEWRITER_INTERVAL_MS)
    },
    [setInputValue]
  )

  const startRecording = useCallback(() => {
    if (!isSupported) return

    setError(null)
    setTranscript('')
    setIsRecording(true)
    setInputMode('voice')

    controllerRef.current = createRecognition({
      onResult: (t) => {
        // May fire multiple times during a session — once per utterance.
        // Accumulate into the transcript state and stream each result
        // into the input via the typewriter (appending with a space).
        setTranscript((prev) => (prev ? prev + ' ' + t : t))
        startTypewriter(t)
      },
      onError: (errorType) => {
        setError(errorType)
        setIsRecording(false)
      },
      onEnd: () => {
        // Only called when speech.ts has fully ended the session:
        // user stopped, grace timer fired, or silence timeout.
        // NOT called during the iOS restart loop — isRecording stays true.
        setIsRecording(false)
      },
    })

    controllerRef.current.start()
  }, [isSupported, setInputMode, startTypewriter])

  const stopRecording = useCallback(() => {
    // speech.ts sets isIntentionallyStopped = true before abort(),
    // which prevents the restart loop from continuing.
    controllerRef.current?.stop()
  }, [])

  const retry = useCallback(() => {
    setError(null)
    startRecording()
  }, [startRecording])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isRecording,
    transcript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    retry,
    clearError,
  }
}
