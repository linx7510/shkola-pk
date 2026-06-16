import type { Metadata } from "next";
import "./globals.css";
import "./header-mobile.css";

export const metadata: Metadata = {
  title: {
    default: "Школа ПК — Первая Онлайн Школа Потребительских Кооперативов",
    template: "%s | Школа ПК",
  },
  description:
    "Потребительский кооператив — обучение, услуги по закону РФ № 3085-1. Аудит устава ПК, регистрация под ключ, защита активов, налоговая оптимизация.",
  keywords:
    "потребительский кооператив, кооперация, школа кооперативов, Велеслав Старков, регистрация кооператива, аудит устава, защита активов, Закон 3085-1",
  openGraph: {
    title: "Школа ПК — Первая Онлайн Школа Потребительских Кооперативов",
    description: "Обучение, консалтинг и услуги для потребительских кооперативов по закону РФ № 3085-1",
    url: "https://2980738.ru",
    siteName: "Школа ПК",
    locale: "ru_RU",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
