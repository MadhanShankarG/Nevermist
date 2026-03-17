import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()

  if (!session.isAuthenticated || !session.userId) {
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 401 }
    )
  }

  return NextResponse.json({
    isAuthenticated: true,
    userId: session.userId,
  })
}
