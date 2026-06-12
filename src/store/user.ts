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
  theme: 'dark' | 'light'
  settingsOpen: boolean
}

interface UserActions {
  setAuthenticated: (authenticated: boolean) => void
  setNotionWorkspace: (workspace: string | null) => void
  setPages: (pages: PageConfig[]) => void
  setTextPolish: (polish: boolean) => void
  setNudgeTime: (time: string | null) => void
  setHasCompletedFirstCapture: (completed: boolean) => void
  setHasSeenTagline: (seen: boolean) => void
  setTheme: (theme: 'dark' | 'light') => void
  setSettingsOpen: (open: boolean) => void
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
  theme: 'dark',
  settingsOpen: false,
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
  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nevermist-theme', theme)
    }
    set({ theme })
  },
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  reset: () => set(initialState),
}))

