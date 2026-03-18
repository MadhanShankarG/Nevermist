'use client'

import { motion } from 'framer-motion'

interface ConnectStepProps {
  onConnect?: () => void
}

export default function ConnectStep({ onConnect }: ConnectStepProps) {
  const handleConnect = () => {
    if (onConnect) {
      onConnect()
    } else {
      window.location.href = '/api/auth/notion'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2.5rem',
        maxWidth: '360px',
        textAlign: 'center',
        margin: '0 auto',
      }}
    >
      {/* Wordmark */}
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            fontWeight: 500,
            color: 'var(--ink)',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}
        >
          nevermist
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1rem',
            fontStyle: 'italic',
            color: 'var(--ink2)',
          }}
        >
          Your thought never mists.
        </p>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--ink2)',
          lineHeight: 1.6,
          fontFamily: 'var(--font-sans)',
        }}
      >
        Capture thoughts instantly. Voice, text, or photo — routed to the right
        Notion page with AI.
      </p>

      {/* Connect Button */}
      <motion.button
        onClick={handleConnect}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          width: '100%',
          padding: '0.875rem 1.5rem',
          backgroundColor: 'var(--bg3)',
          border: '1px solid var(--line2)',
          borderRadius: '8px',
          color: 'var(--ink)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 400,
          cursor: 'pointer',
          transition: 'border-color 0.2s ease',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--sage)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--line2)'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
          <path d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-1.553 6.807-6.99 7.193L24.467 99.967c-4.08.193-6.023-.39-8.16-3.113L3.3 79.94c-2.333-3.113-3.3-5.443-3.3-8.167V11.113c0-3.497 1.553-6.413 6.017-6.8z" fill="currentColor"/>
          <path d="M61.35.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257-3.89c5.437-.387 6.99-2.917 6.99-7.193V20.64c0-2.21-.873-2.847-3.443-4.733L75.24 3.093C71.06-.52 69.51-.787 62.713.133L61.35.227z" fill="var(--bg2)"/>
          <path d="M28.45 16.93c-5.18.477-6.367.587-9.317-1.683L10.3 8.62c-1.55-1.17-.78-2.527 1.553-2.72l52.827-3.887c4.467-.387 6.793.973 8.737 2.527l10.5 7.583c.583.39 1.947 1.367.193 1.367l-54.693 3.247-.967.193z" fill="currentColor"/>
          <path d="M22.477 92.493V29.32c0-2.527.777-3.693 3.107-3.887l59.71-3.497c2.14-.193 3.107 1.167 3.107 3.693v62.787c0 2.527-1.36 5.833-5.437 6.033l-54.5 3.107c-4.08.193-6.987-1.167-5.987-5.063z" fill="var(--bg2)"/>
          <path d="M75.03 33.397c.39 1.75 0 3.497-1.75 3.693l-2.723.583v46.407c-2.333 1.17-4.467 1.75-6.22 1.75-2.917 0-3.693-.973-5.833-3.5L40.623 56.29v24.38l5.833 1.364s0 3.5-4.857 3.5l-13.393.777c-.39-.777 0-2.723 1.357-3.11l3.497-.973V47.893l-4.857-.39c-.39-1.75.583-4.277 3.3-4.467l14.363-.973 18.667 28.847V49.14l-4.857-.583c-.39-2.143 1.163-3.694 3.107-3.887l13.803-.777z" fill="currentColor"/>
        </svg>
        Connect Notion
      </motion.button>

      <p
        style={{
          fontSize: '0.6875rem',
          color: 'var(--ink3)',
          lineHeight: 1.5,
          fontFamily: 'var(--font-sans)',
        }}
      >
        We&apos;ll ask for access to your pages.
        <br />
        Your data stays yours — nothing is stored.
      </p>
    </motion.div>
  )
}
