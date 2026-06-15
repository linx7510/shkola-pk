import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Школа ПК — Первая Онлайн Школа Потребительских Кооперативов",
  description: "Потребительский кооператив — обучение, услуги по закону РФ № 3085-1. Аудит устава ПК, регистрация под ключ, защита активов, налоговая оптимизация.",
  keywords: "потребительский кооператив, кооперация, школа кооперативов, Велеслав Старков, регистрация кооператива, аудит устава, защита активов, Закон 3085-1",
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
      <body>{children}</body>
    </html>
  );
}

