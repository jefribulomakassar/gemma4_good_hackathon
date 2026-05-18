import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Inter } from 'next/font/google'
import OfflineBanner from '@/components/OfflineBanner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PuskesmasAI',
  description: 'Offline AI triage assistant for community health workers',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PuskesmasAI',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>  // ← Promise
}) {
  const { locale } = await params  // ← await
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <OfflineBanner />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}