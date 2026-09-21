-- Миграция 0005: CRM v4.2 — расширение Leads (Этап A, Этап «Фаза 2 Sales»)
-- Применение: psql -h 127.0.0.1 -U shkola_pk -d shkola_pk_payload -f 0005_lead_crm_v42.sql

-- Новые скоринговые и CRM-поля
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "lead_score" double precision;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "risk_score" double precision;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "next_action" varchar;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "objection_notes" text;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "sleep_until" timestamp(3) with time zone;

-- Сегмент (select → pg enum)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_leads_segment') THEN
    CREATE TYPE "enum_leads_segment" AS ENUM ('researcher', 'create_pc', 'tax_save', 'education', 'chairman_problem', 'other');
  END IF;
END $$;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "segment" "enum_leads_segment";

-- Возражение (select → pg enum)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_leads_objection') THEN
    CREATE TYPE "enum_leads_objection" AS ENUM ('no_budget', 'no_time', 'no_trust', 'thinking', 'studying', 'other');
  END IF;
END $$;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "objection" "enum_leads_objection";

-- Расширение статусов воронки
ALTER TYPE "enum_leads_status" ADD VALUE IF NOT EXISTS 'consultation';
ALTER TYPE "enum_leads_status" ADD VALUE IF NOT EXISTS 'proposal';
ALTER TYPE "enum_leads_status" ADD VALUE IF NOT EXISTS 'thinking';
ALTER TYPE "enum_leads_status" ADD VALUE IF NOT EXISTS 'sleeping';

-- Источники: форма главной CTA и ИИ-аудит устава (фикс сломанной формы главной)
ALTER TYPE "enum_leads_source" ADD VALUE IF NOT EXISTS 'home_cta';
ALTER TYPE "enum_leads_source" ADD VALUE IF NOT EXISTS 'ai-audit';
