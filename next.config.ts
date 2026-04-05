import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // Cache app shell only — small cache to avoid iOS eviction
  cacheOnNavigation: true,
  additionalPrecacheEntries: [{ url: '/', revision: null }],
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Silence pnpm lockfile warning on Vercel
  outputFileTracingRoot: '/Users/madhang/Documents/nevermist',
}

export default withSerwist(nextConfig)
