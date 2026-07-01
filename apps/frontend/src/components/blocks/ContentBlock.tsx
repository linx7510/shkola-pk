import Reveal from "@/components/Reveal"

export interface ContentBlockData {
  title?: string
  body?: any
  content?: any
}

const STATE_MAP: Record<string, Record<string, string>> = {
  fontSize: {
    'fs-xs':  'font-size: 0.75rem',
    'fs-sm':  'font-size: 0.875rem',
    'fs-md':  'font-size: 1rem',
    'fs-lg':  'font-size: 1.25rem',
    'fs-xl':  'font-size: 1.5rem',
    'fs-2xl': 'font-size: 2rem',
  },
  color: {
    'text-red':    'color: #C0392B',
    'text-orange': 'color: #E67E22',
    'text-yellow': 'color: #B7950B',
    'text-green':  'color: #27AE60',
    'text-blue':   'color: #2E86C1',
    'text-purple': 'color: #7D3C98',
    'text-pink':   'color: #C2185B',
  },
  background: {
    'bg-red':    'background-color: rgba(231,76,60,0.25)',
    'bg-orange': 'background-color: rgba(243,156,18,0.25)',
    'bg-yellow': 'background-color: rgba(241,196,15,0.30)',
    'bg-green':  'background-color: rgba(39,174,96,0.25)',
    'bg-blue':   'background-color: rgba(52,152,219,0.25)',
    'bg-purple': 'background-color: rgba(155,89,182,0.25)',
    'bg-pink':   'background-color: rgba(233,30,99,0.25)',
  },
}

function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function getTextStateStyles(node: any): string {
  const styles: string[] = []
  for (const stateKey of Object.keys(STATE_MAP)) {
    const v = (node as any)[stateKey]
    if (v && STATE_MAP[stateKey][v]) {
      styles.push(STATE_MAP[stateKey][v])
    }
  }
  return styles.join('; ')
}

function formatToInlineTags(format: number): string {
  const tags: string[] = []
  if (format & 1)  tags.push('b')
  if (format & 2)  tags.push('i')
  if (format & 4)  tags.push('s')
  if (format & 8)  tags.push('u')
  if (format & 16) tags.push('code')
  if (format & 32) tags.push('sub')
  if (format & 64) tags.push('sup')
  return tags.join('')
}

function wrapInlineTags(tags: string, content: string): string {
  if (!tags) return content
  const open = tags
  const close = tags.split('').reverse().join('')
  return `<${open}>${content}</${close}>`
}

function lexicalToHtml(node: any): string {
  if (!node) return ""
  if (typeof node === "string") return node
  if (node.root) return lexicalToHtml(node.root)
  if (node.children && Array.isArray(node.children)) {
    if (node.type === "paragraph") {
      const inner = node.children.map((c: any) => lexicalToHtml(c)).join("")
      const fmt = node.format ?? 0
      const align = ['left', 'center', 'right', 'justify'][fmt] || 'left'
      const indent = node.indent ?? 0
      const styleParts: string[] = []
      if (align !== 'left') styleParts.push(`text-align: ${align}`)
      if (indent > 0) styleParts.push(`padding-left: ${indent * 1.5}rem`)
      const styleAttr = styleParts.length ? ` style="${styleParts.join('; ')}"` : ''
      return `<p${styleAttr}>${inner}</p>`
    }
    if (node.type === "heading") {
      const lvl = node.tag || "h3"
      const inner = node.children.map((c: any) => lexicalToHtml(c)).join("")
      const fmt = node.format ?? 0
      const align = ['left', 'center', 'right', 'justify'][fmt] || 'left'
      const indent = node.indent ?? 0
      const styleParts: string[] = []
      if (align !== 'left') styleParts.push(`text-align: ${align}`)
      if (indent > 0) styleParts.push(`padding-left: ${indent * 1.5}rem`)
      const styleAttr = styleParts.length ? ` style="${styleParts.join('; ')}"` : ''
      return `<${lvl}${styleAttr}>${inner}</${lvl}>`
    }
    if (node.type === "quote") {
      const inner = node.children.map((c: any) => lexicalToHtml(c)).join("")
      return `<blockquote style="border-left: 3px solid rgba(230,136,99,0.6); padding-left: 1rem; margin: 1rem 0; font-style: italic; color: rgba(214,198,178,0.85)">${inner}</blockquote>`
    }
    if (node.type === "horizontalrule") {
      return `<hr style="border: none; border-top: 1px solid rgba(214,198,178,0.3); margin: 2rem 0" />`
    }
    if (node.type === "list") {
      const tag = node.listType === "number" ? "ol" : "ul"
      const inner = node.children.map((c: any) => lexicalToHtml(c)).join("")
      return `<${tag}>${inner}</${tag}>`
    }
    if (node.type === "listitem") {
      const inner = node.children.map((c: any) => lexicalToHtml(c)).join("")
      if (node.checked !== undefined && node.checked !== null) {
        const checked = node.checked ? 'checked' : ''
        return `<li style="list-style: none"><input type="checkbox" ${checked} disabled style="margin-right: 0.5rem" /> ${inner}</li>`
      }
      return `<li>${inner}</li>`
    }
    if (node.type === "link") {
      const inner = node.children.map((c: any) => lexicalToHtml(c)).join("")
      const href = node.fields?.url || node.url || '#'
      const newTab = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${href}"${newTab} style="color: #E68863; text-decoration: underline">${inner}</a>`
    }
    return node.children.map((c: any) => lexicalToHtml(c)).join("")
  }
  if (node.type === "text") {
    const text = escapeHtml(node.text || "")
    const style = getTextStateStyles(node)
    const fmt = node.format ?? 0
    const tags = formatToInlineTags(fmt)
    let html = text
    if (tags) html = wrapInlineTags(tags, html)
    if (style) html = `<span style="${style}">${html}</span>`
    return html
  }
  if (node.type === "linebreak") return "<br/>"
  return ""
}

export function ContentBlock({ data }: { data: ContentBlockData }) {
  const body = data.body || data.content || null
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {data.title && <Reveal><h2 style={{ fontSize: "1.8rem", color: "#E7DCCF", marginBottom: "1rem", fontWeight: 700 }}>{data.title}</h2></Reveal>}
        {body && (
          <div style={{ color: "rgba(214,198,178,0.9)", fontSize: "1rem", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: lexicalToHtml(body) }} />
        )}
      </div>
    </section>
  )
}
