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

// ── ThemeToggle ─────────────────────────────────────────────────────────────
function ThemeToggle() {
  const theme = useUserStore((s) => s.theme)
  const setTheme = useUserStore((s) => s.setTheme)

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
            Appearance
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--ink3)',
              margin: 0,
            }}
          >
            {theme === 'dark' ? 'Dark mode' : 'Light mode'}
          </p>
        </div>

        {/* Moon | Sun pill */}
        <div
          role="group"
          aria-label="Theme toggle"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg3)',
            border: '1px solid var(--line2)',
            borderRadius: '20px',
            padding: '3px',
            gap: '2px',
            flexShrink: 0,
          }}
        >
          {/* Moon — dark */}
          <button
            id="theme-dark-btn"
            onClick={() => setTheme('dark')}
            aria-label="Dark mode"
            aria-pressed={theme === 'dark'}
            style={{
              width: '30px',
              height: '24px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              background: theme === 'dark' ? 'var(--bg)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 200ms ease',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={theme === 'dark' ? 'var(--accent)' : 'var(--ink3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          {/* Sun — light */}
          <button
            id="theme-light-btn"
            onClick={() => setTheme('light')}
            aria-label="Light mode"
            aria-pressed={theme === 'light'}
            style={{
              width: '30px',
              height: '24px',
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              background: theme === 'light' ? 'var(--bg)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 200ms ease',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={theme === 'light' ? 'var(--accent)' : 'var(--ink3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </button>
        </div>
      </div>
    </div>
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

// ── CalendarSection ─────────────────────────────────────────────────────────
function CalendarSection() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/user/config')
      .then((r) => r.json())
      .then((d: { calendarToken?: string }) => {
        if (d.calendarToken) setToken(d.calendarToken)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nevermist.vercel.app'
  const feedUrl = token ? `${appUrl}/api/calendar?token=${token}` : null

  const handleCopy = async () => {
    if (!feedUrl) return
    try {
      await navigator.clipboard.writeText(feedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      alert(feedUrl)
    }
  }

  const handleOpenInCalendar = () => {
    if (!feedUrl) return
    window.open(feedUrl.replace('https://', 'webcal://'), '_blank')
  }

  const baseBtnStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    border: '1px solid var(--line2)',
    borderRadius: '6px',
    padding: '6px 14px',
    cursor: 'pointer',
    background: 'none',
    transition: 'opacity 120ms ease',
  }

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink)', margin: '0 0 4px 0' }}>
        Calendar sync
      </p>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--ink2)', margin: '0 0 16px 0' }}>
        Subscribe to your tasks in any calendar app.
        <br />Tasks with due dates appear automatically.
      </p>

      {loading ? (
        // Skeleton while token loads
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          {[80, 120].map((w) => (
            <div
              key={w}
              style={{
                width: w,
                height: 30,
                borderRadius: '6px',
                background: 'var(--line)',
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <button
            id="calendar-copy-btn"
            style={{ ...baseBtnStyle, color: 'var(--ink2)' }}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy feed URL'}
          </button>
          <button
            id="calendar-open-btn"
            style={{ ...baseBtnStyle, color: 'var(--accent)', borderColor: 'var(--accent)' }}
            onClick={handleOpenInCalendar}
          >
            Open in Calendar ↗
          </button>
        </div>
      )}

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--ink3)', margin: 0, lineHeight: 1.6 }}>
        Updates when your calendar app refreshes.
      </p>
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

// ── Overlay animation variants ──────────────────────────────────────────────
const desktopVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as [number, number, number, number] } },
}

const mobileVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit: { y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as [number, number, number, number] } },
}

// ── Main Settings Overlay ───────────────────────────────────────────────────
export default function SettingsPage() {
  const settingsOpen = useUserStore((s) => s.settingsOpen)
  const setSettingsOpen = useUserStore((s) => s.setSettingsOpen)
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
    setSettingsOpen(false)
  }, [setSettingsOpen])

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
      top: '15vh',
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
    <AnimatePresence>
      {settingsOpen && (
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
                id="settings-close-btn"
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
              <ThemeToggle />
              <TextPolishToggle />
              <NudgeTimePicker />
            </section>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--line)', marginBottom: '32px' }} />

            {/* ── Calendar ── */}
            <section style={{ marginBottom: '40px' }}>
              <SectionHeader>Calendar</SectionHeader>
              <CalendarSection />
            </section>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--line)', marginBottom: '32px' }} />

            {/* ── Account ── */}
            <section>
              <SectionHeader>Account</SectionHeader>
              <AccountSection />
            </section>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
