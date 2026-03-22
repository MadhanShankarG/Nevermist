'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePreviewStore } from '@/store/preview'
import { useUserStore } from '@/store/user'
import PagePickerSheet from '@/components/PagePickerSheet'
import TaskChip from '@/components/TaskChip'
import type { CaptureResult } from '@/types/capture'

const CARD_SPRING = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as number[] }
const CARD_EXIT = { duration: 0.2, ease: 'easeIn' }

const PRIORITY_CYCLE: Record<string, 'P1' | 'P2' | 'P3'> = { P1: 'P2', P2: 'P3', P3: 'P1' }
const PRIORITY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  P1: { text: '#C07060', bg: '#1E0E0A', border: '#3A1A14' },
  P2: { text: '#C4944A', bg: '#1E1608', border: '#3A2A10' },
  P3: { text: '#6BA888', bg: '#0E1A14', border: '#1A3028' },
}

interface PreviewCardProps {
  onSend: () => Promise<void>
  onCancel: () => void
  isSending: boolean
}

export default function PreviewCard({ onSend, onCancel, isSending }: PreviewCardProps) {
  const preview = usePreviewStore()
  const pages = useUserStore((s) => s.pages)

  const [showPagePicker, setShowPagePicker] = useState(false)
  const destinationBadgeRef = useRef<HTMLButtonElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Local editable copies of photo tasks
  const [localTasks, setLocalTasks] = useState<CaptureResult[]>([])

  // Sync localTasks when preview opens with photo tasks
  const isPhotoMode = preview.tasks.length > 0

  useEffect(() => {
    if (isPhotoMode) setLocalTasks(preview.tasks)
  }, [preview.tasks, isPhotoMode])

  const handleRemoveTask = useCallback((index: number) => {
    setLocalTasks((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpdateTask = useCallback((index: number, updates: Partial<CaptureResult>) => {
    setLocalTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...updates } : t))
    )
  }, [])

  const cyclePriority = () => {
    preview.setPreview({ priority: PRIORITY_CYCLE[preview.priority] ?? 'P2' })
  }

  const priorityStyle = PRIORITY_COLORS[preview.priority] ?? PRIORITY_COLORS.P2

  const formattedDueDate = preview.dueDate
    ? new Date(preview.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null

  const handleSend = async () => {
    if (isPhotoMode) {
      // Inject latest local tasks into the store before sending
      preview.setPreview({ tasks: localTasks })
    }
    await onSend()
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!preview.visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSend()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview.visible, onCancel])

  return (
    <>
      <AnimatePresence>
        {preview.visible && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onCancel}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: '#000',
                zIndex: 10,
              }}
            />

            {/* Card */}
            <motion.div
              key="preview-card"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '8%', opacity: 0, scale: 0.97 }}
              transition={preview.visible ? CARD_SPRING : CARD_EXIT}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 20,
                display: 'flex',
                justifyContent: 'center',
                padding: '0 16px 24px',
                paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '760px',
                  backgroundColor: 'var(--bg3)',
                  border: '1px solid var(--line2)',
                  borderRadius: '9px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* ── Photo mode: task chip list ── */}
                {isPhotoMode ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      maxHeight: '50vh',
                      overflowY: 'auto',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--ink3)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      extracted tasks
                    </span>
                    {localTasks.length === 0 ? (
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '13px',
                          fontStyle: 'italic',
                          color: 'var(--ink3)',
                        }}
                      >
                        No tasks extracted. Try another photo.
                      </span>
                    ) : (
                      localTasks.map((task, i) => (
                        <TaskChip
                          key={i}
                          task={task}
                          index={i}
                          onRemove={handleRemoveTask}
                          onUpdate={handleUpdateTask}
                          pages={pages.map((p) => ({
                            notionPageId: p.notionPageId,
                            name: p.name,
                          }))}
                        />
                      ))
                    )}
                  </div>
                ) : (
                  <>
                    {/* ── Task text (inline editable) ── */}
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        preview.setPreview({ cleanedTask: e.currentTarget.textContent ?? '' })
                      }
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '14px',
                        color: 'var(--ink)',
                        lineHeight: 1.5,
                        outline: 'none',
                        minHeight: '24px',
                        caretColor: 'var(--accent)',
                      }}
                    >
                      {preview.cleanedTask}
                    </div>

                    {/* ── Metadata pills row ── */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Destination badge */}
                      <div style={{ position: 'relative' }}>
                        <button
                          ref={destinationBadgeRef}
                          onClick={() => setShowPagePicker((v) => !v)}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--sage)',
                            backgroundColor: 'var(--sage-bg)',
                            border: '1px solid var(--sage)',
                            borderRadius: '20px',
                            padding: '4px 10px',
                            cursor: 'pointer',
                            transition: 'opacity 150ms ease',
                          }}
                        >
                          {preview.destinationName || 'select page'}
                        </button>
                      </div>

                      {/* Priority pill — cycles on click */}
                      <button
                        onClick={cyclePriority}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: priorityStyle.text,
                          backgroundColor: priorityStyle.bg,
                          border: `1px solid ${priorityStyle.border}`,
                          borderRadius: '20px',
                          padding: '4px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        {preview.priority.toLowerCase()}
                      </button>

                      {/* Due date pill — opens native date picker */}
                      <button
                        onClick={() => dateInputRef.current?.showPicker?.()}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: formattedDueDate ? '#6BA888' : '#A09890',
                          backgroundColor: formattedDueDate ? '#0E1A14' : '#1A1A1A',
                          border: formattedDueDate ? '1px solid #1A3028' : '1px solid #3A3A3A',
                          borderRadius: '20px',
                          padding: '4px 10px',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        {formattedDueDate ? `due ${formattedDueDate}` : 'no date'}
                        <input
                          ref={dateInputRef}
                          type="date"
                          value={preview.dueDate ?? ''}
                          onChange={(e) => preview.setPreview({ dueDate: e.target.value || null })}
                          style={{
                            position: 'absolute',
                            opacity: 0,
                            pointerEvents: 'none',
                            width: 0,
                            height: 0,
                          }}
                        />
                      </button>
                    </div>
                  </>
                )}

                {/* ── Action row ── */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '4px',
                    borderTop: '1px solid var(--line)',
                  }}
                >
                  {/* Cancel */}
                  <button
                    onClick={onCancel}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--ink3)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      letterSpacing: '0.05em',
                    }}
                  >
                    cancel
                  </button>

                  {/* Send to Notion */}
                  <button
                    onClick={handleSend}
                    disabled={isSending || (isPhotoMode && localTasks.length === 0)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 300,
                      letterSpacing: '0.1em',
                      color: 'var(--bg)',
                      backgroundColor: isSending ? 'var(--ink3)' : 'var(--ink)',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '8px 18px',
                      cursor: isSending ? 'not-allowed' : 'pointer',
                      transition: 'background-color 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSending) e.currentTarget.style.backgroundColor = 'var(--accent)'
                    }}
                    onMouseLeave={(e) => {
                      if (!isSending) e.currentTarget.style.backgroundColor = 'var(--ink)'
                    }}
                  >
                    {isSending
                      ? 'sending…'
                      : isPhotoMode && localTasks.length > 1
                        ? `send ${localTasks.length} tasks`
                        : 'send to notion'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page picker — portal, outside card DOM */}
      <PagePickerSheet
        visible={showPagePicker}
        onClose={() => setShowPagePicker(false)}
        onSelect={(pageId, pageName) => {
          preview.setPreview({ destinationPageId: pageId, destinationName: pageName })
        }}
        currentPageId={preview.destinationPageId}
        anchorRef={destinationBadgeRef}
      />
    </>
  )
}
