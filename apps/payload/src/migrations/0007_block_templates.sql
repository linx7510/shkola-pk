-- Библиотека шаблонов блоков (этап 4): коллекция block-templates
CREATE TABLE IF NOT EXISTS block_templates (
  id serial PRIMARY KEY,
  name varchar NOT NULL,
  block_type varchar NOT NULL,
  description text,
  data jsonb,
  created_at timestamp(3) with time zone NOT NULL DEFAULT now(),
  updated_at timestamp(3) with time zone NOT NULL DEFAULT now()
);
-- Полиморфная таблица блокировок: колонка для новой коллекции (обязательно!)
ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS block_templates_id integer;
ALTER TABLE payload_locked_documents_rels ADD CONSTRAINT payload_locked_documents_rels_block_templates_fk FOREIGN KEY (block_templates_id) REFERENCES block_templates(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_block_templates_id_idx ON payload_locked_documents_rels (block_templates_id);
-- Права для пользователя приложения (иначе permission denied)
GRANT ALL PRIVILEGES ON TABLE block_templates TO shkola_pk;
GRANT ALL PRIVILEGES ON SEQUENCE block_templates_id_seq TO shkola_pk;
