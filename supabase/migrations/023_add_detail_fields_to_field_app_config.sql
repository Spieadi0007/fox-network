-- 023: Add the missing detail_fields column to field_app_config.
--
-- The live table was created from an older 018 that predated detail_fields,
-- so every Field App save (which writes detail_fields) failed silently with
-- "column field_app_config.detail_fields does not exist" and nothing
-- persisted. Add it idempotently.

alter table public.field_app_config
  add column if not exists detail_fields jsonb not null default '[]';
