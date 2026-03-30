/// <reference lib="webworker" />
// Nevermist Service Worker — powered by @serwist/next
// @serwist/next injects the precache manifest at build time.
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, NetworkFirst, CacheFirst } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Navigation requests: try network (3s timeout), fall back to cached app shell
      matcher: ({ request }: { request: Request }) => request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: 'nevermist-pages',
        networkTimeoutSeconds: 3,
      }),
    },
    {
      // Next.js static chunks: always serve from cache
      matcher: /\/_next\/static\/.*/,
      handler: new CacheFirst({
        cacheName: 'nevermist-static',
      }),
    },
  ],
})

serwist.addEventListeners()
