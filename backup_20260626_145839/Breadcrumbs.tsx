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
      fontSize: "0.9rem",
      color: "rgba(214,198,178,0.8)",
      background: "rgba(214,198,178,0.03)",
      borderBottom: "1px solid rgba(214,198,178,0.06)",
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
              <Link href={item.href} className="breadcrumb-link" style={{
                color: "#B8956A",
                textDecoration: "none",
              }}>
                {item.label}
              </Link>
            ) : (
              <span style={{ color: "#E7DCCF", fontWeight: 600 }}>{item.label}</span>
            )}
            {i < items.length - 1 && (
              <span style={{ color: "rgba(214,198,178,0.3)" }}>›</span>
            )}
          </li>
        ))}
      </ol>
      <style>{`.breadcrumb-link:hover{color:#B8956A !important}`}</style>
    </nav>
  );
}

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
