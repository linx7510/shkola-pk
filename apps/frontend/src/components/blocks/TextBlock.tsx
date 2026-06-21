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
    if (node.type === "heading") {
      const lvl = node.tag || "h3"
      return `<${lvl}>${node.children.map((c: any) => lexicalToHtml(c)).join("")}</${lvl}>`
    }
    if (node.type === "list") {
      const tag = node.listType === "number" ? "ol" : "ul"
      return `<${tag}>${node.children.map((c: any) => lexicalToHtml(c)).join("")}</${tag}>`
    }
    if (node.type === "listitem") {
      return `<li>${node.children.map((c: any) => lexicalToHtml(c)).join("")}</li>`
    }
    return node.children.map((c: any) => lexicalToHtml(c)).join("")
  }
  if (node.text) return node.text
  if (node.type === "linebreak") return "<br/>"
  return ""
}

export function TextBlock({ data }: { data: TextBlockData }) {
  const bg =
    data.backgroundColor === "accent"
      ? "rgba(230,136,99,0.05)"
      : data.backgroundColor === "dark"
        ? "#0D0C0A"
        : "transparent"
  return (
    <section style={{ padding: "3rem 1.5rem", background: bg }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {data.title && (
          <Reveal>
            <h2
              className="section-title heading-sweep"
              data-text={data.title}
              style={{
                fontSize: "1.8rem",
                color: "#E7DCCF",
                marginBottom: "1rem",
                fontWeight: 700,
              }}
            >
              {data.title}
            </h2>
          </Reveal>
        )}
        <div
          style={{ color: "rgba(214,198,178,0.9)", fontSize: "1rem", lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: lexicalToHtml(data.body) }}
        />
      </div>
    </section>
  )
}
