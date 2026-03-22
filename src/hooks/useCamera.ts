'use client'

import { useState, useCallback } from 'react'
import { openCamera, compressImage } from '@/lib/camera'
import { useCaptureStore } from '@/store/capture'
import { usePreviewStore } from '@/store/preview'
import type { CaptureResult } from '@/types/capture'

export interface UseCameraReturn {
  isCapturing: boolean
  error: string | null
  capturePhoto: () => Promise<void>
  clearError: () => void
}

export function useCamera(): UseCameraReturn {
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setInputMode = useCaptureStore((s) => s.setInputMode)
  const setIsProcessing = useCaptureStore((s) => s.setIsProcessing)
  const setProcessingError = useCaptureStore((s) => s.setProcessingError)
  const setPreview = usePreviewStore((s) => s.setPreview)

  const capturePhoto = useCallback(async () => {
    setError(null)

    // Open file picker / camera first — before setting any store state
    // (avoids showing a processing indicator before the user has picked a photo)
    let file: File
    try {
      file = await openCamera()
    } catch (err) {
      // User cancelled — silently ignore
      if (err instanceof Error && err.message === 'cancelled') return
      setError(err instanceof Error ? err.message : 'Camera unavailable')
      return
    }

    setIsCapturing(true)
    setInputMode('photo')
    setIsProcessing(true)
    setProcessingError(null)

    try {
      const base64 = await compressImage(file)

      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputValue: '',
          inputMode: 'photo',
          imageData: base64,
        }),
      })

      const data = (await res.json()) as
        | { tasks: CaptureResult[] }
        | { error: string }

      if (!res.ok) {
        throw new Error('error' in data ? data.error : 'Photo capture failed')
      }

      if (!('tasks' in data) || !Array.isArray(data.tasks)) {
        throw new Error('Unexpected response from capture')
      }

      const tasks = data.tasks
      setPreview({
        visible: true,
        tasks,
        cleanedTask: tasks[0]?.cleanedTask ?? '',
        destinationPageId: tasks[0]?.destinationPageId ?? '',
        destinationName: tasks[0]?.destinationName ?? '',
        priority: tasks[0]?.priority ?? 'P2',
        dueDate: tasks[0]?.dueDate ?? null,
        isRecurring: tasks[0]?.isRecurring ?? false,
        recurringPattern: tasks[0]?.recurringPattern ?? null,
        isUrl: false,
        sourceUrl: null,
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setProcessingError(message)
    } finally {
      setIsCapturing(false)
      setIsProcessing(false)
    }
  }, [setInputMode, setIsProcessing, setProcessingError, setPreview])

  const clearError = useCallback(() => setError(null), [])

  return { isCapturing, error, capturePhoto, clearError }
}
