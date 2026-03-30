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
  const resetCapture = useCaptureStore((s) => s.reset)
  const setPreview = usePreviewStore((s) => s.setPreview)
  const setIsOnline = useQueueStore((s) => s.setIsOnline)
  const setItems = useQueueStore((s) => s.setItems)

  const syncQueueStore = useCallback(async () => {
    try {
      const items = await getAllQueued()
      setItems(items)
    } catch {
      // IDB read failure — non-critical
    }
  }, [setItems])

  const submit = useCallback(async (imageData?: string | null) => {
    if (!inputValue.trim() && !imageData) return

    // ── Step 1: If offline, skip entirely — AI hasn't processed it yet
    // so there is nothing meaningful to queue.
    if (!navigator.onLine) {
      setIsOnline(false)
      setProcessingError("You're offline — capture when back online")
      return
    }

    setIsProcessing(true)
    setProcessingError(null)

    let captureResult: CaptureResult | null = null

    try {
      // ── Step 2: Call /api/capture for AI processing
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

      // ── Step 3: AI returned a CaptureResult — show preview card.
      // For photo mode, use the first task for the preview header.
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
        captureResult = data as CaptureResult
        setPreview({
          visible: true,
          cleanedTask: captureResult.cleanedTask,
          destinationPageId: captureResult.destinationPageId,
          destinationName: captureResult.destinationName,
          priority: captureResult.priority,
          dueDate: captureResult.dueDate,
          isRecurring: captureResult.isRecurring,
          recurringPattern: captureResult.recurringPattern,
          isUrl: captureResult.isUrl,
          sourceUrl: captureResult.sourceUrl,
          tasks: [],
        })
      }
    } catch (err) {
      // Network error during /api/capture — we cannot AI-process offline,
      // so there is nothing to queue. Show a user-friendly message.
      if (!navigator.onLine || (err instanceof TypeError && err.message.toLowerCase().includes('fetch'))) {
        setIsOnline(false)
        setProcessingError("You're offline — capture when back online")
        return
      }

      // Non-network error (e.g. 500, auth error) — no queue, just report
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setProcessingError(message)
    } finally {
      setIsProcessing(false)
    }
  }, [inputValue, inputMode, setIsProcessing, setProcessingError, setPreview, setIsOnline, syncQueueStore])

  // ── sendToNotion is called from page.tsx after the user confirms the
  // preview card. We handle the queue here so the flow is:
  //   AI result shown in preview → user taps Send →
  //   addToQueue(result) → call /api/notion/send →
  //   200: removeFromQueue → done
  //   failure: item stays in queue for sync
  const sendToNotion = useCallback(async (
    result: CaptureResult,
    onSuccess: (result: CaptureResult) => void,
    onError: (message: string) => void,
  ) => {
    let queueId: number | null = null

    // ── Step 3a: Save processed CaptureResult to queue
    try {
      queueId = await addToQueue(result)
      await syncQueueStore()
    } catch {
      // IDB failure — continue, worst case we lose resilience
    }

    try {
      // ── Step 4: Call /api/notion/send with the processed result
      const res = await fetch('/api/notion/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cleanedTask: result.cleanedTask,
          destinationPageId: result.destinationPageId,
          priority: result.priority,
          dueDate: result.dueDate,
          isRecurring: result.isRecurring,
          recurringPattern: result.recurringPattern,
          isUrl: result.isUrl,
          sourceUrl: result.sourceUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error || 'Failed to send to Notion')
      }

      // ── Step 5: 200 success — remove from queue, notify caller
      if (queueId !== null) {
        try {
          await removeFromQueue(queueId)
          await syncQueueStore()
        } catch {
          // IDB failure — non-critical
        }
      }

      onSuccess(result)
    } catch (err) {
      // ── Step 6: Network error or server error — item stays in queue
      // useOffline.startSync() will re-send when back online.
      if (!navigator.onLine || (err instanceof TypeError && err.message.toLowerCase().includes('fetch'))) {
        setIsOnline(false)
      }

      // Keep item in queue (do NOT call removeFromQueue) — sync will handle it
      await syncQueueStore()

      const message = err instanceof Error ? err.message : 'Send failed'
      onError(message)
    }
  }, [syncQueueStore, setIsOnline])

  return { submit, sendToNotion }
}
