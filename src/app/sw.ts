/// <reference lib="webworker" />
// Nevermist Service Worker — powered by @serwist/next
// @serwist/next injects the precache manifest at build time.
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, NetworkFirst, CacheFirst, ExpirationPlugin } from 'serwist'

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
      // Navigation requests: try network (3s timeout), fall back to cached app shell.
      // handlerDidError fires when network times-out AND no cache entry exists —
      // returning '/' prevents the blank Safari "FetchEvent.respondWith" error screen.
      matcher: ({ request }: { request: Request }) => request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: 'nevermist-pages',
        networkTimeoutSeconds: 3,
        plugins: [
          {
            handlerDidError: async () => {
              return (await caches.match('/')) ?? Response.error()
            },
          },
        ],
      }),
    },
    {
      // Next.js static chunks: always serve from cache, expire after 30 days
      matcher: /\/_next\/static\/.*/,
      handler: new CacheFirst({
        cacheName: 'nevermist-static',
        plugins: [
          new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        ],
      }),
    },
    {
      // Next.js image optimisation responses
      matcher: /\/_next\/image\/.*/,
      handler: new CacheFirst({
        cacheName: 'nevermist-images',
        plugins: [
          new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }),
        ],
      }),
    },
  ],
})

serwist.addEventListeners()
