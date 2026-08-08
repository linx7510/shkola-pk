"use client";
import dynamic from "next/dynamic";

/**
 * CursorLightLazy — обёртка для динамической загрузки CursorLight.
 *
 * Используется в Server Components (например, [slug]/page.tsx), где нельзя
 * напрямую вызвать next/dynamic с ssr:false. CursorLight — полностью клиентский
 * компонент (слушатели mousemove), SSR для него бесполезен и только раздувает
 * initial bundle. Через ssr:false он загружается отдельным chunk'ом после гидратации.
 *
 * Производительность: ~3-5 КБ экономии в initial bundle на каждой странице,
 * где CursorLight импортировался статически.
 */
const CursorLight = dynamic(() => import("./CursorLight"), { ssr: false });

export default function CursorLightLazy() {
  return <CursorLight />;
}

