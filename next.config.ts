import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  additionalPrecacheEntries: [
    { url: '/', revision: null },
    { url: '/connect', revision: null },
  ],
  // Disable source maps in SW bundle — prevents source-map module leak into server
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent any source-map requires from being bundled into server chunks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'source-map': false,
      }
    }
    return config
  },
}

export default withSerwist(nextConfig)