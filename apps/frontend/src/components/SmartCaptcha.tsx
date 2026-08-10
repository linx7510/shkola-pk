// @ts-nocheck
"use client"
import { useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    SmartCaptcha?: any
    onSmartCaptchaReady?: () => void
  }
}

let widgetCounter = 0

export function SmartCaptcha({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [rendered, setRendered] = useState(false)
  const callbackRef = useRef(onVerify)
  const widgetName = useRef(`captcha-widget-${++widgetCounter}`)

  useEffect(() => {
    callbackRef.current = onVerify
  }, [onVerify])

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY
    if (!clientKey) return

    function doRender() {
      if (!window.smartCaptcha || !containerRef.current || widgetIdRef.current) return
      try {
        widgetIdRef.current = window.smartCaptcha.render(containerRef.current, {
          sitekey: clientKey,
          callback: (token: string) => {
            callbackRef.current(token)
          },
          hl: 'ru',
          appearance: 'always',
        })
        setRendered(true)
      } catch (e) {
        console.error('[SmartCaptcha] render error:', e)
      }
    }

    // Set global callback for script onload
    window.onSmartCaptchaReady = doRender

    // If already loaded
    if (window.smartCaptcha) {
      doRender()
      return
    }

    // Load script with onload callback
    const existing = document.querySelector('script[data-captcha]')
    if (!existing) {
      const script = document.createElement('script')
      script.src = 'https://captcha-api.yandex.ru/captcha.js?onload=onSmartCaptchaReady&render=explicit'
      script.async = true
      script.defer = true
      script.setAttribute('data-captcha', 'yandex')
      document.head.appendChild(script)
    }

    // Poll as fallback
    const interval = setInterval(() => {
      if (window.smartCaptcha) {
        doRender()
        if (widgetIdRef.current) clearInterval(interval)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div ref={containerRef} style={{ minHeight: 102 }} />
      {!rendered && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(214,198,178,0.05)', border: '1px solid rgba(214,198,178,0.15)', borderRadius: 8, fontSize: '0.9rem', color: 'rgba(214,198,178,0.7)', textAlign: 'center' }}>
          Загрузка капчи...
        </div>
      )}
    </div>
  )
}
