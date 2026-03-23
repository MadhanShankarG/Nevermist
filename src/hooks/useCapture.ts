'use client'

import { useCallback } from 'react'
import { useCaptureStore } from '@/store/capture'
import { usePreviewStore } from '@/store/preview'
import { useQueueStore } from '@/store/queue'
import { addToQueue, getAllQueued, removeFromQueue } from '@/lib/offline-queue'
import type { CaptureResult } from '@/types/capture'

export function useCapture() {
  const inputValue = useCaptureStore((s) => s.inputValue)
  const inputMode = useCaptureStore((s) => s.inputMode)
  const setIsProcessing = useCaptureStore((s) => s.setIsProcessing)
  const setProcessingError = useCaptureStore((s) => s.setProcessingError)
  const setPreview = usePreviewStore((s) => s.setPreview)
  const setIsOnline = useQueueStore((s) => s.setIsOnline)
  const setItems = useQueueStore((s) => s.setItems)

  const submit = useCallback(async (imageData?: string | null) => {
    if (!inputValue.trim() && !imageData) return

    setIsProcessing(true)
    setProcessingError(null)

    // Save to IndexedDB BEFORE any API call — capture is never lost
    let queueId: number | null = null
    try {
      queueId = await addToQueue({
        cleanedTask: inputValue,
        destinationPageId: '',
        destinationName: '',
        priority: 'P2',
        dueDate: null,
        isRecurring: false,
        recurringPattern: null,
        isUrl: false,
        sourceUrl: null,
      })
      // Sync store with IDB
      const items = await getAllQueued()
      setItems(items)
    } catch {
      // IDB failure — continue without queue safety net
    }

    // If offline: skip API call, keep item in queue
    if (!navigator.onLine) {
      setIsOnline(false)
      setIsProcessing(false)
      setProcessingError('You\'re offline — capture queued for later')
      return
    }

    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputValue,
          inputMode,
          imageData: imageData ?? null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Capture failed')
      }

      // AI processing succeeded — remove from queue
      // (the preview card handles Notion send; if that fails,
      // the user can retry from the preview which is still visible)
      if (queueId !== null) {
        try {
          await removeFromQueue(queueId)
          const items = await getAllQueued()
          setItems(items)
        } catch {
          // IDB failure — non-critical
        }
      }

      // Photo mode — array of tasks
      if (inputMode === 'photo' && Array.isArray(data.tasks)) {
        setPreview({
          visible: true,
          tasks: data.tasks as CaptureResult[],
          cleanedTask: data.tasks[0]?.cleanedTask ?? '',
          destinationPageId: data.tasks[0]?.destinationPageId ?? '',
          destinationName: data.tasks[0]?.destinationName ?? '',
          priority: data.tasks[0]?.priority ?? 'P2',
          dueDate: data.tasks[0]?.dueDate ?? null,
          isRecurring: data.tasks[0]?.isRecurring ?? false,
          recurringPattern: data.tasks[0]?.recurringPattern ?? null,
          isUrl: false,
          sourceUrl: null,
        })
      } else {
        // Text / voice / url — single result
        const result = data as CaptureResult
        setPreview({
          visible: true,
          cleanedTask: result.cleanedTask,
          destinationPageId: result.destinationPageId,
          destinationName: result.destinationName,
          priority: result.priority,
          dueDate: result.dueDate,
          isRecurring: result.isRecurring,
          recurringPattern: result.recurringPattern,
          isUrl: result.isUrl,
          sourceUrl: result.sourceUrl,
          tasks: [],
        })
      }
    } catch (err) {
      // Network error — keep item in queue for offline sync
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setIsOnline(false)
        setProcessingError('Network lost — capture queued for later')
        return
      }

      // Non-network error — remove from queue (item can't be processed)
      if (queueId !== null) {
        try {
          await removeFromQueue(queueId)
          const items = await getAllQueued()
          setItems(items)
        } catch {
          // IDB failure — non-critical
        }
      }

      const message = err instanceof Error ? err.message : 'Something went wrong'
      setProcessingError(message)
    } finally {
      setIsProcessing(false)
    }
  }, [inputValue, inputMode, setIsProcessing, setProcessingError, setPreview, setIsOnline, setItems])

  return { submit }
}
