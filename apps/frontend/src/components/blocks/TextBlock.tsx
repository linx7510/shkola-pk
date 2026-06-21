import Reveal from "@/components/Reveal"

export interface TextBlockData {
  title?: string
  body: any  // Can be HTML string OR Lexical JSON
  backgroundColor?: string
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

export function TextBlock({ data }: { data: TextBlockData }) {
  const bg = data.backgroundColor === "accent" ? "rgba(230,136,99,0.05)" :
             data.backgroundColor === "dark" ? "#0D0C0A" : "transparent"
  return (
    <section style={{ padding: "3rem 1.5rem", background: bg }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {data.title && <Reveal><h2 style={{ fontSize: "1.8rem", color: "#E7DCCF", marginBottom: "1rem", fontWeight: 700 }}>{data.title}</h2></Reveal>}
        <div style={{ color: "rgba(214,198,178,0.9)", fontSize: "1rem", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: lexicalToHtml(data.body) }} />
      </div>
    </section>
  )
}
