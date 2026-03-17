export interface CaptureResult {
  cleanedTask: string
  destinationPageId: string
  destinationName: string
  priority: 'P1' | 'P2' | 'P3'
  dueDate: string | null
  isRecurring: boolean
  recurringPattern: string | null
  isUrl: boolean
  sourceUrl: string | null
}

export interface CaptureRequest {
  inputValue: string
  inputMode: 'text' | 'voice' | 'photo' | 'url'
  imageData?: string | null
  userId: string
}

export type InputMode = 'text' | 'voice' | 'photo' | 'url'
export type Priority = 'P1' | 'P2' | 'P3'
