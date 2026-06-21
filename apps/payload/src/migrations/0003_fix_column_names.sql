-- Fix: rename columns to match Payload's camelCase→snake_case convention
-- totalXP → total_x_p (not total_xp)
-- unlockXPThreshold → unlock_x_p_threshold (not unlock_xp_threshold)

BEGIN;

-- service_templates: rename total_xp → total_x_p
ALTER TABLE "service_templates" RENAME COLUMN "total_xp" TO "total_x_p";

-- service_templates_achievements: rename unlock_xp_threshold → unlock_x_p_threshold
ALTER TABLE "service_templates_achievements" RENAME COLUMN "unlock_xp_threshold" TO "unlock_x_p_threshold";

-- client_projects: rename total_xp → total_x_p
ALTER TABLE "client_projects" RENAME COLUMN "total_xp" TO "total_x_p";

-- client_projects_achievements: rename unlock_xp_threshold → unlock_x_p_threshold
ALTER TABLE "client_projects_achievements" RENAME COLUMN "unlock_xp_threshold" TO "unlock_x_p_threshold";

COMMIT;

-- Verify
\echo 'After rename:'
\d "service_templates"
\d "client_projects"
