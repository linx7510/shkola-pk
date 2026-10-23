'use client'
// Знак Школы ПК (admin.components.graphics.Icon). Размеры — как у штатной иконки
// Payload (graphic-icon, 100%/100%): подстраивается под слот — сайдбар крупнее,
// хлебные крошки мельче. Фиксированные px нельзя: обрезается в мелких слотах.
const LogoIcon = () => (
  <svg
    className="graphic-icon"
    width="100%"
    height="100%"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Школа ПК"
  >
    <circle cx="24" cy="24" r="23" fill="#6B4A2E" />
    <path d="M24 9 L39 22 H34 V37 H28 V29 H20 V37 H14 V22 H9 Z" fill="#E7DCCF" />
  </svg>
)
export default LogoIcon
export { LogoIcon }
