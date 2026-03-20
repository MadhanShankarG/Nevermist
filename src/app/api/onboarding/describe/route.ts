import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthenticated } from '@/lib/auth-guard'
import { generatePageDescriptions } from '@/lib/ai'

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!isAuthenticated(auth)) return auth

  try {
    const body = await request.json()
    const { pages } = body

    if (!pages || !Array.isArray(pages)) {
      return NextResponse.json(
        { error: 'pages array is required' },
        { status: 400 }
      )
    }

    let descriptions
    try {
      descriptions = await generatePageDescriptions(pages)
    } catch (err) {
      console.error('generatePageDescriptions failed — falling back to page names:', err)
      descriptions = (pages as Array<{ name: string }>).map((p) => ({
        name: p.name,
        description: `${p.name} — items and tasks`,
      }))
    }

    return NextResponse.json({ descriptions })
  } catch (err) {
    console.error('Error in onboarding describe route:', err)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
