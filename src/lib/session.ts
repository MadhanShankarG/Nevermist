import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId?: string
  isAuthenticated: boolean
}

const sessionOptions = {
  cookieName: 'nevermist-session',
  password: process.env.SESSION_SECRET!,
  ttl: 30 * 24 * 60 * 60, // 30 days in seconds
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    path: '/',
  },
}

/**
 * Get the session from cookies (for use in App Router route handlers and server components).
 */
export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
