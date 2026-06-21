-- Fix: change id columns from serial (integer) to varchar (text)
-- Payload 3.x uses text IDs by default for new collections

BEGIN;

-- Drop the old serial columns and their sequences
ALTER TABLE "service_templates" DROP COLUMN IF EXISTS "id" CASCADE;
ALTER TABLE "service_templates_stages" DROP COLUMN IF EXISTS "id" CASCADE;
ALTER TABLE "service_templates_stages_documents" DROP COLUMN IF EXISTS "id" CASCADE;
ALTER TABLE "service_templates_achievements" DROP COLUMN IF EXISTS "id" CASCADE;
ALTER TABLE "client_projects" DROP COLUMN IF EXISTS "id" CASCADE;
ALTER TABLE "client_projects_documents" DROP COLUMN IF EXISTS "id" CASCADE;
ALTER TABLE "client_projects_achievements" DROP COLUMN IF EXISTS "id" CASCADE;
ALTER TABLE "client_projects_chat" DROP COLUMN IF EXISTS "id" CASCADE;
ALTER TABLE "client_projects_calendar" DROP COLUMN IF EXISTS "id" CASCADE;
ALTER TABLE "client_projects_notifications" DROP COLUMN IF EXISTS "id" CASCADE;

-- Recreate with varchar (text) IDs as Payload expects
ALTER TABLE "service_templates" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid()::text;
ALTER TABLE "service_templates_stages" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid()::text;
ALTER TABLE "service_templates_stages_documents" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid()::text;
ALTER TABLE "service_templates_achievements" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid()::text;
ALTER TABLE "client_projects" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid()::text;
ALTER TABLE "client_projects_documents" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid()::text;
ALTER TABLE "client_projects_achievements" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid()::text;
ALTER TABLE "client_projects_chat" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid()::text;
ALTER TABLE "client_projects_calendar" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid()::text;
ALTER TABLE "client_projects_notifications" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid()::text;

-- Recreate foreign key constraints (they were dropped with CASCADE)
ALTER TABLE "service_templates_stages" ADD CONSTRAINT "service_templates_stages__parent_id_fkey"
  FOREIGN KEY ("_parent_id") REFERENCES "service_templates"("id") ON DELETE CASCADE;
ALTER TABLE "service_templates_stages_documents" ADD CONSTRAINT "service_templates_stages_documents__parent_id_fkey"
  FOREIGN KEY ("_parent_id") REFERENCES "service_templates_stages"("id") ON DELETE CASCADE;
ALTER TABLE "service_templates_achievements" ADD CONSTRAINT "service_templates_achievements__parent_id_fkey"
  FOREIGN KEY ("_parent_id") REFERENCES "service_templates"("id") ON DELETE CASCADE;

ALTER TABLE "client_projects_documents" ADD CONSTRAINT "client_projects_documents__parent_id_fkey"
  FOREIGN KEY ("_parent_id") REFERENCES "client_projects"("id") ON DELETE CASCADE;
ALTER TABLE "client_projects_achievements" ADD CONSTRAINT "client_projects_achievements__parent_id_fkey"
  FOREIGN KEY ("_parent_id") REFERENCES "client_projects"("id") ON DELETE CASCADE;
ALTER TABLE "client_projects_chat" ADD CONSTRAINT "client_projects_chat__parent_id_fkey"
  FOREIGN KEY ("_parent_id") REFERENCES "client_projects"("id") ON DELETE CASCADE;
ALTER TABLE "client_projects_calendar" ADD CONSTRAINT "client_projects_calendar__parent_id_fkey"
  FOREIGN KEY ("_parent_id") REFERENCES "client_projects"("id") ON DELETE CASCADE;
ALTER TABLE "client_projects_notifications" ADD CONSTRAINT "client_projects_notifications__parent_id_fkey"
  FOREIGN KEY ("_parent_id") REFERENCES "client_projects"("id") ON DELETE CASCADE;

-- client_projects foreign keys to users and service_templates
-- Note: users.id is integer, service_templates.id is now varchar
-- So client_projects.client_id should reference users(id) as integer
-- client_projects.template_id should reference service_templates(id) as varchar

COMMIT;

\echo 'ID columns changed to varchar successfully.'
