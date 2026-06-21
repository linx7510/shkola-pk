import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Заказ', plural: 'Заказы' },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'user', 'course', 'amount', 'status', 'createdAt'],
    group: 'Продажи',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin' || req.user?.role === 'manager') return true
      return { user: { equals: req.user?.id } }
    },
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, label: 'Пользователь' },
    { name: 'course', type: 'relationship', relationTo: 'courses', label: 'Курс' },
    { name: 'amount', type: 'number', required: true, label: 'Сумма (руб)', min: 0 },
    { name: 'description', type: 'text', label: 'Описание' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      label: 'Статус',
      options: [
        { label: 'Ожидает', value: 'pending' },
        { label: 'Оплачен', value: 'paid' },
        { label: 'Отменён', value: 'cancelled' },
        { label: 'Возврат', value: 'refunded' },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      label: 'Способ оплаты',
      options: [
        { label: 'YooKassa', value: 'yookassa' },
        { label: 'Банковский перевод', value: 'bank' },
        { label: 'Наличные', value: 'cash' },
      ],
    },
    { name: 'paymentId', type: 'text', label: 'ID платежа', admin: { position: 'sidebar' } },
    { name: 'yookassaStatus', type: 'text', label: 'Статус YooKassa', admin: { position: 'sidebar' } },
  ],
  timestamps: true,
}

