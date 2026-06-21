import type { Metadata } from 'next'

export const metadata: Metadata = {
  // Базовая metadata для [slug] маршрута — переопределяется в page.tsx через generateMetadata
}

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

