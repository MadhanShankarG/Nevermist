import 'server-only'

import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

// ── Types ───────────────────────────────────────────────────────────────
export interface PushPayload {
  title: string
  body: string
  icon: string
}

// ── Lazy VAPID init ──────────────────────────────────────────────────────
// Called on first notification send so env vars are available at runtime
// and not required at module load (which would crash the build).
let vapidInitialized = false
function ensureVapid() {
  if (vapidInitialized) return
  const subject = process.env.VAPID_SUBJECT
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!subject || !publicKey || !privateKey) {
    throw new Error('VAPID environment variables are not set')
  }
  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidInitialized = true
}

// ── sendPushNotification ─────────────────────────────────────────────────
// Sends a single push notification.
// On 410 Gone: subscription has expired — clears it from the DB.
// Returns true on success, false on failure (caller logs as needed).
export async function sendPushNotification(
  subscriptionJson: string,
  payload: PushPayload,
  userId: string,
): Promise<boolean> {
  ensureVapid()

  let subscription: webpush.PushSubscription

  try {
    subscription = JSON.parse(subscriptionJson) as webpush.PushSubscription
  } catch {
    console.error('[push] Invalid subscription JSON for user', userId)
    return false
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return true
  } catch (err: unknown) {
    // 410 Gone — the browser has unsubscribed; clean up the DB record
    if (
      typeof err === 'object' &&
      err !== null &&
      'statusCode' in err &&
      (err as { statusCode: number }).statusCode === 410
    ) {
      console.info('[push] Subscription expired (410) for user', userId, '— removing')
      await prisma.user.update({
        where: { id: userId },
        data: { pushSubscription: null },
      })
    } else {
      console.error('[push] sendNotification failed for user', userId, err)
    }
    return false
  }
}

