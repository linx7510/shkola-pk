/**
 * extract-text.ts — извлечение текста из загруженного устава.
 *
 * Перенос логики из text-extractor.php (PHP-версия Школы ПК) на Node.js.
 * Поддерживаемые форматы:
 *   • PDF  — через pdf-parse (основной), fallback на грубый raw-парсинг;
 *   • DOCX — через mammoth.extractRawText();
 *   • TXT  — нативно, с детекцией кодировки (UTF-8 / Windows-1251);
 *   • RTF  — regex-стриппер управляющих последовательностей;
 *   • DOC  — устаревший формат, сервер без antiword: возвращаем понятную ошибку.
 *
 * Постобработка: нормализация пробелов, ограничение длины.
 */

export interface ExtractionResult {
  success: boolean
  text: string
  charCount: number
  error?: string
}

/** Допустимые MIME-типы для аудита устава. */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain', // .txt
  'application/rtf',
  'text/rtf',
  'application/vnd.oasis.opendocument.text', // .odt
  // Браузеры иногда шлют octet-stream для DOCX/DOC — разрешаем, проверим по расширению
  'application/octet-stream',
  '',
]

/** Допустимые расширения. */
export const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt']

/** Максимальный размер файла — 10 МБ (уставы обычно 200 КБ - 2 МБ). */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/** Минимальная длина извлечённого текста, чтобы считать документ осмысленным. */
export const MIN_TEXT_LENGTH = 200

/** Предел длины извлечённого текста (для передачи в LLM). */
const TEXT_LIMIT = 60000

/**
 * Определяет расширение файла по имени.
 */
function getExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)
  return match ? match[1] : ''
}

/**
 * Главная функция: извлекает текст из буфера файла.
 *
 * @param buffer — содержимое файла
 * @param fileName — оригинальное имя файла (для определения формата)
 * @param mimeType — MIME-тип из загрузки (может быть ненадёжным)
 */
export async function extractText(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<ExtractionResult> {
  const ext = getExtension(fileName)

  // Маршрутизация по расширению (надёжнее, чем MIME)
  try {
    let text = ''

    if (ext === 'pdf' || mimeType === 'application/pdf') {
      text = await extractPdf(buffer)
    } else if (ext === 'docx' || mimeType?.includes('wordprocessingml')) {
      text = await extractDocx(buffer)
    } else if (ext === 'txt' || mimeType === 'text/plain') {
      text = extractTxt(buffer)
    } else if (ext === 'rtf' || mimeType?.includes('rtf')) {
      text = extractRtf(buffer)
    } else if (ext === 'odt' || mimeType?.includes('opendocument')) {
      text = await extractOdt(buffer)
    } else if (ext === 'doc' || mimeType === 'application/msword') {
      // Старый бинарный DOC — без antiword/antiword на сервере не извлекается надёжно
      return {
        success: false,
        text: '',
        charCount: 0,
        error:
          'Формат .doc (старый Word) не поддерживается. Сохраните устав в формате .docx или .pdf и загрузите снова.',
      }
    } else {
      return {
        success: false,
        text: '',
        charCount: 0,
        error: `Неподдерживаемый формат файла (.${ext || 'без расширения'}). Поддерживаются: PDF, DOCX, TXT, RTF, ODT.`,
      }
    }

    text = postprocess(text)

    if (text.length < MIN_TEXT_LENGTH) {
      return {
        success: false,
        text,
        charCount: text.length,
        error:
          'Не удалось извлечь достаточно текста из файла. Возможно, это сканы без текстового слоя (PDF-картинки), пустой или повреждённый документ. Попробуйте другой файл или формат DOCX.',
      }
    }

    return {
      success: true,
      text,
      charCount: text.length,
    }
  } catch (err: any) {
    console.error('[extract-text] Ошибка извлечения:', err?.message || err)
    return {
      success: false,
      text: '',
      charCount: 0,
      error: `Ошибка обработки файла: ${err?.message || 'неизвестная ошибка'}. Попробуйте пересохранить документ в формате DOCX или PDF.`,
    }
  }
}

/**
 * PDF — через pdf-parse.
 * Если библиотека недоступна — fallback на raw-парсинг потоков текста.
 */
// Кэш загруженной функции pdf-parse (загружается один раз).
// Обёрнут в обход известного бага pdf-parse@1.1.1 — попытки чтения
// './test/data/05-versions-space.pdf' при инициализации модуля.
let _pdfParseFn: ((buf: Buffer) => Promise<{ text: string }>) | null = null
function getPdfParse(): ((buf: Buffer) => Promise<{ text: string }>) | null {
  if (_pdfParseFn) return _pdfParseFn
  try {
    // Workaround бага pdf-parse@1.1.1: библиотека проверяет isDebugMode через
    // module.parent и пытается загрузить тестовый PDF из своей папки.
    // Подменяем require так, чтобы pdf-parse «думал», что вызывается не из тестов.
    const Module = require('module') as any
    const origRequire = Module.prototype.require
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParseModule: any = require('pdf-parse')
    const fn =
      typeof pdfParseModule === 'function'
        ? pdfParseModule
        : pdfParseModule.default || pdfParseModule
    if (typeof fn === 'function') {
      _pdfParseFn = fn
      return fn
    }
    // suppress unused warning
    void origRequire
    return null
  } catch (e) {
    console.error('[extract-text] pdf-parse load error:', (e as Error)?.message)
    return null
  }
}

async function extractPdf(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = getPdfParse()
    if (!pdfParse) {
      return extractPdfRaw(buffer)
    }
    const data = await pdfParse(buffer)
    const text = (data?.text || '').toString()
    if (text.trim().length >= MIN_TEXT_LENGTH) {
      return text
    }
    return extractPdfRaw(buffer)
  } catch (e) {
    console.error('[extract-text] pdf-parse error:', (e as Error)?.message)
    return extractPdfRaw(buffer)
  }
}

/**
 * Грубый raw-парсинг PDF: извлекает текст из потоков BT...ET.
 * Работает только для PDF без сжатия контента (редкий случай),
 * но как fallback лучше, чем ничего.
 */
function extractPdfRaw(buffer: Buffer): string {
  const text = buffer.toString('latin1')
  const chunks: string[] = []
  // Ищем операторы Tj / TJ внутри BT...ET блоков
  const regex = /\(((?:[^()\\]|\\.)*)\)\s*Tj/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    chunks.push(match[1])
  }
  // TJ-массивы: [(A) -10 (B)] TJ
  const tjRegex = /\[(.*?)\]\s*TJ/g
  while ((match = tjRegex.exec(text)) !== null) {
    const inner = match[1].match(/\(((?:[^()\\]|\\.)*)\)/g)
    if (inner) {
      chunks.push(...inner.map((s: string) => s.replace(/[()]/g, '')))
    }
  }
  let result = chunks.join(' ')
  // Декодируем escape-последовательности PDF-строк
  result = result
    .replace(/\\(\d{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
  return result
}

/**
 * DOCX — через mammoth.extractRawText().
 */
async function extractDocx(buffer: Buffer): Promise<string> {
  // mammoth — external package (см. next.config.ts → serverExternalPackages)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammothModule: any = require('mammoth')
  const mammoth = mammothModule.default || mammothModule
  const result = await mammoth.extractRawText({ buffer })
  return result.value || ''
}

/**
 * TXT — нативно, с детекцией кодировки.
 * Если не UTF-8 — пробуем Windows-1251 (типично для старых русских txt).
 * Без внешних зависимостей — используем встроенный decodeWin1251.
 */
function extractTxt(buffer: Buffer): string {
  // Пробуем UTF-8
  const utf8 = buffer.toString('utf-8')
  // Эвристика: если UTF-8 валидный и без замены символов — используем
  if (!utf8.includes('\uFFFD')) {
    return utf8
  }
  // Иначе пробуем Windows-1251 через встроенный декодер (без iconv-lite)
  return decodeWin1251(buffer)
}

/**
 * Простой декодер Windows-1251 → Unicode (без зависимостей).
 * Используется, только если iconv-lite недоступен.
 */
function decodeWin1251(buffer: Buffer): string {
  const win1251ToUnicode: Record<number, number> = {}
  // Прямые совпадения (0x00-0x7F, 0xA0-0xFF — как Latin-1)
  for (let i = 0; i < 256; i++) {
    if (i < 0x80 || (i >= 0xa0 && i <= 0xff)) {
      win1251ToUnicode[i] = i
    }
  }
  // Кирилица Windows-1251 (0xC0-0xFF)
  const cyrillicUpper = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
  const cyrillicLower = 'абвгдежзийклмнопрстуфхцчшщъыьэюя'
  for (let i = 0; i < cyrillicUpper.length; i++) {
    win1251ToUnicode[0xc0 + i] = cyrillicUpper.charCodeAt(i)
  }
  for (let i = 0; i < cyrillicLower.length; i++) {
    win1251ToUnicode[0xe0 + i] = cyrillicLower.charCodeAt(i)
  }
  // Спецсимволлы
  win1251ToUnicode[0xa8] = 0x0401 // Ё
  win1251ToUnicode[0xb8] = 0x0451 // ё
  win1251ToUnicode[0xb2] = 0x0406
  win1251ToUnicode[0xb3] = 0x0456

  let result = ''
  for (let i = 0; i < buffer.length; i++) {
    const code = win1251ToUnicode[buffer[i]] ?? buffer[i]
    result += String.fromCharCode(code)
  }
  return result
}

/**
 * RTF — regex-стриппер управляющих последовательностей.
 * Грубый, но работает для большинства RTF-уставов.
 */
function extractRtf(buffer: Buffer): string {
  let text = buffer.toString('latin1')
  // Убираем группы {\*...} (destination-команды)
  text = text.replace(/\{\\[\w*-]+[^}]*\}/g, ' ')
  // Убираем управляющие слова \command
  text = text.replace(/\\[a-zA-Z]+-?\d* ?/g, ' ')
  // Декодируем Unicode: \uNNNN?
  text = text.replace(/\\u(-?\d+)\??/g, (_, dec) => {
    const code = parseInt(dec, 10)
    return String.fromCharCode(code < 0 ? code + 65536 : code)
  })
  // Декодируем hex-символы \\'NN (Windows-1251)
  text = text.replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) => {
    const byte = parseInt(hex, 16)
    return decodeWin1251(Buffer.from([byte]))
  })
  // Убираем оставшиеся скобки
  text = text.replace(/[{}]/g, ' ')
  // Схлопываем пробелы
  text = text.replace(/[ \t]+/g, ' ')
  return text
}

/**
 * ODT (OpenDocument Text) — это ZIP, текст в content.xml.
 */
async function extractOdt(buffer: Buffer): Promise<string> {
  // Используем возможности Node по чтению ZIP (через JSZip если есть, иначе упрощённо)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jszipModule: any = require('jszip')
    const JSZip = jszipModule.default || jszipModule
    const zip = await JSZip.loadAsync(buffer)
    const contentFile = zip.file('content.xml')
    if (!contentFile) return ''
    const xml = await contentFile.async('string')
    // Извлекаем текст из <text:p> и <text:h>
    const matches = xml.match(/<(?:text:p|text:h)[^>]*>([\s\S]*?)<\/(?:text:p|text:h)>/g)
    if (!matches) return ''
    return matches
      .map((m: string) => m.replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'"))
      .join('\n')
  } catch {
    return ''
  }
}

/**
 * Постобработка текста: нормализация пробелов, переносов, ограничение длины.
 */
function postprocess(text: string): string {
  let t = text
  // Унифицируем переносы строк
  t = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  // Схлопываем пробелы и табы (но сохраняем переносы)
  t = t.replace(/[ \t]+/g, ' ')
  // Убираем более 2 переносов подряд
  t = t.replace(/\n{3,}/g, '\n\n')
  // Убираем пробелы в начале/конце строк
  t = t
    .split('\n')
    .map((line: string) => line.trim())
    .join('\n')
    .trim()
  // Ограничиваем длину
  if (t.length > TEXT_LIMIT) {
    t = t.slice(0, TEXT_LIMIT) + '\n\n[... документ обрезан: превышен лимит символов ...]'
  }
  return t
}
