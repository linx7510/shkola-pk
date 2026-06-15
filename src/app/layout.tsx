import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Школа ПК — Первая Онлайн Школа Потребительских Кооперативов",
  description:
    "Потребительский кооператив — обучение, услуги по закону РФ № 3085-1. Аудит устава ПК, регистрация под ключ, защита активов, налоговая оптимизация.",
  keywords:
    "потребительский кооператив, кооперация, школа кооперативов, Велеслав Старков, регистрация кооператива, аудит устава, защита активов, Закон 3085-1",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    nosnippet: true,
    noarchive: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
