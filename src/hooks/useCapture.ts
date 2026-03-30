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

  /** Normalise InputMode to the subset the queue supports */
  const toQueueMode = (mode: string): 'text' | 'voice' | 'photo' =>
    mode === 'photo' ? 'photo' : mode === 'voice' ? 'voice' : 'text'

  const submit = useCallback(async (imageData?: string | null) => {
    if (!inputValue.trim() && !imageData) return

    // ─────────────────────────────────────────────────────────────────────
    // OFFLINE PATH — WhatsApp-style instant feedback.
    //   Save raw input as pending-ai, clear the input, show a brief
    //   success message. AI + Notion happen silently in startSync().
    // ─────────────────────────────────────────────────────────────────────
    if (!navigator.onLine) {
      setIsOnline(false)

      try {
        await addToQueue({
          rawInput: inputValue,
          inputMode: toQueueMode(inputMode),
          // Placeholder values — replaced by updateQueueItem() after Claude runs
          cleanedTask: '',
          destinationPageId: '',
          destinationName: '',
          priority: 'P3',
          dueDate: null,
          isRecurring: false,
          recurringPattern: null,
          isUrl: false,
          sourceUrl: null,
          status: 'pending-ai',
          createdAt: Date.now(),
          retryCount: 0,
        })
        await syncQueueStore()
      } catch {
        // IDB failure — still clear the field and show the message
      }

      resetCapture()
      // Sentinel — page.tsx renders a friendly green message for 2 seconds
      setProcessingError('__offline_queued__')
      return
    }

    // ─────────────────────────────────────────────────────────────────────
    // ONLINE PATH — unchanged from Phase 9
    // ─────────────────────────────────────────────────────────────────────
    setIsProcessing(true)
    setProcessingError(null)

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
      // Network dropped mid-request — queue raw input for later
      if (!navigator.onLine || (err instanceof TypeError && err.message.toLowerCase().includes('fetch'))) {
        setIsOnline(false)

        try {
          await addToQueue({
            rawInput: inputValue,
            inputMode: toQueueMode(inputMode),
            cleanedTask: '',
            destinationPageId: '',
            destinationName: '',
            priority: 'P3',
            dueDate: null,
            isRecurring: false,
            recurringPattern: null,
            isUrl: false,
            sourceUrl: null,
            status: 'pending-ai',
            createdAt: Date.now(),
            retryCount: 0,
          })
          await syncQueueStore()
        } catch {
          // IDB failure — non-critical
        }

        resetCapture()
        setProcessingError('__offline_queued__')
        return
      }

      const message = err instanceof Error ? err.message : 'Something went wrong'
      setProcessingError(message)
    } finally {
      setIsProcessing(false)
    }
  }, [inputValue, inputMode, setIsProcessing, setProcessingError, setPreview, setIsOnline, syncQueueStore, resetCapture])

  // ─────────────────────────────────────────────────────────────────────
  // sendToNotion — called from page.tsx after user confirms preview card.
  //   addToQueue(pending-notion) → /api/notion/send → 200: removeFromQueue
  //   On failure: item stays in queue for useOffline.startSync()
  // ─────────────────────────────────────────────────────────────────────
  const sendToNotion = useCallback(async (
    result: CaptureResult,
    onSuccess: (result: CaptureResult) => void,
    onError: (message: string) => void,
  ) => {
    let queueId: number | null = null

    try {
      queueId = await addToQueue({
        rawInput: result.cleanedTask,
        inputMode: 'text',
        cleanedTask: result.cleanedTask,
        destinationPageId: result.destinationPageId,
        destinationName: result.destinationName,
        priority: result.priority,
        dueDate: result.dueDate,
        isRecurring: result.isRecurring,
        recurringPattern: result.recurringPattern,
        isUrl: result.isUrl,
        sourceUrl: result.sourceUrl,
        status: 'pending-notion',
        createdAt: Date.now(),
        retryCount: 0,
      })
      await syncQueueStore()
    } catch {
      // IDB failure — continue
    }

    try {
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

      // 200 — remove from queue
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
      if (!navigator.onLine || (err instanceof TypeError && err.message.toLowerCase().includes('fetch'))) {
        setIsOnline(false)
      }
      await syncQueueStore()
      const message = err instanceof Error ? err.message : 'Send failed'
      onError(message)
    }
  }, [syncQueueStore, setIsOnline])

  return { submit, sendToNotion }
}
