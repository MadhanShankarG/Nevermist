'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useQueueStore } from '@/store/queue'
import {
  getAllQueued,
  removeFromQueue,
  markFailed,
  markNeedsRerouting,
} from '@/lib/offline-queue'

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
    if (isSyncingRef.current) return
    isSyncingRef.current = true
    setIsSyncing(true)

    try {
      const items = await getAllQueued()
      const pending = items.filter((i) => i.status === 'pending')

      for (const item of pending) {
        // Check we're still online before each item
        if (!navigator.onLine) break

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
              // Auth revoked — stop entire sync
              setNeedsReconnect(true)
              await syncQueueToStore()
              return
            }

            if (res.status === 404) {
              await markNeedsRerouting(id)
              await syncQueueToStore()
              break
            }

            if (res.status === 429) {
              // Rate limited — exponential backoff
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

            // Give up on this item
            await markFailed(id, data.error ?? 'Send failed')
            await syncQueueToStore()
            break
          } catch {
            // Network drop mid-sync — stop, resume on next online event
            if (!navigator.onLine) break
            retries++
            if (retries > MAX_RETRIES) {
              await markFailed(id, 'Network error')
              await syncQueueToStore()
              break
            }
            await sleep(BACKOFF_BASE_MS * retries)
          }
        }

        // If we went offline mid-loop, stop
        if (!navigator.onLine) break
      }
    } finally {
      isSyncingRef.current = false
      setIsSyncing(false)
      await syncQueueToStore()
    }
  }, [setIsSyncing, setNeedsReconnect, syncQueueToStore])

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
