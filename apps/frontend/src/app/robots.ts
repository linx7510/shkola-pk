import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://велеслав.рус";
  return {
    rules: [
      {
        userAgent: "*",
        // /api/media/ — картинки блога: этот префикс длиннее /api, поэтому у Google
        // и Яндекса разрешение выигрывает у Disallow: /api (правило длиннейшего префикса).
        // Next.js выводит из allow только последнюю строку — "/" не пишем, всё и так разрешено.
        allow: ["/api/media/"],
        disallow: ["/admin", "/api", "/dashboard", "/login", "/register"],
      },
      // AI-боты — ЗАПРЕЩЕНЫ (защита контента); смена политики — решение владельца
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "ChatGPT-User", disallow: "/" },
      { userAgent: "Google-Extended", disallow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "ClaudeBot", disallow: "/" },
      { userAgent: "anthropic-ai", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
      { userAgent: "FacebookBot", disallow: "/" },
      { userAgent: "Applebot-Extended", disallow: "/" },
      { userAgent: "PerplexityBot", disallow: "/" },
      { userAgent: "Omgili", disallow: "/" },
      { userAgent: "AI2Bot", disallow: "/" },
      { userAgent: "cohere-ai", disallow: "/" },
      { userAgent: "YouBot", disallow: "/" },
      { userAgent: "Amazonbot", disallow: "/" },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
