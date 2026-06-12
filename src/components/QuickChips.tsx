'use client'

import { useState, useCallback, useRef } from 'react'
import { useUserStore } from '@/store/user'
import { useCaptureStore } from '@/store/capture'
import { useVoice } from '@/hooks/useVoice'
import { useCamera } from '@/hooks/useCamera'

interface QuickChipsProps {
  onChipClick?: (chipId: string) => void
}

// ── Icons ───────────────────────────────────────────────────────────────────
function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function PageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

function MicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="1" width="6" height="11" rx="3"/>
      <path d="M5 11a7 7 0 0 0 14 0"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="8" y1="22" x2="16" y2="22"/>
    </svg>
  )
}

function ScanIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
      <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
    </svg>
  )
}

// ── QuickChips ──────────────────────────────────────────────────────────────
export default function QuickChips({ onChipClick }: QuickChipsProps) {
  const pages = useUserStore((s) => s.pages)
  const firstPageName = pages[0]?.name || 'Inbox'

  const setInputMode = useCaptureStore((s) => s.setInputMode)

  const voice = useVoice()
  const { capturePhoto } = useCamera()

  // 200ms accent flash on tap
  const [activeChip, setActiveChip] = useState<string | null>(null)
  // Voice unsupported inline message
  const [voiceUnsupported, setVoiceUnsupported] = useState(false)
  const voiceUnsupportedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flashAndRun = useCallback((chipId: string, action: () => void) => {
    setActiveChip(chipId)
    setTimeout(() => {
      setActiveChip(null)
      action()
    }, 200)
    onChipClick?.(chipId)
  }, [onChipClick])

  // ── Set a time: focuses input with time-oriented placeholder ──────────────
  const handleSetTime = useCallback(() => {
    flashAndRun('set-time', () => {
      const textarea = document.getElementById('capture-input') as HTMLTextAreaElement | null
      if (textarea) {
        textarea.focus()
        textarea.placeholder = 'e.g. call dentist Friday at 3pm'
        const clearPlaceholder = () => {
          textarea.placeholder = ''
          textarea.removeEventListener('input', clearPlaceholder)
        }
        textarea.addEventListener('input', clearPlaceholder)
      }
    })
  }, [flashAndRun])

  // ── Current page: focus input (page pre-selection happens via AI routing) ─
  const handleCurrentPage = useCallback(() => {
    flashAndRun('current-page', () => {
      const textarea = document.getElementById('capture-input') as HTMLTextAreaElement | null
      textarea?.focus()
    })
  }, [flashAndRun])

  // ── Voice ─────────────────────────────────────────────────────────────────
  const handleVoice = useCallback(() => {
    if (!voice.isSupported) {
      flashAndRun('voice-note', () => {
        setVoiceUnsupported(true)
        if (voiceUnsupportedTimerRef.current) clearTimeout(voiceUnsupportedTimerRef.current)
        voiceUnsupportedTimerRef.current = setTimeout(() => setVoiceUnsupported(false), 2000)
      })
      return
    }
    flashAndRun('voice-note', () => {
      if (voice.isRecording) {
        voice.stopRecording()
      } else {
        voice.startRecording()
        setInputMode('voice')
      }
    })
  }, [flashAndRun, voice, setInputMode])

  // ── Scan: call capturePhoto() exactly as CameraButton does ──────────────
  const handleScan = useCallback(() => {
    flashAndRun('scan-notes', () => {
      capturePhoto()
    })
  }, [flashAndRun, capturePhoto])

  // ── Chip definitions ──────────────────────────────────────────────────────
  type ChipDef =
    | { id: string; icon: React.ReactNode; label: string; sublabel?: undefined; onClick: () => void }
    | { id: string; icon: React.ReactNode; label: string; sublabel: string; onClick: () => void }

  const chips: ChipDef[] = [
    { id: 'set-time', icon: <ClockIcon />, label: 'Set a time', onClick: handleSetTime },
    { id: 'current-page', icon: <PageIcon />, label: firstPageName, sublabel: 'current page', onClick: handleCurrentPage },
    { id: 'voice-note', icon: <MicIcon />, label: 'Record a voice note', onClick: handleVoice },
    { id: 'scan-notes', icon: <ScanIcon />, label: 'Scan handwritten notes', onClick: handleScan },
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
        {chips.map((chip) => {
          const isActive = activeChip === chip.id
          return (
            <button
              key={chip.id}
              id={`chip-${chip.id}`}
              onClick={chip.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: chip.sublabel ? '8px 11px' : '10px 11px',
                backgroundColor: 'var(--bg3)',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--line2)'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 150ms ease, background-color 150ms ease',
                color: 'var(--ink2)',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.backgroundColor = 'var(--bg2)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--line2)'
                  e.currentTarget.style.backgroundColor = 'var(--bg3)'
                }
              }}
            >
              <span style={{ flexShrink: 0, color: isActive ? 'var(--accent)' : 'var(--ink2)' }}>
                {chip.icon}
              </span>
              {chip.sublabel ? (
                <span style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '11px',
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {chip.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '9px',
                      color: 'var(--ink3)',
                      letterSpacing: '0.04em',
                      lineHeight: 1.2,
                    }}
                  >
                    {chip.sublabel}
                  </span>
                </span>
              ) : (
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
              )}
            </button>
          )
        })}
      </div>

      {/* Voice unsupported inline message */}
      {voiceUnsupported && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            color: 'var(--ink3)',
            marginTop: '8px',
          }}
        >
          Voice not supported on this browser
        </p>
      )}

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
