'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { PageConfig } from '@/types/notion'

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton({ width = '100%', height = '16px' }: { width?: string; height?: string }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'var(--bg4)',
        borderRadius: '4px',
        animation: 'pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

// ── PageRow ────────────────────────────────────────────────────────────────
function PageRow({
  page,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDescriptionChange,
}: {
  page: PageConfig
  index: number
  total: number
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onDescriptionChange: (id: string, description: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(page.description)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(page.description)
  }, [page.description])

  const handleBlur = () => {
    setIsEditing(false)
    if (draft !== page.description) {
      onDescriptionChange(page.id, draft)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setDraft(page.description)
      setIsEditing(false)
    }
  }

  return (
    <div
      style={{
        padding: '10px 0',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}
    >
      {/* Reorder arrows */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          marginTop: '1px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => onMoveUp(page.id)}
          disabled={index === 0}
          aria-label={`Move ${page.name} up`}
          style={{
            background: 'none',
            border: 'none',
            padding: '1px 3px',
            cursor: index === 0 ? 'default' : 'pointer',
            color: index === 0 ? 'var(--line2)' : 'var(--ink3)',
            fontSize: '10px',
            lineHeight: 1,
          }}
        >
          ▲
        </button>
        <button
          onClick={() => onMoveDown(page.id)}
          disabled={index === total - 1}
          aria-label={`Move ${page.name} down`}
          style={{
            background: 'none',
            border: 'none',
            padding: '1px 3px',
            cursor: index === total - 1 ? 'default' : 'pointer',
            color: index === total - 1 ? 'var(--line2)' : 'var(--ink3)',
            fontSize: '10px',
            lineHeight: 1,
          }}
        >
          ▼
        </button>
      </div>

      {/* Name + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--ink)',
            margin: '0 0 4px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {page.name}
        </p>

        {isEditing ? (
          <input
            ref={inputRef}
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              background: 'var(--bg3)',
              border: '1px solid var(--accent)',
              borderRadius: '4px',
              padding: '3px 6px',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--ink2)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(true)}
            title="Click to edit description"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--ink3)',
              margin: 0,
              cursor: 'text',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {page.description || '— add description —'}
          </p>
        )}
      </div>
    </div>
  )
}

// ── PageConfigList ─────────────────────────────────────────────────────────
export default function PageConfigList() {
  const [pages, setPages] = useState<PageConfig[]>([])
  const [loading, setLoading] = useState(true)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch on mount
  useEffect(() => {
    fetch('/api/user/config')
      .then((r) => r.json())
      .then((data: { pages?: PageConfig[] }) => {
        if (data.pages) {
          setPages(data.pages.map((p) => ({ ...p, createdAt: new Date(p.createdAt) })))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Debounced save — 500ms after last mutation
  const scheduleSave = useCallback((updatedPages: PageConfig[]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      try {
        await fetch('/api/user/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pages: updatedPages.map((p, i) => ({
              id: p.id,
              notionPageId: p.notionPageId,
              name: p.name,
              description: p.description,
              sortOrder: i,
              isDatabase: p.isDatabase,
              databaseProps: p.databaseProps,
            })),
          }),
        })
      } catch (err) {
        console.error('[settings] pages save failed:', err)
      }
    }, 500)
  }, [])

  const moveUp = useCallback((id: string) => {
    setPages((prev) => {
      const i = prev.findIndex((p) => p.id === id)
      if (i <= 0) return prev
      const next = [...prev]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      scheduleSave(next)
      return next
    })
  }, [scheduleSave])

  const moveDown = useCallback((id: string) => {
    setPages((prev) => {
      const i = prev.findIndex((p) => p.id === id)
      if (i < 0 || i >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      scheduleSave(next)
      return next
    })
  }, [scheduleSave])

  const updateDescription = useCallback((id: string, description: string) => {
    setPages((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, description } : p))
      scheduleSave(next)
      return next
    })
  }, [scheduleSave])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Skeleton width="60%" height="14px" />
            <Skeleton width="85%" height="12px" />
          </div>
        ))}
        <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
      </div>
    )
  }

  return (
    <div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
      {pages.length === 0 ? (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--ink3)',
            margin: 0,
          }}
        >
          No pages configured.
        </p>
      ) : (
        <div>
          {pages.map((page, index) => (
            <PageRow
              key={page.id}
              page={page}
              index={index}
              total={pages.length}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
              onDescriptionChange={updateDescription}
            />
          ))}
          {pages.length >= 6 && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--ink3)',
                marginTop: '10px',
                letterSpacing: '0.05em',
              }}
            >
              Maximum 6 pages reached
            </p>
          )}
        </div>
      )}
    </div>
  )
}
