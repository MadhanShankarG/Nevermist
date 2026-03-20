'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCaptureStore } from '@/store/capture'

interface SendButtonProps {
  onSend: () => void
}

export default function SendButton({ onSend }: SendButtonProps) {
  const inputValue = useCaptureStore((s) => s.inputValue)
  const isProcessing = useCaptureStore((s) => s.isProcessing)
  const hasContent = inputValue.trim().length > 0

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
          disabled={isProcessing}
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
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            opacity: isProcessing ? 0.5 : 1,
            transition: 'background-color 150ms ease',
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) e.currentTarget.style.backgroundColor = 'var(--accent)'
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
