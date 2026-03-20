'use client'

import { useUserStore } from '@/store/user'

interface Chip {
  id: string
  icon: React.ReactNode
  label: string
}

interface QuickChipsProps {
  onChipClick?: (chipId: string) => void
}

function BrainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
      <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
      <path d="M6 18a4 4 0 0 1-1.967-.516"/>
      <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
    </svg>
  )
}

function AddPageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}

function MicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="1" width="6" height="11" rx="3"/>
      <path d="M5 11a7 7 0 0 0 14 0"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="8" y1="22" x2="16" y2="22"/>
    </svg>
  )
}

function ScanIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
      <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
    </svg>
  )
}

export default function QuickChips({ onChipClick }: QuickChipsProps) {
  const pages = useUserStore((s) => s.pages)
  const firstPageName = pages[0]?.name || 'Inbox'

  const chips: Chip[] = [
    { id: 'brain-dump', icon: <BrainIcon />, label: 'Quick brain dump' },
    { id: 'add-to-page', icon: <AddPageIcon />, label: `Add to ${firstPageName}` },
    { id: 'voice-note', icon: <MicIcon />, label: 'Record a voice note' },
    { id: 'scan-notes', icon: <ScanIcon />, label: 'Scan handwritten notes' },
  ]

  return (
    <>
      <div
        id="quick-chips"
        role="group"
        aria-label="Quick actions"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          width: '100%',
        }}
        className="quick-chips-grid"
      >
        {chips.map((chip) => (
          <button
            key={chip.id}
            id={`chip-${chip.id}`}
            onClick={() => onChipClick?.(chip.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 11px',
              backgroundColor: 'var(--bg3)',
              border: '1px solid var(--line2)',
              borderRadius: '10px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 150ms ease, background-color 150ms ease',
              color: 'var(--ink2)',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.backgroundColor = 'var(--bg2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--line2)'
              e.currentTarget.style.backgroundColor = 'var(--bg3)'
            }}
          >
            <span style={{ flexShrink: 0 }}>{chip.icon}</span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                color: 'var(--ink2)',
                lineHeight: 1.3,
              }}
            >
              {chip.label}
            </span>
          </button>
        ))}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .quick-chips-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </>
  )
}
