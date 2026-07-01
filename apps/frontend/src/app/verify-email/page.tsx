import { NextRequest } from 'next/server'
import Link from 'next/link'

// This page verifies email tokens — must be dynamic (token is unique per request)
export const dynamic = 'force-dynamic' // CORRECT: token-based page, not a CMS page

const PAYLOAD_API_URL = process.env.PAYLOAD_API_URL || 'http://localhost:3001'

export default async function VerifyEmailPage({ searchParams }: { searchParams: { token?: string; email?: string } }) {
  const { token, email } = searchParams

  if (!token || !email) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <h1>Ссылка недействительна</h1>
        <p style={{ color: '#666' }}>Отсутствует токен подтверждения или email.</p>
        <Link href="/" style={{ color: '#B8956A' }}>На главную</Link>
      </div>
    )
  }

  // Call Payload verify endpoint
  let verified = false
  let errorMsg = ''
  try {
    const res = await fetch(`${PAYLOAD_API_URL}/api/users/verify/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      verified = true
    } else {
      const data = await res.json().catch(() => ({}))
      errorMsg = data.errors?.[0]?.message || 'Не удалось подтвердить email. Возможно, ссылка устарела.'
    }
  } catch (err) {
    errorMsg = 'Ошибка соединения с сервером. Попробуйте позже.'
  }

  return (
    <div style={{ maxWidth: 500, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      {verified ? (
        <>
          <h1 style={{ color: '#4CAF50', fontSize: 32 }}>Email подтверждён!</h1>
          <p style={{ fontSize: 16, margin: '24px 0' }}>Ваш аккаунт активирован. Теперь вы можете войти.</p>
          <Link href="/login" style={{ display: 'inline-block', padding: '12px 32px', background: '#B8956A', color: '#0D0C0A', textDecoration: 'none', borderRadius: 4, fontWeight: 600 }}>Войти</Link>
        </>
      ) : (
        <>
          <h1 style={{ color: '#F44336', fontSize: 28 }}>Ошибка подтверждения</h1>
          <p style={{ fontSize: 16, color: '#666', margin: '24px 0' }}>{errorMsg}</p>
          <Link href="/register" style={{ color: '#B8956A' }}>Попробовать ещё раз</Link>
        </>
      )}
    </div>
  )
}
