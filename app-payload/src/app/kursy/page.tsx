import { redirect } from "next/navigation";

// /kursy — короткий алиас. Перенаправляем на оригинальный URL страницы курсов
// (как на velaslav.rus) для сохранения SEO-позиций.
// Сама страница контента рендерится через [slug]/page.tsx по slug
// "kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn" из Payload CMS.
export default function KursyPage() {
  redirect("/kursy-obuchenie-potrebitelskoy-kooperatsii-onlayn");
}
