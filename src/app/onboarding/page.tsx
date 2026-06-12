'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

// Inner component that uses useSearchParams — must be wrapped in Suspense
function OnboardingInner() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isReconfigure = searchParams.get('reconfigure') === 'true'

  const [step, setStep] = useState<OnboardingStep>('connect')
  const [selectedPages, setSelectedPages] = useState<NotionPageItem[]>([])

  // If already authenticated, skip connect step.
  // If reconfiguring, jump straight to pages selection.
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
      <div
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
      </div>
    )
  }

  // Step indicators — skip 'connect' step when reconfiguring
  const visibleSteps = isReconfigure
    ? (['pages', 'describe'] as OnboardingStep[])
    : (['connect', 'pages', 'describe'] as OnboardingStep[])

  return (
    <>
      {/* Step indicator */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {visibleSteps.map((s, i) => (
          <div
            key={s}
            style={{
              width: '24px',
              height: '2px',
              borderRadius: '1px',
              backgroundColor:
                i <= visibleSteps.indexOf(step)
                  ? 'var(--sage)'
                  : 'var(--bg4)',
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'connect' && !isReconfigure && (
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
    </>
  )
}

// Page wrapper — Suspense required for useSearchParams
export default function OnboardingPage() {
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
      <Suspense
        fallback={
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--ink3)',
              letterSpacing: '0.05em',
            }}
          >
            loading...
          </div>
        }
      >
        <OnboardingInner />
      </Suspense>
    </main>
  )
}
