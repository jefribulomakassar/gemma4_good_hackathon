const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts')
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',

  // ─── Offline Fallback Pages ───────────────────────────────────────────────
  fallbacks: {
    document: '/offline',   // shown when a page is not cached yet
  },

  // ─── Runtime Caching Strategy ────────────────────────────────────────────
  runtimeCaching: [
    {
      // Triage API — try network first, fall back to last cached response
      urlPattern: /^https:\/\/.*\/api\/triage/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-triage-cache',
        networkTimeoutSeconds: 8,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 3600, // 1 hour
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      // Medical reference — rarely changes, serve from cache first
      urlPattern: /^https:\/\/.*\/api\/reference/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'reference-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 604800, // 7 days
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      // Auth endpoints — always hit network (never cache credentials)
      urlPattern: /^https:\/\/.*\/api\/auth/,
      handler: 'NetworkOnly',
    },
    {
      // Google Fonts — cache for performance
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
      },
    },
    {
      // Font files
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 31536000, // 1 year
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      // All other pages and static assets
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'page-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400, // 24 hours
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ─── i18n — Bilingual Support (Indonesian + English) ─────────────────────
  // Using next-intl, so Next.js built-in i18n routing is handled via middleware
  // No need to declare locales here — next-intl handles it via middleware.ts

  // ─── Security Headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Block MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control referrer info sent with requests
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
            // microphone=(self) → allows Web Speech API voice input
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL}`,
              "img-src 'self' data: blob:",
              "media-src 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },

  // ─── Redirects ────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect root to default locale
      {
        source: '/',
        destination: '/id',        // default locale: Bahasa Indonesia
        permanent: false,
      },
    ]
  },
}

module.exports = withNextIntl(withPWA(nextConfig))