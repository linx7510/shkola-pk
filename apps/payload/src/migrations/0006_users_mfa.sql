-- Миграция 0006: 2FA (TOTP) для админки — поля users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mfa_enabled" boolean DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mfa_secret" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mfa_pending_secret" varchar;
