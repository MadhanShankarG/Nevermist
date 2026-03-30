'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useQueueStore } from '@/store/queue'
import {
  getAllQueued,
  removeFromQueue,
  updateQueueItem,
  markFailed,
  markNeedsRerouting,
} from '@/lib/offline-queue'
import type { CaptureResult } from '@/types/capture'

const MAX_RETRIES = 3
const BACKOFF_BASE_MS = 2000

export function useOffline() {
  const setIsOnline = useQueueStore((s) => s.setIsOnline)
  const setIsSyncing = useQueueStore((s) => s.setIsSyncing)
  const setItems = useQueueStore((s) => s.setItems)
  const setNeedsReconnect = useQueueStore((s) => s.setNeedsReconnect)
  const isSyncing = useQueueStore((s) => s.isSyncing)

  const isSyncingRef = useRef(false)

  const syncQueueToStore = useCallback(async () => {
    try {
      const items = await getAllQueued()
      setItems(items)
    } catch {
      // IDB read failure — non-critical
    }
  }, [setItems])

  const startSync = useCallback(async () => {
    console.log('[useOffline] startSync fired — online:', navigator.onLine)
    if (isSyncingRef.current) return
    isSyncingRef.current = true
    setIsSyncing(true)

    try {
      // getAllQueued() returns items sorted by createdAt ASC — FIFO
      const items = await getAllQueued()
      const actionable = items.filter(
        (i) => i.status === 'pending-ai' || i.status === 'pending-notion',
      )

      for (const item of actionable) {
        if (!navigator.onLine) break

        const id = item.id!

        // ──────────────────────────────────────────────────────────────
        // PENDING-AI: call Claude, upgrade item in-place, then fall
        //             through to Notion send immediately
        // ──────────────────────────────────────────────────────────────
        if (item.status === 'pending-ai') {
          console.log('[useOffline] processing pending-ai item:', id, item.rawInput.slice(0, 40))

          let captureResult: CaptureResult | null = null

          try {
            const res = await fetch('/api/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                inputValue: item.rawInput,
                inputMode: item.inputMode,
                imageData: null,
              }),
            })

            if (res.status === 401) {
              // Auth revoked — stop entire sync
              setNeedsReconnect(true)
              await syncQueueToStore()
              return
            }

            if (!res.ok) {
              const errData = (await res.json().catch(() => ({}))) as { error?: string }
              await markFailed(id, errData.error ?? `Capture failed (${res.status})`)
              await syncQueueToStore()
              continue
            }

            const data = await res.json()
            captureResult = data as CaptureResult
          } catch {
            // Network error while calling Claude
            if (!navigator.onLine) break
            await markFailed(id, 'Network error during AI processing')
            await syncQueueToStore()
            continue
          }

          // Upgrade item: pending-ai → pending-notion with Claude's result
          try {
            await updateQueueItem(id, {
              status: 'pending-notion',
              cleanedTask: captureResult.cleanedTask,
              destinationPageId: captureResult.destinationPageId,
              destinationName: captureResult.destinationName,
              priority: captureResult.priority,
              dueDate: captureResult.dueDate,
              isRecurring: captureResult.isRecurring,
              recurringPattern: captureResult.recurringPattern,
              isUrl: captureResult.isUrl,
              sourceUrl: captureResult.sourceUrl,
            })
          } catch {
            // IDB write failed — skip to next item
            continue
          }

          // Re-fetch the updated item so the notion-send block below has
          // all fields populated
          const updatedItems = await getAllQueued()
          const upgraded = updatedItems.find((i) => i.id === id)
          if (!upgraded || upgraded.status !== 'pending-notion') continue

          // Fall through to notion send with the upgraded item
          await sendItemToNotion(upgraded)
        } else if (item.status === 'pending-notion') {
          // ────────────────────────────────────────────────────────────
          // PENDING-NOTION: existing logic — unchanged
          // ────────────────────────────────────────────────────────────
          await sendItemToNotion(item)
        }

        if (!navigator.onLine) break
      }
    } finally {
      isSyncingRef.current = false
      setIsSyncing(false)
      await syncQueueToStore()
    }

    // ── Inner helper — send one pending-notion item to Notion ──────────
    async function sendItemToNotion(item: Awaited<ReturnType<typeof getAllQueued>>[number]) {
      const id = item.id!
      let success = false
      let retries = 0

      while (!success && retries <= MAX_RETRIES) {
        try {
          const res = await fetch('/api/queue/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          })

          if (res.ok) {
            await removeFromQueue(id)
            await syncQueueToStore()
            success = true
            break
          }

          const data = (await res.json().catch(() => ({}))) as {
            error?: string
            retryable?: boolean
          }

          if (res.status === 401) {
            setNeedsReconnect(true)
            await syncQueueToStore()
            // Signal outer loop to stop
            isSyncingRef.current = false
            return
          }

          if (res.status === 404) {
            await markNeedsRerouting(id)
            await syncQueueToStore()
            break
          }

          if (res.status === 429) {
            const delay = BACKOFF_BASE_MS * Math.pow(2, retries)
            await sleep(delay)
            retries++
            continue
          }

          // 500 or other server error — retry up to MAX_RETRIES
          if (data.retryable !== false && retries < MAX_RETRIES) {
            retries++
            await sleep(BACKOFF_BASE_MS * retries)
            continue
          }

          await markFailed(id, data.error ?? 'Send failed')
          await syncQueueToStore()
          break
        } catch {
          if (!navigator.onLine) return
          retries++
          if (retries > MAX_RETRIES) {
            await markFailed(id, 'Network error')
            await syncQueueToStore()
            break
          }
          await sleep(BACKOFF_BASE_MS * retries)
        }
      }
    }
  }, [setIsSyncing, setNeedsReconnect, syncQueueToStore, setNeedsReconnect])

  useEffect(() => {
    // Initialize online state + load queue on mount
    setIsOnline(navigator.onLine)
    syncQueueToStore()

    const handleOnline = () => {
      setIsOnline(true)
      startSync()
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // If already online and there are items, sync on mount
    if (navigator.onLine) {
      startSync()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setIsOnline, startSync, syncQueueToStore])

  return { isSyncing, startSync }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
