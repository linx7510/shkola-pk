'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const CrmNavLink: React.FC = () => {
  const pathname = usePathname()
  const active = pathname === '/admin/crm' || pathname === '/admin/crm/'

  return (
    <nav className="skpk-navlink">
      <style>{`
        .skpk-navlink { margin: calc(var(--base) * 0.5) calc(var(--base) * 1.5); }
        .skpk-navlink__item { display: flex; align-items: center; gap: calc(var(--base)); padding: calc(var(--base) * 0.75) calc(var(--base) * 1.5); border-radius: var(--style-radius-m); color: var(--theme-elevation-800); text-decoration: none; font-size: calc(var(--base) * 2.33); font-weight: 500; }
        .skpk-navlink__item:hover { background: var(--theme-elevation-100); color: var(--theme-text); }
        .skpk-navlink__item--active { background: var(--theme-elevation-150); color: var(--theme-text); }
        [data-theme="dark"] .skpk-navlink__item { color: var(--theme-elevation-200); }
      `}</style>
      <Link href="/admin/crm" className={`skpk-navlink__item${active ? ' skpk-navlink__item--active' : ''}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 10h18" />
          <path d="M9 4v6" />
        </svg>
        CRM-дашборд
      </Link>
    </nav>
  )
}

export default CrmNavLink
