'use client'

import { useState, useRef, useEffect } from 'react'
import type { CaptureResult } from '@/types/capture'

interface TaskChipProps {
  task: CaptureResult
  index: number
  onRemove: (index: number) => void
  onUpdate: (index: number, updates: Partial<CaptureResult>) => void
  pages: Array<{ notionPageId: string; name: string }>
}

const PRIORITY_CYCLE: Record<string, 'P1' | 'P2' | 'P3'> = {
  P1: 'P2',
  P2: 'P3',
  P3: 'P1',
}

const PRIORITY_COLORS: Record<
  string,
  { text: string; bg: string; border: string }
> = {
  P1: { text: '#C07060', bg: '#1E0E0A', border: '#3A1A14' },
  P2: { text: '#C4944A', bg: '#1E1608', border: '#3A2A10' },
  P3: { text: '#6BA888', bg: '#0E1A14', border: '#1A3028' },
}

export default function TaskChip({
  task,
  index,
  onRemove,
  onUpdate,
  pages,
}: TaskChipProps) {
  const isUncertain = task.cleanedTask.includes('[?]')
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.cleanedTask)
  const [showPagePicker, setShowPagePicker] = useState(false)

  // Local priority state — initialised from prop, propagated up on every change
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3'>(
    task.priority ?? 'P2',
  )

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const commitEdit = () => {
    onUpdate(index, { cleanedTask: editValue })
    setIsEditing(false)
  }

  const cyclePriority = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = PRIORITY_CYCLE[priority] ?? 'P2'
    setPriority(next)
    onUpdate(index, { priority: next })
  }

  const priorityStyle = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.P2

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '10px 12px',
        backgroundColor: 'var(--bg3)',
        border: isUncertain ? '1px dashed var(--line)' : '1px solid var(--line2)',
        borderRadius: '8px',
        position: 'relative',
      }}
    >
      {/* Task text / edit input */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit()
            if (e.key === 'Escape') {
              setEditValue(task.cleanedTask)
              setIsEditing(false)
            }
          }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '12px',
            color: 'var(--ink)',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid var(--accent)',
            outline: 'none',
            width: '100%',
            caretColor: 'var(--accent)',
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '12px',
            color: isUncertain ? 'var(--ink3)' : 'var(--ink)',
            fontStyle: isUncertain ? 'italic' : 'normal',
            lineHeight: 1.4,
          }}
        >
          {task.cleanedTask}
        </span>
      )}

      {/* Bottom row: destination + priority + actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
        }}
      >
        {/* Destination badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowPagePicker((p) => !p)
            }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--sage)',
              backgroundColor: 'var(--sage-bg)',
              border: '1px solid var(--sage)',
              borderRadius: '4px',
              padding: '2px 6px',
              cursor: 'pointer',
              minHeight: '28px',
            }}
          >
            {task.destinationName}
          </button>
          {showPagePicker && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                marginBottom: '4px',
                backgroundColor: 'var(--bg3)',
                border: '1px solid var(--line2)',
                borderRadius: '8px',
                overflow: 'hidden',
                zIndex: 50,
                minWidth: '160px',
              }}
            >
              {pages.map((page) => (
                <button
                  key={page.notionPageId}
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdate(index, {
                      destinationPageId: page.notionPageId,
                      destinationName: page.name,
                    })
                    setShowPagePicker(false)
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: 'var(--ink)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--line)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'var(--bg4)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  {page.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority pill — tappable, cycles P1 → P2 → P3 */}
        <button
          onClick={cyclePriority}
          aria-label={`Priority ${priority} — tap to change`}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: priorityStyle.text,
            backgroundColor: priorityStyle.bg,
            border: `1px solid ${priorityStyle.border}`,
            borderRadius: '4px',
            padding: '0 8px',
            cursor: 'pointer',
            minHeight: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 100ms ease, color 100ms ease',
          }}
        >
          {priority.toLowerCase()}
        </button>

        {/* Spacer */}
        <span style={{ flex: 1 }} />

        {/* Edit button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--ink3)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
          }}
        >
          edit
        </button>

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(index)
          }}
          aria-label="Remove task"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--ink3)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
