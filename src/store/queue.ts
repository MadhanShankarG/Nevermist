import { create } from 'zustand'
import type { QueueItem, FailedItem } from '@/types/queue'

interface QueueState {
  items: QueueItem[]
  isSyncing: boolean
  isOnline: boolean
  failedItems: FailedItem[]
}

interface QueueActions {
  addItem: (item: QueueItem) => void
  removeItem: (id: string) => void
  setIsSyncing: (syncing: boolean) => void
  setIsOnline: (online: boolean) => void
  addFailedItem: (item: FailedItem) => void
  reset: () => void
}

const initialState: QueueState = {
  items: [],
  isSyncing: false,
  isOnline: true,
  failedItems: [],
}

export const useQueueStore = create<QueueState & QueueActions>((set) => ({
  ...initialState,
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  setIsOnline: (online) => set({ isOnline: online }),
  addFailedItem: (item) => set((state) => ({ failedItems: [...state.failedItems, item] })),
  reset: () => set(initialState),
}))
