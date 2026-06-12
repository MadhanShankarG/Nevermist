export interface CaptureResult {
  cleanedTask: string
  destinationPageId: string
  destinationName: string
  priority: 'P1' | 'P2' | 'P3'
  dueDate: string | null
  dueTime: string | null        // "HH:MM" 24-hour, e.g. "08:00", "17:30". null if no time.
  duration: number              // minutes. 0 if no time specified. e.g. 90 for "1.5 hours"
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
