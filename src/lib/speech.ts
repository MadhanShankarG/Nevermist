// Minimal type definitions for the Web Speech API.
// Not included in all TypeScript DOM lib versions, so we declare them here.

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResult {
  readonly length: number
  readonly isFinal: boolean
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList
  readonly resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export interface SpeechHandlers {
  onResult: (transcript: string) => void
  onError: (errorType: string) => void
  onEnd: () => void
  /** Optional: receives interim (non-final) text for live preview only */
  onInterim?: (transcript: string) => void
}

export interface SpeechController {
  start: () => void
  stop: () => void
}

/**
 * Returns true when the browser exposes a SpeechRecognition constructor.
 * Safe to call during SSR — returns false on server.
 */
export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

/**
 * Creates a session controller that keeps listening until explicitly stopped.
 *
 * Keep-alive restart loop (iOS Safari fix):
 *   iOS ignores continuous:true and stops recognition on short pauses.
 *   When onend fires without isIntentionallyStopped, we immediately restart
 *   with a fresh instance. handlers.onEnd() is ONLY called when the session
 *   is truly finished — so useVoice.ts's isRecording stays true between restarts.
 *
 * onResult fires multiple times (once per final utterance):
 *   — useVoice.ts accumulates results into the input via the typewriter effect.
 *
 * Session ends when ONE of these occurs:
 *   1. User calls stop() manually
 *   2. Grace timer fires (8s after the last final result with no new speech)
 *   3. Silence timer fires (15s with no final result at all — hard timeout)
 */
export function createRecognition(handlers: SpeechHandlers): SpeechController {
  const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition

  if (!Ctor) {
    throw new Error('SpeechRecognition is not available in this browser')
  }

  const GRACE_MS = 10000   // pause after final result before auto-stop
  const SILENCE_MS = 15000 // hard timeout: no speech at all

  let isIntentionallyStopped = false
  let gotAnyResult = false
  let currentInstance: SpeechRecognitionInstance | null = null
  let graceTimer: ReturnType<typeof setTimeout> | null = null
  let silenceTimer: ReturnType<typeof setTimeout> | null = null

  /** Single internal stop path — used by the exposed stop() and both timers. */
  function doStop(): void {
    isIntentionallyStopped = true
    if (graceTimer !== null) { clearTimeout(graceTimer); graceTimer = null }
    if (silenceTimer !== null) { clearTimeout(silenceTimer); silenceTimer = null }
    // abort() is faster than stop() on iOS and triggers onerror('aborted') + onend.
    // onerror('aborted') is suppressed below; onend fires → isIntentionallyStopped
    // is true → handlers.onEnd() is called.
    currentInstance?.abort()
  }

  /** Reset the 15s hard silence timer. Called at session start and on every result. */
  function resetSilenceTimer(): void {
    if (silenceTimer !== null) clearTimeout(silenceTimer)
    silenceTimer = setTimeout(doStop, SILENCE_MS)
  }

  function startInstance(): void {
    const r = new Ctor!()
    r.continuous = false
    r.interimResults = handlers.onInterim !== undefined
    r.maxAlternatives = 1
    currentInstance = r

    r.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1]

      if (result.isFinal) {
        gotAnyResult = true

        // Reset silence timer — user is actively speaking
        resetSilenceTimer()

        // Start/restart the grace timer — if no new speech arrives within
        // GRACE_MS, end the session automatically
        if (graceTimer !== null) clearTimeout(graceTimer)
        graceTimer = setTimeout(() => {
          graceTimer = null
          doStop()
        }, GRACE_MS)

        handlers.onResult(result[0].transcript.trim())
      } else if (handlers.onInterim) {
        handlers.onInterim(result[0].transcript.trim())
      }
    }

    r.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'aborted' fires when abort() is called in doStop() — not a real error
      if (event.error !== 'aborted') {
        handlers.onError(event.error)
      }
    }

    r.onend = () => {
      if (isIntentionallyStopped) {
        if (!gotAnyResult) {
          handlers.onError('silent-fail')
        }
        handlers.onEnd()
        return
      }

      // iOS / natural end — restart to keep session alive.
      // Grace and silence timers remain active and will call doStop() when ready.
      startInstance()
    }

    r.start()
  }

  return {
    start: () => {
      isIntentionallyStopped = false
      gotAnyResult = false
      resetSilenceTimer()
      startInstance()
    },
    stop: doStop,
  }
}
