// @ts-nocheck
'use client'
import { useState, useMemo } from 'react'
import { FieldLabel, useField, useDocumentInfo } from '@payloadcms/ui'

/**
 * StageDocumentsView — кастомный компонент для админки Payload.
 *
 * Группирует документы проекта по этапам (stage 0-5) и показывает
 * для каждого этапа:
 *   - Список документов с файлами
 *   - Сообщения чата относящиеся к этому этапу
 *   - Возможность изменить статус документа
 *
 * Используется в ClientProjects collection как custom field component.
 */

const STAGES = [
  { num: 0, name: 'Бриф', icon: '📝', description: 'Анкеты и входные данные от клиента' },
  { num: 1, name: 'Устав', icon: '📜', description: 'Устав потребительского кооператива' },
  { num: 2, name: 'Учреждение', icon: '✍️', description: 'Протокол учредительного собрания, заявление Р11001' },
  { num: 3, name: 'Положения', icon: '⚖️', description: 'Внутренние положения кооператива' },
  { num: 4, name: 'Целевые программы', icon: '🎯', description: 'Целевые потребительские программы' },
  { num: 5, name: 'Образцы', icon: '📋', description: 'Образцы документов' },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '📝 В очереди', color: '#888' },
  in_progress: { label: '⏳ В разработке', color: '#E68863' },
  available: { label: '📥 Доступен', color: '#4A90D9' },
  ready: { label: '✅ Готов', color: '#27AE60' },
  review: { label: '👁 На согласовании', color: '#F39C12' },
  approved: { label: '⏸ Согласован', color: '#8E44AD' },
  submitted: { label: '📤 Подан в ФНС', color: '#16A085' },
  registered: { label: '⭐ Зарегистрирован', color: '#27AE60' },
}

export default function StageDocumentsView(props: any) {
  const { value: documents } = useField<any[]>({ path: 'documents' })
  const { value: chat } = useField<any[]>({ path: 'chat' })
  const [activeStage, setActiveStage] = useState(0)

  // Группируем документы по stage
  const docsByStage: any = useMemo(() => {
    const groups: any = {}
    for (let i = 0; i <= 5; i++) groups[i] = []
    ;(documents || []).forEach((doc: any) => {
      const stage = doc.stage ?? 0
      if (!groups[stage]) groups[stage] = []
      groups[stage].push(doc)
    })
    return groups
  }, [documents])

  // Группируем чат по stage (используем attachedDocumentCode)
  const chatByStage: any = useMemo(() => {
    const groups: any = {}
    for (let i = 0; i <= 5; i++) groups[i] = []
    ;(chat || []).forEach((msg: any) => {
      // Если есть attachedDocumentCode — ищем к какому stage относится
      const code = msg.attachedDocumentCode || ''
      let found = false
      for (const [stageNum, docs] of Object.entries(docsByStage)) {
        if (docs.some((d: any) => code.startsWith(d.code))) {
          groups[Number(stageNum)].push(msg)
          found = true
          break
        }
      }
      // Если не нашли — добавляем в общий этап (0) или оставляем
      if (!found && !code) {
        groups[0].push(msg)
      }
    })
    return groups
  }, [chat, docsByStage])

  const currentDocs = docsByStage[activeStage] || []
  const currentChat = chatByStage[activeStage] || []

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#E7DCCF', fontSize: '1.4rem' }}>
        📂 Документы по этапам
      </h3>

      {/* Tabs для этапов */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {STAGES.map((stage) => {
          const docs = docsByStage[stage.num] || []
          const reviewCount = docs.filter((d: any) => d.status === 'review').length
          const isActive = activeStage === stage.num
          return (
            <button
              key={stage.num}
              onClick={() => setActiveStage(stage.num)}
              style={{
                padding: '0.6rem 1rem',
                background: isActive ? 'rgba(230,136,99,0.2)' : 'rgba(214,198,178,0.05)',
                border: `1px solid ${isActive ? 'rgba(230,136,99,0.5)' : 'rgba(214,198,178,0.15)'}`,
                borderRadius: '8px',
                color: isActive ? '#E68863' : '#D6C6B2',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>{stage.icon}</span>
              <span>{stage.name}</span>
              {docs.length > 0 && (
                <span style={{
                  background: 'rgba(214,198,178,0.2)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                }}>
                  {docs.length}
                </span>
              )}
              {reviewCount > 0 && (
                <span style={{
                  background: 'rgba(243,156,18,0.3)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#F39C12',
                }}>
                  {reviewCount} новых
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Описание текущего этапа */}
      <div style={{
        padding: '0.75rem 1rem',
        background: 'rgba(214,198,178,0.05)',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        color: 'rgba(214,198,178,0.7)',
        fontSize: '0.9rem',
      }}>
        {STAGES[activeStage].icon} <strong>{STAGES[activeStage].name}</strong> — {STAGES[activeStage].description}
      </div>

      {/* Документы этапа */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#E7DCCF', fontSize: '1.1rem' }}>
          📄 Документы ({currentDocs.length})
        </h4>
        {currentDocs.length === 0 ? (
          <div style={{ padding: '1rem', color: 'rgba(214,198,178,0.5)', fontStyle: 'italic' }}>
            Нет документов на этом этапе
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentDocs.map((doc: any, i: number) => {
              const status = STATUS_LABELS[doc.status] || STATUS_LABELS.pending
              const file = doc.file
              const fileUrl = file && typeof file === 'object' ? file.url : null
              const fileName = file && typeof file === 'object' ? file.filename : null
              return (
                <div key={i} style={{
                  padding: '1rem',
                  background: 'rgba(214,198,178,0.04)',
                  border: '1px solid rgba(214,198,178,0.12)',
                  borderRadius: '10px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#E7DCCF', fontSize: '1rem' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.5)', marginTop: '0.2rem' }}>
                        Код: {doc.code} • XP: {doc.xp || 0}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: `${status.color}20`,
                      color: status.color,
                      border: `1px solid ${status.color}40`,
                    }}>
                      {status.label}
                    </span>
                  </div>

                  {doc.description && (
                    <div style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.7)', marginBottom: '0.5rem' }}>
                      {doc.description}
                    </div>
                  )}

                  {/* Файл */}
                  {fileUrl && fileName ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(230,136,99,0.08)',
                      borderRadius: '6px',
                      marginTop: '0.5rem',
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>📎</span>
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{
                        color: '#E68863',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}>
                        {fileName}
                      </a>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(214,198,178,0.5)' }}>
                        — открыть/скачать
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(214,198,178,0.05)',
                      borderRadius: '6px',
                      marginTop: '0.5rem',
                      fontSize: '0.85rem',
                      color: 'rgba(214,198,178,0.4)',
                    }}>
                      📎 Файл не загружен
                    </div>
                  )}

                  {/* Комментарии */}
                  {doc.clientComment && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(243,156,18,0.08)',
                      borderRadius: '6px',
                      borderLeft: '3px solid #F39C12',
                      fontSize: '0.85rem',
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#F39C12', fontWeight: 600, marginBottom: '0.2rem' }}>
                        💬 Комментарий клиента:
                      </div>
                      <div style={{ color: 'rgba(214,198,178,0.9)' }}>{doc.clientComment}</div>
                    </div>
                  )}
                  {doc.comment && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(74,144,217,0.08)',
                      borderRadius: '6px',
                      borderLeft: '3px solid #4A90D9',
                      fontSize: '0.85rem',
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#4A90D9', fontWeight: 600, marginBottom: '0.2rem' }}>
                        💬 Комментарий исполнителя:
                      </div>
                      <div style={{ color: 'rgba(214,198,178,0.9)' }}>{doc.comment}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Чат для этапа */}
      <div>
        <h4 style={{ marginBottom: '1rem', color: '#E7DCCF', fontSize: '1.1rem' }}>
          💬 Сообщения клиента ({currentChat.length})
        </h4>
        {currentChat.length === 0 ? (
          <div style={{ padding: '1rem', color: 'rgba(214,198,178,0.5)', fontStyle: 'italic' }}>
            Нет сообщений по этому этапу
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentChat.map((msg: any, i: number) => (
              <div key={i} style={{
                padding: '0.6rem 0.9rem',
                background: msg.author === 'client' ? 'rgba(243,156,18,0.08)' : 'rgba(74,144,217,0.08)',
                borderRadius: '8px',
                borderLeft: `3px solid ${msg.author === 'client' ? '#F39C12' : '#4A90D9'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: msg.author === 'client' ? '#F39C12' : '#4A90D9' }}>
                    {msg.author === 'client' ? '👤 Клиент' : msg.author === 'executor' ? '👨‍💼 Исполнитель' : '🤖 Система'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(214,198,178,0.4)' }}>
                    {msg.sentAt ? new Date(msg.sentAt).toLocaleString('ru-RU') : ''}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(214,198,178,0.9)', whiteSpace: 'pre-wrap' }}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        marginTop: '1.5rem',
        padding: '0.75rem 1rem',
        background: 'rgba(230,136,99,0.05)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: 'rgba(214,198,178,0.6)',
        borderTop: '1px solid rgba(230,136,99,0.2)',
      }}>
        💡 Подсказка: Статус документов и комментарии можно изменять в разделе «Документы» ниже.
        Здесь отображается сгруппированный вид для удобства.
      </div>
    </div>
  )
}
