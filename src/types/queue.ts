export interface QueueItem {
  id: string
  cleanedTask: string
  destinationPageId: string
  destinationName: string
  priority: 'P1' | 'P2' | 'P3'
  dueDate: string | null
  isRecurring: boolean
  recurringPattern: string | null
  isUrl: boolean
  sourceUrl: string | null
  createdAt: number
  status: 'pending' | 'syncing' | 'failed'
}

export interface FailedItem extends QueueItem {
  error: string
  failedAt: number
}
