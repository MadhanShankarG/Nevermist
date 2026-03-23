export interface QueueItem {
  id?: number
  cleanedTask: string
  destinationPageId: string
  destinationName: string
  priority: 'P1' | 'P2' | 'P3'
  dueDate: string | null
  isRecurring: boolean
  recurringPattern: string | null
  isUrl: boolean
  sourceUrl: string | null
  status: 'pending' | 'failed' | 'needs-rerouting'
  createdAt: number
  error?: string
}

export interface FailedItem extends QueueItem {
  error: string
  failedAt: number
}
