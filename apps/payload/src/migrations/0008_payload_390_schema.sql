-- 0008: схема для Payload 3.90.2 (аудит 06.10.2026)
-- 3.90 добавляет в auth-коллекции reset_password_requested_at (rate-limit сброса пароля)
-- и выборку sessions через lateral join (таблица users_sessions уже существует).
BEGIN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_requested_at timestamp(3) with time zone;
COMMIT;
