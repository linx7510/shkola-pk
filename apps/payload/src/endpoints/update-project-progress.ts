// /var/www/shkola-pk/apps/payload/src/endpoints/update-project-progress.ts
// Кастомный endpoint Payload для обновления прогресса проекта.
// Теперь работает с integer IDs (после миграции).

import type { Endpoint } from 'payload'

export const updateProjectProgressEndpoint: Endpoint = {
  path: '/custom/update-progress/:projectId',
  method: 'post',
  handler: async (req: any) => {
    try {
      const projectId = req.routeParams?.projectId || ''
      if (!projectId) {
        return Response.json({ error: 'projectId обязателен' }, { status: 400 })
      }

      if (!req.user) {
        return Response.json({ error: 'Не авторизован' }, { status: 401 })
      }

      const body = await req.json?.() || {}
      const { documents, totalXP, percent, chat, notifications } = body

      // Get current project (now with integer ID, Payload Local API works)
      const project = await req.payload.findByID({
        collection: 'client-projects',
        id: projectId,
        depth: 1,
        overrideAccess: true,
      })

      if (!project) {
        return Response.json({ error: 'Проект не найден' }, { status: 404 })
      }

      // Verify ownership
      const projectClientId = (project.client as any)?.id || project.client
      if (projectClientId && String(projectClientId) !== String(req.user.id) && req.user.role !== 'admin') {
        return Response.json({ error: 'Нет доступа' }, { status: 403 })
      }

      // Build update data
      const updateData: any = {}
      if (documents !== undefined) updateData.documents = documents
      if (totalXP !== undefined) updateData.totalXP = totalXP
      if (percent !== undefined) updateData.percent = percent
      if (chat !== undefined) updateData.chat = chat
      if (notifications !== undefined) updateData.notifications = notifications

      // Update via Local API (now works with integer IDs)
      const updated = await req.payload.update({
        collection: 'client-projects',
        id: projectId,
        data: updateData,
        overrideAccess: true,
      })

      return Response.json({
        ok: true,
        project: {
          id: updated.id,
          totalXP: updated.totalXP,
          percent: updated.percent,
        },
      })
    } catch (error: any) {
      console.error('[custom/update-progress] Error:', error)
      return Response.json(
        { error: error.message || 'Внутренняя ошибка сервера' },
        { status: 500 }
      )
    }
  },
}
