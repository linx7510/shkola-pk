/**
 * YooKassa Payment Integration
 * API docs: https://yookassa.ru/developers/api
 *
 * In test mode: payments are simulated
 * In production: real YooKassa API calls
 */

interface PaymentCreateParams {
  amount: number;
  description: string;
  orderId: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  paymentSubject?: string;
}

interface PaymentResult {
  id: string;
  status: string;
  confirmationUrl?: string;
}

const isTestMode = !process.env.YOOKASSA_SHOP_ID || process.env.YOOKASSA_SHOP_ID === 'test_shop_id';

export async function createPayment({ amount, description, orderId, metadata, customerEmail, paymentSubject }: PaymentCreateParams): Promise<PaymentResult> {
  if (isTestMode) {
    // Simulate payment in test mode
    const testPaymentId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    console.log(`💳 Test payment created: ${testPaymentId}, amount: ${amount} ₽, order: ${orderId}`);

    return {
      id: testPaymentId,
      status: 'pending',
      confirmationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}&test=1`,
    };
  }

  // Production YooKassa API call
  const shopId = process.env.YOOKASSA_SHOP_ID!;
  const secretKey = process.env.YOOKASSA_SECRET_KEY!;
  const apiUrl = process.env.YOOKASSA_API_URL || 'https://api.yookassa.ru/v3';

  // Детерминированный ключ идемпотентности (без Date.now()) — ретраи
  // возвращают тот же платёж, а не создают дубликат.
  const idempotenceKey = `order_${orderId}`;

  const paymentBody: Record<string, unknown> = {
    amount: {
      value: amount.toFixed(2),
      currency: 'RUB',
    },
    confirmation: {
      type: 'redirect',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?orderId=${orderId}`,
    },
    capture: true,
    description,
    metadata: {
      orderId,
      ...metadata,
    },
  };

  // Магазин с включённой фискализацией требует receipt (чек 54-ФЗ).
  // Без него YooKassa отдаёт 400 "Receipt is missing or illegal".
  if (customerEmail) {
    paymentBody.receipt = {
      customer: { email: customerEmail },
      items: [
        {
          description,
          quantity: '1',
          amount: { value: amount.toFixed(2), currency: 'RUB' },
          vat_code: 1, // 20% НДС
          payment_subject: paymentSubject || 'service', // признак предмета расчёта (услуга) — 54-ФЗ
          payment_mode: 'full_payment', // признак способа расчёта (полная оплата)
        },
      ],
    };
  }

  const response = await fetch(`${apiUrl}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
      'Idempotence-Key': idempotenceKey,
    },
    body: JSON.stringify(paymentBody),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('YooKassa error:', error);
    throw new Error(error.description || 'Ошибка создания платежа');
  }

  const data = await response.json();
  return {
    id: data.id,
    status: data.status,
    confirmationUrl: data.confirmation?.confirmation_url,
  };
}

export async function checkPaymentStatus(paymentId: string): Promise<{ status: string; paid: boolean }> {
  if (paymentId.startsWith('test_')) {
    // Тестовые платежи разрешены только в тестовом режиме (isTestMode).
    // В production test_-id — это бэкдор, поэтому выбрасываем ошибку.
    if (!isTestMode) {
      throw new Error('Тестовые платежи запрещены в боевом режиме')
    }
    return { status: 'succeeded', paid: true };
  }

  const shopId = process.env.YOOKASSA_SHOP_ID!;
  const secretKey = process.env.YOOKASSA_SECRET_KEY!;
  const apiUrl = process.env.YOOKASSA_API_URL || 'https://api.yookassa.ru/v3';

  const response = await fetch(`${apiUrl}/payments/${paymentId}`, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Ошибка проверки статуса платежа');
  }

  const data = await response.json();
  return {
    status: data.status,
    paid: data.paid || false,
  };
}
