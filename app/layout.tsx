import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DocSafeConverter: Privacy-First Document Tools',
  description: 'Convert, compress, and edit your documents and images directly in your browser. No uploads, no tracking, 100% private.',
  keywords: ['document converter', 'image converter', 'privacy-first tools', 'offline document tools', 'compress PDF', 'edit documents', 'no tracking', 'secure file tools'],
  authors: [{ name: 'DocSafeConverter Team' }],
  creator: 'DocSafeConverter',
  applicationName: 'DocSafeConverter',
  viewport: 'width=device-width, initial-scale=1.0',
  themeColor: '#0f172a',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
