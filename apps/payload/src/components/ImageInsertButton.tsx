"use client";
import React, { useState, useRef } from "react";

/**
 * ImageInsertButton — кнопка для вставки изображений в HTML-контент статьи
 * с настройками размера и обтекания текстом.
 *
 * При клике открывает модальное окно, где можно:
 * - Указать URL изображения (или выбрать из загруженных медиа)
 * - Задать ширину (300/400/600/900 px или произвольная)
 * - Выбрать обтекание: слева, справа, по центру, без обтекания
 * - Указать отступы (margin)
 * - Добавить alt-текст
 *
 * После нажатия "Вставить" генерируется HTML-тег <img> с inline-стилями
 * и вставляется в позицию курсора в поле "Содержание статьи".
 */
export const ImageInsertButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [width, setWidth] = useState("400");
  const [align, setAlign] = useState("left");
  const [customMargin, setCustomMargin] = useState("0 1.5rem 1rem 0");

  const findTextarea = (): HTMLTextAreaElement | null => {
    const textareas = document.querySelectorAll("textarea");
    for (const ta of textareas) {
      if (ta.name && ta.name.includes("content")) return ta as HTMLTextAreaElement;
    }
    return textareas[0] as HTMLTextAreaElement || null;
  };

  const generateImgTag = (): string => {
    let style = "";
    const w = width ? `width:${width}px;` : "";
    const m = `margin:${customMargin};`;
    if (align === "left") {
      style = `${w}float:left;${m}border-radius:8px;`;
    } else if (align === "right") {
      style = `${w}float:right;${m}border-radius:8px;`;
    } else if (align === "center") {
      style = `${w}display:block;margin:1.5rem auto;border-radius:8px;`;
    } else {
      style = `${w}display:block;${m}border-radius:8px;`;
    }
    const altAttr = alt ? ` alt="${alt.replace(/"/g, "&quot;")}"` : "";
    return `<img src="${imageUrl}"${altAttr} style="${style}">`;
  };

  const handleInsert = () => {
    if (!imageUrl) {
      alert("Введите URL изображения");
      return;
    }
    const textarea = findTextarea();
    if (!textarea) {
      alert("Поле содержания не найдено");
      return;
    }
    const imgTag = generateImgTag();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const newValue = value.substring(0, start) + imgTag + value.substring(end);
    
    // Update the textarea value using native input setter (for React controlled inputs)
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    nativeInputValueSetter?.call(textarea, newValue);
    
    // Dispatch input event so React picks up the change
    const event = new Event("input", { bubbles: true });
    textarea.dispatchEvent(event);
    
    // Set cursor position after inserted image
    const newCursorPos = start + imgTag.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
    
    setIsOpen(false);
    setImageUrl("");
    setAlt("");
  };

  const presetMargins: Record<string, string> = {
    left: "0 1.5rem 1rem 0",
    right: "0 0 1rem 1.5rem",
    center: "0 auto 1.5rem auto",
    none: "0 0 1.5rem 0",
  };

  const handleAlignChange = (newAlign: string) => {
    setAlign(newAlign);
    setCustomMargin(presetMargins[newAlign] || "0 0 1rem 0");
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.5rem 1rem",
    background: "linear-gradient(135deg, #C96E4D, #E68863)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "0.75rem",
    transition: "opacity 0.15s",
  };

  const modalOverlay: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
  };

  const modalStyle: React.CSSProperties = {
    background: "#1a1a1a",
    border: "1px solid rgba(214,198,178,0.2)",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    color: "#D6C6B2",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "0.3rem",
    color: "rgba(214,198,178,0.8)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    background: "#0D0C0A",
    border: "1px solid rgba(214,198,178,0.15)",
    borderRadius: "6px",
    color: "#D6C6B2",
    fontSize: "0.9rem",
    outline: "none",
    marginBottom: "1rem",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
  };

  const btnPrimary: React.CSSProperties = {
    padding: "0.6rem 1.5rem",
    background: "linear-gradient(135deg, #C96E4D, #E68863)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  };

  const btnSecondary: React.CSSProperties = {
    ...btnPrimary,
    background: "transparent",
    border: "1px solid rgba(214,198,178,0.3)",
    color: "rgba(214,198,178,0.7)",
    marginLeft: "0.5rem",
  };

  return (
    <>
      <button type="button" style={buttonStyle} onClick={() => setIsOpen(true)}>
        🖼 Вставить изображение
      </button>

      {isOpen && (
        <div style={modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
          <div style={modalStyle}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem", color: "#E7DCCF" }}>
              Вставка изображения
            </h3>

            <label style={labelStyle}>URL изображения *</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/api/media/file/0144.png"
              style={inputStyle}
            />

            <label style={labelStyle}>Альтернативный текст (для SEO)</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Описание изображения"
              style={inputStyle}
            />

            <label style={labelStyle}>Ширина (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="400"
              style={inputStyle}
            />
            <div style={{ fontSize: "0.75rem", color: "rgba(214,198,178,0.5)", marginBottom: "1rem", marginTop: "-0.5rem" }}>
              Рекомендуем: 300 — небольшое, 400–500 — среднее (для обтекания), 600–900 — крупное
            </div>

            <label style={labelStyle}>Обтекание текстом</label>
            <select
              value={align}
              onChange={(e) => handleAlignChange(e.target.value)}
              style={selectStyle}
            >
              <option value="left">Слева (текст справа)</option>
              <option value="right">Справа (текст слева)</option>
              <option value="center">По центру (без обтекания)</option>
              <option value="none">На отдельной строке</option>
            </select>

            <label style={labelStyle}>Отступы (margin)</label>
            <input
              type="text"
              value={customMargin}
              onChange={(e) => setCustomMargin(e.target.value)}
              placeholder="0 1.5rem 1rem 0"
              style={inputStyle}
            />
            <div style={{ fontSize: "0.75rem", color: "rgba(214,198,178,0.5)", marginBottom: "1rem", marginTop: "-0.5rem" }}>
              Формат CSS: верх право низ лево. Для левого обтекания: «0 1.5rem 1rem 0» (отступ справа и снизу)
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button type="button" style={btnSecondary} onClick={() => setIsOpen(false)}>
                Отмена
              </button>
              <button type="button" style={btnPrimary} onClick={handleInsert}>
                Вставить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageInsertButton;
