'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/user'
import { createPortal } from 'react-dom'

interface PagePickerSheetProps {
  visible: boolean
  onClose: () => void
  onSelect: (pageId: string, pageName: string) => void
  currentPageId?: string
  anchorRef?: React.RefObject<HTMLElement | null>
}

interface DropdownPos {
  top: number
  left: number
  openAbove: boolean
}

export default function PagePickerSheet({
  visible,
  onClose,
  onSelect,
  currentPageId,
  anchorRef,
}: PagePickerSheetProps) {
  const pages = useUserStore((s) => s.pages)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null)

  // Reactive mobile check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Compute dropdown position from anchor when visible opens on desktop
  useEffect(() => {
    if (!visible || isMobile) return
    if (!anchorRef?.current) return

    const rect = anchorRef.current.getBoundingClientRect()
    const dropdownHeight = Math.min(pages.length * 64 + 44, 320)
    const spaceBelow = window.innerHeight - rect.bottom - 8
    const openAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight

    setDropdownPos({
      top: openAbove ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - 288 - 8),
      openAbove,
    })
  }, [visible, isMobile, anchorRef, pages.length])

  // Close on outside click
  useEffect(() => {
    if (!visible) return
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [visible, onClose, anchorRef])

  // Escape key
  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [visible, onClose])

  if (typeof document === 'undefined') return null

  const SHEET_WIDTH = 280

  const content = (
    <AnimatePresence>
      {visible && (
        <>
          {/* Mobile backdrop */}
          {isMobile && (
            <motion.div
              key="picker-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                zIndex: 90,
              }}
            />
          )}

          <motion.div
            ref={containerRef}
            key="page-picker"
            initial={isMobile ? { y: '100%' } : { opacity: 0, y: -6 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, y: -4 }}
            transition={{
              duration: isMobile ? 0.25 : 0.15,
              ease: isMobile ? [0.16, 1, 0.3, 1] : [0.16, 1, 0.3, 1],
            }}
            style={
              isMobile
                ? {
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--bg2)',
                    border: '1px solid var(--line2)',
                    borderRadius: '12px 12px 0 0',
                    zIndex: 91,
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    maxHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                  }
                : {
                    position: 'fixed',
                    top: dropdownPos?.top ?? 0,
                    left: dropdownPos?.left ?? 0,
                    width: `${SHEET_WIDTH}px`,
                    backgroundColor: 'var(--bg2)',
                    border: '1px solid var(--line2)',
                    borderRadius: '10px',
                    zIndex: 100,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                  }
            }
          >
            {/* Mobile drag handle */}
            {isMobile && (
              <div
                style={{
                  padding: '10px 0 6px',
                  display: 'flex',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: 'var(--line2)',
                  }}
                />
              </div>
            )}

            {/* Header */}
            <div
              style={{
                padding: '10px 14px 8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.08em',
                color: 'var(--ink3)',
                borderBottom: '1px solid var(--line)',
                flexShrink: 0,
              }}
            >
              send to
            </div>

            {/* Page list */}
            <div
              style={{
                overflowY: 'auto',
                flex: isMobile ? '1 1 auto' : undefined,
                maxHeight: isMobile ? undefined : '320px',
              }}
            >
              {pages.map((page) => {
                const isActive = page.notionPageId === currentPageId
                const isDb = page.isDatabase

                return (
                  <button
                    key={page.notionPageId}
                    onClick={() => {
                      onSelect(page.notionPageId, page.name)
                      onClose()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      background: isActive ? 'var(--sage-bg)' : 'transparent',
                      border: 'none',
                      borderLeft: isActive
                        ? '2px solid var(--sage)'
                        : '2px solid transparent',
                      borderBottom: '1px solid var(--line)',
                      cursor: 'pointer',
                      minHeight: '48px',
                      transition: 'background-color 100ms ease',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = isActive
                        ? 'var(--sage-bg)'
                        : 'var(--bg3)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = isActive
                        ? 'var(--sage-bg)'
                        : 'transparent')
                    }
                  >
                    {/* Icon */}
                    <span
                      style={{
                        fontSize: '14px',
                        width: '16px',
                        textAlign: 'center',
                        flexShrink: 0,
                        lineHeight: 1,
                      }}
                    >
                      {isDb ? '⊞' : '📄'}
                    </span>

                    {/* Name + description */}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: 'block',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '13px',
                          color: isActive ? 'var(--sage)' : 'var(--ink)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {page.name}
                      </span>
                      {page.description && (
                        <span
                          style={{
                            display: 'block',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '11px',
                            color: 'var(--ink3)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '1px',
                          }}
                        >
                          {page.description}
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}
