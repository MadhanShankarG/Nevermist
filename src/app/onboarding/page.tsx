'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AnimatePresence } from 'framer-motion'
import ConnectStep from '@/components/onboarding/ConnectStep'
import PagesStep from '@/components/onboarding/PagesStep'
import DescribeStep from '@/components/onboarding/DescribeStep'

interface NotionPageItem {
  id: string
  name: string
  type: 'database' | 'page'
  icon?: string | null
  properties?: string[]
}

type OnboardingStep = 'connect' | 'pages' | 'describe'

export default function OnboardingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>('connect')
  const [selectedPages, setSelectedPages] = useState<NotionPageItem[]>([])

  // If already authenticated, skip to pages step
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setStep('pages')
    }
  }, [isAuthenticated, isLoading])

  const handleConnect = () => {
    window.location.href = '/api/auth/notion'
  }

  const handlePagesSelected = (pages: NotionPageItem[]) => {
    setSelectedPages(pages)
    setStep('describe')
  }

  const handleDone = () => {
    router.replace('/')
  }

  if (isLoading) {
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
      {/* Step indicator */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {['connect', 'pages', 'describe'].map((s, i) => (
          <div
            key={s}
            style={{
              width: '24px',
              height: '2px',
              borderRadius: '1px',
              backgroundColor:
                i <= ['connect', 'pages', 'describe'].indexOf(step)
                  ? 'var(--sage)'
                  : 'var(--bg4)',
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'connect' && (
          <ConnectStep key="connect" onConnect={handleConnect} />
        )}
        {step === 'pages' && (
          <PagesStep key="pages" onContinue={handlePagesSelected} />
        )}
        {step === 'describe' && (
          <DescribeStep
            key="describe"
            selectedPages={selectedPages}
            onDone={handleDone}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
