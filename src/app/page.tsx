'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { isAuthenticated, userId, isLoading } = useAuth()
  const router = useRouter()
  const [hasPages, setHasPages] = useState<boolean | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace('/connect')
      return
    }

    // Check if user has configured pages
    async function checkPages() {
      try {
        const res = await fetch('/api/user/config')
        if (res.ok) {
          const data = await res.json()
          if (!data.pages || data.pages.length === 0) {
            router.replace('/onboarding')
            return
          }
          setHasPages(true)
        } else {
          router.replace('/onboarding')
        }
      } catch {
        setHasPages(true) // Default to showing capture screen on error
      }
    }

    checkPages()
  }, [isAuthenticated, isLoading, router])

  // Loading state
  if (isLoading || (!isAuthenticated && hasPages === null)) {
    return (
      <main
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          color: 'var(--ink3)',
        }}
      >
        loading...
      </main>
    )
  }

  // Authenticated with pages — render capture screen (placeholder for now)
  if (hasPages) {
    return (
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.5rem',
            fontWeight: 500,
            color: 'var(--ink)',
            marginBottom: '0.5rem',
          }}
        >
          Nevermist
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--ink3)',
          }}
        >
          capture screen — placeholder
        </p>
      </main>
    )
  }

  return null
}
