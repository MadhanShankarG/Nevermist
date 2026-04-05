/**
 * isPushSupported()
 *
 * Returns true ONLY when:
 *   1. The browser has a service worker API
 *   2. The browser supports PushManager
 *   3. The app is running in standalone (installed PWA) mode
 *
 * On iOS push is only available when the PWA is installed to the
 * home screen (iOS 16.4+). This check prevents offering a feature
 * that can't be delivered.
 *
 * Safe to call on server — always returns false outside a browser.
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    nav.standalone === true
  )
}

/**
 * isIosSafariNotInstalled()
 *
 * Returns true when the user is on an iOS Safari browser that is NOT
 * running as a standalone PWA. Used to show the install banner.
 */
export function isIosSafariNotInstalled(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isStandalone = nav.standalone === true
  return isIos && !isStandalone
}
