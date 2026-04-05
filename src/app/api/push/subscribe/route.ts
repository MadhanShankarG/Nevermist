import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthenticated } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

// POST /api/push/subscribe
// Stores the browser PushSubscription object for the current user.
export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!isAuthenticated(auth)) return auth

  const body = await request.json() as { subscription: PushSubscriptionJSON }

  if (!body.subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: auth.userId },
    data: { pushSubscription: JSON.stringify(body.subscription) },
  })

  return NextResponse.json({ success: true })
}
