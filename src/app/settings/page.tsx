'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/user'
import { isPushSupported } from '@/lib/pwa'
import PageConfigList from '@/components/PageConfigList'

// ── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        width: '36px',
        height: '20px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        background: checked ? 'var(--sage)' : 'var(--line2)',
        transition: 'background 200ms ease',
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '19px' : '3px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#EDEAE4',
          transition: 'left 200ms ease',
          display: 'block',
        }}
      />
    </button>
  )
}

// ── Section header ─────────────────────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '16px',
        fontWeight: 400,
        color: 'var(--ink)',
        margin: '0 0 16px 0',
      }}
    >
      {children}
    </h2>
  )
}

// ── TextPolishToggle ────────────────────────────────────────────────────────
function TextPolishToggle() {
  const textPolish = useUserStore((s) => s.textPolish)
  const setTextPolish = useUserStore((s) => s.setTextPolish)
  const savingRef = useRef(false)

  const handleChange = useCallback(async (val: boolean) => {
    if (savingRef.current) return
    setTextPolish(val)
    savingRef.current = true
    try {
      await fetch('/api/user/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textPolish: val }),
      })
    } catch (err) {
      console.error('[settings] textPolish save failed:', err)
    } finally {
      savingRef.current = false
    }
  }, [setTextPolish])

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--ink)',
              margin: '0 0 4px 0',
            }}
          >
            Auto-polish task text
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--ink3)',
              margin: 0,
            }}
          >
            Cleans up phrasing before saving to Notion
          </p>
        </div>
        <Toggle checked={textPolish} onChange={handleChange} />
      </div>
    </div>
  )
}

// ── NudgeTimePicker ────────────────────────────────────────────────────────
function NudgeTimePicker() {
  const nudgeTime = useUserStore((s) => s.nudgeTime)
  const setNudgeTime = useUserStore((s) => s.setNudgeTime)
  const [pushOk] = useState(() => isPushSupported())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(async (time: string | null) => {
    setNudgeTime(time)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        await fetch('/api/user/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nudgeTime: time }),
        })
      } catch (err) {
        console.error('[settings] nudgeTime save failed:', err)
      }
    }, 500)
  }, [setNudgeTime])

  return (
    <div style={{ marginBottom: '24px' }}>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--ink)',
          margin: '0 0 8px 0',
        }}
      >
        Daily reminder
      </p>

      {!pushOk ? (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'var(--ink3)',
            margin: 0,
          }}
        >
          Push notifications not supported on this device
        </p>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="time"
            value={nudgeTime ?? ''}
            onChange={(e) => save(e.target.value || null)}
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--line2)',
              borderRadius: '6px',
              padding: '5px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--ink)',
              colorScheme: 'dark',
            }}
          />
          {nudgeTime && (
            <button
              onClick={() => save(null)}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--ink3)',
                cursor: 'pointer',
                padding: 0,
                letterSpacing: '0.05em',
              }}
            >
              remove
            </button>
          )}
          {!nudgeTime && (
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--ink3)',
              }}
            >
              No reminder set
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ── AccountSection ─────────────────────────────────────────────────────────
function AccountSection() {
  const notionWorkspace = useUserStore((s) => s.notionWorkspace)
  const router = useRouter()
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleDisconnect = useCallback(async () => {
    if (isDisconnecting) return
    setIsDisconnecting(true)
    try {
      await fetch('/api/auth/session', { method: 'DELETE' })
    } catch {
      // Ignore — session may already be gone
    }
    router.replace('/connect')
  }, [isDisconnecting, router])

  return (
    <div>
      {notionWorkspace && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--ink2)',
            margin: '0 0 12px 0',
          }}
        >
          Connected to {notionWorkspace}
        </p>
      )}
      <button
        onClick={handleDisconnect}
        disabled={isDisconnecting}
        style={{
          background: 'none',
          border: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--red)',
          cursor: isDisconnecting ? 'wait' : 'pointer',
          padding: 0,
          letterSpacing: '0.05em',
          opacity: isDisconnecting ? 0.5 : 1,
        }}
      >
        {isDisconnecting ? 'disconnecting…' : 'Disconnect'}
      </button>
    </div>
  )
}

// ── Overlay variants ────────────────────────────────────────────────────────
const desktopVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
}

const mobileVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
}

// ── Main Settings Page ──────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  // Close on Escape
  useEffect(() => {
    if (!mounted) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mounted, handleClose])

  if (!mounted) return null

  const overlayStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        inset: 0,
        top: '10vh',
        background: 'var(--bg2)',
        borderTop: '1px solid var(--line2)',
        borderRadius: '16px 16px 0 0',
        overflow: 'auto',
        zIndex: 200,
        padding: '24px 28px 40px',
      }
    : {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '380px',
        background: 'var(--bg2)',
        borderLeft: '1px solid var(--line2)',
        overflow: 'auto',
        zIndex: 200,
        padding: '32px 28px 40px',
      }

  return (
    <>
      {/* Backdrop — click to close */}
      <motion.div
        key="settings-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 199,
          background: 'transparent',
        }}
        aria-hidden="true"
      />

      {/* Overlay panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key="settings-panel"
          variants={isMobile ? mobileVariants : desktopVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={overlayStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '36px',
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '16px',
                fontWeight: 400,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              Settings
            </h1>
            <button
              onClick={handleClose}
              aria-label="Close settings"
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: '18px',
                color: 'var(--ink3)',
                cursor: 'pointer',
                padding: '0 0 2px 8px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* ── Pages ── */}
          <section style={{ marginBottom: '40px' }}>
            <SectionHeader>Pages</SectionHeader>
            <PageConfigList />
          </section>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--line)', marginBottom: '32px' }} />

          {/* ── Preferences ── */}
          <section style={{ marginBottom: '40px' }}>
            <SectionHeader>Preferences</SectionHeader>
            <TextPolishToggle />
            <NudgeTimePicker />
          </section>

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--line)', marginBottom: '32px' }} />

          {/* ── Account ── */}
          <section>
            <SectionHeader>Account</SectionHeader>
            <AccountSection />
          </section>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
