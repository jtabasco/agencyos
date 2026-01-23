import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
