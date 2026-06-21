import type { Block } from 'payload'

export const TableBlock: Block = {
  slug: 'table',
  labels: { singular: 'Таблица', plural: 'Таблицы' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок таблицы' },
    {
      name: 'columns',
      type: 'array',
      label: 'Колонки',
      required: true,
      minRows: 1,
      fields: [
        { name: 'header', type: 'text', required: true, label: 'Заголовок колонки' },
      ],
    },
    {
      name: 'rows',
      type: 'array',
      label: 'Строки',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'cells',
          type: 'array',
          label: 'Ячейки',
          required: true,
          fields: [
            { name: 'value', type: 'text', required: true, label: 'Значение' },
          ],
        },
      ],
    },
  ],
}
