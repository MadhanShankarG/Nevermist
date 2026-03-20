'use client'

import { useUserStore } from '@/store/user'
import { useCaptureStore } from '@/store/capture'

interface VoiceButtonProps {
  isRecording: boolean
  onToggle: () => void
}

export default function VoiceButton({ isRecording, onToggle }: VoiceButtonProps) {
  const hasCompletedFirstCapture = useUserStore((s) => s.hasCompletedFirstCapture)
  const showLabel = !hasCompletedFirstCapture
  const inputMode = useCaptureStore((s) => s.inputMode)
  const isActive = isRecording || inputMode === 'voice'

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
        {/* Radiating ring — shown when recording */}
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
          onClick={onToggle}
          aria-label={isRecording ? 'Stop recording' : 'Start voice capture'}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: `1px solid ${isActive ? 'var(--accent)' : 'var(--line2)'}`,
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
            if (!isActive) e.currentTarget.style.borderColor = 'var(--accent)'
          }}
          onMouseLeave={(e) => {
            if (!isActive) e.currentTarget.style.borderColor = 'var(--line2)'
          }}
        >
          {/* Mic SVG */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ink2)"
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
        </button>
      </div>

      {/* First launch label */}
      {showLabel && (
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
      )}

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
