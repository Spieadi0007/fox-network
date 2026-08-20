-- 029: SOP document storage + import audit trail.
--
-- Managers upload a client's SOP (a PDF) and we derive the Field App
-- configuration for one service type from it. Two things are needed:
--
--   1. Somewhere private to keep the PDF. These are customer operating
--      procedures, so unlike `org-logos` this bucket is NOT public.
--   2. A record of what was proposed from that PDF and what was actually
--      accepted, so "why is Phone switched off for Survey?" has an answer
--      six months later.

-- ============================================================
-- Storage bucket
-- ============================================================

-- Private. The size limit mirrors the Anthropic API's 32 MB request ceiling
-- and the mime restriction keeps non-PDFs out at the storage layer rather
-- than relying on a client-side check.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sop-documents',
  'sop-documents',
  false,
  33554432,
  array['application/pdf']
)
on conflict (id) do nothing;

-- Objects live under `{organization_id}/...`, same folder convention as
-- `org-logos`. Only managers and admins touch SOPs — they are the only roles
-- that can reach the Field App settings page in the first place.

drop policy if exists "Managers can upload SOP documents" on storage.objects;
create policy "Managers can upload SOP documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'sop-documents'
  and (storage.foldername(name))[1] = public.get_my_org_id()::text
  and public.is_manager_or_admin()
);

drop policy if exists "Managers can read SOP documents" on storage.objects;
create policy "Managers can read SOP documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'sop-documents'
  and (storage.foldername(name))[1] = public.get_my_org_id()::text
  and public.is_manager_or_admin()
);

drop policy if exists "Managers can update SOP documents" on storage.objects;
create policy "Managers can update SOP documents"
on storage.objects for update
to authenticated
using (
  bucket_id = 'sop-documents'
  and (storage.foldername(name))[1] = public.get_my_org_id()::text
  and public.is_manager_or_admin()
);

drop policy if exists "Managers can delete SOP documents" on storage.objects;
create policy "Managers can delete SOP documents"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'sop-documents'
  and (storage.foldername(name))[1] = public.get_my_org_id()::text
  and public.is_manager_or_admin()
);

-- ============================================================
-- Import audit trail
-- ============================================================

create table if not exists public.sop_imports (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,

  -- Which service type this import configured. Plain text, matching
  -- `field_app_config.action_type_code` — action types are org-configurable
  -- via `configurable_field_options`, so this is deliberately not constrained
  -- to the `action_type` enum.
  action_type_code text not null,

  -- Path within the `sop-documents` bucket, and the original upload name so
  -- the UI can show something human-readable.
  storage_path     text not null,
  file_name        text not null,

  -- What the model proposed: per-field and per-module verdicts, each with the
  -- SOP text that justified it. Shape is owned by the extraction route.
  extracted        jsonb not null default '{}',

  -- What the manager actually accepted. Null until applied. This is the half
  -- that makes the trail trustworthy — the reviewer can reject individual
  -- rows, so `extracted` alone does not tell you what landed in the config.
  applied          jsonb,
  applied_at       timestamptz,

  created_by       uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- `applied` and `applied_at` are set together or not at all.
  constraint sop_imports_applied_together check (
    (applied is null and applied_at is null)
    or (applied is not null and applied_at is not null)
  )
);

alter table public.sop_imports enable row level security;

-- Lookups are always "the imports for this org", most recent first, usually
-- narrowed to one service type.
create index if not exists idx_sop_imports_org_type
  on public.sop_imports (organization_id, action_type_code, created_at desc);

-- ── RLS ──────────────────────────────────────────────────────────────
-- Mirrors `field_app_config` (018), except reads are manager-only: an import
-- record quotes SOP contents, which ordinary org members have no reason to
-- see. Technicians read the resulting config, never the import.

drop policy if exists "Managers can read sop imports" on public.sop_imports;
create policy "Managers can read sop imports"
  on public.sop_imports for select
  using (
    organization_id = public.get_my_org_id()
    and public.is_manager_or_admin()
  );

drop policy if exists "Managers can insert sop imports" on public.sop_imports;
create policy "Managers can insert sop imports"
  on public.sop_imports for insert
  with check (
    organization_id = public.get_my_org_id()
    and public.is_manager_or_admin()
  );

drop policy if exists "Managers can update sop imports" on public.sop_imports;
create policy "Managers can update sop imports"
  on public.sop_imports for update
  using (
    organization_id = public.get_my_org_id()
    and public.is_manager_or_admin()
  );

drop policy if exists "Managers can delete sop imports" on public.sop_imports;
create policy "Managers can delete sop imports"
  on public.sop_imports for delete
  using (
    organization_id = public.get_my_org_id()
    and public.is_manager_or_admin()
  );

drop trigger if exists on_sop_imports_updated on public.sop_imports;
create trigger on_sop_imports_updated
  before update on public.sop_imports
  for each row execute function public.handle_updated_at();
