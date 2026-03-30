/**
 * QueueItem — two lifecycle states:
 *
 *  pending-ai:     Raw input saved before Claude processes it.
 *                  cleanedTask/destinationPageId are placeholders.
 *                  The sync engine calls /api/capture, upgrades to pending-notion.
 *
 *  pending-notion: Claude has produced a result. Ready to send to Notion.
 *
 * Processed fields (cleanedTask, destinationPageId, etc.) are always
 * present so that existing API routes (e.g. /api/queue/sync) which
 * read these fields without optional guards continue to type-check.
 * For pending-ai items they hold placeholder values that are replaced
 * by updateQueueItem() after Claude processes the item.
 */
export interface QueueItem {
  id?: number

  // ── Raw input — always populated at queue time ──
  rawInput: string                          // what the user typed
  inputMode: 'text' | 'voice' | 'photo'    // determines how sync calls /api/capture

  // ── Processed fields — required, but placeholders until Claude runs ──
  cleanedTask: string                       // '' for pending-ai
  destinationPageId: string                 // '' for pending-ai
  destinationName: string                   // '' for pending-ai
  priority: 'P1' | 'P2' | 'P3'            // default 'P3' for pending-ai
  dueDate: string | null
  isRecurring: boolean
  recurringPattern: string | null
  isUrl: boolean
  sourceUrl: string | null

  // ── Metadata ──
  status: 'pending-ai' | 'pending-notion' | 'failed' | 'needs-rerouting'
  createdAt: number
  retryCount: number
  error?: string
}

export interface FailedItem extends QueueItem {
  error: string
  failedAt: number
}
