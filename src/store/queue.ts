import { create } from 'zustand'
import type { QueueItem, FailedItem } from '@/types/queue'

interface QueueState {
  items: QueueItem[]
  isSyncing: boolean
  isOnline: boolean
  failedItems: FailedItem[]
  needsReconnect: boolean
}

interface QueueActions {
  addItem: (item: QueueItem) => void
  removeItem: (id: number) => void
  setItems: (items: QueueItem[]) => void
  setIsSyncing: (syncing: boolean) => void
  setIsOnline: (online: boolean) => void
  setNeedsReconnect: (needs: boolean) => void
  addFailedItem: (item: FailedItem) => void
  removeFailedItem: (id: number) => void
  reset: () => void
}

const initialState: QueueState = {
  items: [],
  isSyncing: false,
  isOnline: true,
  failedItems: [],
  needsReconnect: false,
}

export const useQueueStore = create<QueueState & QueueActions>((set) => ({
  ...initialState,
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  setItems: (items) => set({ items }),
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  setIsOnline: (online) => set({ isOnline: online }),
  setNeedsReconnect: (needs) => set({ needsReconnect: needs }),
  addFailedItem: (item) => set((state) => ({ failedItems: [...state.failedItems, item] })),
  removeFailedItem: (id) =>
    set((state) => ({ failedItems: state.failedItems.filter((i) => i.id !== id) })),
  reset: () => set(initialState),
}))
