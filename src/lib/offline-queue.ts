import { openDB, type IDBPDatabase } from 'idb'
import type { QueueItem } from '@/types/queue'

const DB_NAME = 'nevermist'
const STORE_NAME = 'queue'
// Bump to 2 so existing browsers that have v1 upgrade cleanly.
// The store shape is the same — no new indices needed.
const DB_VERSION = 2

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          })
        }
        // v1 → v2: same object store, only version bump needed
      },
    })
  }
  return dbPromise
}

/**
 * Add an item to the IndexedDB queue.
 *
 * Accepts a full QueueItem (minus `id`). Callers must supply all required
 * fields, including `status`, `rawInput`, `inputMode`, `createdAt`, and
 * `retryCount`. This lets callers choose between `pending-ai` and
 * `pending-notion` as appropriate.
 *
 * For `pending-ai` items, pass placeholder values for the processed
 * fields (cleanedTask: '', destinationPageId: '', etc.) — these are
 * updated by `updateQueueItem()` after Claude processes the item.
 */
export async function addToQueue(
  item: Omit<QueueItem, 'id'>,
): Promise<number> {
  const db = await getDB()
  const id = await db.add(STORE_NAME, item)
  return id as number
}

/**
 * Returns all queue items sorted by createdAt ASC (FIFO order).
 */
export async function getAllQueued(): Promise<QueueItem[]> {
  const db = await getDB()
  const all: QueueItem[] = await db.getAll(STORE_NAME)
  return all.sort((a, b) => a.createdAt - b.createdAt)
}

export async function removeFromQueue(id: number): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

/**
 * Partially update a queue item in-place.
 * Used by the sync engine to upgrade a `pending-ai` item to `pending-notion`
 * after Claude processes it — without removing and re-adding.
 */
export async function updateQueueItem(
  id: number,
  updates: Partial<QueueItem>,
): Promise<void> {
  const db = await getDB()
  const item: QueueItem | undefined = await db.get(STORE_NAME, id)
  if (item) {
    await db.put(STORE_NAME, { ...item, ...updates, id })
  }
}

export async function markFailed(id: number, error: string): Promise<void> {
  const db = await getDB()
  const item: QueueItem | undefined = await db.get(STORE_NAME, id)
  if (item) {
    await db.put(STORE_NAME, { ...item, status: 'failed' as const, error })
  }
}

export async function markNeedsRerouting(id: number): Promise<void> {
  const db = await getDB()
  const item: QueueItem | undefined = await db.get(STORE_NAME, id)
  if (item) {
    await db.put(STORE_NAME, {
      ...item,
      status: 'needs-rerouting' as const,
      error: 'Destination page not found',
    })
  }
}
