'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NotionPageItem {
  id: string
  name: string
  type: 'database' | 'page'
  icon?: string | null
  properties?: string[]
}

interface PagesStepProps {
  onContinue: (selectedPages: NotionPageItem[]) => void
}

export default function PagesStep({ onContinue }: PagesStepProps) {
  const [pages, setPages] = useState<NotionPageItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPages() {
      try {
        const res = await fetch('/api/notion/pages')
        if (!res.ok) throw new Error('Failed to fetch pages')
        const data = await res.json()
        setPages(data.pages || [])
      } catch (err) {
        setError('Could not load your Notion pages. Please try again.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPages()
  }, [])

  const togglePage = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 6) {
        next.add(id)
      }
      return next
    })
  }

  const handleContinue = () => {
    const selectedPages = pages.filter((p) => selected.has(p.id))
    onContinue(selectedPages)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '440px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            fontWeight: 500,
            color: 'var(--ink)',
            marginBottom: '0.5rem',
          }}
        >
          Choose your destinations
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8125rem',
            color: 'var(--ink2)',
            lineHeight: 1.5,
          }}
        >
          Select up to 6 pages where your captures will be routed.
        </p>
      </div>

      {/* Page list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        {isLoading ? (
          // Skeleton rows
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                backgroundColor: 'var(--bg2)',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg4)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: '14px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--bg4)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                  maxWidth: `${60 + Math.random() * 30}%`,
                }}
              />
            </div>
          ))
        ) : error ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--red)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8125rem',
            }}
          >
            {error}
          </div>
        ) : pages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--ink2)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8125rem',
            }}
          >
            No pages found. Make sure your Notion integration has access to some pages.
          </div>
        ) : (
          <AnimatePresence>
            {pages.map((page, i) => {
              const isSelected = selected.has(page.id)
              return (
                <motion.button
                  key={page.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  onClick={() => togglePage(page.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'var(--sage-bg)' : 'var(--bg2)',
                    border: `1px solid ${isSelected ? 'var(--sage)' : 'var(--line2)'}`,
                    color: 'var(--ink)',
                    cursor: selected.size >= 6 && !isSelected ? 'not-allowed' : 'pointer',
                    opacity: selected.size >= 6 && !isSelected ? 0.4 : 1,
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    textAlign: 'left',
                    width: '100%',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {/* Icon */}
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: page.icon && !page.icon.startsWith('http') ? '1rem' : '0.75rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg4)',
                      flexShrink: 0,
                    }}
                  >
                    {page.icon && !page.icon.startsWith('http')
                      ? page.icon
                      : page.type === 'database'
                        ? '⊞'
                        : '📄'}
                  </span>

                  {/* Name + type badge */}
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {page.name}
                    </span>
                  </span>

                  {/* Type badge */}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      color: 'var(--ink3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      flexShrink: 0,
                    }}
                  >
                    {page.type}
                  </span>

                  {/* Checkmark */}
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        color: 'var(--sage)',
                        fontSize: '1rem',
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Max pages message */}
      {selected.size >= 6 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--ink3)',
          }}
        >
          maximum 6 pages reached
        </motion.p>
      )}

      {/* Selected count + Continue */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.5rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--ink2)',
          }}
        >
          {selected.size} selected
        </span>

        <motion.button
          onClick={handleContinue}
          disabled={selected.size === 0}
          whileHover={selected.size > 0 ? { scale: 1.02 } : {}}
          whileTap={selected.size > 0 ? { scale: 0.98 } : {}}
          style={{
            padding: '0.625rem 1.5rem',
            borderRadius: '6px',
            backgroundColor: selected.size > 0 ? 'var(--sage)' : 'var(--bg4)',
            border: 'none',
            color: selected.size > 0 ? 'var(--bg)' : 'var(--ink3)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 400,
            cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            letterSpacing: '0.02em',
          }}
        >
          continue
        </motion.button>
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </motion.div>
  )
}
