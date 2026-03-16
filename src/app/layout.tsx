import type { Metadata } from 'next'
import './globals.css'
import { RootLayoutClient } from '@/components/layout/RootLayoutClient'

export const metadata: Metadata = {
  title: 'AgencyOS',
  description: 'Agency management platform with AI-powered reports',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  )
}
