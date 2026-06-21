"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * ClientDashboard — главная страница Личного кабинета клиента.
 *
 * URL: /dashboard
 *
 * Показывает:
 *   - Круговой прогресс (0-100%)
 *   - Карта пути (6 этапов)
 *   - 31 карточка документа со статусами
 *   - 7 бейджей (открытые/закрытые)
 *   - Чат с Исполнителем
 *   - Календарь сроков
 *
 * Данные загружаются с /api/client-projects (collection в Payload CMS).
 */

interface Document {
  id: string;
  code: string;
  name: string;
  stage: number;
  xp: number;
  status: 'pending' | 'in_progress' | 'ready' | 'review' | 'approved' | 'submitted' | 'registered';
  readyAt?: string;
  file?: { url: string };
  comment?: string;
}

interface Achievement {
  id: string;
  code: string;
  name: string;
  icon: string;
  desc: string;
  xp: number;
  unlocked: boolean;
  unlockedAt?: string;
}

interface ClientProject {
  id: string;
  coopName: string;
  client: { email: string; name?: string };
  contract: {
    number: string;
    signedAt: string;
    tariff: string;
    amount: number;
    paymentStatus: string;
  };
  stage: string;
  totalXP: number;
  documents: Document[];
  achievements: Achievement[];
}

const STAGES = [
  { num: 0, name: 'Бриф', icon: '📝', color: '#6DB89A' },
  { num: 1, name: 'Устав', icon: '📜', color: '#C96E4D' },
  { num: 2, name: 'Учреждение', icon: '✍️', color: '#5B8DAA' },
  { num: 3, name: 'Положения', icon: '⚖️', color: '#D4A856' },
  { num: 4, name: 'Целевые программы', icon: '🎯', color: '#9A6DB8' },
  { num: 5, name: 'Образцы', icon: '📋', color: '#6DB89A' },
];

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: '📝 В очереди',           color: '#5A5A5A', bg: '#F0EDE8' },
  in_progress: { label: '⏳ В разработке',         color: '#C96E4D', bg: '#FBF3DE' },
  ready:       { label: '✅ Готов',                color: '#6DB89A', bg: '#E8F1ED' },
  review:      { label: '👁 На согласовании',      color: '#D4A856', bg: '#FBF3DE' },
  approved:    { label: '⏸ Согласован',           color: '#5B8DAA', bg: '#E8EEF4' },
  submitted:   { label: '📤 Подан в ФНС',          color: '#9A6DB8', bg: '#F0E8F4' },
  registered:  { label: '⭐ Зарегистрирован',      color: '#D4A856', bg: '#FBF3DE' },
};

export default function ClientDashboard() {
  const [project, setProject] = useState<ClientProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'achievements' | 'chat' | 'calendar'>('overview');

  useEffect(() => {
    // Fetch client projects from Payload API
    const token = localStorage.getItem('token');
    fetch('/api/client-projects/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.docs && data.docs.length > 0) {
          setProject(data.docs[0]);
        } else if (data.error) {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Не удалось загрузить проекты');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(214,198,178,0.6)' }}>
        Загрузка проектов...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 12, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
        <div style={{ color: '#E7DCCF', marginBottom: '0.5rem', fontWeight: 600 }}>
          У вас пока нет активных проектов
        </div>
        <div style={{ color: 'rgba(214,198,178,0.6)', fontSize: '0.9rem' }}>
          Когда вы подпишете договор на создание ПК под ключ, ваш проект появится здесь.
          Вы сможете отслеживать прогресс по каждому из 31 документа, получать бейджи и общаться с Исполнителем.
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '2rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 12, textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
        <div style={{ color: '#E7DCCF', marginBottom: '0.5rem', fontWeight: 600 }}>
          У вас пока нет активных проектов
        </div>
        <div style={{ color: 'rgba(214,198,178,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Когда вы подпишете договор на создание ПК под ключ, ваш проект появится здесь.
          Вы сможете отслеживать прогресс по каждому из 31 документа, получать бейджи и общаться с Исполнителем.
        </div>
        <a href="/uslugi-dlya-potrebitelskih-kooperativov" className="btn-primary" style={{ display: 'inline-block', padding: '0.7rem 1.5rem' }}>
          Заказать ПК под ключ
        </a>
      </div>
    );
  }

  const percent = project.totalXP;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (percent / 100) * circumference;

  const documentsByStage = STAGES.map((s) => ({
    ...s,
    docs: project.documents.filter((d) => d.stage === s.num),
    done: project.documents.filter((d) => d.stage === s.num && ['ready', 'approved', 'submitted', 'registered'].includes(d.status)).length,
  }));

  return (
    <div style={{ minHeight: '100vh', background: '#0D0C0A', color: '#D6C6B2', paddingTop: 'calc(var(--header-h, 72px) + 2rem)', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 'var(--container-max, 1400px)', margin: '0 auto', padding: '0 var(--container-px, clamp(1rem, 4vw, 4rem))' }}>
        {/* ─── Заголовок ─── */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="heading-sweep" data-text={`Проект «${project.coopName}»`} style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#D6C6B2', marginBottom: '0.5rem' }}>
            Проект «{project.coopName}»
          </h1>
          <p style={{ color: 'rgba(214,198,178,0.6)', fontSize: '1rem' }}>
            Договор №{project.contract.number} от {new Date(project.contract.signedAt).toLocaleDateString('ru-RU')} · Тариф: {project.contract.tariff}
          </p>
        </div>

        {/* ─── Табы ─── */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { code: 'overview', label: '📊 Обзор' },
            { code: 'documents', label: '📋 Документы (31)' },
            { code: 'achievements', label: '🏆 Достижения (7)' },
            { code: 'chat', label: '💬 Чат' },
            { code: 'calendar', label: '📅 Календарь' },
          ].map((tab) => (
            <button
              key={tab.code}
              onClick={() => setActiveTab(tab.code as typeof activeTab)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: 999,
                border: `1px solid ${activeTab === tab.code ? 'rgba(230,136,99,0.5)' : 'rgba(214,198,178,0.15)'}`,
                background: activeTab === tab.code ? 'rgba(230,136,99,0.1)' : 'transparent',
                color: activeTab === tab.code ? '#E68863' : 'rgba(214,198,178,0.7)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Контент по табам ─── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Круговой прогресс */}
            <div style={{ padding: '2rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 16, textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E7DCCF', marginBottom: '1.5rem' }}>Прогресс</h3>
              <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(214,198,178,0.1)" strokeWidth="12" />
                  <circle
                    cx="100" cy="100" r="80" fill="none" stroke="#E68863" strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#E68863' }}>{percent}%</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.6)' }}>{project.totalXP} / 100 XP</div>
                </div>
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'rgba(214,198,178,0.7)' }}>
                {percent < 100 ? `До финиша — ${100 - percent} XP` : '🎉 Кооператив создан!'}
              </p>
            </div>

            {/* Карта пути */}
            <div style={{ padding: '2rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 16, gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E7DCCF', marginBottom: '1.5rem' }}>🗺️ Карта пути</h3>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {documentsByStage.map((s, i) => (
                  <div key={s.num} style={{ flex: '1 0 180px', padding: '1rem', background: 'rgba(214,198,178,0.05)', border: '1px solid rgba(214,198,178,0.1)', borderRadius: 12 }}>
                    <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>{s.icon}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: s.color, textAlign: 'center', marginBottom: '0.25rem' }}>Этап {s.num}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E7DCCF', textAlign: 'center', marginBottom: '0.5rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.6)', textAlign: 'center' }}>
                      {s.done} / {s.docs.length} готово
                    </div>
                    <div style={{ marginTop: '0.5rem', height: 4, background: 'rgba(214,198,178,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        width: `${s.docs.length > 0 ? (s.done / s.docs.length) * 100 : 0}%`,
                        height: '100%',
                        background: s.color,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Открытые бейджи */}
            <div style={{ padding: '2rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 16, gridColumn: 'span 3' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E7DCCF', marginBottom: '1.5rem' }}>🏆 Достижения ({project.achievements.filter(a => a.unlocked).length} / {project.achievements.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                {project.achievements.map((a) => (
                  <div key={a.code} style={{
                    padding: '1rem',
                    background: a.unlocked ? 'rgba(212,168,86,0.1)' : 'rgba(214,198,178,0.03)',
                    border: `1px solid ${a.unlocked ? 'rgba(212,168,86,0.4)' : 'rgba(214,198,178,0.08)'}`,
                    borderRadius: 12,
                    textAlign: 'center',
                    opacity: a.unlocked ? 1 : 0.5,
                  }}>
                    <div style={{ fontSize: '2.5rem' }}>{a.unlocked ? a.icon : '🔒'}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: a.unlocked ? '#D4A856' : 'rgba(214,198,178,0.5)', marginTop: '0.5rem' }}>{a.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(214,198,178,0.6)', marginTop: '0.25rem' }}>+{a.xp} XP</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            {STAGES.map((s) => {
              const stageDocs = project.documents.filter((d) => d.stage === s.num);
              if (stageDocs.length === 0) return null;
              return (
                <div key={s.num} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color, marginBottom: '1rem' }}>
                    {s.icon} Этап {s.num}: {s.name} ({stageDocs.length} док.)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    {stageDocs.map((doc) => {
                      const st = STATUS_LABELS[doc.status] || STATUS_LABELS.pending;
                      return (
                        <div key={doc.code} style={{
                          padding: '1.25rem',
                          background: 'rgba(214,198,178,0.04)',
                          border: `1px solid ${st.color}40`,
                          borderRadius: 12,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E7DCCF', flex: 1 }}>{doc.name}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: st.color, background: st.bg, padding: '0.25rem 0.6rem', borderRadius: 6, whiteSpace: 'nowrap' }}>
                              {st.label}
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'rgba(214,198,178,0.6)' }}>
                            <span>+{doc.xp} XP</span>
                            {doc.readyAt && <span>Готов: {new Date(doc.readyAt).toLocaleDateString('ru-RU')}</span>}
                            {doc.file && <a href={doc.file.url} style={{ color: '#E68863', textDecoration: 'none' }}>Скачать →</a>}
                          </div>
                          {doc.comment && (
                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(214,198,178,0.05)', borderRadius: 6, fontSize: '0.8rem', color: 'rgba(214,198,178,0.7)', fontStyle: 'italic' }}>
                              💬 {doc.comment}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {project.achievements.map((a) => (
              <div key={a.code} style={{
                padding: '2rem',
                background: a.unlocked ? 'linear-gradient(135deg, rgba(212,168,86,0.15), rgba(212,168,86,0.05))' : 'rgba(214,198,178,0.03)',
                border: `2px solid ${a.unlocked ? '#D4A856' : 'rgba(214,198,178,0.1)'}`,
                borderRadius: 16,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{a.unlocked ? a.icon : '🔒'}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: a.unlocked ? '#D4A856' : 'rgba(214,198,178,0.5)', marginBottom: '0.5rem' }}>
                  {a.unlocked ? '✓ ' : ''}{a.name}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(214,198,178,0.7)', marginBottom: '1rem' }}>{a.desc}</p>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: a.unlocked ? '#D4A856' : 'rgba(214,198,178,0.4)' }}>+{a.xp} XP</div>
                {a.unlocked && a.unlockedAt && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'rgba(214,198,178,0.5)' }}>
                    Открыт: {new Date(a.unlockedAt).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 16 }}>
              <p style={{ color: 'rgba(214,198,178,0.6)', textAlign: 'center', padding: '3rem 0' }}>
                💬 Чат с Исполнителем появится здесь после заполнения анкет.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 16 }}>
              <p style={{ color: 'rgba(214,198,178,0.6)', textAlign: 'center', padding: '3rem 0' }}>
                📅 Календарь сроков появится после запуска разработки документов.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
