-- Drop and recreate all new tables with varchar IDs
-- Payload 3.x expects text IDs everywhere

BEGIN;

DROP TABLE IF EXISTS "client_projects_notifications" CASCADE;
DROP TABLE IF EXISTS "client_projects_calendar" CASCADE;
DROP TABLE IF EXISTS "client_projects_chat" CASCADE;
DROP TABLE IF EXISTS "client_projects_achievements" CASCADE;
DROP TABLE IF EXISTS "client_projects_documents" CASCADE;
DROP TABLE IF EXISTS "client_projects" CASCADE;
DROP TABLE IF EXISTS "service_templates_achievements" CASCADE;
DROP TABLE IF EXISTS "service_templates_stages_documents" CASCADE;
DROP TABLE IF EXISTS "service_templates_stages" CASCADE;
DROP TABLE IF EXISTS "service_templates" CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- SERVICE TEMPLATES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE "service_templates" (
  "id"                    varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"                  varchar NOT NULL,
  "slug"                  varchar NOT NULL UNIQUE,
  "service_type"          varchar,
  "description"           text,
  "short_description"     varchar,
  "price_min"             numeric,
  "price_max"             numeric,
  "currency"              varchar DEFAULT 'RUB',
  "payment_schedule"      varchar DEFAULT '50_50',
  "total_x_p"             integer DEFAULT 100,
  "estimated_duration_days" integer DEFAULT 25,
  "is_active"             boolean DEFAULT true,
  "is_public"             boolean DEFAULT true,
  "sort_order"            integer DEFAULT 100,
  "created_at"            timestamptz DEFAULT NOW(),
  "updated_at"            timestamptz DEFAULT NOW()
);

CREATE TABLE "service_templates_stages" (
  "id"            varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_order"        integer NOT NULL DEFAULT 0,
  "_parent_id"    varchar REFERENCES "service_templates"("id") ON DELETE CASCADE,
  "num"           integer,
  "name"          varchar,
  "icon"          varchar DEFAULT '📋',
  "description"   text,
  "who"           varchar DEFAULT 'executor'
);

CREATE TABLE "service_templates_stages_documents" (
  "id"              varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_order"          integer NOT NULL DEFAULT 0,
  "_parent_id"      varchar REFERENCES "service_templates_stages"("id") ON DELETE CASCADE,
  "code"            varchar NOT NULL,
  "name"            varchar NOT NULL,
  "xp"              integer DEFAULT 1,
  "estimated_days"  integer DEFAULT 1,
  "description"     text
);

CREATE TABLE "service_templates_achievements" (
  "id"                    varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_order"                integer NOT NULL DEFAULT 0,
  "_parent_id"            varchar REFERENCES "service_templates"("id") ON DELETE CASCADE,
  "code"                  varchar NOT NULL,
  "name"                  varchar NOT NULL,
  "icon"                  varchar DEFAULT '🏆',
  "description"           text,
  "xp"                    integer DEFAULT 0,
  "unlock_condition"      varchar DEFAULT 'manual',
  "unlock_stage"          integer,
  "unlock_x_p_threshold"  integer,
  "unlock_doc_codes"      varchar
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CLIENT PROJECTS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE "client_projects" (
  "id"                  varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "client_id"           integer REFERENCES "users"("id") ON DELETE SET NULL,
  "coop_name"           varchar NOT NULL,
  "coop_slug"           varchar,
  "template_id"         varchar REFERENCES "service_templates"("id") ON DELETE SET NULL,
  "template_snapshot"   jsonb,
  "contract_number"         varchar,
  "contract_signed_at"      timestamptz,
  "contract_amount"         numeric,
  "contract_payment_status" varchar DEFAULT 'prepaid_50',
  "contract_paid_at"        timestamptz,
  "contract_final_paid_at"  timestamptz,
  "contract_payment_schedule" varchar,
  "stage"               integer DEFAULT 0,
  "total_x_p"           integer DEFAULT 0,
  "percent"             integer DEFAULT 0,
  "created_at"          timestamptz DEFAULT NOW(),
  "updated_at"          timestamptz DEFAULT NOW()
);

CREATE TABLE "client_projects_documents" (
  "id"              varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_order"          integer NOT NULL DEFAULT 0,
  "_parent_id"      varchar REFERENCES "client_projects"("id") ON DELETE CASCADE,
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

CREATE TABLE "client_projects_achievements" (
  "id"                    varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_order"                integer NOT NULL DEFAULT 0,
  "_parent_id"            varchar REFERENCES "client_projects"("id") ON DELETE CASCADE,
  "code"                  varchar NOT NULL,
  "name"                  varchar NOT NULL,
  "icon"                  varchar DEFAULT '🏆',
  "description"           text,
  "xp"                    integer DEFAULT 0,
  "unlock_condition"      varchar DEFAULT 'manual',
  "unlock_stage"          integer,
  "unlock_x_p_threshold"  integer,
  "unlock_doc_codes"      varchar,
  "unlocked"              boolean DEFAULT false,
  "unlocked_at"           timestamptz
);

CREATE TABLE "client_projects_chat" (
  "id"                      varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_order"                  integer NOT NULL DEFAULT 0,
  "_parent_id"              varchar REFERENCES "client_projects"("id") ON DELETE CASCADE,
  "author"                  varchar NOT NULL,
  "message"                 text NOT NULL,
  "sent_at"                 timestamptz,
  "attached_document_code"  varchar
);

CREATE TABLE "client_projects_calendar" (
  "id"          varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_order"      integer NOT NULL DEFAULT 0,
  "_parent_id"  varchar REFERENCES "client_projects"("id") ON DELETE CASCADE,
  "event"       varchar NOT NULL,
  "date"        timestamptz,
  "type"        varchar,
  "done"        boolean DEFAULT false
);

CREATE TABLE "client_projects_notifications" (
  "id"          varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_order"      integer NOT NULL DEFAULT 0,
  "_parent_id"  varchar REFERENCES "client_projects"("id") ON DELETE CASCADE,
  "type"        varchar NOT NULL,
  "message"     text NOT NULL,
  "sent_at"     timestamptz,
  "read_at"     timestamptz,
  "channel"     varchar
);

-- Indexes
CREATE INDEX idx_service_templates_slug ON "service_templates"("slug");
CREATE INDEX idx_service_templates_active_public ON "service_templates"("is_active", "is_public");
CREATE INDEX idx_client_projects_client ON "client_projects"("client_id");
CREATE INDEX idx_client_projects_template ON "client_projects"("template_id");
CREATE INDEX idx_client_projects_slug ON "client_projects"("coop_slug");

COMMIT;

\echo 'All tables recreated with varchar IDs.'
