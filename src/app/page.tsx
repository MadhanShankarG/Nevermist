'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useCaptureStore } from '@/store/capture'
import { useQueueStore } from '@/store/queue'
import CaptureInput from '@/components/CaptureInput'
import SendButton from '@/components/SendButton'
import VoiceButton from '@/components/VoiceButton'
import CameraButton from '@/components/CameraButton'
import StatusPill from '@/components/StatusPill'
import QuickChips from '@/components/QuickChips'

// Stagger animation variants — each element animates in 600ms ease-out
const makeVariant = (delayMs: number) => ({
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0, 0, 0.2, 1], // ease-out
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

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const inputValue = useCaptureStore((s) => s.inputValue)
  const setInputMode = useCaptureStore((s) => s.setInputMode)
  const reset = useCaptureStore((s) => s.reset)
  const setIsOnline = useQueueStore((s) => s.setIsOnline)

  const [hasPages, setHasPages] = useState<boolean | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  // Viewport height — updated on keyboard open/close
  const [viewportH, setViewportH] = useState<string>('100dvh')

  // Monitor visual viewport for mobile keyboard
  useEffect(() => {
    const updateViewport = () => {
      if (window.visualViewport) {
        setViewportH(`${window.visualViewport.height}px`)
      }
    }
    window.visualViewport?.addEventListener('resize', updateViewport)
    return () => window.visualViewport?.removeEventListener('resize', updateViewport)
  }, [])

  // Online/offline listeners for StatusPill
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setIsOnline])

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
          const data = await res.json()
          if (!data.pages || data.pages.length === 0) {
            router.replace('/onboarding')
            return
          }
          setHasPages(true)
        } else {
          router.replace('/onboarding')
        }
      } catch {
        setHasPages(true)
      }
    }

    checkPages()
  }, [isAuthenticated, isLoading, router])

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return
    // Capture logic will be implemented in Phase 5
    console.log('Send:', inputValue)
    reset()
  }, [inputValue, reset])

  const handleVoiceToggle = () => {
    setIsRecording((prev) => {
      const next = !prev
      setInputMode(next ? 'voice' : 'text')
      return next
    })
  }

  const handleCameraCapture = () => {
    setInputMode('photo')
    // Camera capture logic will be implemented in Phase 6
    console.log('Camera capture')
  }

  const handleChipClick = (chipId: string) => {
    if (chipId === 'voice-note') handleVoiceToggle()
    if (chipId === 'scan-notes') handleCameraCapture()
    // Other chip actions
  }

  // Loading / not-ready state
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
          // Mobile
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
          <motion.div
            variants={WORDMARK}
            initial="hidden"
            animate="visible"
          >
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
          <motion.div
            variants={INPUT_BLOCK}
            initial="hidden"
            animate="visible"
          >
            <CaptureInput onSubmit={handleSend} />
          </motion.div>

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
            {/* Left: voice + camera */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <VoiceButton
                isRecording={isRecording}
                onToggle={handleVoiceToggle}
              />
              <CameraButton onCapture={handleCameraCapture} />
            </div>

            {/* Right: send */}
            <SendButton onSend={handleSend} />
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
  )
}
