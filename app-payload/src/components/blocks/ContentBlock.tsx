export interface ContentBlockData {
  title?: string
  body?: any  // RichText (Lexical JSON) — Schema field name: body
  content?: any  // DEPRECATED alias for backward compat
}

function lexicalToHtml(node: any): string {
  if (!node) return ""
  if (typeof node === "string") return node
  if (node.root) return lexicalToHtml(node.root)
  if (node.children && Array.isArray(node.children)) {
    if (node.type === "paragraph") {
      return "<p>" + node.children.map((c: any) => lexicalToHtml(c)).join("") + "</p>"
    }
    return node.children.map((c: any) => lexicalToHtml(c)).join("")
  }
  if (node.text) return node.text
  return ""
}

export function ContentBlock({ data }: { data: ContentBlockData }) {
  const body = data.body || data.content || null
  return (
    <section style={{ padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {data.title && <h2 style={{ fontSize: "1.8rem", color: "#E7DCCF", marginBottom: "1rem", fontWeight: 700 }}>{data.title}</h2>}
        {body && (
          <div style={{ color: "rgba(214,198,178,0.9)", fontSize: "1rem", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: lexicalToHtml(body) }} />
        )}
      </div>
    </section>
  )
}
