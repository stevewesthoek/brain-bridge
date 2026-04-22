import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BuildFlow',
  description: 'Connect your local brain folder to ChatGPT'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
