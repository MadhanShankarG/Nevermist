'use client'

import { useEffect, useRef } from 'react'
import { useUserStore } from '@/store/user'
import { useCamera } from '@/hooks/useCamera'

interface CameraButtonProps {
  onCapture: () => void
}

export default function CameraButton({ onCapture }: CameraButtonProps) {
  const hasCompletedFirstCapture = useUserStore((s) => s.hasCompletedFirstCapture)
  const showLabel = !hasCompletedFirstCapture

  const { isCapturing, error, capturePhoto, clearError } = useCamera()

  // Auto-clear error after 3 seconds
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!error) return
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    errorTimerRef.current = setTimeout(clearError, 3000)
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }
  }, [error, clearError])

  const handleClick = () => {
    onCapture() // keeps page.tsx in sync (sets inputMode = 'photo')
    capturePhoto()
  }

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
        <button
          id="camera-button"
          onClick={handleClick}
          disabled={isCapturing}
          aria-label={isCapturing ? 'Processing photo…' : 'Capture photo'}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: `1px solid ${isCapturing ? 'var(--accent)' : 'var(--line2)'}`,
            backgroundColor: 'transparent',
            cursor: isCapturing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'border-color 150ms ease, opacity 150ms ease',
            opacity: isCapturing ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isCapturing)
              e.currentTarget.style.borderColor = 'var(--accent)'
          }}
          onMouseLeave={(e) => {
            if (!isCapturing)
              e.currentTarget.style.borderColor = 'var(--line2)'
          }}
        >
          {/* Camera SVG */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isCapturing ? 'var(--accent)' : 'var(--ink2)'}
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

      {/* Label: error > processing > first-launch */}
      {error ? (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--red)',
            maxWidth: '64px',
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {error.length > 24 ? 'failed' : error}
        </span>
      ) : isCapturing ? (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--ink2)',
            whiteSpace: 'nowrap',
          }}
        >
          Processing…
        </span>
      ) : showLabel ? (
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
      ) : null}
    </div>
  )
}
