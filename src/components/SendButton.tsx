'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCaptureStore } from '@/store/capture'

interface SendButtonProps {
  onSend: () => void
  disabled?: boolean
}

export default function SendButton({ onSend, disabled = false }: SendButtonProps) {
  const inputValue = useCaptureStore((s) => s.inputValue)
  const isProcessing = useCaptureStore((s) => s.isProcessing)
  const hasContent = inputValue.trim().length > 0
  const isDisabled = isProcessing || disabled

  return (
    <AnimatePresence initial={false}>
      {hasContent && (
        <motion.button
          key="send-btn"
          id="send-button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeInOut' }}
          onClick={onSend}
          disabled={isDisabled}
          whileTap={{ scale: 0.95, transition: { duration: 0.1, ease: 'easeInOut' } }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 18px',
            backgroundColor: 'var(--ink)',
            color: 'var(--bg)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 300,
            letterSpacing: '0.1em',
            borderRadius: '20px',
            border: 'none',
            cursor: isDisabled ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            opacity: isDisabled ? 0.2 : 1,
            filter: isDisabled ? 'grayscale(1)' : 'none',
            pointerEvents: isDisabled ? 'none' : 'auto',
            transition: 'background-color 150ms ease, opacity 150ms ease, filter 150ms ease',
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) e.currentTarget.style.backgroundColor = 'var(--accent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ink)'
          }}
          aria-label="Send capture"
        >
          {isProcessing ? 'sending…' : 'send →'}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
