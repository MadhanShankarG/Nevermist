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

const PRIORITY_COLORS: Record<string, { text: string; bg: string }> = {
  P1: { text: 'var(--red)', bg: 'var(--red-bg)' },
  P2: { text: 'var(--amber)', bg: 'var(--amb-bg)' },
  P3: { text: 'var(--ink3)', bg: 'var(--bg4)' },
}

export default function TaskChip({ task, index, onRemove, onUpdate, pages }: TaskChipProps) {
  const isUncertain = task.cleanedTask.includes('[?]')
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.cleanedTask)
  const [showPagePicker, setShowPagePicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const commitEdit = () => {
    onUpdate(index, { cleanedTask: editValue })
    setIsEditing(false)
  }

  const priorityStyle = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.P2

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
            if (e.key === 'Escape') { setEditValue(task.cleanedTask); setIsEditing(false) }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {/* Destination badge */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPagePicker((p) => !p)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--sage)',
              backgroundColor: 'var(--sage-bg)',
              border: '1px solid var(--sage)',
              borderRadius: '4px',
              padding: '2px 6px',
              cursor: 'pointer',
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
                  onClick={() => {
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
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg4)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {page.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority pill */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: priorityStyle.text,
            backgroundColor: priorityStyle.bg,
            border: `1px solid ${priorityStyle.text}`,
            borderRadius: '4px',
            padding: '2px 5px',
          }}
        >
          {task.priority.toLowerCase()}
        </span>

        {/* Spacer */}
        <span style={{ flex: 1 }} />

        {/* Edit button */}
        <button
          onClick={() => setIsEditing(true)}
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
          onClick={() => onRemove(index)}
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
