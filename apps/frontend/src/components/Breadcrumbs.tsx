import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb" style={{
      padding: "1rem 1.5rem",
      maxWidth: 1200,
      margin: "0 auto",
      fontSize: "0.85rem",
      color: "rgba(214,198,178,0.5)",
    }}>
      <ol style={{
        listStyle: "none",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        padding: 0,
        margin: 0,
        alignItems: "center",
      }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} style={{
                color: "rgba(184,149,106,0.7)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#B8956A"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(184,149,106,0.7)"}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ color: "rgba(214,198,178,0.6)" }}>{item.label}</span>
            )}
            {i < items.length - 1 && (
              <span style={{ color: "rgba(214,198,178,0.3)" }}>›</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export function breadcrumbJsonLd(items: Crumb[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {})
    }))
  };
}
