'use client'

import { useQueueStore } from '@/store/queue'

export default function StatusPill() {
  const isOnline = useQueueStore((s) => s.isOnline)
  const items = useQueueStore((s) => s.items)
  const queuedCount = items.length

  let dotColor: string
  let label: string

  if (!isOnline) {
    dotColor = 'var(--amber)'
    label = 'disconnected'
  } else if (queuedCount > 0) {
    dotColor = 'var(--ink3)'
    label = `${queuedCount} queued`
  } else {
    dotColor = 'var(--sage)'
    label = 'connected'
  }

  return (
    <div
      id="status-pill"
      role="status"
      aria-live="polite"
      aria-label={`Status: ${label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        border: '1px solid var(--line2)',
        borderRadius: '20px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        fontWeight: 300,
        letterSpacing: '0.08em',
        color: 'var(--ink3)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          flexShrink: 0,
          transition: 'background-color 300ms ease',
        }}
      />
      {label}
    </div>
  )
}
