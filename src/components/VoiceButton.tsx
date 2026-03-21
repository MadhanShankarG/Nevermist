'use client'

import { useUserStore } from '@/store/user'
import { useVoice } from '@/hooks/useVoice'

interface VoiceButtonProps {
  /** Passed from page.tsx — kept for interface compatibility, visual state uses hook instead */
  isRecording: boolean
  /** Called on explicit tap so page.tsx local state stays in sync */
  onToggle: () => void
}

export default function VoiceButton({ onToggle }: VoiceButtonProps) {
  const hasCompletedFirstCapture = useUserStore((s) => s.hasCompletedFirstCapture)
  const voice = useVoice()

  // Hide completely when browser doesn't support Web Speech API
  if (!voice.isSupported) return null

  const isActive = voice.isRecording

  const handleTap = () => {
    if (isActive) {
      voice.stopRecording()
      // Signal page.tsx so its local isRecording flips to false
      onToggle()
    } else if (voice.error === 'silent-fail') {
      // Retry path — don't toggle page.tsx state since it's already in recording-off position
      voice.retry()
      onToggle()
    } else {
      voice.startRecording()
      // Signal page.tsx so its local isRecording flips to true
      onToggle()
    }
  }

  // Label below button — first launch only
  const showFirstLaunchLabel = !hasCompletedFirstCapture && !isActive && !voice.error

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        flexShrink: 0,
      }}
    >
      <div style={{ position: 'relative', width: '32px', height: '32px' }}>
        {/* Radiating ring — shown while recording */}
        {isActive && (
          <span
            className="voice-ring"
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: '1px solid var(--accent)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Button */}
        <button
          id="voice-button"
          onClick={handleTap}
          aria-label={
            isActive
              ? 'Stop recording'
              : voice.error === 'silent-fail'
              ? 'Retry voice capture'
              : 'Start voice capture'
          }
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: `1px solid ${isActive ? 'var(--accent)' : voice.error ? 'var(--red)' : 'var(--line2)'}`,
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            transition: 'border-color 150ms ease',
            animation: isActive ? 'voicePulse 1.2s ease-in-out infinite' : 'none',
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.borderColor = voice.error ? 'var(--red)' : 'var(--accent)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.borderColor = voice.error ? 'var(--red)' : 'var(--line2)'
            }
          }}
        >
          {voice.error === 'silent-fail' ? (
            /* Retry indicator — small refresh SVG */
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--red)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          ) : (
            /* Mic SVG */
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isActive ? 'var(--accent)' : 'var(--ink2)'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="1" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          )}
        </button>
      </div>

      {/* State label */}
      {isActive ? (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            color: 'var(--ink2)',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Listening...
        </span>
      ) : voice.error === 'silent-fail' ? (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            color: 'var(--red)',
            userSelect: 'none',
          }}
        >
          Retry
        </span>
      ) : showFirstLaunchLabel ? (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'var(--ink3)',
            userSelect: 'none',
          }}
        >
          Speak
        </span>
      ) : null}

      {/* Keyframes — defined once here, referenced by both button and ring */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes voicePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
          @keyframes voiceRing {
            0% { transform: scale(1); opacity: 0.3; }
            100% { transform: scale(2); opacity: 0; }
          }
          .voice-ring {
            animation: voiceRing 1.2s ease-out infinite;
          }
        }
      `}</style>
    </div>
  )
}
