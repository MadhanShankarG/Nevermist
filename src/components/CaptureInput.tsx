'use client'

import { useEffect, useRef } from 'react'
import { useCaptureStore } from '@/store/capture'
import { useUserStore } from '@/store/user'

interface CaptureInputProps {
  onSubmit: () => void
}

export default function CaptureInput({ onSubmit }: CaptureInputProps) {
  const inputValue = useCaptureStore((s) => s.inputValue)
  const inputMode = useCaptureStore((s) => s.inputMode)
  const setInputValue = useCaptureStore((s) => s.setInputValue)
  const setInputMode = useCaptureStore((s) => s.setInputMode)
  const hasCompletedFirstCapture = useUserStore((s) => s.hasCompletedFirstCapture)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus on every mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(80, el.scrollHeight)}px`
  }, [inputValue])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim()) onSubmit()
    }
    // Detect URL paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      setTimeout(() => {
        const val = textareaRef.current?.value || ''
        try {
          new URL(val.trim())
          setInputMode('url')
        } catch {
          if (inputMode === 'url') setInputMode('text')
        }
      }, 50)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInputValue(val)
    // Detect URL
    try {
      new URL(val.trim())
      setInputMode('url')
    } catch {
      if (inputMode === 'url') setInputMode('text')
    }
  }

  const placeholder = hasCompletedFirstCapture
    ? "What's on your mind?"
    : "Try it — say 'buy groceries tomorrow' and hit send"

  const placeholderOpacity = hasCompletedFirstCapture ? 0.7 : 0.4

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <textarea
        ref={textareaRef}
        id="capture-input"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={1}
        style={{
          width: '100%',
          minHeight: '80px',
          background: 'transparent',
          border: 'none',
          borderLeft: '1.5px solid var(--line2)',
          outline: 'none',
          resize: 'none',
          paddingLeft: '20px',
          paddingTop: '4px',
          paddingBottom: '4px',
          paddingRight: '0',
          fontFamily: 'var(--font-serif)',
          fontSize: '24px',
          lineHeight: 1.35,
          color: 'var(--ink)',
          caretColor: 'var(--accent)',
          borderRadius: 0,
          boxShadow: 'none',
          transition: 'border-color 250ms ease',
          display: 'block',
          overflowY: 'hidden',
          WebkitAppearance: 'none',
        }}
        className="capture-textarea"
        placeholder={placeholder}
        aria-label="Capture input"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={true}
      />
      <style>{`
        .capture-textarea::placeholder {
          font-style: italic;
          color: var(--ink3);
          opacity: ${placeholderOpacity};
        }
        .capture-textarea:focus {
          border-left-color: var(--accent);
        }
      `}</style>
    </div>
  )
}
