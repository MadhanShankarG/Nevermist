import { create } from 'zustand'

interface CaptureState {
  inputValue: string
  inputMode: 'text' | 'voice' | 'photo' | 'url'
  isProcessing: boolean
  processingError: string | null
  isMultiTask: boolean
}

interface CaptureActions {
  setInputValue: (value: string) => void
  setInputMode: (mode: CaptureState['inputMode']) => void
  setIsProcessing: (processing: boolean) => void
  setProcessingError: (error: string | null) => void
  setIsMultiTask: (v: boolean) => void
  reset: () => void
}

const initialState: CaptureState = {
  inputValue: '',
  inputMode: 'text',
  isProcessing: false,
  processingError: null,
  isMultiTask: false,
}

export const useCaptureStore = create<CaptureState & CaptureActions>((set) => ({
  ...initialState,
  setInputValue: (value) => set({ inputValue: value }),
  setInputMode: (mode) => set({ inputMode: mode }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setProcessingError: (error) => set({ processingError: error }),
  setIsMultiTask: (v) => set({ isMultiTask: v }),
  reset: () => set(initialState),
}))
