import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Школа ПК — CMS',
  description: 'Панель управления платформой Школа ПК',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
