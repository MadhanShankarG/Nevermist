import { openDB, type IDBPDatabase } from 'idb'
import type { QueueItem } from '@/types/queue'

const DB_NAME = 'nevermist'
const STORE_NAME = 'queue'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          })
        }
      },
    })
  }
  return dbPromise
}

export async function addToQueue(
  item: Omit<QueueItem, 'id' | 'status' | 'createdAt'>,
): Promise<number> {
  const db = await getDB()
  const entry = { ...item, status: 'pending' as const, createdAt: Date.now() }
  const id = await db.add(STORE_NAME, entry)
  return id as number
}

export async function getAllQueued(): Promise<QueueItem[]> {
  const db = await getDB()
  const all: QueueItem[] = await db.getAll(STORE_NAME)
  return all.sort((a, b) => a.createdAt - b.createdAt)
}

export async function removeFromQueue(id: number): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
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
