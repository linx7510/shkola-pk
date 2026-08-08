"use client";
import dynamic from "next/dynamic";

/**
 * AIConsultantLazy — обёртка для динамической загрузки AIConsultant.
 *
 * AIConsultant — тяжёлый клиентский компонент (281 строка): состояние сообщений,
 * быстрые кнопки, поле ввода. Не нужен для LCP и не используется для SEO (нет
 * семантического контента, только интерактивный виджет).
 *
 * Через ssr:false он загружается отдельным chunk'ом после гидратации — экономит
 * ~5-8 КБ в initial JS-бандле на каждой странице, где используется.
 */
const AIConsultant = dynamic(() => import("./AIConsultant"), { ssr: false });

export default function AIConsultantLazy() {
  return <AIConsultant />;
}

