"use client"

import { useState, useCallback, useRef } from "react"

/**
 * ExpressAuditForm — встраиваемая секция экспресс-аудита устава.
 *
 * Встраивается в существующий лендинг аудита (AuditUstavaLanding.tsx)
 * после Hero или перед CTA. Содержит:
 *   • заголовок-трипфайер «Проверьте устав бесплатно за 60 секунд»;
 *   • форму (имя, email, телефон?, файл, согласие 152-ФЗ);
 *   • состояния uploading / analyzing / result;
 *   • результат: балл + список проблем без конкретики + CTA на полный аудит.
 *
 * API: POST /api/express-audit (multipart/form-data).
 */

interface PreviewIssue {
  title: string
  severity: "high" | "medium" | "low"
  categoryLabel: string
}
interface AuditPreview {
  complianceScore: number
  scoreTone: "green" | "beige" | "orange"
  summary: string
  issues: PreviewIssue[]
  totalIssuesFound: number
  missingSectionsCount: number
  ctaMessage: string
}

type Status = "idle" | "uploading" | "analyzing" | "result" | "error"

const TONE_COLORS = {
  green: { bg: "rgba(109,184,154,0.12)", border: "rgba(109,184,154,0.4)", text: "#6DB89A", glow: "0 0 30px rgba(109,184,154,0.15)" },
  beige: { bg: "rgba(214,198,178,0.10)", border: "rgba(214,198,178,0.35)", text: "#D6C6B2", glow: "0 0 30px rgba(214,198,178,0.12)" },
  orange: { bg: "rgba(201,110,77,0.12)", border: "rgba(201,110,77,0.4)", text: "#E68863", glow: "0 0 30px rgba(201,110,77,0.18)" },
} as const

const SEVERITY_META = {
  high: { label: "Критично", color: "#E68863", icon: "⚠", bg: "rgba(201,110,77,0.10)", border: "rgba(201,110,77,0.3)" },
  medium: { label: "Существенно", color: "#D6C6B2", icon: "◐", bg: "rgba(214,198,178,0.08)", border: "rgba(214,198,178,0.22)" },
  low: { label: "Замечание", color: "#9C856B", icon: "○", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)" },
} as const

export default function ExpressAuditForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string>("")
  const [preview, setPreview] = useState<AuditPreview | null>(null)
  const [progress, setProgress] = useState<string>("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [consent, setConsent] = useState(false)
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileBufferRef = useRef<File | null>(null)

  const handleFile = useCallback((file: File | null) => {
    if (!file) return
    const MAX = 10 * 1024 * 1024
    if (file.size > MAX) {
      setError(`Файл слишком большой (${(file.size / 1024 / 1024).toFixed(1)} МБ). Максимум 10 МБ.`)
      setStatus("error")
      return
    }
    const ext = (file.name.toLowerCase().match(/\.([a-z0-9]+)$/) || [])[1] || ""
    if (!["pdf", "docx", "doc", "txt", "rtf", "odt"].includes(ext)) {
      setError(`Формат .${ext} не поддерживается. Разрешены: PDF, DOCX, TXT, RTF, ODT.`)
      setStatus("error")
      return
    }
    fileBufferRef.current = file
    setFileName(file.name)
    setFileSize(file.size)
    setError("")
    if (status === "error") setStatus("idle")
  }, [status])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0] || null)
  }, [handleFile])

  const submit = useCallback(async () => {
    if (!name.trim() || name.trim().length < 2) { setError("Укажите имя (минимум 2 символа)"); setStatus("error"); return }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Укажите корректный email"); setStatus("error"); return }
    if (!consent) { setError("Необходимо согласие на обработку персональных данных (152-ФЗ)"); setStatus("error"); return }
    if (!fileBufferRef.current) { setError("Загрузите файл устава"); setStatus("error"); return }

    setStatus("uploading")
    setProgress("Загружаем файл устава на защищённый сервер…")
    setError("")

    try {
      await new Promise((r) => setTimeout(r, 400))
      setStatus("analyzing")
      setProgress("ИИ-юрист читает устав и сверяет с законами РФ…")

      const fd = new FormData()
      fd.append("name", name.trim())
      fd.append("email", email.trim())
      fd.append("phone", phone.trim())
      fd.append("consentAccepted", "true")
      fd.append("file", fileBufferRef.current)

      const res = await fetch("/api/express-audit", { method: "POST", body: fd })
      const data = await res.json()

      if (!res.ok || !data.preview) {
        setError(data.error || "Ошибка при анализе. Попробуйте ещё раз.")
        setStatus("error")
        return
      }

      setPreview(data.preview)
      setStatus("result")
      setTimeout(() => {
        document.getElementById("express-audit-result")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    } catch {
      setError("Сеть или сервер недоступны. Проверьте подключение или попробуйте позже.")
      setStatus("error")
    }
  }, [name, email, phone, consent])

  const reset = useCallback(() => {
    setStatus("idle")
    setPreview(null)
    setError("")
    setProgress("")
    fileBufferRef.current = null
    setFileName("")
    setFileSize(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  return (
    <section id="express-audit" style={{ padding: "3rem 1.5rem", maxWidth: 920, margin: "0 auto" }}>
      {/* Заголовок секции (трипфайер) */}
      {(status === "idle" || status === "error") && (
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="section-label mono" style={{ display: "inline-block", marginBottom: "0.75rem" }}>
            ⚡ Бесплатно · за 60 секунд · без оплаты
          </div>
          <h2
            className="heading-sweep"
            data-text="Проверьте свой устав прямо сейчас"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, color: "#F5F0E8", marginBottom: "0.75rem" }}
          >
            Проверьте свой устав прямо сейчас
          </h2>
          <p style={{ color: "#D6C6B2", maxWidth: 620, margin: "0 auto", fontSize: "1rem", lineHeight: 1.6 }}>
            Загрузите устав — наш ИИ-юрист проанализирует его по законам РФ и покажет
            ключевые проблемы. <strong style={{ color: "#E68863" }}>Бесплатно</strong>, за минуту.
          </p>
        </div>
      )}

      {/* ФОРМА */}
      {(status === "idle" || status === "error") && (
        <div className="glass-card" style={{ padding: "2rem" }}>
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              display: "block",
              border: `2px dashed ${dragOver ? "#E68863" : "rgba(214,198,178,0.25)"}`,
              borderRadius: 14,
              padding: "2rem 1.5rem",
              textAlign: "center",
              cursor: "pointer",
              background: dragOver ? "rgba(201,110,77,0.08)" : "rgba(255,255,255,0.02)",
              transition: "all 0.2s",
              marginBottom: "1.5rem",
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.rtf,.odt"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
            {fileName ? (
              <div>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📄</div>
                <div style={{ color: "#F5F0E8", fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>{fileName}</div>
                <div style={{ color: "#9C856B", fontSize: "0.85rem" }}>{(fileSize / 1024).toFixed(0)} КБ · нажмите, чтобы заменить</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⬆️</div>
                <div style={{ color: "#D6C6B2", fontWeight: 600, fontSize: "1.05rem", marginBottom: "0.25rem" }}>
                  Перетащите устав сюда или нажмите для выбора
                </div>
                <div style={{ color: "#9C856B", fontSize: "0.85rem" }}>PDF, DOCX, TXT, RTF · до 10 МБ</div>
              </div>
            )}
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <input className="form-field" type="text" placeholder="Ваше имя *" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "0.85rem 1rem" }} />
            <input className="form-field" type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: "0.85rem 1rem" }} />
          </div>
          <input className="form-field" type="tel" placeholder="Телефон (необязательно)" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: "0.85rem 1rem", marginBottom: "1rem", width: "100%" }} />

          <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: 10, marginBottom: "1.5rem", fontSize: "0.88rem", color: "#BCA891", lineHeight: 1.5 }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: "0.2rem", accentColor: "#C96E4D", width: 18, height: 18, flexShrink: 0 }} />
            <span>
              Я согласен(на) на обработку персональных данных (152-ФЗ) и принимаю, что
              загруженный устав будет проанализирован ИИ для подготовки экспресс-аудита.
              Файл хранится в защищённом виде и не передаётся третьим лицам.
            </span>
          </label>

          {status === "error" && (
            <div style={{ background: "rgba(201,77,77,0.1)", border: "1px solid rgba(201,77,77,0.25)", borderRadius: 10, padding: "0.85rem 1rem", color: "#E68888", fontSize: "0.92rem", marginBottom: "1.25rem" }}>
              {error}
            </div>
          )}

          <button className="btn-primary" onClick={submit} style={{ width: "100%", padding: "1rem", fontSize: "1.05rem" }}>
            🔍 Проверить устав бесплатно
          </button>
          <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.8rem", color: "#9C856B" }}>
            Без оплаты · результат через ~60 секунд · конфиденциально
          </div>
        </div>
      )}

      {/* ЗАГРУЗКА / АНАЛИЗ */}
      {(status === "uploading" || status === "analyzing") && (
        <div className="glass-card" style={{ padding: "3rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{status === "uploading" ? "📤" : "🤖"}</div>
          <h3 style={{ color: "#F5F0E8", marginBottom: "0.75rem", fontSize: "1.4rem" }}>{progress}</h3>
          <div style={{ maxWidth: 320, margin: "1.5rem auto" }}>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: status === "uploading" ? "30%" : "70%", animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
          </div>
          <p style={{ color: "#9C856B", fontSize: "0.9rem" }}>
            Проверяем по 10 ключевым блокам: правовая природа, новация, запрет займов,
            налоги, управление, крупные сделки, комплаенс, фонды…
          </p>
          <p style={{ color: "#6DB89A", fontSize: "0.85rem", marginTop: "1rem" }}>Не закрывайте страницу · обычно 30-90 секунд</p>
        </div>
      )}

      {/* РЕЗУЛЬТАТ */}
      {status === "result" && preview && (
        <div id="express-audit-result">
          <ResultView preview={preview} onReset={reset} />
        </div>
      )}
    </section>
  )
}

function ResultView({ preview, onReset }: { preview: AuditPreview; onReset: () => void }) {
  const tone = TONE_COLORS[preview.scoreTone]
  const verdict =
    preview.complianceScore >= 70 ? "Устав в хорошем состоянии"
    : preview.complianceScore >= 40 ? "Есть проблемы, требующие внимания"
    : "Серьёзные риски — нужна доработка"

  return (
    <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ background: tone.bg, borderBottom: `1px solid ${tone.border}`, padding: "2rem", textAlign: "center", boxShadow: tone.glow }}>
        <div style={{ fontSize: "0.8rem", color: "#9C856B", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Балл соответствия
        </div>
        <div style={{ fontSize: "clamp(3rem, 8vw, 4.5rem)", fontWeight: 800, color: tone.text, lineHeight: 1, marginBottom: "0.5rem" }}>
          {preview.complianceScore}<span style={{ fontSize: "1.5rem", opacity: 0.6 }}>/100</span>
        </div>
        <div style={{ color: "#D6C6B2", fontWeight: 600, fontSize: "1.05rem" }}>{verdict}</div>
        <div style={{ color: "#BCA891", fontSize: "0.9rem", maxWidth: 500, margin: "0.5rem auto 0", lineHeight: 1.5 }}>{preview.summary}</div>
      </div>

      <div style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h3 style={{ color: "#F5F0E8", fontSize: "1.2rem", fontWeight: 700 }}>🔍 Найденные проблемы ({preview.totalIssuesFound})</h3>
          {preview.missingSectionsCount > 0 && (
            <span style={{ color: "#E68863", fontSize: "0.85rem", fontWeight: 600 }}>+ {preview.missingSectionsCount} отсутствующих разделов</span>
          )}
        </div>

        {preview.issues.length === 0 ? (
          <p style={{ color: "#6DB89A", padding: "1rem", background: "rgba(109,184,154,0.08)", borderRadius: 10 }}>
            ✓ Серьёзных проблем не обнаружено. Рекомендуем полный аудит для поиска скрытых рисков.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {preview.issues.map((issue, i) => {
              const meta = SEVERITY_META[issue.severity]
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "1rem 1.25rem", background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 12 }}>
                  <span style={{ fontSize: "1.1rem", color: meta.color, flexShrink: 0, marginTop: "0.1rem" }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "#E7DCCF", fontSize: "0.95rem", marginBottom: "0.15rem" }}>{issue.title}</div>
                    <div style={{ color: meta.color, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                      {meta.label} · {issue.categoryLabel}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", background: "rgba(214,198,178,0.04)", border: "1px solid rgba(214,198,178,0.12)", borderRadius: 12, fontSize: "0.85rem", color: "#BCA891", lineHeight: 1.6 }}>
          💡 <strong style={{ color: "#D6C6B2" }}>Это экспресс-превью.</strong> Конкретные формулировки
          проблем, цитаты из вашего устава и готовые правки текста со ссылками на статьи закона
          входят в <strong style={{ color: "#E68863" }}>полный аудит</strong>.
        </div>

        <div className="cta__inner" style={{ marginTop: "1.5rem", padding: "2rem 1.5rem", textAlign: "center" }}>
          <h3 className="cta__title" style={{ fontSize: "1.3rem", marginBottom: "0.75rem" }}>Закажите полный аудит устава</h3>
          <p className="cta__desc" style={{ marginBottom: "0" }}>{preview.ctaMessage}</p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.5rem" }}>
            <a href="#cta" className="btn-primary" style={{ textDecoration: "none" }}>💼 Заказать полный аудит</a>
            <a href="tel:+79024720738" className="btn-secondary" style={{ textDecoration: "none" }}>📞 +7 (902) 472-07-38</a>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button className="btn-secondary" onClick={onReset} style={{ fontSize: "0.9rem" }}>↻ Проверить другой устав</button>
        </div>
      </div>
    </div>
  )
}
