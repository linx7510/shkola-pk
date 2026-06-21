-- Migration 0002: service-templates + client-projects
-- Создаёт таблицы для коллекций ServiceTemplates и ClientProjects
-- Запуск: psql shkola_pk_payload < 0002_service_templates_client_projects.sql

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- SERVICE TEMPLATES (главная таблица)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS "service_templates" (
  "id"                    serial PRIMARY KEY,
  "name"                  varchar NOT NULL,
  "slug"                  varchar NOT NULL UNIQUE,
  "service_type"          varchar,
  "description"           text,
  "short_description"     varchar,
  "price_min"             numeric,
  "price_max"             numeric,
  "currency"              varchar DEFAULT 'RUB',
  "payment_schedule"      varchar DEFAULT '50_50',
  "total_xp"              integer DEFAULT 100,
  "estimated_duration_days" integer DEFAULT 25,
  "is_active"             boolean DEFAULT true,
  "is_public"             boolean DEFAULT true,
  "sort_order"            integer DEFAULT 100,
  "created_at"            timestamptz DEFAULT NOW(),
  "updated_at"            timestamptz DEFAULT NOW()
);

-- Stages (массив этапов)
CREATE TABLE IF NOT EXISTS "service_templates_stages" (
  "id"            serial PRIMARY KEY,
  "_order"        integer NOT NULL DEFAULT 0,
  "_parent_id"    integer REFERENCES "service_templates"("id") ON DELETE CASCADE,
  "num"           integer,
  "name"          varchar,
  "icon"          varchar DEFAULT '📋',
  "description"   text,
  "who"           varchar DEFAULT 'executor'
);

-- Stages → Documents (вложенный массив)
CREATE TABLE IF NOT EXISTS "service_templates_stages_documents" (
  "id"              serial PRIMARY KEY,
  "_order"          integer NOT NULL DEFAULT 0,
  "_parent_id"      integer REFERENCES "service_templates_stages"("id") ON DELETE CASCADE,
  "code"            varchar NOT NULL,
  "name"            varchar NOT NULL,
  "xp"              integer DEFAULT 1,
  "estimated_days"  integer DEFAULT 1,
  "description"     text
);

-- Achievements (массив бейджей)
CREATE TABLE IF NOT EXISTS "service_templates_achievements" (
  "id"                    serial PRIMARY KEY,
  "_order"                integer NOT NULL DEFAULT 0,
  "_parent_id"            integer REFERENCES "service_templates"("id") ON DELETE CASCADE,
  "code"                  varchar NOT NULL,
  "name"                  varchar NOT NULL,
  "icon"                  varchar DEFAULT '🏆',
  "description"           text,
  "xp"                    integer DEFAULT 0,
  "unlock_condition"      varchar DEFAULT 'manual',
  "unlock_stage"          integer,
  "unlock_xp_threshold"   integer,
  "unlock_doc_codes"      varchar
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CLIENT PROJECTS (главная таблица)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS "client_projects" (
  "id"                  serial PRIMARY KEY,
  "client_id"           integer REFERENCES "users"("id") ON DELETE SET NULL,
  "coop_name"           varchar NOT NULL,
  "coop_slug"           varchar,
  "template_id"         integer REFERENCES "service_templates"("id") ON DELETE SET NULL,
  "template_snapshot"   jsonb,
  -- contract (group)
  "contract_number"         varchar,
  "contract_signed_at"      timestamptz,
  "contract_amount"         numeric,
  "contract_payment_status" varchar DEFAULT 'prepaid_50',
  "contract_paid_at"        timestamptz,
  "contract_final_paid_at"  timestamptz,
  "contract_payment_schedule" varchar,
  -- progress
  "stage"               integer DEFAULT 0,
  "total_xp"            integer DEFAULT 0,
  "percent"             integer DEFAULT 0,
  -- meta
  "created_at"          timestamptz DEFAULT NOW(),
  "updated_at"          timestamptz DEFAULT NOW()
);

-- Documents (snapshot из template)
CREATE TABLE IF NOT EXISTS "client_projects_documents" (
  "id"              serial PRIMARY KEY,
  "_order"          integer NOT NULL DEFAULT 0,
  "_parent_id"      integer REFERENCES "client_projects"("id") ON DELETE CASCADE,
  "code"            varchar NOT NULL,
  "name"            varchar NOT NULL,
  "stage"           integer,
  "stage_name"      varchar,
  "stage_icon"      varchar,
  "xp"              integer DEFAULT 1,
  "estimated_days"  integer,
  "description"     text,
  "status"          varchar DEFAULT 'pending',
  "ready_at"        timestamptz,
  "approved_at"     timestamptz,
  "file_id"         integer REFERENCES "media"("id") ON DELETE SET NULL,
  "comment"         text,
  "client_comment"  text
);

-- Achievements (snapshot из template)
CREATE TABLE IF NOT EXISTS "client_projects_achievements" (
  "id"                    serial PRIMARY KEY,
  "_order"                integer NOT NULL DEFAULT 0,
  "_parent_id"            integer REFERENCES "client_projects"("id") ON DELETE CASCADE,
  "code"                  varchar NOT NULL,
  "name"                  varchar NOT NULL,
  "icon"                  varchar DEFAULT '🏆',
  "description"           text,
  "xp"                    integer DEFAULT 0,
  "unlock_condition"      varchar DEFAULT 'manual',
  "unlock_stage"          integer,
  "unlock_xp_threshold"   integer,
  "unlock_doc_codes"      varchar,
  "unlocked"              boolean DEFAULT false,
  "unlocked_at"           timestamptz
);

-- Chat (массив сообщений)
CREATE TABLE IF NOT EXISTS "client_projects_chat" (
  "id"                      serial PRIMARY KEY,
  "_order"                  integer NOT NULL DEFAULT 0,
  "_parent_id"              integer REFERENCES "client_projects"("id") ON DELETE CASCADE,
  "author"                  varchar NOT NULL,
  "message"                 text NOT NULL,
  "sent_at"                 timestamptz,
  "attached_document_code"  varchar
);

-- Calendar (массив событий)
CREATE TABLE IF NOT EXISTS "client_projects_calendar" (
  "id"          serial PRIMARY KEY,
  "_order"      integer NOT NULL DEFAULT 0,
  "_parent_id"  integer REFERENCES "client_projects"("id") ON DELETE CASCADE,
  "event"       varchar NOT NULL,
  "date"        timestamptz,
  "type"        varchar,
  "done"        boolean DEFAULT false
);

-- Notifications (массив уведомлений)
CREATE TABLE IF NOT EXISTS "client_projects_notifications" (
  "id"          serial PRIMARY KEY,
  "_order"      integer NOT NULL DEFAULT 0,
  "_parent_id"  integer REFERENCES "client_projects"("id") ON DELETE CASCADE,
  "type"        varchar NOT NULL,
  "message"     text NOT NULL,
  "sent_at"     timestamptz,
  "read_at"     timestamptz,
  "channel"     varchar
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ИНДЕКСЫ
-- ═══════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_service_templates_slug ON "service_templates"("slug");
CREATE INDEX IF NOT EXISTS idx_service_templates_active_public ON "service_templates"("is_active", "is_public");
CREATE INDEX IF NOT EXISTS idx_client_projects_client ON "client_projects"("client_id");
CREATE INDEX IF NOT EXISTS idx_client_projects_template ON "client_projects"("template_id");
CREATE INDEX IF NOT EXISTS idx_client_projects_slug ON "client_projects"("coop_slug");
CREATE INDEX IF NOT EXISTS idx_cpd_parent ON "client_projects_documents"("_parent_id");
CREATE INDEX IF NOT EXISTS idx_cpa_parent ON "client_projects_achievements"("_parent_id");
CREATE INDEX IF NOT EXISTS idx_cpchat_parent ON "client_projects_chat"("_parent_id");

-- ═══════════════════════════════════════════════════════════════════════════
-- ЗАПИСЬ В payload_migrations
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO payload_migrations (name, batch, updated_at, created_at)
VALUES ('0002_service_templates_client_projects', 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

COMMIT;

-- Сводка
SELECT 'service_templates' as table_name, count(*) as rows FROM "service_templates"
UNION ALL
SELECT 'client_projects', count(*) FROM "client_projects"
UNION ALL
SELECT 'service_templates_stages', count(*) FROM "service_templates_stages"
UNION ALL
SELECT 'service_templates_stages_documents', count(*) FROM "service_templates_stages_documents"
UNION ALL
SELECT 'service_templates_achievements', count(*) FROM "service_templates_achievements";
