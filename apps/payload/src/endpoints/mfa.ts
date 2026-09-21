import type { PayloadRequest } from 'payload'
import crypto from 'crypto'

// ===== TOTP (RFC 6238) на node:crypto — без внешних зависимостей =====
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
function b32encode(buf: Buffer): string {
  let bits = 0, value = 0, out = ''
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5 }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31]
  return out
}
function b32decode(s: string): Buffer {
  let bits = 0, value = 0, out: number[] = []
  for (const c of s.replace(/=+$/, '').toUpperCase()) {
    const idx = B32.indexOf(c)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8 }
  }
  return Buffer.from(out)
}
function hotp(secretB32: string, counter: number): string {
  const key = b32decode(secretB32)
  const buf = Buffer.alloc(8)
  buf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0)
  buf.writeUInt32BE(counter % 2 ** 32, 4)
  const h = crypto.createHmac('sha1', key).update(buf).digest()
  const off = h[h.length - 1] & 0xf
  const code = ((h[off] & 0x7f) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3]
  return String(code % 1_000_000).padStart(6, '0')
}
export function totpNow(secretB32: string): string {
  return hotp(secretB32, Math.floor(Date.now() / 30_000))
}
export function totpVerify(secretB32: string, token: string, window = 1): boolean {
  const step = Math.floor(Date.now() / 30_000)
  const t = String(token || '').replace(/\D/g, '')
  if (t.length !== 6) return false
  for (let i = -window; i <= window; i++) {
    const cand = hotp(secretB32, step + i)
    if (crypto.timingSafeEqual(Buffer.from(cand), Buffer.from(t))) return true
  }
  return false
}
export function totpSecretNew(): string {
  return b32encode(crypto.randomBytes(20))
}

// ===== Проверка пароля — точная копия Payload local strategy (pbkdf2) =====
function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  return new Promise((resolve) => {
    crypto.pbkdf2(password, salt, 25000, 512, 'sha256', (e, hashBuffer) => {
      if (e) return resolve(false)
      const stored = Buffer.from(hash, 'hex')
      resolve(hashBuffer.length === stored.length && crypto.timingSafeEqual(hashBuffer, stored))
    })
  })
}

const APP = 'https://велеслав.рус'
const TOKEN_TTL = 60 * 60 * 8 // 8 часов

function page(title: string, body: string, extra = ''): Response {
  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Школа ПК</title>
<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0D0C0A;color:#D6C6B2;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:1rem}
.card{background:#1A1917;border:1px solid #2A2825;border-radius:16px;padding:2rem 2.2rem;max-width:420px;width:100%}
h1{font-size:1.25rem;color:#E7DCCF;margin:0 0 1.2rem}
input{width:100%;box-sizing:border-box;background:#0D0C0A;border:1px solid #2A2825;border-radius:10px;padding:.8rem .9rem;color:#D6C6B2;font-size:1rem;margin-bottom:.9rem}
button{width:100%;background:linear-gradient(135deg,#C96E4D,#E68863);border:none;border-radius:10px;padding:.85rem;color:#0D0C0A;font-weight:700;font-size:1rem;cursor:pointer}
a{color:#E68863}
.err{background:rgba(201,77,77,.12);border:1px solid rgba(201,77,77,.4);border-radius:10px;padding:.7rem .9rem;margin-bottom:1rem;font-size:.9rem;display:none}
.hint{font-size:.8rem;color:#8A7E6F;margin-top:1rem;line-height:1.5}
img.qr{display:block;margin:1rem auto;border-radius:12px;background:#fff;padding:8px;width:200px}
code{background:#0D0C0A;border:1px solid #2A2825;border-radius:6px;padding:2px 6px;font-size:.85rem;word-break:break-all}
</style></head><body><div class="card">${extra}${body}</div></body></html>`
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
}

// ===== GET /mfa — страница входа с кодом =====
export const mfaLoginPageEndpoint = {
  path: '/mfa',
  method: 'get' as const,
  handler: async (req: PayloadRequest) => {
    const q = new URL(req.url || 'http://localhost').searchParams
    const err = q.get('err') ? `<div class="err" style="display:block">${q.get('err')}</div>` : ''
    return page('Вход с 2FA', `${err}
<h1>🔐 Вход в админку — шаг 2</h1>
<form id="f">
<input name="email" type="email" placeholder="Email" required>
<input name="password" type="password" placeholder="Пароль" required>
<input name="code" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="Код из приложения (6 цифр)" required>
<button>Войти</button>
</form>
<div class="err" id="e"></div>
<p class="hint">Откройте приложение-аутентификатор (Google Authenticator, Яндекс.Ключ) и введите текущий код для аккаунта «Школа ПК».</p>
<script>
document.getElementById('f').addEventListener('submit',async(ev)=>{
  ev.preventDefault();
  const e0=document.getElementById('e');e0.style.display='none';
  const f=new FormData(ev.target);
  const r=await fetch('/api/mfa/login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:f.get('email'),password:f.get('password'),code:f.get('code')})});
  const d=await r.json().catch(()=>({}));
  if(r.ok&&d.ok&&d.token){
    document.cookie='payload-token='+d.token+'; path=/; max-age='+d.maxAge+'; secure; samesite=lax';
    location.href=d.redirect||'/admin';
  }else{
    e0.textContent=d.error||'Неверный email, пароль или код';e0.style.display='block';
  }
});
</script>`)
  },
}

// ===== POST /mfa/login — пароль + TOTP → cookie сессии =====
export const mfaLoginEndpoint = {
  path: '/mfa/login',
  method: 'post' as const,
  handler: async (req: PayloadRequest) => {
    const redirect = (msg: string) => {
      if ((req.headers.get('content-type') || '').includes('application/json')) {
        return new Response(JSON.stringify({ ok: false, error: msg }), { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } })
      }
      return Response.redirect(`${APP}/api/mfa?err=${encodeURIComponent(msg)}`, 303)
    }
    try {
      const ct = req.headers.get('content-type') || ''
      let email = '', password = '', code = ''
      if (ct.includes('application/json')) {
        const b = (req as any).jsonBody || await req.json?.().catch(() => ({}))
        email = b.email || ''; password = b.password || ''; code = b.code || ''
      } else {
        const form = await (req as any).formData?.()
        email = form?.get?.('email') || ''; password = form?.get?.('password') || ''; code = form?.get?.('code') || ''
      }
      if (!email || !password || !code) return redirect('Заполните все поля')

      const user: any = await req.payload.db.findOne({ collection: 'users', where: { email: { equals: email.toLowerCase().trim() } } })
      if (!user) return redirect('Неверный email, пароль или код')
      if (user.lockUntil && new Date(user.lockUntil) > new Date()) return redirect('Аккаунт временно заблокирован после неудачных попыток')
      if (!(await verifyPassword(password, user.salt, user.hash))) return redirect('Неверный email, пароль или код')
      if (!user.mfaEnabled || !user.mfaSecret) return redirect('Для этого аккаунта 2FA не включена — войдите через обычную форму /admin/login')
      if (!totpVerify(user.mfaSecret, code)) {
        await req.payload.db.updateOne({ collection: 'users', id: user.id, data: { loginAttempts: (user.loginAttempts || 0) + 1 } } as any).catch(() => {})
        return redirect('Неверный код — проверьте приложение-аутентификатор')
      }
      await req.payload.db.updateOne({ collection: 'users', id: user.id, data: { loginAttempts: 0, lockUntil: null } } as any).catch(() => {})

      // Штатный login Payload (сессия sid + валидный токен); beforeLogin пропустит из-за req.mfaBypass
      ;(req as any).mfaBypass = true
      const loginResult: any = await req.payload.login({ collection: 'users', data: { email: user.email, password }, req })
      const token = loginResult?.token
      if (!token) return redirect('Не удалось создать сессию')

      return new Response(JSON.stringify({ ok: true, token, redirect: '/admin', maxAge: TOKEN_TTL }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Set-Cookie': `payload-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_TTL}; Secure`,
          'Cache-Control': 'no-store',
        },
      })
    } catch (e: any) {
      return redirect('Ошибка сервера: ' + (e?.message || ''))
    }
  },
}

// ===== GET /mfa/setup — QR для включения (нужна активная сессия админа) =====
export const mfaSetupEndpoint = {
  path: '/mfa/setup',
  method: 'get' as const,
  handler: async (req: PayloadRequest) => {
    const user = (req as any).user
    if (!user || !['admin', 'manager'].includes(user.role)) {
      return new Response('401: сначала войдите в админку (обычный логин, если 2FA ещё не включена), затем откройте эту страницу', { status: 401, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    }
    const secret = totpSecretNew()
    await req.payload.db.updateOne({ collection: 'users', id: user.id, data: { mfaPendingSecret: secret } } as any)
    const uri = `otpauth://totp/${encodeURIComponent('Школа ПК')}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent('Школа ПК')}&algorithm=SHA1&digits=6&period=30`
    const QRCode = (await import('qrcode' as any)).default as any
    const qr = await QRCode.toDataURL(uri, { width: 220, margin: 1 })
    return page('Включение 2FA', `
<h1>🔐 Включение 2FA</h1>
<p>1. Откройте приложение-аутентификатор и отсканируйте QR:</p>
<img class="qr" src="${qr}" alt="QR для аутентификатора">
<p style="font-size:.85rem;color:#8A7E6F">или добавьте вручную ключ:<br><code>${secret}</code></p>
<form method="POST" action="/api/mfa/confirm">
<input name="code" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="Текущий код из приложения" required>
<button>Подтвердить и включить</button>
</form>
<p class="hint">После включения обычный вход в /admin будет требовать код. Вход с кодом — на странице <a href="/api/mfa">/mfa</a>.</p>`)
  },
}

// ===== POST /mfa/confirm — подтверждение кода → включение =====
export const mfaConfirmEndpoint = {
  path: '/mfa/confirm',
  method: 'post' as const,
  handler: async (req: PayloadRequest) => {
    const user = (req as any).user
    const done = (ok: boolean, msg: string) => page('2FA', `<h1>${ok ? '✅' : '❌'} ${msg}</h1><p class="hint"><a href="/admin">← в админку</a></p>`)
    if (!user) return done(false, 'Сессия истекла — войдите заново')
    const form = await (req as any).formData?.().catch(() => null)
    const code = form?.get?.('code') || ''
    const fresh: any = await req.payload.db.findOne({ collection: 'users', where: { id: { equals: user.id } } })
    if (!fresh?.mfaPendingSecret) return done(false, 'Нет неподтверждённого ключа — начните с /api/mfa/setup')
    if (!totpVerify(fresh.mfaPendingSecret, code)) return done(false, 'Код неверен — попробуйте ещё раз (<a href="/api/mfa/setup">заново</a>)')
    await req.payload.db.updateOne({ collection: 'users', id: user.id, data: { mfaSecret: fresh.mfaPendingSecret, mfaEnabled: true, mfaPendingSecret: null } } as any)
    return done(true, '2FA включена! Теперь вход в админку — только с кодом (страница /mfa)')
  },
}

// ===== POST /mfa/disable — отключение (код обязателен) =====
export const mfaDisableEndpoint = {
  path: '/mfa/disable',
  method: 'post' as const,
  handler: async (req: PayloadRequest) => {
    const user = (req as any).user
    if (!user) return new Response('401: требуется вход', { status: 401 })
    const form = await (req as any).formData?.().catch(() => null)
    const code = form?.get?.('code') || ''
    const fresh: any = await req.payload.db.findOne({ collection: 'users', where: { id: { equals: user.id } } })
    if (!fresh?.mfaEnabled) return new Response('2FA не включена', { status: 400 })
    if (!totpVerify(fresh.mfaSecret, code)) return new Response('Неверный код', { status: 403 })
    await req.payload.db.updateOne({ collection: 'users', id: user.id, data: { mfaEnabled: false, mfaSecret: null } } as any)
    return new Response('2FA отключена', { status: 200 })
  },
}
