-- Migration: add consultation_bookings_id to _rels tables
-- Причина: коллекция ConsultationBookings добавлена в payload.config.ts,
-- но миграция БД не была выполнена. Payload CMS при запросе /admin пытается
-- SELECT consultation_bookings_id из payload_locked_documents_rels и
-- payload_preferences_rels — колонок нет → ERROR 3356197915 → админка не грузится.

-- Добавляем колонку в payload_locked_documents_rels
ALTER TABLE payload_locked_documents_rels
  ADD COLUMN IF NOT EXISTS consultation_bookings_id integer;

-- Добавляем колонку в payload_preferences_rels
ALTER TABLE payload_preferences_rels
  ADD COLUMN IF NOT EXISTS consultation_bookings_id integer;
