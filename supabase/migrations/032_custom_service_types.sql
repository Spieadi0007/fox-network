-- 032: Let organisations define their own service types.
--
-- `actions.action_type` was a Postgres enum fixed at eight values. Everything
-- built on top of it — Field App configs, procedures, workflow steps — keys
-- off a plain text code, so an org could already be shown a ninth type in
-- settings, configure it, publish a procedure for it, and then find that no
-- work order could ever have it: the enum rejects the value on insert.
--
-- One SOP describes one kind of job, and that job is often not one of the
-- eight. Widening the column is what makes "import this SOP as a new service
-- type" mean anything.

-- ============================================================
-- action_type: enum -> text
-- ============================================================

-- Only actions.action_type ever used the enum; nothing else references it.
alter table public.actions
  alter column action_type type text using action_type::text;

-- The eight remain the defaults an org starts from, but they are no longer a
-- closed set. Codes are matched against configurable_field_options instead.
-- The old enum type is left in place: dropping it would break any generated
-- client types still referring to it, and it now costs nothing.

-- Guard against the obvious mistakes a free-text column allows.
alter table public.actions
  drop constraint if exists actions_action_type_not_blank;
alter table public.actions
  add constraint actions_action_type_not_blank
  check (length(btrim(action_type)) > 0);

-- ============================================================
-- Retiring a service type
-- ============================================================

-- Types are retired rather than deleted: existing work orders, configs and
-- filed reports all resolve through the code, and removing the option row
-- would leave them pointing at a name nothing can display.
alter table public.configurable_field_options
  add column if not exists is_active boolean not null default true;

create index if not exists idx_cfo_org_field_active
  on public.configurable_field_options (organization_id, field_key)
  where is_active;

-- ============================================================
-- Tying a service type to the SOP it came from
-- ============================================================

-- Which import produced this type, so the page can show where it came from
-- and offer to re-import from the same document.
alter table public.configurable_field_options
  add column if not exists source_sop_import_id uuid
    references public.sop_imports(id) on delete set null;

-- ============================================================
-- Note on migration 022
-- ============================================================
--
-- 022 deleted field_app_config rows whose action_type_code was not one of
-- the eight enum values. That was correct then — such rows could never match
-- a real action. From here they can, so 022 must not be re-run against a
-- database that has custom types. It is a one-shot cleanup and is left in
-- place for fresh installs, where it runs before any custom type exists.
