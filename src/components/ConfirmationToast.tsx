'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastData {
  destinationName: string
  priority: 'P1' | 'P2' | 'P3'
  dueDate: string | null
}

interface ConfirmationToastProps {
  data: ToastData | null
  onDismiss: () => void
  showTagline: boolean
  onTaglineDone: () => void
}

const TOAST_DURATION_MS = 5000
const TAGLINE_DURATION_MS = 4000

export default function ConfirmationToast({
  data,
  onDismiss,
  showTagline,
  onTaglineDone,
}: ConfirmationToastProps) {
  const [taglineVisible, setTaglineVisible] = useState(false)
  const dismissedRef = useRef(false)

  // Auto-dismiss after 5s
  useEffect(() => {
    if (!data) return
    dismissedRef.current = false

    const timer = setTimeout(() => {
      dismissedRef.current = true
      onDismiss()

      // First capture tagline — show after toast exits
      if (showTagline) {
        setTimeout(() => {
          setTaglineVisible(true)
          setTimeout(() => {
            setTaglineVisible(false)
            onTaglineDone()
          }, TAGLINE_DURATION_MS)
        }, 350)
      }
    }, TOAST_DURATION_MS)

    return () => clearTimeout(timer)
  }, [data, onDismiss, showTagline, onTaglineDone])

  const formattedDue = data?.dueDate
    ? new Date(data.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null

  const subLine = [
    data?.priority.toLowerCase(),
    formattedDue ? `due ${formattedDue}` : null,
    'done',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <AnimatePresence>
        {data && (
          <motion.div
            key="toast"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '20%', opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 60,
              width: 'calc(100% - 48px)',
              maxWidth: '440px',
              backgroundColor: 'var(--bg3)',
              border: '1px solid var(--line2)',
              borderRadius: '9px',
              overflow: 'hidden',
            }}
          >
            {/* Content */}
            <div style={{ padding: '14px 16px 12px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  marginBottom: '3px',
                }}
              >
                Added to {data.destinationName}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--sage)',
                  letterSpacing: '0.05em',
                }}
              >
                {subLine}
              </div>
            </div>

            {/* Progress bar — 1px, drains left to right over 5s */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: TOAST_DURATION_MS / 1000, ease: 'linear' }}
              style={{
                height: '1px',
                backgroundColor: 'var(--sage)',
                transformOrigin: 'left',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* First-capture tagline */}
      <AnimatePresence>
        {taglineVisible && (
          <motion.p
            key="tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              bottom: '64px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 55,
              fontFamily: 'var(--font-serif)',
              fontSize: '13px',
              fontStyle: 'italic',
              color: 'var(--ink3)',
              textAlign: 'center',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            That&apos;s it. Every thought, straight to Notion.
          </motion.p>
        )}
      </AnimatePresence>
    </>
  )
}
