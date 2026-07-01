"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

/**
 * ClientDashboard — главная страница Личного кабинета клиента.
 *
 * URL: /dashboard
 *
 * Показывает:
 *   - Круговой прогресс (0-100%) с весами документов
 *   - Карта пути (6 этапов)
 *   - 34 карточки документа со статусами
 *   - 7 бейджей (открытые/закрытые)
 *   - Чат с Исполнителем
 *   - Календарь сроков
 *   - Обзор: услуги, заказы, прогресс
 *
 * ─── СИСТЕМА БАЛЛОВ (XP) ───
 * Регистрация в ЛК = 2 XP (стартовый бонус за активацию аккаунта)
 *
 * Этап 0 «Бриф» = 10 XP (за все 3 анкеты):
 *   - Анкета №1 «Устав» = 4 XP (самая важная — задаёт структуру кооператива)
 *   - Анкета №2 «Целевая программа» = 3 XP
 *   - Анкета №3 «Протокол №1» = 3 XP
 *   - Договор-оферта = 0 XP (просто скачивание)
 *
 * Этап 1 «Устав» = 25 XP (самый важный документ — правовая основа):
 *   - Проект Устава (черновик) = 15 XP
 *   - Устав ПК (финальная версия) = 10 XP
 *
 * Этап 2 «Учреждение» = 12 XP:
 *   - Протокол №1 учредительного собрания = 7 XP
 *   - Заявление Р11001 = 5 XP
 *
 * Этап 3 «Положения» = 13 XP (по 1 XP за каждый из 13 положений)
 *
 * Этап 4 «Целевые программы» = 15 XP:
 *   - Базовая ЦПП = 7 XP
 *   - Индивидуальная ЦПП = 8 XP
 *
 * Этап 5 «Образцы» = 13 XP (по 1 XP за каждый из 13 образцов)
 *
 * ИТОГО: 2 + 10 + 25 + 12 + 13 + 15 + 13 = 90 XP
 * + 10 XP за достижения (бейджи) = 100 XP = 100%
 *
 * Веса статусов:
 *   - pending = 0 (документ не начат)
 *   - in_progress = 0.3 (в разработке у исполнителя)
 *   - review = 0.5 (клиент загрузил, на проверке у исполнителя)
 *   - ready/approved/submitted/registered = 1.0 (готов)
 *
 * Безопасность:
 *   - Файлы проверяются на MIME, magic bytes, размер ≤ 10 МБ
 *   - Cloudflare Turnstile для защиты от ботов
 *   - JWT auth required
 */

interface DocumentItem {
  id: string;
  code: string;
  name: string;
  stage: number;
  xp: number;
  description?: string;
  status: 'pending' | 'in_progress' | 'ready' | 'review' | 'approved' | 'submitted' | 'registered' | 'available';
  readyAt?: string;
  file?: { url: string };
  comment?: string;
  clientComment?: string;
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
    paymentSchedule?: string;
  };
  template?: { id?: string; name?: string; slug?: string } | string | null;
  templateSnapshot?: { name?: string; slug?: string; totalXP?: number; priceMin?: number; priceMax?: number } | null;
  stage: string;
  totalXP: number;
  percent: number;
  documents: DocumentItem[];
  achievements: Achievement[];
}

const STAGES = [
  { num: 0, name: 'Бриф', icon: '📝', color: '#6DB89A', subtitle: 'Начало пути' },
  { num: 1, name: 'Устав', icon: '📜', color: '#C96E4D', subtitle: 'Правовая основа' },
  { num: 2, name: 'Учреждение', icon: '✍️', color: '#5B8DAA', subtitle: 'Регистрация в ФНС' },
  { num: 3, name: 'Положения', icon: '⚖️', color: '#D4A856', subtitle: 'Внутренние регламенты' },
  { num: 4, name: 'Целевые программы', icon: '🎯', color: '#9A6DB8', subtitle: 'Финансовая часть' },
  { num: 5, name: 'Образцы', icon: '📋', color: '#6DB89A', subtitle: 'Операционные документы' },
];

// ──────────────────────────────────────────────────────────────
// Карта пути для Аудит устава — 3 этапа (упрощённая)
// ──────────────────────────────────────────────────────────────
const AUDIT_STAGES = [
  { num: 0, name: 'Регистрация', icon: '📝', color: '#6DB89A', subtitle: 'Стартовый бонус +2 XP' },
  { num: 1, name: 'Загрузка Устава', icon: '📥', color: '#C96E4D', subtitle: '+25 XP за загрузку' },
  { num: 2, name: 'Аудит Устава', icon: '🔍', color: '#5B8DAA', subtitle: '+50 XP за проект аудита' },
  { num: 3, name: 'Консультация', icon: '💬', color: '#D4A856', subtitle: '+23 XP за итоговую консультацию' },
];

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: '📝 В очереди',           color: '#5A5A5A', bg: '#F0EDE8' },
  in_progress: { label: '⏳ В разработке',         color: '#C96E4D', bg: '#FBF3DE' },
  available:   { label: '📥 Доступен к скачиванию', color: '#6DB89A', bg: '#E8F1ED' },
  ready:       { label: '✅ Готов',                color: '#6DB89A', bg: '#E8F1ED' },
  review:      { label: '👁 На проверке',          color: '#D4A856', bg: '#FBF3DE' },
  approved:    { label: '⏸ Согласован',           color: '#5B8DAA', bg: '#E8EEF4' },
  submitted:   { label: '📤 Подан в ФНС',          color: '#9A6DB8', bg: '#F0E8F4' },
  registered:  { label: '⭐ Зарегистрирован',      color: '#D4A856', bg: '#FBF3DE' },
};

// ──────────────────────────────────────────────────────────────
// ПРОГРЕСС: веса документов
// ──────────────────────────────────────────────────────────────

const PROGRESS_WEIGHTS: Record<string, number> = {
  pending: 0,
  in_progress: 0.3,
  available: 0,  // Доступен к скачиванию — но клиент ещё не скачал/загрузил. XP = 0
  ready: 1,
  review: 0.5,
  approved: 1,
  submitted: 1,
  registered: 1,
};

const REGISTRATION_BONUS_XP = 2;
const MAX_TOTAL_XP = 100;

function computeProgress(documents: DocumentItem[]): { percent: number; currentXP: number } {
  let currentXP = REGISTRATION_BONUS_XP;
  for (const d of documents) {
    const w = PROGRESS_WEIGHTS[d.status] ?? 0;
    currentXP += (d.xp || 0) * w;
  }
  currentXP = Math.min(MAX_TOTAL_XP, currentXP);
  const percent = Math.round(currentXP);
  return { percent, currentXP: Math.round(currentXP * 10) / 10 };
}

// ──────────────────────────────────────────────────────────────
// Прямые ссылки на документы (в /public/documents/)
// ──────────────────────────────────────────────────────────────
const DIRECT_FILE_URLS: Record<string, string> = {
  // Для ПК под ключ:
  contract_offer: '/documents/Dogovor_oferta_PK_pod_klyuch.docx',
  // Анкеты (для проектов, созданных вручную):
  anketa_1: '/documents/Anketa_1_Ustav_PK.docx',
  anketa_2: '/documents/Anketa_2_Celevaya_programma_PK.docx',
  anketa_3: '/documents/Anketa_3_Protokol_1_uchrediteley.docx',
  // Анкеты (для проектов через заказ):
  brief_1: '/documents/Anketa_1_Ustav_PK.docx',
  brief_2: '/documents/Anketa_2_Celevaya_programma_PK.docx',
  brief_3: '/documents/Anketa_3_Protokol_1_uchrediteley.docx',
  // Для Аудит устава:
  audit_contract_offer: '/documents/Dogovor_oferta_Audit_ustava.docx',
  anketa_audit: '/documents/Dogovor_oferta_Audit_ustava.docx',
};

// ──────────────────────────────────────────────────────────────
// Мотивационные сообщения по этапам
// ──────────────────────────────────────────────────────────────
const STAGE_MOTIVATION: Record<number, string> = {
  0: `🚀 Путь начался! Поздравляем — вы подписали договор и внесли предоплату. Большинство предпринимателей годами откладывают создание кооператива «на потом». Вы — нет. Перед вами 3 анкеты (Бриф): они нужны, чтобы Исполнитель разработал все 31 документ под ваш бизнес. Анкета №1 «Устав» — про правовую основу кооператива. Чем точнее вы ответите, тем прочнее будет защита. 20–30 минут работы — и вы получите +4 XP.`,
  1: `📜 Устав — это фундамент вашего кооператива. На основе ваших анкет Исполнитель готовит проект Устава (15 XP), вы его согласуете, и затем получаете финальную версию (10 XP). Итого за этап — 25 XP, самый ценный этап во всём пути.`,
  2: `✍️ Учреждение кооператива. Протокол №1 учредительного собрания (7 XP) и заявление Р11001 для ФНС (5 XP) — это 12 XP, и ваш кооператив официально существует.`,
  3: `⚖️ 13 внутренних положений: о паевых взносах, членстве, ЦПП, ревизионной комиссии, Совете, Правлении, собраниях, участках, конфликте интересов, крупных сделках, заёмной деятельности, бухгалтерском учёте, защите ПД. Каждое положение = 1 XP.`,
  4: `🎯 Целевые программы — финансовое сердце кооператива. Базовая ЦПП (7 XP) + индивидуальная ЦПП (8 XP) = 15 XP. Здесь описано, как именно кооператив выдаёт займы пайщикам.`,
  5: `📋 13 образцов документов для ежедневной работы: заявления, протоколы, договоры, акты, расписки. Каждый = 1 XP. С этим набором кооператив готов к полноценной операционной деятельности.`,
};

// Мотивация для Аудит устава — 3 этапа
const AUDIT_STAGE_MOTIVATION: Record<number, string> = {
  0: `📝 Регистрация — первый шаг. Вы зарегистрировались в Личном кабинете и получили +2 XP стартового бонуса. Это начало вашего пути к правовой защите кооператива. Скачайте договор-оферту, ознакомьтесь с условиями, и переходите к следующему шагу — загрузке вашего действующего Устава.`,
  1: `📥 Загрузка Устава — ключевой шаг. Загрузите действующий Устав вашего кооператива (в формате .docx или .pdf). Исполнитель получит уведомление и приступит к правовому аудиту. За загрузку вы получаете +25 XP — это четверть всего пути. Если Устава нет — Исполнитель разработает его с нуля, но тогда этот шаг будет выполнен после подготовки.`,
  2: `🔍 Аудит Устава — самая ценная часть. Исполнитель проводит правовой анализ вашего Устава на соответствие 215-ФЗ, выявляет риски (корпоративные конфликты, размытие полномочий, нечёткие процедуры), и готовит подробный отчёт с рекомендациями. Срок — 3-5 рабочих дней. За готовый отчёт вы получаете +50 XP — половина всего пути.`,
  3: `💬 Консультация и итоговое заключение — финальный шаг. Вы получаете финальное письменное заключение с конкретными рекомендациями по исправлению Устава. Для Расширенного тарифа — также 1 час онлайн-консультации с Велеславом Старковым лично. За этот шаг — +23 XP, и ваш кооператив получает полную правовую защиту.`,
};

// ──────────────────────────────────────────────────────────────
// Доступные услуги для заказа
// ──────────────────────────────────────────────────────────────
interface ServiceTemplate {
  slug: string;
  name: string;
  serviceType: string;
  priceMin: number;
  priceMax: number;
  priceDisplay: string;
  shortDescription: string;
  description: string;
  estimatedDurationDays: number;
  paymentSchedule: string;
  totalXP: number;
}

// ──────────────────────────────────────────────────────────────
// Главный компонент
// ──────────────────────────────────────────────────────────────

export default function ClientDashboard() {
  const router = useRouter();
  const [project, setProject] = useState<ClientProject | null>(null);
  const [allProjects, setAllProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'achievements' | 'chat' | 'calendar' | 'services' | 'order'>('overview');
  const [token, setToken] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [services, setServices] = useState<ServiceTemplate[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token') || '';
    setToken(token);
    fetch('/api/client-projects/me', {
      headers: { 'Authorization': `JWT ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.docs && data.docs.length > 0) {
          setAllProjects(data.docs);
          setProject(data.docs[0]);
        } else if (data.error) {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Не удалось загрузить проекты');
        setLoading(false);
      });

    // Загрузить список услуг для заказа
    fetch('/api/client-projects/order', {
      headers: { 'Authorization': `JWT ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.services) {
          setServices(data.services);
        }
      })
      .catch(() => {});
  }, []);

  const refreshProject = () => {
    setRefreshKey(k => k + 1);
    const t = localStorage.getItem('auth_token') || '';
    fetch('/api/client-projects/me', {
      headers: { 'Authorization': `JWT ${t}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.docs && data.docs.length > 0) {
          setAllProjects(data.docs);
          setProject(data.docs[0]);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (refreshKey > 0) refreshProject();
  }, [refreshKey]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(214,198,178,0.75)' }}>
        Загрузка проектов...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0C0A', color: '#D6C6B2', paddingTop: 'calc(var(--header-h, 72px) + 2rem)', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: 'var(--container-max, 1400px)', margin: '0 auto', padding: '0 var(--container-px, clamp(1rem, 4vw, 4rem))' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#D6C6B2', marginBottom: '0.5rem' }}>
              🛒 Заказать услугу
            </h1>
            <p style={{ color: 'rgba(214,198,178,0.75)', fontSize: '1rem' }}>
              Выберите услугу — мы создадим проект, привяжем договор и откроем доступ к документам.
            </p>
          </div>

          {/* Каталог услуг */}
          {services.length === 0 ? (
            <div style={{ padding: '2rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 12, textAlign: 'center', color: 'rgba(214,198,178,0.7)' }}>
              Загрузка услуг...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {services.map((svc) => (
                <ServiceCard key={svc.slug} service={svc} token={token} onOrdered={() => {
                  // Перезагрузить страницу после заказа
                  window.location.reload();
                }} />
              ))}
            </div>
          )}

          {/* Также — ссылка на подробную страницу услуги */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ color: 'rgba(214,198,178,0.75)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              💡 Хотите сначала подробнее узнать об услуге?
            </div>
            <a href="/uslugi-dlya-potrebitelskih-kooperativov" className="btn-primary" style={{ display: 'inline-block', padding: '0.7rem 1.5rem' }}>
              Посмотреть описание услуг
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Расчёт прогресса ──
  const { percent, currentXP } = computeProgress(project.documents);
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  // Определить тип проекта (Аудит устава или ПК под ключ)
  // Аудит устава — если в документах есть anketa_audit или current_ustav
  const isAuditProject = project.documents.some(d => d.code === 'anketa_audit' || d.code === 'current_ustav');

  // Выбрать карту пути в зависимости от типа проекта
  const stagesToShow = isAuditProject ? AUDIT_STAGES : STAGES;

  const documentsByStage = stagesToShow.map((s) => {
    const stageDocs = project.documents.filter((d) => d.stage === s.num);
    let stageXP = 0;
    let stageMaxXP = 0;
    for (const d of stageDocs) {
      const w = PROGRESS_WEIGHTS[d.status] ?? 0;
      stageXP += (d.xp || 0) * w;
      stageMaxXP += (d.xp || 0);
    }
    return {
      ...s,
      docs: stageDocs,
      done: stageDocs.filter(d => ['ready', 'approved', 'submitted', 'registered'].includes(d.status)).length,
      uploaded: stageDocs.filter(d => d.status === 'review').length,
      stageXP: Math.round(stageXP * 10) / 10,
      stageMaxXP,
      stagePercent: stageMaxXP > 0 ? Math.round((stageXP / stageMaxXP) * 100) : 0,
    };
  });

  const totalDocs = project.documents.length;
  const doneDocs = project.documents.filter(d => ['ready', 'approved', 'submitted', 'registered'].includes(d.status)).length;
  const inProgressDocs = project.documents.filter(d => ['in_progress', 'review'].includes(d.status)).length;
  const pendingDocs = project.documents.filter(d => d.status === 'pending').length;

  // Стадия 0: доступные к скачиванию (available) и загруженные клиентом (review)
  const stage0Ready = project.documents.filter((d) => d.stage === 0 && (d.status === 'available' || d.status === 'ready'));
  const stage0Uploaded = project.documents.filter((d) => d.stage === 0 && d.status === 'review');

  // Получить название услуги из templateSnapshot или по типу проекта
  const serviceName = project.templateSnapshot?.name
    || (typeof project.template === 'object' ? project.template?.name : null)
    || (isAuditProject ? 'Аудит устава' : 'ПК под ключ');

  // Описание и срок по типу проекта
  const serviceDescription = isAuditProject
    ? '🔍 Правовой аудит Устава потребительского кооператива: проверка соответствия 215-ФЗ, выявление рисков, разработка рекомендаций. Письменное заключение + (для Расширенного тарифа) 1 час консультации.'
    : '💡 Заказано: создание потребительского кооператива «под ключ» — полный пакет из 31 документа, включая Устав, Протокол №1, Р11001, 13 положений, 2 целевые программы и 13 образцов документов.';

  const serviceDuration = isAuditProject
    ? (project.documents.some(d => d.code === 'current_polozheniya') ? '≈ 7 рабочих дней' : '≈ 5 рабочих дней')
    : '≈ 25 рабочих дней';

  // Тариф по paymentSchedule
  const tariffDisplay = project.contract.paymentSchedule === '100_prepaid'
    ? '100% предоплата'
    : project.contract.paymentSchedule === '50_50'
    ? '50/50 (предоплата + после регистрации)'
    : project.contract.tariff || 'По согласованию';

  // Сумма — определить тариф по сумме
  const amountNum = project.contract.amount || 0;
  const tariffName = isAuditProject
    ? (amountNum <= 15000 ? 'Базовый' : 'Расширенный')
    : (amountNum <= 90000 ? 'Базовый' : 'Персонифицированный');

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#0D0C0A', color: '#D6C6B2', paddingTop: 'calc(var(--header-h, 72px) + 2rem)', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 'var(--container-max, 1400px)', margin: '0 auto', padding: '0 var(--container-px, clamp(1rem, 4vw, 4rem))' }}>
        {/* ─── Кнопка «Выйти» ─── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              router.push('/login');
            }}
            style={{
              padding: '0.5rem 1.2rem',
              background: 'rgba(230,136,99,0.1)',
              border: '1px solid rgba(230,136,99,0.3)',
              color: '#E68863',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🚪 Выйти
          </button>
        </div>
        {/* ─── Заголовок с переключателем проектов ─── */}
        <div style={{ marginBottom: '2rem' }}>
          {/* Переключатель проектов (если их больше 1) */}
          {allProjects.length > 1 && (
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {allProjects.map((p) => {
                const isAudit = p.documents.some(d => d.code === 'anketa_audit' || d.code === 'current_ustav');
                const pIcon = isAudit ? '🔍' : '🚀';
                const pColor = isAudit ? '#5B8DAA' : '#C96E4D';
                const isActive = p.id === project.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setProject(p);
                      setActiveTab('overview');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 10,
                      border: `1px solid ${isActive ? pColor : 'rgba(214,198,178,0.15)'}`,
                      background: isActive ? `${pColor}20` : 'rgba(214,198,178,0.04)',
                      color: isActive ? pColor : 'rgba(214,198,178,0.75)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{pIcon}</span>
                    <span>{p.coopName}</span>
                    <span style={{ fontSize: '0.75rem', color: isActive ? pColor : 'rgba(214,198,178,0.5)' }}>
                      ({p.percent}%)
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          
          <h1 className="heading-sweep" data-text={`Проект «${project.coopName}»`} style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#D6C6B2', marginBottom: '0.5rem' }}>
            Проект «{project.coopName}»
          </h1>
          <p style={{ color: 'rgba(214,198,178,0.75)', fontSize: '1rem' }}>
            Договор №{project.contract.number} от {new Date(project.contract.signedAt).toLocaleDateString('ru-RU')} · Тариф: {tariffName}
          </p>
        </div>

        {/* ─── Табы ─── */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { code: 'overview', label: '📊 Обзор' },
            { code: 'documents', label: `📋 Документы (${totalDocs})` },
            { code: 'achievements', label: `🏆 Достижения (${project.achievements.filter(a => a.unlocked).length}/${project.achievements.length})` },
            { code: 'chat', label: '💬 Чат' },
            { code: 'calendar', label: '📅 Календарь' },
            { code: 'services', label: '🛒 Услуги' },
          ].map((tab) => (
            <button
              key={tab.code}
              onClick={() => setActiveTab(tab.code as typeof activeTab)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: 999,
                border: `1px solid ${activeTab === tab.code ? 'rgba(230,136,99,0.5)' : 'rgba(214,198,178,0.15)'}`,
                background: activeTab === tab.code ? 'rgba(230,136,99,0.1)' : 'transparent',
                color: activeTab === tab.code ? '#E68863' : 'rgba(214,198,178,0.8)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═════════ ОБЗОР ═════════ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* ── Заказанная услуга ── */}
            <div style={{ padding: '2rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 16, gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E7DCCF', marginBottom: '1.5rem' }}>
                📦 Заказанная услуга {isAuditProject ? '🔍' : '🚀'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(214,198,178,0.05)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.7)', marginBottom: '0.4rem' }}>Услуга</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#E7DCCF' }}>{serviceName}</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(214,198,178,0.05)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.7)', marginBottom: '0.4rem' }}>Договор</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#E7DCCF' }}>№{project.contract.number}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.6)' }}>{new Date(project.contract.signedAt).toLocaleDateString('ru-RU')}</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(214,198,178,0.05)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.7)', marginBottom: '0.4rem' }}>Тариф</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#E7DCCF' }}>{tariffName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(214,198,178,0.6)' }}>{tariffDisplay}</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(214,198,178,0.05)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.7)', marginBottom: '0.4rem' }}>Сумма договора</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#E7DCCF' }}>
                    {project.contract.amount ? new Intl.NumberFormat('ru-RU').format(project.contract.amount) + ' ₽' : '—'}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(214,198,178,0.05)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.7)', marginBottom: '0.4rem' }}>Оплата</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: project.contract.paymentStatus === 'paid' ? '#6DB89A' : '#D4A856' }}>
                    {project.contract.paymentStatus === 'paid' || project.contract.paymentStatus === 'paid_100' ? '✅ Оплачено' 
                     : project.contract.paymentStatus === 'prepaid_50' ? '⏸ Предоплата 50%' 
                     : project.contract.paymentStatus === 'prepaid_100' ? '⏸ Предоплата 100%' 
                     : '⏳ Ожидает оплаты'}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(214,198,178,0.05)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.7)', marginBottom: '0.4rem' }}>Срок</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E7DCCF' }}>{serviceDuration}</div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(230,136,99,0.06)', borderRadius: 8, fontSize: '0.85rem', color: 'rgba(214,198,178,0.8)' }}>
                {serviceDescription}
              </div>
            </div>

            {/* ── Круговой прогресс с интерактивной анимацией ── */}
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
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#E68863', transition: 'all 0.5s' }}>{percent}%</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.75)' }}>{currentXP} / {MAX_TOTAL_XP} XP</div>
                </div>
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'rgba(214,198,178,0.8)' }}>
                {percent < 100 ? `До финиша — ${MAX_TOTAL_XP - Math.round(currentXP)} XP` : '🎉 Кооператив создан!'}
              </p>
              <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'rgba(214,198,178,0.6)' }}>
                📝 Стартовый бонус за регистрацию: +{REGISTRATION_BONUS_XP} XP
              </div>
            </div>

            {/* ── Карта пути (по этапам) ── */}
            <div style={{ padding: '2rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 16, gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E7DCCF', marginBottom: '1.5rem' }}>🗺️ Карта пути</h3>
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {documentsByStage.map((s) => (
                  <div key={s.num} style={{ flex: '1 0 200px', padding: '1rem', background: 'rgba(214,198,178,0.05)', border: '1px solid rgba(214,198,178,0.1)', borderRadius: 12 }}>
                    <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>{s.icon}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: s.color, textAlign: 'center', marginBottom: '0.25rem' }}>Этап {s.num}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E7DCCF', textAlign: 'center', marginBottom: '0.25rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(214,198,178,0.6)', textAlign: 'center', marginBottom: '0.5rem' }}>{s.subtitle}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.75)', textAlign: 'center', marginBottom: '0.5rem' }}>
                      {s.done} / {s.docs.length} готово{s.uploaded > 0 ? ` · ${s.uploaded} на проверке` : ''}
                    </div>
                    <div style={{ height: 6, background: 'rgba(214,198,178,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: `${s.stagePercent}%`,
                        height: '100%',
                        background: s.color,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(214,198,178,0.6)', textAlign: 'center' }}>
                      +{s.stageXP} / {s.stageMaxXP} XP
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Статистика по документам ── */}
            <div style={{ padding: '2rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 16, gridColumn: 'span 3' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E7DCCF', marginBottom: '1.5rem' }}>📊 Статистика документов</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(109,184,154,0.08)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6DB89A' }}>{doneDocs}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.75)' }}>Готово</div>
                </div>
                <div style={{ padding: '1.25rem', background: 'rgba(212,168,86,0.08)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#D4A856' }}>{inProgressDocs}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.75)' }}>В работе</div>
                </div>
                <div style={{ padding: '1.25rem', background: 'rgba(214,198,178,0.05)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'rgba(214,198,178,0.6)' }}>{pendingDocs}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.75)' }}>В очереди</div>
                </div>
                <div style={{ padding: '1.25rem', background: 'rgba(230,136,99,0.08)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#E68863' }}>{totalDocs}</div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.75)' }}>Всего документов</div>
                </div>
              </div>
            </div>

            {/* ── Мои заказы (все услуги клиента) ── */}
            <div style={{ padding: '2rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 16, gridColumn: 'span 3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E7DCCF' }}>📦 Мои заказы ({allProjects.length})</h3>
                <button
                  onClick={() => setActiveTab('services')}
                  style={{
                    padding: '0.4rem 0.9rem',
                    background: 'rgba(230,136,99,0.1)',
                    border: '1px solid rgba(230,136,99,0.3)',
                    color: '#E68863',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🛒 Заказать ещё →
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {allProjects.map((p, idx) => {
                  const isAudit = p.documents.some(d => d.code === 'anketa_audit' || d.code === 'current_ustav');
                  const pServiceName = p.templateSnapshot?.name || (isAudit ? 'Аудит устава' : 'ПК под ключ');
                  const pIcon = isAudit ? '🔍' : '🚀';
                  const pColor = isAudit ? '#5B8DAA' : '#C96E4D';
                  const isActive = p.id === project.id;
                  const totalDocsP = p.documents?.length || 0;
                  const doneDocsP = p.documents?.filter(d => ['ready', 'approved', 'submitted', 'registered'].includes(d.status)).length || 0;
                  return (
                    <div key={p.id} style={{
                      padding: '1.25rem',
                      background: isActive ? `${pColor}15` : 'rgba(214,198,178,0.04)',
                      border: `1px solid ${isActive ? pColor + '60' : 'rgba(214,198,178,0.12)'}`,
                      borderRadius: 12,
                      position: 'relative',
                    }}>
                      {isActive && (
                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '0.7rem', color: pColor, fontWeight: 700, background: `${pColor}20`, padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                          АКТИВНЫЙ
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{pIcon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E7DCCF', marginBottom: '0.2rem' }}>{p.coopName}</div>
                          <div style={{ fontSize: '0.75rem', color: pColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{pServiceName}</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(214,198,178,0.75)' }}>
                        <div>
                          <span style={{ color: 'rgba(214,198,178,0.5)' }}>Сумма:</span><br />
                          <span style={{ color: '#E7DCCF', fontWeight: 600 }}>{new Intl.NumberFormat('ru-RU').format(p.contract?.amount || 0)} ₽</span>
                        </div>
                        <div>
                          <span style={{ color: 'rgba(214,198,178,0.5)' }}>Прогресс:</span><br />
                          <span style={{ color: pColor, fontWeight: 700 }}>{p.percent}%</span>
                        </div>
                        <div>
                          <span style={{ color: 'rgba(214,198,178,0.5)' }}>Договор:</span><br />
                          <span style={{ color: '#E7DCCF', fontWeight: 600 }}>№{p.contract?.number}</span>
                        </div>
                        <div>
                          <span style={{ color: 'rgba(214,198,178,0.5)' }}>Документов:</span><br />
                          <span style={{ color: '#E7DCCF', fontWeight: 600 }}>{doneDocsP} / {totalDocsP}</span>
                        </div>
                      </div>
                      {/* Прогресс-бар */}
                      <div style={{ marginTop: '0.75rem', height: 5, background: 'rgba(214,198,178,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${p.percent}%`,
                          height: '100%',
                          background: pColor,
                          transition: 'width 1s ease',
                        }} />
                      </div>
                      <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: 'rgba(214,198,178,0.5)' }}>
                        {p.contract?.paymentStatus === 'paid' || p.contract?.paymentStatus === 'paid_100' ? '✅ Оплачено'
                         : p.contract?.paymentStatus === 'prepaid_50' ? '⏸ Предоплата 50%'
                         : p.contract?.paymentStatus === 'prepaid_100' ? '⏸ Предоплата 100%'
                         : '⏳ Ожидает оплаты'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Достижения (с прогрессом) ── */}
            <div style={{ padding: '2rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 16, gridColumn: 'span 3' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E7DCCF', marginBottom: '1.5rem' }}>
                🏆 Достижения ({project.achievements.filter(a => a.unlocked).length} / {project.achievements.length} открыто)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {project.achievements.map((a) => (
                  <div key={a.code} style={{
                    padding: '1.25rem',
                    background: a.unlocked ? 'rgba(212,168,86,0.1)' : 'rgba(214,198,178,0.03)',
                    border: `1px solid ${a.unlocked ? 'rgba(212,168,86,0.4)' : 'rgba(214,198,178,0.08)'}`,
                    borderRadius: 12,
                    opacity: a.unlocked ? 1 : 0.75,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontSize: '2.2rem', flexShrink: 0 }}>{a.unlocked ? a.icon : '🔒'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: a.unlocked ? '#D4A856' : 'rgba(214,198,178,0.8)' }}>
                          {a.unlocked ? '✓ ' : ''}{a.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#E68863', fontWeight: 600, marginTop: '0.2rem' }}>+{a.xp} XP</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(214,198,178,0.7)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                      {a.desc}
                    </div>
                    {a.unlocked && a.unlockedAt && (
                      <div style={{ fontSize: '0.72rem', color: '#6DB89A', marginTop: '0.4rem' }}>
                        ✓ Открыт: {new Date(a.unlockedAt).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                    {!a.unlocked && (
                      <div style={{ fontSize: '0.72rem', color: 'rgba(214,198,178,0.5)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                        🔒 Выполните условие, чтобы открыть
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Сводка по достижениям */}
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(212,168,86,0.05)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.8)' }}>
                  💡 Открыто <span style={{ color: '#D4A856', fontWeight: 700 }}>{project.achievements.filter(a => a.unlocked).length}</span> из <span style={{ color: '#E7DCCF', fontWeight: 700 }}>{project.achievements.length}</span> достижений
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.8)' }}>
                  Заработано за достижения: <span style={{ color: '#D4A856', fontWeight: 700 }}>+{project.achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp, 0)} XP</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════ ДОКУМЕНТЫ ═════════ */}
        {activeTab === 'documents' && (
          <div>
            {/* Stage 0: Бриф — Скачивание анкет + Загрузка заполненных */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(184,149,106,0.05)', border: '1px solid rgba(184,149,106,0.2)', borderRadius: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#B8956A' }}>
                  {isAuditProject ? '📝 Этап 0: Заявка на аудит — Начало работы' : '📝 Этап 0: Бриф — Начало работы'}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.75)' }}>
                  {isAuditProject 
                    ? <>Можно заработать: <span style={{ color: '#B8956A', fontWeight: 700 }}>5 XP</span> (за загрузку Устава)</>
                    : <>Можно заработать: <span style={{ color: '#B8956A', fontWeight: 700 }}>10 XP</span> (за 3 анкеты)</>
                  }
                </div>
              </div>
              
              {/* Мотивационный блок */}
              <div style={{ padding: '1rem', background: 'rgba(230,136,99,0.06)', border: '1px solid rgba(230,136,99,0.2)', borderRadius: 10, marginBottom: '1.5rem', fontSize: '0.85rem', color: 'rgba(214,198,178,0.85)', lineHeight: 1.6 }}>
                {isAuditProject 
                  ? AUDIT_STAGE_MOTIVATION[0]
                  : STAGE_MOTIVATION[0]
                }
              </div>
              
              {/* Downloads */}
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#E7DCCF', marginBottom: '0.75rem' }}>
                {isAuditProject ? '📥 Скачайте документы' : '📥 Скачайте и заполните документы'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {stage0Ready.map((doc) => {
                  const fileUrl = DIRECT_FILE_URLS[doc.code] || doc.file?.url || '#';
                  return (
                    <div key={doc.code} style={{ padding: '1.25rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(109,184,154,0.3)', borderRadius: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E7DCCF', flex: 1 }}>{doc.name}</div>
                        {doc.xp > 0 && (
                          <span style={{ fontSize: '0.75rem', color: '#E68863', fontWeight: 700, background: 'rgba(230,136,99,0.1)', padding: '0.25rem 0.6rem', borderRadius: 6 }}>
                            +{doc.xp} XP
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.7)', marginBottom: '0.75rem' }}>{doc.description}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#6DB89A', fontWeight: 600 }}>📥 Доступен к скачиванию</span>
                        <a href={fileUrl} download style={{ color: '#E68863', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, padding: '0.4rem 0.8rem', border: '1px solid rgba(230,136,99,0.4)', borderRadius: 6 }}>⬇ Скачать</a>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Загруженные клиентом анкеты */}
              {stage0Uploaded.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#E7DCCF', marginBottom: '0.75rem' }}>📤 Загруженные анкеты (на проверке у Исполнителя)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {stage0Uploaded.map((doc) => (
                      <div key={doc.code} style={{ padding: '1.25rem', background: 'rgba(212,168,86,0.05)', border: '1px solid rgba(212,168,86,0.3)', borderRadius: 12 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E7DCCF', marginBottom: '0.5rem' }}>{doc.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.7)', marginBottom: '0.5rem' }}>{doc.clientComment}</div>
                        <div style={{ fontSize: '0.75rem', color: '#D4A856', fontWeight: 600 }}>👁 На проверке · +{(doc.xp * 0.5).toFixed(1)} XP (из {doc.xp})</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload form */}
              <div style={{ padding: '1.5rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 12 }}>
                {isAuditProject ? (
                  <>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#E7DCCF', marginBottom: '0.75rem' }}>📤 Загрузить ваш Устав для аудита</h4>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.7)', marginBottom: '1rem' }}>
                      Загрузите действующий Устав вашего кооператива (в формате .docx или .pdf). Исполнитель получит уведомление и приступит к правовому аудиту.
                      <br /><br />
                      <strong style={{ color: 'rgba(214,198,178,0.85)' }}>Также приложите:</strong>
                      <br />
                      • Краткое описание проблемы или вопроса, который вас беспокоит<br />
                      • Состав пайщиков (если есть)<br />
                      • Информация о видах деятельности (ОКВЭД)<br />
                      • Любые особые требования к Уставу
                    </p>
                    <UploadForm projectId={project.id} documentCode="anketa_audit_filled" stage={0} token={token} onSubmitted={() => { refreshProject(); }} />
                  </>
                ) : (
                  <>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#E7DCCF', marginBottom: '0.75rem' }}>📤 Загрузить заполненные анкеты</h4>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.7)', marginBottom: '1rem' }}>Загрузите каждую анкету отдельно. За каждую загруженную анкету вы получаете XP.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {project.documents.filter((d: any) => d.stage === 0 && d.code.startsWith('brief_')).map((doc: any) => (
                        <div key={doc.code} style={{ padding: '1rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <strong style={{ color: '#E7DCCF', fontSize: '0.95rem' }}>{doc.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#E68863', fontWeight: 700 }}>+{doc.xp} XP</span>
                          </div>
                          {doc.status === 'review' ? (
                            <div style={{ fontSize: '0.85rem', color: '#D4A856', fontWeight: 600 }}>✅ Загружено — на проверке у исполнителя</div>
                          ) : doc.file ? (
                            <div style={{ fontSize: '0.85rem', color: '#6DB89A' }}>✅ Загружено</div>
                          ) : (
                            <UploadForm projectId={project.id} documentCode={doc.code} stage={0} token={token} onSubmitted={() => { refreshProject(); }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stages 1-5: Документы Исполнителя */}
            {(isAuditProject ? AUDIT_STAGES : STAGES).filter(s => s.num > 0).map((s) => {
              const stageDocs = project.documents.filter((d) => d.stage === s.num);
              if (stageDocs.length === 0) return null;
              const stageReady = stageDocs.some(d => d.status === 'ready' || d.status === 'approved');
              const stageStat = documentsByStage.find(st => st.num === s.num)!;
              return (
                <div key={s.num} style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color }}>
                      {s.icon} Этап {s.num}: {s.name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.75)' }}>
                      Прогресс: <span style={{ color: s.color, fontWeight: 700 }}>{stageStat.stagePercent}%</span> · +{stageStat.stageXP}/{stageStat.stageMaxXP} XP
                    </div>
                  </div>
                  
                  {/* Мотивационный блок для этапа */}
                  {(isAuditProject ? AUDIT_STAGE_MOTIVATION[s.num] : STAGE_MOTIVATION[s.num]) && (
                    <div style={{ padding: '1rem', background: 'rgba(230,136,99,0.04)', border: '1px solid rgba(230,136,99,0.15)', borderRadius: 10, marginBottom: '1rem', fontSize: '0.85rem', color: 'rgba(214,198,178,0.8)', lineHeight: 1.6 }}>
                      {isAuditProject ? AUDIT_STAGE_MOTIVATION[s.num] : STAGE_MOTIVATION[s.num]}
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
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
                          <div style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.7)', marginBottom: '0.5rem' }}>{doc.description}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'rgba(214,198,178,0.75)' }}>
                            <span style={{ color: '#E68863', fontWeight: 600 }}>+{doc.xp} XP</span>
                            {doc.readyAt && <span>Готов: {new Date(doc.readyAt).toLocaleDateString('ru-RU')}</span>}
                            {doc.file && <a href={doc.file.url} target="_blank" style={{ color: '#E68863', textDecoration: 'none', fontWeight: 600 }}>⬇ Скачать</a>}
                          </div>
                          {doc.clientComment && (
                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(214,198,178,0.05)', borderRadius: 6, fontSize: '0.8rem', color: 'rgba(214,198,178,0.8)', fontStyle: 'italic' }}>
                              💬 {doc.clientComment}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {stageReady && (
                    <FeedbackForm projectId={project.id} stage={s.num} stageName={s.name} token={token} onSubmitted={() => { refreshProject(); }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═════════ ДОСТИЖЕНИЯ ═════════ */}
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: a.unlocked ? '#D4A856' : 'rgba(214,198,178,0.8)', marginBottom: '0.5rem' }}>
                  {a.unlocked ? '✓ ' : ''}{a.name}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(214,198,178,0.8)', marginBottom: '1rem' }}>{a.desc}</p>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: a.unlocked ? '#D4A856' : 'rgba(214,198,178,0.65)' }}>+{a.xp} XP</div>
                {a.unlocked && a.unlockedAt && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'rgba(214,198,178,0.8)' }}>
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
              <p style={{ color: 'rgba(214,198,178,0.75)', textAlign: 'center', padding: '3rem 0' }}>
                💬 Чат с Исполнителем появится здесь после заполнения анкет.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 16 }}>
              <p style={{ color: 'rgba(214,198,178,0.75)', textAlign: 'center', padding: '3rem 0' }}>
                📅 Календарь сроков появится после запуска разработки документов.
              </p>
            </div>
          </div>
        )}

        {/* ═════════ УСЛУГИ — каталог всегда доступен ═════════ */}
        {activeTab === 'services' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#E7DCCF', marginBottom: '0.5rem' }}>
                🛒 Каталог услуг
              </h2>
              <p style={{ color: 'rgba(214,198,178,0.75)', fontSize: '0.95rem' }}>
                Выберите услугу — мы создадим проект, привяжем договор и откроем доступ к документам.
                {project && (
                  <span style={{ color: '#D4A856', marginLeft: '0.5rem' }}>
                    ⚠️ У вас уже есть активный проект «{project.coopName}». Новая услуга создаст дополнительный проект.
                  </span>
                )}
              </p>
            </div>

            {services.length === 0 ? (
              <div style={{ padding: '2rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 12, textAlign: 'center', color: 'rgba(214,198,178,0.7)' }}>
                Загрузка услуг...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {services.map((svc) => (
                  <ServiceCard key={svc.slug} service={svc} token={token} onOrdered={() => {
                    // Перезагрузить страницу после заказа
                    window.location.reload();
                  }} />
                ))}
              </div>
            )}

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.12)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ color: 'rgba(214,198,178,0.75)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                💡 Хотите сначала подробнее узнать об услуге?
              </div>
              <a href="/uslugi-dlya-potrebitelskih-kooperativov" className="btn-primary" style={{ display: 'inline-block', padding: '0.7rem 1.5rem' }}>
                Посмотреть описание услуг
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// UploadForm — с Turnstile капчей
// ════════════════════════════════════════════════════════════
function UploadForm({ projectId, documentCode, stage, token, onSubmitted }: { 
  projectId: string; documentCode: string; stage: number; token: string; onSubmitted: () => void 
}) {
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
      setTurnstileLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => setTurnstileLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!turnstileLoaded) return;
    const siteKey = (window as any).NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;
    const el = document.getElementById('turnstile-container');
    if (el && (window as any).turnstile) {
      el.innerHTML = '';
      try {
        (window as any).turnstile.render('#turnstile-container', {
          sitekey: siteKey,
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
          theme: 'dark',
        });
      } catch (e) {}
    }
  }, [turnstileLoaded]);

  const validateFile = (f: File): string | null => {
    if (f.size > 10 * 1024 * 1024) return 'Файл слишком большой. Максимум 10 МБ.';
    if (f.size === 0) return 'Файл пустой.';
    const ext = f.name.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
    const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    if (!allowed.includes(ext)) return `Расширение ${ext} не разрешено. Разрешены: ${allowed.join(', ')}.`;
    const forbidden = ['.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.html', '.svg', '.xml'];
    if (forbidden.includes(ext)) return `Расширение ${ext} запрещено по соображениям безопасности.`;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) { setError('Выберите файл'); return; }
    const vErr = validateFile(file);
    if (vErr) { setError(vErr); return; }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      formData.append('documentCode', documentCode);
      formData.append('feedback', feedback);
      formData.append('stage', String(stage));
      if (turnstileToken) formData.append('turnstileToken', turnstileToken);

      const res = await fetch('/api/client-projects/upload', {
        method: 'POST',
        headers: { 'Authorization': `JWT ${token}` },
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setFile(null);
        setFeedback('');
        setTurnstileToken('');
        onSubmitted();
      } else {
        setError(data.error || 'Ошибка загрузки');
      }
    } catch (err) {
      setError('Ошибка соединения');
    }
    setUploading(false);
  };

  if (success) {
    return (
      <div style={{ padding: '1rem', background: 'rgba(109,184,154,0.1)', border: '1px solid rgba(109,184,154,0.3)', borderRadius: 8, color: '#6DB89A', fontSize: '0.9rem' }}>
        ✅ Документ загружен! Исполнитель получил уведомление. Прогресс обновлён: +2.5 XP (50% от 5 XP за загрузку; полный XP зачислится после проверки).
        <button onClick={() => setSuccess(false)} style={{ marginLeft: '1rem', background: 'transparent', border: 'none', color: '#6DB89A', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>Загрузить ещё</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(201,110,77,0.1)', border: '1px solid rgba(201,110,77,0.3)', borderRadius: 8, color: '#C96E4D', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}
      <div>
        <input 
          type="file" 
          onChange={(e) => { setFile(e.target.files?.[0] || null); setError(null); }}
          style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.8)', padding: '0.5rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.15)', borderRadius: 8, width: '100%' }}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <div style={{ fontSize: '0.75rem', color: 'rgba(214,198,178,0.5)', marginTop: '0.4rem' }}>
          📎 Разрешены: PDF, DOC, DOCX, JPG, PNG · Максимум 10 МБ
        </div>
      </div>
      <div>
        <textarea 
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Комментарий к документу (необязательно) — опишите, что именно загрузили, какие особенности, вопросы к Исполнителю..."
          style={{ width: '100%', minHeight: 180, padding: '0.75rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.15)', borderRadius: 8, color: '#D6C6B2', fontSize: '0.85rem', outline: 'none', resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit' }}
        />
      </div>
      <div id="turnstile-container" style={{ minHeight: 65 }} />
      <button 
        type="submit" 
        disabled={!file || uploading}
        style={{ 
          padding: '0.6rem 1.5rem', 
          background: uploading ? 'rgba(214,198,178,0.2)' : 'linear-gradient(135deg, #C96E4D, #E68863)', 
          color: '#fff', border: 'none', borderRadius: 8, 
          fontSize: '0.9rem', fontWeight: 600, cursor: uploading ? 'wait' : 'pointer',
          opacity: !file || uploading ? 0.6 : 1,
        }}
      >
        {uploading ? '⏳ Загрузка...' : '📤 Отправить исполнителю'}
      </button>
    </form>
  );
}

// ════════════════════════════════════════════════════════════
// FeedbackForm — с Turnstile капчей
// ════════════════════════════════════════════════════════════
function FeedbackForm({ projectId, stage, stageName, token, onSubmitted }: { 
  projectId: string; stage: number; stageName: string; token: string; onSubmitted: () => void 
}) {
  const [feedback, setFeedback] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
      setTurnstileLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => setTurnstileLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!turnstileLoaded) return;
    const siteKey = (window as any).NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return;
    const el = document.getElementById('turnstile-feedback-' + stage);
    if (el && (window as any).turnstile) {
      el.innerHTML = '';
      try {
        (window as any).turnstile.render('#turnstile-feedback-' + stage, {
          sitekey: siteKey,
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          theme: 'dark',
        });
      } catch (e) {}
    }
  }, [turnstileLoaded, stage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!feedback.trim()) { setError('Введите отзыв'); return; }
    
    setSubmitting(true);
    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);
        formData.append('documentCode', `stage_${stage}_feedback`);
        formData.append('feedback', feedback);
        formData.append('stage', String(stage));
        if (turnstileToken) formData.append('turnstileToken', turnstileToken);

        const res = await fetch('/api/client-projects/upload', {
          method: 'POST',
          headers: { 'Authorization': `JWT ${token}` },
          body: formData,
        });
        
        if (res.ok) {
          setSuccess(true);
          setFeedback('');
          setFile(null);
          setTurnstileToken('');
          onSubmitted();
        } else {
          const data = await res.json();
          setError(data.error || 'Ошибка');
        }
      } else {
        const res = await fetch('/api/client-projects/feedback', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`,
          },
          body: JSON.stringify({ projectId, stage, feedback, turnstileToken }),
        });
        
        if (res.ok) {
          setSuccess(true);
          setFeedback('');
          onSubmitted();
        } else {
          const data = await res.json();
          setError(data.error || 'Ошибка');
        }
      }
    } catch (err) {
      setError('Ошибка соединения');
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div style={{ padding: '0.75rem', background: 'rgba(109,184,154,0.1)', border: '1px solid rgba(109,184,154,0.3)', borderRadius: 8, marginTop: '0.75rem' }}>
        <span style={{ color: '#6DB89A', fontSize: '0.85rem' }}>✅ Отзыв отправлен! Исполнитель получит уведомление.</span>
        <button onClick={() => setSuccess(false)} style={{ marginLeft: '1rem', background: 'transparent', border: 'none', color: '#6DB89A', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}>Написать ещё</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.1)', borderRadius: 12 }}>
      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E7DCCF', marginBottom: '0.75rem' }}>💬 Ваши дополнения / пожелания по этапу «{stageName}»</h4>
      {error && (
        <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(201,110,77,0.1)', border: '1px solid rgba(201,110,77,0.3)', borderRadius: 6, color: '#C96E4D', fontSize: '0.8rem' }}>
          ⚠️ {error}
        </div>
      )}
      <textarea 
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Опишите ваши пожелания, дополнения или вопросы по документам этого этапа. Можно написать развёрнуто — поле прокручивается, и вы всегда увидите весь введённый текст..."
        style={{ width: '100%', minHeight: 240, padding: '0.75rem', background: 'rgba(214,198,178,0.04)', border: '1px solid rgba(214,198,178,0.15)', borderRadius: 8, color: '#D6C6B2', fontSize: '0.85rem', outline: 'none', resize: 'vertical', marginBottom: '0.75rem', lineHeight: 1.5, fontFamily: 'inherit' }}
      />
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ fontSize: '0.8rem', color: 'rgba(214,198,178,0.7)', flex: 1, minWidth: 200 }}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </div>
      <div id={`turnstile-feedback-${stage}`} style={{ minHeight: 65, marginTop: '0.75rem' }} />
      <button 
        type="submit" 
        disabled={!feedback.trim() || submitting}
        style={{ 
          marginTop: '0.75rem',
          padding: '0.5rem 1.25rem', 
          background: submitting ? 'rgba(214,198,178,0.2)' : 'rgba(230,136,99,0.2)', 
          border: '1px solid rgba(230,136,99,0.4)', color: '#E68863', borderRadius: 8, 
          fontSize: '0.85rem', fontWeight: 600, cursor: submitting ? 'wait' : 'pointer',
          opacity: !feedback.trim() || submitting ? 0.5 : 1,
        }}
      >
        {submitting ? '⏳...' : '📤 Отправить'}
      </button>
    </form>
  );
}

// ════════════════════════════════════════════════════════════
// ServiceCard — карточка услуги для заказа из ЛК
// ════════════════════════════════════════════════════════════
function ServiceCard({ service, token, onOrdered }: {
  service: ServiceTemplate;
  token: string;
  onOrdered: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [coopName, setCoopName] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ projectId: string; contractNumber: string; amount: number } | null>(null);

  // Иконка и цвет по типу услуги
  const isPkPodKlyuch = service.serviceType === 'pk_pod_klyuch' || service.slug.startsWith('pk-pod-klyuch');
  const isAudit = service.serviceType === 'audit_ustava' || service.slug.startsWith('audit-ustava');
  const icon = isPkPodKlyuch ? '🚀' : isAudit ? '🔍' : '📋';
  const color = isPkPodKlyuch ? '#C96E4D' : isAudit ? '#5B8DAA' : '#B8956A';
  const typeLabel = isPkPodKlyuch ? 'Регистрация ПК' : isAudit ? 'Правовой аудит' : 'Услуга';

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!coopName.trim() || coopName.trim().length < 3) {
      setError('Введите название кооператива (минимум 3 символа)');
      return;
    }

    setOrdering(true);
    try {
      const res = await fetch('/api/client-projects/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`,
        },
        body: JSON.stringify({
          serviceTemplateSlug: service.slug,
          coopName: coopName.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setSuccess({
          projectId: data.projectId,
          contractNumber: data.contractNumber,
          amount: data.amount,
        });
        // Через 2 секунды перезагрузить страницу
        setTimeout(() => onOrdered(), 2000);
      } else {
        setError(data.error || 'Не удалось создать заказ');
      }
    } catch (err) {
      setError('Ошибка соединения');
    }
    setOrdering(false);
  };

  if (success) {
    return (
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(109,184,154,0.15), rgba(109,184,154,0.05))',
        border: '2px solid #6DB89A',
        borderRadius: 16,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6DB89A', marginBottom: '0.75rem' }}>
          Заказ создан!
        </h3>
        <p style={{ fontSize: '0.95rem', color: 'rgba(214,198,178,0.85)', marginBottom: '1rem' }}>
          Проект «{coopName}» создан.<br />
          Договор №{success.contractNumber}<br />
          Сумма: {new Intl.NumberFormat('ru-RU').format(success.amount)} ₽
        </p>
        <p style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.6)' }}>
          Перенаправляем в личный кабинет...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      background: 'rgba(214,198,178,0.04)',
      border: `1px solid ${color}40`,
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      {/* Шапка */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: '0.25rem' }}>
            {typeLabel}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#E7DCCF', marginBottom: '0.4rem' }}>
            {service.name}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(214,198,178,0.75)', lineHeight: 1.5 }}>
            {service.shortDescription}
          </p>
        </div>
      </div>

      {/* Цена */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: `${color}15`, borderRadius: 10 }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(214,198,178,0.6)', marginBottom: '0.2rem' }}>Стоимость</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{service.priceDisplay}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(214,198,178,0.6)', marginBottom: '0.2rem' }}>Срок</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E7DCCF' }}>{service.estimatedDurationDays} дн.</div>
        </div>
      </div>

      {/* Описание */}
      <div style={{ fontSize: '0.82rem', color: 'rgba(214,198,178,0.7)', lineHeight: 1.6 }}>
        {service.description.length > 200 ? service.description.slice(0, 200) + '...' : service.description}
      </div>

      {/* Оплата */}
      <div style={{ fontSize: '0.75rem', color: 'rgba(214,198,178,0.6)', padding: '0.5rem 0.75rem', background: 'rgba(214,198,178,0.04)', borderRadius: 8 }}>
        💳 Оплата: {service.paymentSchedule === '50_50' ? '50% предоплата + 50% после регистрации' :
                   service.paymentSchedule === '100_prepaid' ? '100% предоплата' :
                   service.paymentSchedule === 'monthly' ? 'Ежемесячно' : 'По согласованию'}
      </div>

      {/* Форма заказа */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '0.8rem 1.5rem',
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🛒 Заказать эту услугу
        </button>
      ) : (
        <form onSubmit={handleOrder} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {error && (
            <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(201,110,77,0.1)', border: '1px solid rgba(201,110,77,0.3)', borderRadius: 6, color: '#C96E4D', fontSize: '0.8rem' }}>
              ⚠️ {error}
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(214,198,178,0.7)', marginBottom: '0.4rem' }}>
              Название кооператива / проекта:
            </label>
            <input
              type="text"
              value={coopName}
              onChange={(e) => setCoopName(e.target.value)}
              placeholder="Например: Кооператив «Восход»"
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                background: 'rgba(214,198,178,0.05)',
                border: '1px solid rgba(214,198,178,0.2)',
                borderRadius: 8,
                color: '#D6C6B2',
                fontSize: '0.9rem',
                outline: 'none',
              }}
              autoFocus
            />
            <div style={{ fontSize: '0.75rem', color: 'rgba(214,198,178,0.5)', marginTop: '0.4rem' }}>
              Это название будет отображаться в вашем ЛК. Можно изменить позже.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null); }}
              style={{
                padding: '0.6rem 1rem',
                background: 'transparent',
                border: '1px solid rgba(214,198,178,0.2)',
                color: 'rgba(214,198,178,0.7)',
                borderRadius: 8,
                fontSize: '0.85rem',
                cursor: 'pointer',
                flex: 1,
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={ordering || coopName.trim().length < 3}
              style={{
                padding: '0.6rem 1rem',
                background: ordering ? 'rgba(214,198,178,0.2)' : `linear-gradient(135deg, ${color}, ${color}cc)`,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: ordering ? 'wait' : 'pointer',
                flex: 2,
                opacity: ordering || coopName.trim().length < 3 ? 0.6 : 1,
              }}
            >
              {ordering ? '⏳ Создание...' : '✓ Подтвердить заказ'}
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(214,198,178,0.5)', textAlign: 'center' }}>
            Нажимая «Подтвердить», вы соглашаетесь с условиями договора-оферты.
          </div>
        </form>
      )}
    </div>
  );
}

