import type { Endpoint } from 'payload'

/**
 * GET /api/lead-count?ipHash=<sha256-hex>
 *
 * Счётчик заявок за последний час по хешу IP — для app-level rate limit
 * приёма заявок во фронтенде (POST /api/leads на :3000).
 *
 * Аудит 06.10.2026: раньше фронт считал лиды через GET /api/leads?where[ipHash]…,
 * но read-доступ к leads закрыт (403 без авторизации) — исключение молча глоталось
 * и лимит «5 заявок/час» фактически не работал. Этот эндпоинт считает через
 * Local API (обходит access-контроль внутри сервера) и отдаёт ТОЛЬКО число.
 *
 * Публичный доступ безопасен: раскрывается лишь count по 64-символьному хешу
 * за скользящий час; перебор ничего не даёт (хеш IP атакующему неизвестен).
 * Эндпоинт накрыт nginx zone=api (120 r/m, burst 10).
 */
export const leadCountEndpoint: Endpoint = {
  path: '/lead-count',
  method: 'get',
  handler: async (req) => {
    const ipHash = (req.searchParams.get('ipHash') || '').toLowerCase()

    if (!/^[a-f0-9]{64}$/.test(ipHash)) {
      return Response.json({ error: 'Некорректный ipHash' }, { status: 400 })
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    try {
      const result = await req.payload.find({
        collection: 'leads',
        where: {
          and: [
            { ipHash: { equals: ipHash } },
            { createdAt: { greater_than: hourAgo } },
          ],
        },
        limit: 1,
        depth: 0,
      })

      return Response.json({ count: result.totalDocs })
    } catch (err: unknown) {
      req.payload.logger.error({
        err,
        msg: 'lead-count: ошибка подсчёта',
      })
      return Response.json({ error: 'Ошибка подсчёта' }, { status: 500 })
    }
  },
}
