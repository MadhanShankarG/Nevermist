import { create } from 'zustand'
import type { CaptureResult } from '@/types/capture'

interface PreviewState {
  visible: boolean
  cleanedTask: string
  destinationPageId: string
  destinationName: string
  priority: 'P1' | 'P2' | 'P3'
  dueDate: string | null
  isRecurring: boolean
  recurringPattern: string | null
  isUrl: boolean
  sourceUrl: string | null
  tasks: CaptureResult[]
}

interface PreviewActions {
  setPreview: (preview: Partial<PreviewState>) => void
  reset: () => void
}

const initialState: PreviewState = {
  visible: false,
  cleanedTask: '',
  destinationPageId: '',
  destinationName: '',
  priority: 'P2',
  dueDate: null,
  isRecurring: false,
  recurringPattern: null,
  isUrl: false,
  sourceUrl: null,
  tasks: [],
}

export const usePreviewStore = create<PreviewState & PreviewActions>((set) => ({
  ...initialState,
  setPreview: (preview) => set((state) => ({ ...state, ...preview })),
  reset: () => set(initialState),
}))
