/**
 * Расширенная конфигурация Lexical RichText редактора для Payload CMS 3.85.
 *
 * Добавляет к стандартному набору:
 *   • FixedToolbarFeature — постоянный тулбар сверху
 *   • TextStateFeature — размер шрифта, цвет текста, цвет фона (highlight)
 *
 * Использование:
 *   import { richTextEditor } from '../lexicalFeatures'
 *   { name: 'body', type: 'richText', editor: richTextEditor }
 */
import {
  lexicalEditor,
  AlignFeature,
  BlockquoteFeature,
  BoldFeature,
  ChecklistFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineCodeFeature,
  IndentFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  TextStateFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  defaultColors,
} from '@payloadcms/richtext-lexical'

export const richTextEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    // Постоянный тулбар сверху + всплывающий при выделении
    FixedToolbarFeature({ applyToFocusedEditor: true }),
    InlineToolbarFeature(),

    // Базовое форматирование
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    SubscriptFeature(),
    SuperscriptFeature(),
    InlineCodeFeature(),

    // Размер шрифта, цвет текста, цвет фона (highlight) — TextStateFeature
    TextStateFeature({
      state: {
        // Размер шрифта
        fontSize: {
          'fs-xs':  { label: 'Очень мелкий',  css: { 'font-size': '0.75rem' } },
          'fs-sm':  { label: 'Мелкий',         css: { 'font-size': '0.875rem' } },
          'fs-md':  { label: 'Обычный',         css: { 'font-size': '1rem' } },
          'fs-lg':  { label: 'Крупный',         css: { 'font-size': '1.25rem' } },
          'fs-xl':  { label: 'Очень крупный',   css: { 'font-size': '1.5rem' } },
          'fs-2xl': { label: 'Огромный',        css: { 'font-size': '2rem' } },
        },
        // Цвет текста
        color: {
          ...defaultColors.text,
        },
        // Цвет фона (выделение маркером)
        background: {
          ...defaultColors.background,
        },
      },
    }),

    // Выравнивание + отступы
    AlignFeature(),
    IndentFeature(),

    // Заголовки H2–H6
    HeadingFeature({
      enabledHeadingSizes: ['h2', 'h3', 'h4', 'h5', 'h6'],
    }),

    // Списки
    UnorderedListFeature(),
    OrderedListFeature(),
    ChecklistFeature(),

    // Цитата, разделитель, ссылка
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    LinkFeature(),

    // Параграф + загрузка изображений
    ParagraphFeature(),
    UploadFeature({ collections: { media: { fields: [] } } }),
  ],
})
