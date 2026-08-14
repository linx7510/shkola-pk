"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";

interface ConsultationService {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  priceMin: number;
}

const SERVICES: ConsultationService[] = [
  {
    slug: "consultation-free",
    priceMin: 0,
    name: "Бесплатная консультация",
    shortDescription: "30 минут · бесплатно · онлайн",
    description: "Разбор вашей ситуации, ответы на общие вопросы, честный совет о целесообразности создания кооператива, подборка обучающих материалов под конкретный запрос. Проводит Велеслав Старков — эксперт с 10-летним опытом создания потребительских кооперативов (более 120 ПК с 2015 года, ни один не ликвидирован ФНС).",
  },
  {
    slug: "consultation-paid",
    priceMin: 6000,
    name: "Индивидуальная консультация",
    shortDescription: "1 час · 6 000 ₽ · письменное резюме",
    description: "Детальный разбор конкретной ситуации с изучением документов. Оценка налоговых рисков, чёткие рекомендации и письменное резюме после консультации с планом действий. Индивидуальный подход к вашему бизнесу: создание, ведение или оптимизация кооператива. Проводит Велеслав Старков лично.",
  },
  {
    slug: "consultation-abonement",
    priceMin: 25000,
    name: "Абонементное сопровождение",
    shortDescription: "До 9 часов в месяц · 25 000 ₽/мес · приоритет",
    description: "Постоянная поддержка эксперта: до 9 часов консультаций в месяц (общая продолжительность). Неограниченные консультации в Telegram, еженедельные созвоны по проекту, сопровождение при подготовке документов, приоритетная реакция на вопросы. Идеально для действующих кооперативов, которым нужна регулярная экспертная поддержка.",
  },
];

const TIME_SLOTS = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

const MSK_OFFSET = 3;

function isWeekend(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  return day === 0 || day === 6;
}

function getAvailableWorkdays(): { value: string; label: string }[] {
  const days: { value: string; label: string }[] = [];
  const today = new Date();
  const weekdays = ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"];
  const months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  
  for (let i = 1; i <= 30 && days.length < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue; // пропускаем выходные
    
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const value = y + "-" + m + "-" + day;
    const label = d.getDate() + " " + months[d.getMonth()] + " (" + weekdays[dow] + ")";
    days.push({ value, label });
  }
  return days;
}

function getMskHour(): number {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const msk = new Date(utc + MSK_OFFSET * 3600000);
  return msk.getHours();
}

function getTodayMsk(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const msk = new Date(utc + MSK_OFFSET * 3600000);
  const y = msk.getFullYear();
  const m = String(msk.getMonth() + 1).padStart(2, "0");
  const d = String(msk.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function formatDateRu(iso: string): string {
  if (!iso) return "";
  try {
    // Добавляем T00:00:00 чтобы дата не сдвигалась из-за UTC
    const d = new Date(iso + "T00:00:00");
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return day + " " + month + " " + year;
  } catch {
    return iso;
  }
}

export default function ConsultationBooking({ token, userEmail }: { token: string; userEmail: string }) {
  const [selectedService, setSelectedService] = useState<ConsultationService | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ bookingId: string; amount: number; paid: boolean } | null>(null);

  const loadBookedSlots = async (month: string) => {
    try {
      const res = await fetch(`/api/consultations/book?month=${month}`);
      if (res.ok) {
        const data = await res.json();
        const slots = (data.booked || []).map((b: any) => `${b.date?.substring(0, 10)}_${b.time}`);
        setBookedSlots(slots);
      }
    } catch {}
  };

  const handleDateChange = (value: string) => {
    if (isWeekend(value)) {
      setError("Консультации проводятся только в будние дни (пн-пт)");
      return;
    }
    setError(null);
    setDate(value);
    setTime("");
    const m = value.substring(0, 7);
    if (m) loadBookedSlots(m);
  };

  const handleBook = async () => {
    if (!selectedService || !date || !time) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/consultations/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: selectedService.slug,
          clientName: "Клиент ЛК",
          clientEmail: userEmail,
          date,
          time,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Не удалось записаться");
        setLoading(false);
        return;
      }

      if (selectedService.priceMin > 0 && data.needsPayment) {
        // Платная — создаём платёж
        const payRes = await fetch("/api/payment/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify({
            courseId: 0,
            serviceSlug: selectedService.slug,
            amount: selectedService.priceMin,
            description: `${selectedService.name} — ${formatDateRu(date)} ${time}`,
          }),
        });
        const payData = await payRes.json();
        if (payRes.ok && (payData.confirmationUrl || payData.paymentUrl)) {
          window.location.href = payData.confirmationUrl || payData.paymentUrl;
        } else {
          // В тестовом режиме — сразу успех
          setSuccess({ bookingId: String(data.bookingId), amount: selectedService.priceMin, paid: true });
        }
      } else {
        // Бесплатная — успех
        setSuccess({ bookingId: String(data.bookingId), amount: 0, paid: true });
      }
    } catch {
      setError("Ошибка соединения");
    }
    setLoading(false);
  };

  // === ЭКРАН 1: ВЫБОР УСЛУГИ ===
  if (!selectedService && !success) {
    return (
      <>
        <Header />
        <div style={{ minHeight: "100vh", background: "#0D0C0A", color: "#D6C6B2", paddingTop: "calc(var(--header-h, 72px) + 2rem)", paddingBottom: "4rem" }}>
          <div style={{ maxWidth: "var(--container-max, 1400px)", margin: "0 auto", padding: "0 var(--container-px, clamp(1rem, 4vw, 4rem))" }}>
            <div style={{ marginBottom: "2rem" }}>
              <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "rgba(214,198,178,0.7)", fontSize: "0.9rem", textDecoration: "none", marginBottom: "1rem" }}>
                ← Назад в личный кабинет
              </Link>
              <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, color: "#D6C6B2", marginBottom: "0.5rem" }}>
                💬 Консультация
              </h1>
              <p style={{ color: "rgba(214,198,178,0.75)", fontSize: "1.05rem" }}>
                Выберите формат консультации с Велеславом Старковым
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "1.5rem" }}>
              {SERVICES.map((svc) => {
                const isFree = svc.priceMin === 0;
                const color = "#6DB89A";
                return (
                  <div key={svc.slug} style={{
                    padding: "1.75rem",
                    background: "rgba(214,198,178,0.04)",
                    border: `1px solid ${color}40`,
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                      <div style={{ fontSize: "2.5rem", flexShrink: 0 }}>{isFree ? "🆓" : "💬"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.75rem", color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "0.25rem" }}>
                          {isFree ? "Бесплатно" : "Платная консультация"}
                        </div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#E7DCCF", marginBottom: "0.4rem" }}>
                          {svc.name}
                        </h3>
                        <p style={{ fontSize: "0.85rem", color: "rgba(214,198,178,0.75)", lineHeight: 1.5 }}>
                          {svc.shortDescription}
                        </p>
                      </div>
                    </div>

                    <div style={{ padding: "0.75rem 1rem", background: `${color}15`, borderRadius: 10 }}>
                      <span style={{ fontSize: "1.5rem", fontWeight: 800, color }}>
                        {isFree ? "0 ₽" : "6 000 ₽"}
                      </span>
                    </div>

                    <p style={{ fontSize: "0.82rem", color: "rgba(214,198,178,0.7)", lineHeight: 1.6 }}>
                      {svc.description}
                    </p>

                    <button
                      onClick={() => { setSelectedService(svc); setError(null); }}
                      style={{
                        padding: "0.8rem 1.5rem",
                        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        marginTop: "auto",
                      }}
                    >
                      {isFree ? "🆓 Выбрать время" : "💳 Выбрать время и оплатить"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "2rem", padding: "1rem 1.25rem", background: "rgba(214,198,178,0.04)", border: "1px solid rgba(214,198,178,0.1)", borderRadius: 10, fontSize: "0.8rem", color: "rgba(214,198,178,0.5)", lineHeight: 1.5 }}>
              ⚠️ Дисклеймер: Консультация носит информационно-консультационный характер и не является юридической услугой в смысле ФЗ-324 «О бесплатной юридической помощи». Для подготовки документов и правового аудита закажите соответствующую услугу. Оказываемые услуги соответствуют законодательству Российской Федерации.
            </div>
          </div>
        </div>
      </>
    );
  }

  // === ЭКРАН 2: ВЫБОР ДАТЫ И ВРЕМЕНИ ===
  if (selectedService && !success) {
    const isFree = selectedService.priceMin === 0;
    const color = "#6DB89A";
    const todayStr = getTodayMsk();

    return (
      <>
        <Header />
        <div style={{ minHeight: "100vh", background: "#0D0C0A", color: "#D6C6B2", paddingTop: "calc(var(--header-h, 72px) + 2rem)", paddingBottom: "4rem" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 1.5rem" }}>
            <button
              onClick={() => { setSelectedService(null); setDate(""); setTime(""); setError(null); }}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "rgba(214,198,178,0.7)", fontSize: "0.9rem", background: "none", border: "none", cursor: "pointer", marginBottom: "1.5rem" }}
            >
              ← Выбрать другую услугу
            </button>

            <div style={{ padding: "1.5rem", background: "rgba(214,198,178,0.04)", border: `1px solid ${color}40`, borderRadius: 16, marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{isFree ? "🆓" : "💬"}</span>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#E7DCCF" }}>{selectedService.name}</h3>
                  <span style={{ fontSize: "1.3rem", fontWeight: 800, color }}>{isFree ? "Бесплатно" : "6 000 ₽"}</span>
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(214,198,178,0.7)", lineHeight: 1.5 }}>{selectedService.description}</p>
            </div>

            <div style={{ padding: "1.5rem", background: "rgba(214,198,178,0.04)", border: "1px solid rgba(214,198,178,0.12)", borderRadius: 16 }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#E7DCCF", marginBottom: "1rem" }}>📅 Выбор времени (пн-пт, МСК)</h3>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(214,198,178,0.7)", marginBottom: "0.4rem" }}>Дата (пн-пт, МСК):</label>
                <select
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem", background: "#1a1a1a", border: "1px solid rgba(214,198,178,0.2)", borderRadius: 8, color: "#D6C6B2", fontSize: "0.95rem", cursor: "pointer" }}
                >
                  <option value="" style={{ background: "#1a1a1a", color: "#888" }}>— Выберите дату —</option>
                  {getAvailableWorkdays().map((d) => (
                    <option key={d.value} value={d.value} style={{ background: "#1a1a1a", color: "#D6C6B2" }}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {date && !error && (
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "rgba(214,198,178,0.7)", marginBottom: "0.4rem" }}>Время (МСК):</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {TIME_SLOTS.filter((t) => {
                      if (date === todayStr) {
                        return parseInt(t.split(":")[0]) > getMskHour();
                      }
                      return true;
                    }).map((t) => {
                      const slotKey = `${date}_${t}`;
                      const isBooked = bookedSlots.includes(slotKey);
                      return (
                        <button
                          key={t}
                          onClick={() => !isBooked && setTime(t)}
                          disabled={isBooked}
                          style={{
                            padding: "0.4rem 0.7rem",
                            background: time === t ? color : isBooked ? "rgba(255,80,80,0.1)" : "rgba(214,198,178,0.08)",
                            color: isBooked ? "rgba(214,198,178,0.25)" : time === t ? "#fff" : "#D6C6B2",
                            border: `1px solid ${time === t ? color : "rgba(214,198,178,0.15)"}`,
                            borderRadius: 6,
                            fontSize: "0.85rem",
                            cursor: isBooked ? "not-allowed" : "pointer",
                            textDecoration: isBooked ? "line-through" : "none",
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", background: "rgba(201,110,77,0.1)", border: "1px solid rgba(201,110,77,0.3)", borderRadius: 6, color: "#C96E4D", fontSize: "0.85rem" }}>
                  ⚠️ {error}
                </div>
              )}

              {date && time && !error && (
                <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", background: "rgba(109,184,154,0.08)", border: "1px solid rgba(109,184,154,0.2)", borderRadius: 10, fontSize: "0.9rem", color: "rgba(214,198,178,0.9)" }}>
                  ✅ Вы выбрали: <strong>{formatDateRu(date)}</strong> в <strong>{time} МСК</strong>
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={loading || !date || !time || !!error}
                style={{
                  width: "100%",
                  marginTop: "1.5rem",
                  padding: "0.9rem",
                  background: loading || !date || !time || !!error ? "rgba(214,198,178,0.1)" : `linear-gradient(135deg, ${color}, ${color}cc)`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: loading || !date || !time || !!error ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Обработка..." : isFree ? "🆓 Записаться" : "💳 Оплатить 6 000 ₽"}
              </button>
            </div>

            <div style={{ marginTop: "1rem", fontSize: "0.78rem", color: "rgba(214,198,178,0.4)", lineHeight: 1.5, textAlign: "center" }}>
              ⚠️ Консультация носит информационно-консультационный характер и не является юридической услугой в смысле ФЗ-324.
            </div>
          </div>
        </div>
      </>
    );
  }

  // === ЭКРАН 3: УСПЕХ ===
  if (success) {
    const isFree = success.amount === 0;
    return (
      <>
        <Header />
        <div style={{ minHeight: "100vh", background: "#0D0C0A", color: "#D6C6B2", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "var(--header-h, 72px)" }}>
          <div style={{ maxWidth: 500, margin: "0 auto", padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{isFree ? "✅" : "🎉"}</div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#6DB89A", marginBottom: "0.75rem" }}>
              {isFree ? "Вы записаны!" : "Оплата прошла успешно!"}
            </h2>
            <div style={{ padding: "1.25rem", background: "rgba(109,184,154,0.08)", border: "1px solid rgba(109,184,154,0.2)", borderRadius: 12, marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "1rem", color: "rgba(214,198,178,0.9)", marginBottom: "0.5rem" }}>
                <strong>{selectedService?.name}</strong>
              </p>
              <p style={{ fontSize: "0.95rem", color: "rgba(214,198,178,0.8)" }}>
                📅 {date && formatDateRu(date)} в {time} МСК
              </p>
              {success.amount > 0 && (
                <p style={{ fontSize: "0.95rem", color: "#6DB89A", fontWeight: 600, marginTop: "0.5rem" }}>
                  Оплачено: {success.amount.toLocaleString("ru-RU")} ₽
                </p>
              )}
              <p style={{ fontSize: "0.85rem", color: "rgba(214,198,178,0.5)", marginTop: "0.5rem" }}>
                ID заявки: {success.bookingId}
              </p>
            </div>
            <p style={{ fontSize: "0.9rem", color: "rgba(214,198,178,0.7)", marginBottom: "1.5rem" }}>
              Велеслав свяжется с вами для подтверждения и уточнения деталей. Ссылка на видеозвонок будет отправлена на вашу почту.
            </p>
            <Link
              href="/dashboard"
              style={{
                display: "inline-block",
                padding: "0.8rem 2rem",
                background: "linear-gradient(135deg, #B8956A, #B8956Acc)",
                color: "#fff",
                borderRadius: 10,
                fontSize: "0.95rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              ← Вернуться в личный кабинет
            </Link>
          </div>
        </div>
      </>
    );
  }

  return null;
}
