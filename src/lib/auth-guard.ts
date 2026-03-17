import { NextResponse } from 'next/server'
import { getSession, type SessionData } from '@/lib/session'
import type { IronSession } from 'iron-session'

interface AuthResult {
  session: IronSession<SessionData>
  userId: string
}

/**
 * Checks if the request is authenticated.
 * Returns the session and userId if authenticated.
 * Returns a 401 NextResponse if not authenticated.
 */
export async function requireAuth(): Promise<AuthResult | NextResponse> {
  const session = await getSession()

  if (!session.isAuthenticated || !session.userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return { session, userId: session.userId }
}

/**
 * Type guard to check if requireAuth returned an auth result vs a 401 response.
 */
export function isAuthenticated(result: AuthResult | NextResponse): result is AuthResult {
  return 'userId' in result
}
