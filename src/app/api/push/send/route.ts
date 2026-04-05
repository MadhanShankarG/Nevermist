import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushNotification } from '@/lib/push'

// POST /api/push/send
// Called by Vercel Cron every hour (0 * * * *).
// Sends a daily nudge to users whose nudgeTime matches the current UTC hour.
export async function POST(request: NextRequest) {
  // ── Auth: verify cron secret ─────────────────────────────────────────
  const cronSecret = request.headers.get('x-cron-secret')
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Find eligible users ───────────────────────────────────────────────
  const users = await prisma.user.findMany({
    where: {
      nudgeTime: { not: null },
      pushSubscription: { not: null },
    },
  })

  const currentHour = new Date().getUTCHours() // 0–23

  // Filter: nudgeTime is stored as "HH:MM" (24h, user's chosen local time
  // treated as UTC for simplicity in V1). Only send when hour matches.
  const eligibleUsers = users.filter((user) => {
    if (!user.nudgeTime) return false
    const [hStr] = user.nudgeTime.split(':')
    return parseInt(hStr, 10) === currentHour
  })

  if (eligibleUsers.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // ── Build and send a notification per user ───────────────────────────
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  let sent = 0

  for (const user of eligibleUsers) {
    // Count how many tasks the user captured today.
    // We approximate by counting PageConfig updates today (V1 simplification —
    // there is no per-capture log table yet, so we use a heuristic).
    // In practice the nudge body varies between "you captured X" and the
    // fallback — the exact count query depends on v2 capture log table.
    // For now, always use the encouraging fallback message.
    const body = 'Quick thought before you sleep?'

    const payload = {
      title: 'Nevermist',
      body,
      icon: '/icons/icon-192.png',
    }

    const ok = await sendPushNotification(
      user.pushSubscription!,
      payload,
      user.id,
    )

    if (ok) sent++
  }

  return NextResponse.json({ sent, total: eligibleUsers.length })
}
