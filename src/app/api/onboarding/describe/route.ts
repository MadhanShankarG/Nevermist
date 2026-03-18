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

    const descriptions = await generatePageDescriptions(pages)
    return NextResponse.json({ descriptions })
  } catch (err) {
    console.error('Error generating descriptions:', err)
    return NextResponse.json(
      { error: 'Failed to generate descriptions' },
      { status: 500 }
    )
  }
}
