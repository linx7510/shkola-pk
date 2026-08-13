import type { CollectionConfig } from 'payload'

// Helper: Payload REST cookie-auth сломан (user:null для /api/ с cookie),
// поэтому bulk-операции из админки падали с 403. Проверяем cookie payload-token
// (JWT-формат) как fallback к req.user.
// Безопасная проверка: верифицирует cookie-токен через сам Payload API
// (Payload знает свой секрет подписи) + требует роль admin/manager.
// Закрывает уязвимость format-only проверки (подделка cookie).
async function canManage(req: any): Promise<boolean> {
  if (req.user?.role === 'admin' || req.user?.role === 'manager') return true
  const cookieHeader = req.headers?.get?.('cookie') || req.headers?.cookie || ''
  const match = cookieHeader.match(/payload-token=([^;]+)/)
  const token = match?.[1]
  if (!token || token.length < 50) return false
  try {
    const r = await fetch((process.env.PAYLOAD_API_URL || 'http://localhost:3001') + '/api/users/me', {
      headers: { Authorization: 'JWT ' + token },
    })
    if (!r.ok) return false
    const d = await r.json()
    return d.user?.role === 'admin' || d.user?.role === 'manager'
  } catch {
    return false
  }
}

export const ConsultationBookings: CollectionConfig = {
  slug: 'consultation-bookings',
  labels: { singular: 'Консультация', plural: 'Расписание консультаций' },
  access: {
    read: ({ req }) => canManage(req),
    create: () => true,
    update: ({ req }) => canManage(req),
    delete: ({ req }) => canManage(req),
  },
  admin: {
    useAsTitle: 'clientName',
    defaultColumns: ['clientName', 'serviceType', 'date', 'time', 'status', 'amount'],
    group: 'Клиенты',
  },
  fields: [
    { name: 'clientName', type: 'text', required: true, label: 'Имя клиента' },
    { name: 'clientEmail', type: 'email', required: true, label: 'Email' },
    { name: 'clientPhone', type: 'text', label: 'Телефон' },
    { name: 'userId', type: 'number', label: 'ID пользователя (ЛК)', admin: { position: 'sidebar' } },
    {
      name: 'serviceType',
      type: 'select',
      required: true,
      label: 'Услуга',
      options: [
        { label: 'Бесплатная консультация (30 мин)', value: 'consultation-free' },
        { label: 'Индивидуальная консультация (1 час)', value: 'consultation-paid' },
      ],
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Дата',
      admin: { date: { displayFormat: 'dd.MM.yyyy' } },
    },
    {
      name: 'time',
      type: 'select',
      required: true,
      label: 'Время',
      options: [
        { label: '07:00', value: '07:00' },
        { label: '08:00', value: '08:00' },
        { label: '09:00', value: '09:00' },
        { label: '10:00', value: '10:00' },
        { label: '11:00', value: '11:00' },
        { label: '12:00', value: '12:00' },
        { label: '13:00', value: '13:00' },
        { label: '14:00', value: '14:00' },
        { label: '15:00', value: '15:00' },
        { label: '16:00', value: '16:00' },
        { label: '17:00', value: '17:00' },
        { label: '18:00', value: '18:00' },
      ],
    },
    { name: 'amount', type: 'number', label: 'Сумма, ₽', defaultValue: 0 },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Статус',
      defaultValue: 'pending',
      options: [
        { label: 'Ожидает оплаты', value: 'pending' },
        { label: 'Оплачено', value: 'paid' },
        { label: 'Запланировано', value: 'scheduled' },
        { label: 'Проведено', value: 'completed' },
        { label: 'Отменено', value: 'cancelled' },
      ],
    },
    { name: 'paymentId', type: 'text', label: 'ID платежа YooKassa', admin: { position: 'sidebar' } },
    { name: 'notes', type: 'textarea', label: 'Заметки' },
  ],
  timestamps: true,
}
