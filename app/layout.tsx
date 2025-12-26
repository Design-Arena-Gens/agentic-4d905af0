import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'نظام الرد الذكي على الإيميلات',
  description: 'نظام ذكي لفرز الإيميلات والرد عليها تلقائياً',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
