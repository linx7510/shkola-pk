import type { Block } from 'payload'

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: 'Статистика', plural: 'Статистика' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Заголовок секции',
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Показатели',
      required: true,
      minRows: 1,
      maxRows: 8,
      fields: [
        { name: 'value', type: 'text', required: true, label: 'Значение' },
        { name: 'label', type: 'text', required: true, label: 'Подпись' },
        { name: 'icon', type: 'text', label: 'Иконка (emoji)' },
      ],
      defaultValue: [
        { value: '2015', label: 'Работаем с 2015 года' },
        { value: '120+', label: 'выпускников' },
        { value: '4', label: 'пакета обучения' },
        { value: '12 мес', label: 'поддержка' },
      ],
    },
  ],
}
