'use client'

import { useState, useEffect } from 'react'

interface AuthState {
  isAuthenticated: boolean
  userId: string | null
  isLoading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    isLoading: true,
  })

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()

        setState({
          isAuthenticated: data.isAuthenticated === true,
          userId: data.userId || null,
          isLoading: false,
        })
      } catch {
        setState({
          isAuthenticated: false,
          userId: null,
          isLoading: false,
        })
      }
    }

    checkSession()
  }, [])

  return state
}
