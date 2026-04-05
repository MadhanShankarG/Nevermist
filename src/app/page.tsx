'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useCapture } from '@/hooks/useCapture'
import { useOffline } from '@/hooks/useOffline'
import { useCaptureStore } from '@/store/capture'
import { usePreviewStore } from '@/store/preview'
import { useUserStore } from '@/store/user'
import { isPushSupported, isIosSafariNotInstalled } from '@/lib/pwa'

import CaptureInput from '@/components/CaptureInput'
import SendButton from '@/components/SendButton'
import VoiceButton from '@/components/VoiceButton'
import CameraButton from '@/components/CameraButton'
import StatusPill from '@/components/StatusPill'
import QuickChips from '@/components/QuickChips'
import PreviewCard from '@/components/PreviewCard'
import ConfirmationToast from '@/components/ConfirmationToast'
import OfflineBanner from '@/components/OfflineBanner'

// Stagger animation variants — each element animates in 600ms ease-out
const makeVariant = (delayMs: number) => ({
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0, 0, 0.2, 1],
      delay: delayMs / 1000,
    },
  },
})

const WORDMARK = makeVariant(0)
const ITALIC_LABEL = makeVariant(100)
const INPUT_BLOCK = makeVariant(200)
const INPUT_ACTIONS = makeVariant(300)
const DIVIDER = makeVariant(400)
const QUICK_CHIPS = makeVariant(500)

interface ToastData {
  destinationName: string
  priority: 'P1' | 'P2' | 'P3'
  dueDate: string | null
}

// Small inline component — shows a brief success message when a capture
// is queued offline, then calls onDone after 2 seconds.
function OfflineQueuedMessage({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <p
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        color: 'var(--ink3)',
      }}
    >
      Captured — will process when back online
    </p>
  )
}

// ── Nudge Prompt ─────────────────────────────────────────────────────────
// Appears after the 3rd capture if push is supported and not yet dismissed.
function NudgePrompt({
  onDismiss,
  onTimeSet,
}: {
  onDismiss: () => void
  onTimeSet: (time: string) => void
}) {
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    if (!time) return
    setSaving(true)
    onTimeSet(time)
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        color: 'var(--ink2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {!showPicker ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            role="button"
            tabIndex={0}
            onClick={() => setShowPicker(true)}
            onKeyDown={(e) => e.key === 'Enter' && setShowPicker(true)}
            style={{ cursor: 'pointer' }}
          >
            Want a daily reminder to capture? Set a nudge time →
          </span>
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--ink3)',
              cursor: 'pointer',
              padding: 0,
              letterSpacing: '0.05em',
            }}
            aria-label="Dismiss nudge prompt"
          >
            dismiss
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--ink3)', fontSize: '11px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            nudge me at
          </span>
          <input
            type="time"
            autoFocus
            disabled={saving}
            onChange={handleTimeChange}
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--line2)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--ink)',
              colorScheme: 'dark',
            }}
          />
          <button
            onClick={() => setShowPicker(false)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--ink3)',
              cursor: 'pointer',
              padding: 0,
              letterSpacing: '0.05em',
            }}
          >
            cancel
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ── iOS Install Banner ────────────────────────────────────────────────────
function IosInstallBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg2)',
        borderTop: '1px solid var(--line2)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* iOS share icon: upward arrow in a rounded-rect box */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
        >
          <rect x="0.5" y="0.5" width="21" height="21" rx="5.5" stroke="var(--ink3)" />
          <path
            d="M11 14V7M11 7L8.5 9.5M11 7L13.5 9.5"
            stroke="var(--ink2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--ink2)',
          }}
        >
          Add to Home Screen for the best experience
        </span>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss install banner"
        style={{
          background: 'none',
          border: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--ink3)',
          cursor: 'pointer',
          padding: 0,
          letterSpacing: '0.05em',
          flexShrink: 0,
        }}
      >
        dismiss
      </button>
    </motion.div>
  )
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Stores
  const inputValue = useCaptureStore((s) => s.inputValue)
  const inputMode = useCaptureStore((s) => s.inputMode)
  const isProcessing = useCaptureStore((s) => s.isProcessing)
  const processingError = useCaptureStore((s) => s.processingError)
  const setInputMode = useCaptureStore((s) => s.setInputMode)
  const resetCapture = useCaptureStore((s) => s.reset)

  const preview = usePreviewStore()
  const resetPreview = usePreviewStore((s) => s.reset)

  const hasCompletedFirstCapture = useUserStore((s) => s.hasCompletedFirstCapture)
  const hasSeenTagline = useUserStore((s) => s.hasSeenTagline)
  const setHasCompletedFirstCapture = useUserStore((s) => s.setHasCompletedFirstCapture)
  const setHasSeenTagline = useUserStore((s) => s.setHasSeenTagline)
  const setPages = useUserStore((s) => s.setPages)
  const setNudgeTime = useUserStore((s) => s.setNudgeTime)

  // Local state
  const [hasPages, setHasPages] = useState<boolean | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [viewportH, setViewportH] = useState<string>('100dvh')
  const [isSending, setIsSending] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  // Capture count for nudge prompt (persisted in localStorage)
  const [captureCount, setCaptureCount] = useState(0)

  // Nudge prompt state
  const [showNudgePrompt, setShowNudgePrompt] = useState(false)
  const [nudgeDismissed, setNudgeDismissed] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)

  // iOS install banner state
  const [showIosBanner, setShowIosBanner] = useState(false)

  // Ref to avoid showing nudge on subsequent toasts after it appears
  const nudgeShownRef = useRef(false)

  // Hydrate persisted state from localStorage
  useEffect(() => {
    if (localStorage.getItem('nevermist:firstCapture') === 'true') {
      setHasCompletedFirstCapture(true)
    }
    if (localStorage.getItem('nevermist:seenTagline') === 'true') {
      setHasSeenTagline(true)
    }

    // Restore capture count
    const storedCount = parseInt(localStorage.getItem('nevermist:captureCount') ?? '0', 10)
    setCaptureCount(isNaN(storedCount) ? 0 : storedCount)

    // Check if nudge prompt was dismissed
    if (localStorage.getItem('nudgePromptDismissed') === 'true') {
      setNudgeDismissed(true)
    }

    // Push capability (client-only check)
    setPushSupported(isPushSupported())

    // iOS install banner — show once if not dismissed and on iOS Safari
    if (
      localStorage.getItem('iosInstallDismissed') !== 'true' &&
      isIosSafariNotInstalled()
    ) {
      setShowIosBanner(true)
    }
  }, [setHasCompletedFirstCapture, setHasSeenTagline])

  // Hooks
  const { submit, sendToNotion } = useCapture()
  // Mount useOffline — registers online/offline listeners and triggers
  // startSync() automatically when the browser comes back online.
  useOffline()

  // Visual viewport — mobile keyboard
  useEffect(() => {
    const updateViewport = () => {
      if (window.visualViewport) {
        setViewportH(`${window.visualViewport.height}px`)
      }
    }
    window.visualViewport?.addEventListener('resize', updateViewport)
    return () => window.visualViewport?.removeEventListener('resize', updateViewport)
  }, [])

  // Auth gate — check session + pages
  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace('/connect')
      return
    }

    async function checkPages() {
      try {
        const res = await fetch('/api/user/config')
        if (res.ok) {
          const data = await res.json() as { pages?: Array<{ notionPageId: string; name: string; description: string; isDatabase: boolean; databaseProps: string | null; sortOrder: number; id: string; userId: string; createdAt: string }> }
          if (!data.pages || data.pages.length === 0) {
            router.replace('/onboarding')
            return
          }
          setPages(data.pages.map((p) => ({ ...p, createdAt: new Date(p.createdAt) })))
          setHasPages(true)
        } else {
          router.replace('/onboarding')
        }
      } catch {
        setHasPages(true)
      }
    }

    checkPages()
  }, [isAuthenticated, isLoading, router, setPages])

  // ── Handlers ──

  // 1. CaptureInput / SendButton submit → call AI
  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim()) return
    await submit()
  }, [inputValue, submit])

  // 2. Send confirmed preview to Notion
  const handleNotionSend = useCallback(async () => {
    setIsSending(true)

    const result = {
      cleanedTask: preview.cleanedTask,
      destinationPageId: preview.destinationPageId,
      destinationName: preview.destinationName,
      priority: preview.priority,
      dueDate: preview.dueDate,
      isRecurring: preview.isRecurring,
      recurringPattern: preview.recurringPattern,
      isUrl: preview.isUrl,
      sourceUrl: preview.sourceUrl,
    }

    await sendToNotion(
      result,
      // onSuccess
      (sent) => {
        setToast({
          destinationName: sent.destinationName,
          priority: sent.priority,
          dueDate: sent.dueDate,
        })
        resetPreview()
        resetCapture()
        if (!hasCompletedFirstCapture) {
          setHasCompletedFirstCapture(true)
          localStorage.setItem('nevermist:firstCapture', 'true')
        }

        // Increment capture count and check for nudge prompt trigger
        setCaptureCount((prev) => {
          const next = prev + 1
          localStorage.setItem('nevermist:captureCount', String(next))
          // Show nudge prompt after 3rd capture (only once, only if supported)
          if (next >= 3 && !nudgeShownRef.current && !nudgeDismissed && pushSupported) {
            nudgeShownRef.current = true
            setShowNudgePrompt(true)
          }
          return next
        })

        setIsSending(false)
      },
      // onError
      (message) => {
        console.error('Notion send error:', message)
        setIsSending(false)
      },
    )
  }, [
    preview,
    sendToNotion,
    resetCapture,
    resetPreview,
    hasCompletedFirstCapture,
    setHasCompletedFirstCapture,
    nudgeDismissed,
    pushSupported,
  ])

  // 3. Cancel preview — card slides down, input retains text
  const handleCancelPreview = useCallback(() => {
    resetPreview()
  }, [resetPreview])

  // 4. Toast dismiss
  const handleToastDismiss = useCallback(() => {
    setToast(null)
  }, [])

  // 5. Tagline done
  const handleTaglineDone = useCallback(() => {
    setHasSeenTagline(true)
    localStorage.setItem('nevermist:seenTagline', 'true')
  }, [setHasSeenTagline])

  // 6. Voice
  const handleVoiceToggle = () => {
    setIsRecording((prev) => {
      const next = !prev
      setInputMode(next ? 'voice' : 'text')
      return next
    })
  }

  // 7. Camera
  const handleCameraCapture = () => {
    setInputMode('photo')
  }

  // 8. QuickChip clicks
  const handleChipClick = (chipId: string) => {
    if (chipId === 'voice-note') handleVoiceToggle()
    if (chipId === 'scan-notes') handleCameraCapture()
  }

  // 9. Nudge prompt handlers
  const handleNudgeDismiss = useCallback(() => {
    setShowNudgePrompt(false)
    setNudgeDismissed(true)
    localStorage.setItem('nudgePromptDismissed', 'true')
  }, [])

  const handleNudgeTimeSet = useCallback(async (time: string) => {
    setNudgeTime(time)
    setShowNudgePrompt(false)

    // Subscribe to push notifications
    try {
      const sw = await navigator.serviceWorker.ready
      const existing = await sw.pushManager.getSubscription()
      const subscription = existing ?? await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })
    } catch (err) {
      console.error('[push] Subscription failed:', err)
    }

    // Save nudge time to DB via user config
    try {
      await fetch('/api/user/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nudgeTime: time }),
      })
    } catch (err) {
      console.error('[nudge] Failed to save nudge time:', err)
    }
  }, [setNudgeTime])

  // 10. iOS banner dismiss
  const handleIosBannerDismiss = useCallback(() => {
    setShowIosBanner(false)
    localStorage.setItem('iosInstallDismissed', 'true')
  }, [])

  // ── Render ──

  if (isLoading || (!isAuthenticated && hasPages === null)) {
    return (
      <main
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: viewportH,
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--ink3)',
          letterSpacing: '0.05em',
        }}
      >
        loading...
      </main>
    )
  }

  if (!hasPages) return null

  return (
    <>
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: viewportH,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '800px',
            width: '100%',
            margin: '0 auto',
            padding: '0 40px',
          }}
          className="capture-layout"
        >
          {/* ── TopBar ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '28px',
              paddingBottom: '40px',
            }}
          >
            <motion.div variants={WORDMARK} initial="hidden" animate="visible">
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: 'var(--ink)',
                  letterSpacing: '0.2em',
                  textTransform: 'lowercase',
                  userSelect: 'none',
                }}
              >
                nevermist
              </span>
            </motion.div>
            <StatusPill />
          </div>

          {/* ── Main Capture Area ── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '20px',
            }}
          >
            {/* Italic label */}
            <motion.p
              variants={ITALIC_LABEL}
              initial="hidden"
              animate="visible"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                fontStyle: 'italic',
                color: 'var(--ink3)',
                userSelect: 'none',
              }}
            >
              what&apos;s on your mind?
            </motion.p>

            {/* Input block */}
            <motion.div variants={INPUT_BLOCK} initial="hidden" animate="visible">
              <CaptureInput onSubmit={handleSubmit} />
            </motion.div>

            {/* Processing error / offline queued message */}
            {processingError && processingError !== '__offline_queued__' && (
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--red)',
                  letterSpacing: '0.03em',
                }}
              >
                {processingError}
              </p>
            )}
            {processingError === '__offline_queued__' && (
              <OfflineQueuedMessage onDone={() => {
                // Clear the sentinel after display — access store directly
                useCaptureStore.getState().setProcessingError(null)
              }} />
            )}


            {/* InputActions row */}
            <motion.div
              variants={INPUT_ACTIONS}
              initial="hidden"
              animate="visible"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <VoiceButton isRecording={isRecording} onToggle={handleVoiceToggle} />
                <CameraButton onCapture={handleCameraCapture} />
              </div>

              {/* SendButton shows AI-processing state while isProcessing */}
              {isProcessing ? (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--ink3)',
                    letterSpacing: '0.08em',
                  }}
                >
                  thinking…
                </span>
              ) : (
                <SendButton onSend={handleSubmit} />
              )}
            </motion.div>
          </div>

          {/* ── Divider ── */}
          <motion.div
            variants={DIVIDER}
            initial="hidden"
            animate="visible"
            style={{
              height: '1px',
              backgroundColor: 'var(--line)',
              margin: '28px 0',
              flexShrink: 0,
            }}
          />

          {/* ── QuickChips ── */}
          <motion.div
            variants={QUICK_CHIPS}
            initial="hidden"
            animate="visible"
            style={{ paddingBottom: '32px', flexShrink: 0 }}
          >
            <QuickChips onChipClick={handleChipClick} />
          </motion.div>
        </div>

        {/* Mobile responsive styles */}
        <style>{`
          @media (max-width: 639px) {
            .capture-layout {
              padding-left: 28px !important;
              padding-right: 28px !important;
            }
          }
        `}</style>
      </main>

      {/* ── Preview Card (portal-like, fixed) ── */}
      <PreviewCard
        onSend={handleNotionSend}
        onCancel={handleCancelPreview}
        isSending={isSending}
      />

      {/* ── Offline Banner (portal — above everything) ── */}
      <OfflineBanner />

      {/* ── Confirmation Toast ── */}
      <ConfirmationToast
        data={toast}
        onDismiss={handleToastDismiss}
        showTagline={!hasSeenTagline && hasCompletedFirstCapture}
        onTaglineDone={handleTaglineDone}
      />

      {/* ── Nudge Prompt — appears after 3rd capture, below toast area ── */}
      <AnimatePresence>
        {showNudgePrompt && (
          <div
            style={{
              position: 'fixed',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '800px',
              padding: '0 40px',
              zIndex: 90,
              boxSizing: 'border-box',
            }}
          >
            <NudgePrompt
              onDismiss={handleNudgeDismiss}
              onTimeSet={handleNudgeTimeSet}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── iOS Install Banner ── */}
      <AnimatePresence>
        {showIosBanner && (
          <IosInstallBanner onDismiss={handleIosBannerDismiss} />
        )}
      </AnimatePresence>

      {/* ── Settings trigger — DM Mono 10px, bottom-right ── */}
      <Link
        href="/settings"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '28px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--ink3)',
          letterSpacing: '0.08em',
          textDecoration: 'none',
          zIndex: 50,
        }}
      >
        settings
      </Link>
    </>
  )
}
