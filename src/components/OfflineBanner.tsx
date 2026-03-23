'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQueueStore } from '@/store/queue'
import { useOffline } from '@/hooks/useOffline'

export default function OfflineBanner() {
  const isOnline = useQueueStore((s) => s.isOnline)
  const items = useQueueStore((s) => s.items)
  const needsReconnect = useQueueStore((s) => s.needsReconnect)

  const [mounted, setMounted] = useState(false)

  // Activate the sync engine
  useOffline()

  useEffect(() => {
    setMounted(true)
  }, [])

  const pendingCount = items.filter((i) => i.status === 'pending').length
  const rerouteCount = items.filter((i) => i.status === 'needs-rerouting').length

  // Determine which banner state to show
  let content: React.ReactNode = null
  let borderColor = 'var(--line2)'
  let textColor = 'var(--ink3)'

  if (needsReconnect) {
    // State 2 — Auth broken
    borderColor = 'var(--accent)'
    textColor = 'var(--accent)'
    content = (
      <>
        <span>Notion disconnected.</span>
        <button
          onClick={() => { window.location.href = '/api/auth/notion' }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--accent)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            padding: 0,
          }}
        >
          Reconnect
        </button>
      </>
    )
  } else if (rerouteCount > 0) {
    // State 3 — Items need rerouting
    textColor = 'var(--amber)'
    borderColor = 'var(--line2)'
    content = (
      <span>
        {rerouteCount} {rerouteCount === 1 ? 'item needs' : 'items need'} re-routing
        — destination page not found
      </span>
    )
  } else if (!isOnline && pendingCount > 0) {
    // State 1 — Offline with queued items
    content = (
      <span>
        {pendingCount} {pendingCount === 1 ? 'item' : 'items'} queued · will sync when
        online
      </span>
    )
  }

  // Nothing to show
  if (!content || !mounted) return null

  const banner = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        padding: '8px 16px',
        paddingTop: 'max(8px, env(safe-area-inset-top))',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: 'var(--bg2)',
          border: `1px solid ${borderColor}`,
          borderRadius: '20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 300,
          letterSpacing: '0.06em',
          color: textColor,
          pointerEvents: 'auto',
          maxWidth: '90vw',
          textAlign: 'center',
          flexWrap: 'wrap',
        }}
      >
        {content}
      </div>
    </div>
  )

  return createPortal(banner, document.body)
}
