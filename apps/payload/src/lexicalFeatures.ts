/**
 * Конфигурация Lexical RichText редактора для Payload CMS 3.85.
 * Упрощённая версия — без экспериментального TextStateFeature.
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
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

export const richTextEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    FixedToolbarFeature({ applyToFocusedEditor: true }),
    InlineToolbarFeature(),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    SubscriptFeature(),
    SuperscriptFeature(),
    InlineCodeFeature(),
    AlignFeature(),
    IndentFeature(),
    HeadingFeature({
      enabledHeadingSizes: ['h2', 'h3', 'h4', 'h5', 'h6'],
    }),
    UnorderedListFeature(),
    OrderedListFeature(),
    ChecklistFeature(),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    LinkFeature(),
    ParagraphFeature(),
    UploadFeature({ collections: { media: { fields: [] } } }),
  ],
})
