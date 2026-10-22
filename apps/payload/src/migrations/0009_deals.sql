-- 0009_deals: сделки услуг Школы (воронка продаж)
BEGIN;

CREATE TYPE enum_deals_service AS ENUM (
  'audit', 'cpp', 'buh_start', 'buh_base', 'buh_std', 'buh_vert',
  'site', 'funnel', 'consult', 'course', 'other'
);
CREATE TYPE enum_deals_stage AS ENUM (
  'new', 'qualified', 'proposal', 'negotiation', 'contract', 'work', 'won', 'lost'
);
CREATE TYPE enum_deals_source AS ENUM (
  'site', 'welcome', 'audit_funnel', 'referral', 'social', 'direct', 'repeat', 'other'
);
CREATE TYPE enum_deals_close_reason AS ENUM (
  'price', 'not_target', 'diy', 'silent', 'competitor', 'other'
);

CREATE TABLE deals (
  id serial PRIMARY KEY,
  title character varying NOT NULL,
  service enum_deals_service,
  stage enum_deals_stage DEFAULT 'new',
  amount double precision,
  source enum_deals_source,
  client_name character varying,
  client_contact character varying,
  lead_id integer,
  responsible character varying,
  notes text,
  close_reason enum_deals_close_reason,
  closed_at timestamp(3) with time zone,
  updated_at timestamp(3) with time zone NOT NULL DEFAULT now(),
  created_at timestamp(3) with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_deals_stage ON deals (stage);

GRANT ALL ON TABLE deals TO shkola_pk;
GRANT ALL ON SEQUENCE deals_id_seq TO shkola_pk;

ALTER TABLE payload_locked_documents_rels ADD COLUMN deals_id integer;

INSERT INTO payload_migrations (name, batch, created_at, updated_at)
VALUES ('0009_deals', (SELECT COALESCE(MAX(batch), 0) + 1 FROM payload_migrations), now(), now());

COMMIT;
