'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface NotionPageItem {
  id: string
  name: string
  type: 'database' | 'page'
  icon?: string | null
  properties?: string[]
}

interface PageConfigDraft {
  notionPageId: string
  name: string
  description: string
  isDatabase: boolean
  databaseProps: string | null
  sortOrder: number
}

interface DescribeStepProps {
  selectedPages: NotionPageItem[]
  onDone: () => void
}

export default function DescribeStep({ selectedPages, onDone }: DescribeStepProps) {
  const [configs, setConfigs] = useState<PageConfigDraft[]>([])
  const [isGenerating, setIsGenerating] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateDescriptions = useCallback(async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/onboarding/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pages: selectedPages.map((p) => ({
            name: p.name,
            type: p.type,
            properties: p.properties,
          })),
        }),
      })

      let descriptions: Array<{ name: string; description: string }> = []

      if (res.ok) {
        const data = await res.json()
        descriptions = data.descriptions || []
      }

      // Create configs from selected pages + descriptions
      const newConfigs: PageConfigDraft[] = selectedPages.map((page, i) => {
        const desc = descriptions.find(
          (d) => d.name.toLowerCase() === page.name.toLowerCase()
        )
        return {
          notionPageId: page.id,
          name: page.name,
          description: desc?.description || `${page.name} — items and tasks`,
          isDatabase: page.type === 'database',
          databaseProps: null,
          sortOrder: i,
        }
      })

      setConfigs(newConfigs)
    } catch (err) {
      console.error('Error generating descriptions:', err)
      // Fallback descriptions
      setConfigs(
        selectedPages.map((page, i) => ({
          notionPageId: page.id,
          name: page.name,
          description: `${page.name} — items and tasks`,
          isDatabase: page.type === 'database',
          databaseProps: null,
          sortOrder: i,
        }))
      )
    } finally {
      setIsGenerating(false)
    }
  }, [selectedPages])

  useEffect(() => {
    generateDescriptions()
  }, [generateDescriptions])

  const updateDescription = (index: number, description: string) => {
    setConfigs((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], description }
      return next
    })
  }

  const handleDone = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/user/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: configs }),
      })

      if (!res.ok) {
        throw new Error('Failed to save configuration')
      }

      onDone()
    } catch (err) {
      console.error('Error saving config:', err)
      setError('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
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
        maxWidth: '480px',
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
          Describe each page
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8125rem',
            color: 'var(--ink2)',
            lineHeight: 1.5,
          }}
        >
          These descriptions help the AI route your captures. Edit if needed.
        </p>
      </div>

      {/* Page descriptions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {isGenerating
          ? // Skeleton loading
            selectedPages.map((page, i) => (
              <div
                key={page.id}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg2)',
                  border: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '0.875rem' }}>
                    {page.icon && !page.icon.startsWith('http')
                      ? page.icon
                      : page.type === 'database'
                        ? '⊞'
                        : '📄'}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem',
                      color: 'var(--ink)',
                      fontWeight: 400,
                    }}
                  >
                    {page.name}
                  </span>
                </div>
                <div
                  style={{
                    height: '36px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg4)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              </div>
            ))
          : configs.map((config, i) => (
              <motion.div
                key={config.notionPageId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg2)',
                  border: '1px solid var(--line)',
                }}
              >
                {/* Page name */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '0.875rem' }}>
                    {selectedPages[i]?.icon &&
                    !selectedPages[i]?.icon?.startsWith('http')
                      ? selectedPages[i].icon
                      : config.isDatabase
                        ? '⊞'
                        : '📄'}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem',
                      color: 'var(--ink)',
                      fontWeight: 400,
                    }}
                  >
                    {config.name}
                  </span>
                  {config.isDatabase && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.5625rem',
                        color: 'var(--ink3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '0.125rem 0.375rem',
                        backgroundColor: 'var(--bg4)',
                        borderRadius: '3px',
                      }}
                    >
                      database
                    </span>
                  )}
                </div>

                {/* Inline editable description */}
                <input
                  type="text"
                  value={config.description}
                  onChange={(e) => updateDescription(i, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.625rem',
                    backgroundColor: 'var(--bg3)',
                    border: '1px solid var(--line)',
                    borderRadius: '4px',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8125rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--line)'
                  }}
                />
              </motion.div>
            ))}
      </div>

      {/* Error */}
      {error && (
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8125rem',
            color: 'var(--red)',
          }}
        >
          {error}
        </p>
      )}

      {/* Done button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
        <motion.button
          onClick={handleDone}
          disabled={isGenerating || isSaving}
          whileHover={!isGenerating && !isSaving ? { scale: 1.02 } : {}}
          whileTap={!isGenerating && !isSaving ? { scale: 0.98 } : {}}
          style={{
            padding: '0.625rem 2rem',
            borderRadius: '6px',
            backgroundColor:
              isGenerating || isSaving ? 'var(--bg4)' : 'var(--sage)',
            border: 'none',
            color: isGenerating || isSaving ? 'var(--ink3)' : 'var(--bg)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 400,
            cursor: isGenerating || isSaving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            letterSpacing: '0.02em',
          }}
        >
          {isSaving ? 'saving...' : 'done'}
        </motion.button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </motion.div>
  )
}
