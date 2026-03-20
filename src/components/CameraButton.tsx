'use client'

import { useUserStore } from '@/store/user'

interface CameraButtonProps {
  onCapture: () => void
}

export default function CameraButton({ onCapture }: CameraButtonProps) {
  const hasCompletedFirstCapture = useUserStore((s) => s.hasCompletedFirstCapture)
  const showLabel = !hasCompletedFirstCapture

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
        {/* Button */}
        <button
          id="camera-button"
          onClick={onCapture}
          aria-label="Capture photo"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid var(--line2)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'border-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--line2)'
          }}
        >
          {/* Camera SVG */}
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
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>

          {/* Orange dot badge */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-1px',
              right: '-1px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#E8773A',
              border: '1px solid var(--bg)',
              flexShrink: 0,
            }}
          />
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
          Photo
        </span>
      )}
    </div>
  )
}
