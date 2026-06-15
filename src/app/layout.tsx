import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Школа ПК — Первая Онлайн Школа Потребительских Кооперативов",
  description: "Обучение, консалтинг и юридическое сопровождение потребительских кооперативов по Закону РФ № 3085-1. Аудит устава, регистрация под ключ, защита активов.",
  keywords: "потребительский кооператив, кооперация, школа кооперативов, регистрация кооператива, аудит устава, защита активов, Закон 3085-1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

