import { create } from 'zustand'
import type { PageConfig } from '@/types/notion'

interface UserState {
  isAuthenticated: boolean
  notionWorkspace: string | null
  pages: PageConfig[]
  textPolish: boolean
  nudgeTime: string | null
  hasCompletedFirstCapture: boolean
  hasSeenTagline: boolean
}

interface UserActions {
  setAuthenticated: (authenticated: boolean) => void
  setNotionWorkspace: (workspace: string | null) => void
  setPages: (pages: PageConfig[]) => void
  setTextPolish: (polish: boolean) => void
  setNudgeTime: (time: string | null) => void
  setHasCompletedFirstCapture: (completed: boolean) => void
  setHasSeenTagline: (seen: boolean) => void
  reset: () => void
}

const initialState: UserState = {
  isAuthenticated: false,
  notionWorkspace: null,
  pages: [],
  textPolish: true,
  nudgeTime: null,
  hasCompletedFirstCapture: false,
  hasSeenTagline: false,
}

export const useUserStore = create<UserState & UserActions>((set) => ({
  ...initialState,
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  setNotionWorkspace: (workspace) => set({ notionWorkspace: workspace }),
  setPages: (pages) => set({ pages }),
  setTextPolish: (polish) => set({ textPolish: polish }),
  setNudgeTime: (time) => set({ nudgeTime: time }),
  setHasCompletedFirstCapture: (completed) => set({ hasCompletedFirstCapture: completed }),
  setHasSeenTagline: (seen) => set({ hasSeenTagline: seen }),
  reset: () => set(initialState),
}))
