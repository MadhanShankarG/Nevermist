'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useCapture } from '@/hooks/useCapture'
import { useOffline } from '@/hooks/useOffline'
import { useCaptureStore } from '@/store/capture'
import { usePreviewStore } from '@/store/preview'
import { useUserStore } from '@/store/user'

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



  // Local state
  const [hasPages, setHasPages] = useState<boolean | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [viewportH, setViewportH] = useState<string>('100dvh')
  const [isSending, setIsSending] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)

  // Hydrate persisted state from localStorage
  useEffect(() => {
    if (localStorage.getItem('nevermist:firstCapture') === 'true') {
      setHasCompletedFirstCapture(true)
    }
    if (localStorage.getItem('nevermist:seenTagline') === 'true') {
      setHasSeenTagline(true)
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
  // Uses sendToNotion from useCapture which handles the queue:
  //   addToQueue(result) → /api/notion/send → 200: removeFromQueue
  //   On failure: item stays in queue for automatic sync via useOffline
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
    </>
  )
}
