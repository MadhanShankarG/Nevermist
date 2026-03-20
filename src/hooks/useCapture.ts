'use client'

import { useCallback } from 'react'
import { useCaptureStore } from '@/store/capture'
import { usePreviewStore } from '@/store/preview'
import type { CaptureResult } from '@/types/capture'

export function useCapture() {
  const inputValue = useCaptureStore((s) => s.inputValue)
  const inputMode = useCaptureStore((s) => s.inputMode)
  const setIsProcessing = useCaptureStore((s) => s.setIsProcessing)
  const setProcessingError = useCaptureStore((s) => s.setProcessingError)
  const setPreview = usePreviewStore((s) => s.setPreview)

  const submit = useCallback(async (imageData?: string | null) => {
    if (!inputValue.trim() && !imageData) return

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
          // Seed first task fields into top-level for single-task fallback
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
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setProcessingError(message)
    } finally {
      setIsProcessing(false)
    }
  }, [inputValue, inputMode, setIsProcessing, setProcessingError, setPreview])

  return { submit }
}
