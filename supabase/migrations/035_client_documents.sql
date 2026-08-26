-- 035: A document library a client owns.
--
-- `sop-documents` (029) is the provider side of the same idea: a manager
-- uploads a client's SOP so the platform can derive a service type from it,
-- and everything about it is manager-gated. A client signing in to their own
-- portal can reach none of it, and has nowhere to put the procedures they
-- want us working to.
--
-- This is that place. Deliberately just storage plus a catalogue: no
-- extraction, no derived config. The file is the deliverable, and FOX staff
-- can read it.

-- ============================================================
-- Storage bucket
-- ============================================================

-- Private. Same 32 MB ceiling as `sop-documents` so a file can later be fed
-- to the extraction route unchanged, but a wider mime list — clients keep
-- procedures in Word and images as often as in PDF.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-documents',
  'client-documents',
  false,
  33554432,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do nothing;

-- Objects live under `{organization_id}/...`, the same folder convention as
-- `org-logos` and `sop-documents`.

drop policy if exists "Members can upload client documents" on storage.objects;
create policy "Members can upload client documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'client-documents'
  and (storage.foldername(name))[1] = public.get_my_org_id()::text
);

drop policy if exists "Members can read client documents" on storage.objects;
create policy "Members can read client documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'client-documents'
  and (
    (storage.foldername(name))[1] = public.get_my_org_id()::text
    or public.is_fox_staff()
  )
);

drop policy if exists "Members can update client documents" on storage.objects;
create policy "Members can update client documents"
on storage.objects for update
to authenticated
using (
  bucket_id = 'client-documents'
  and (storage.foldername(name))[1] = public.get_my_org_id()::text
);

drop policy if exists "Members can delete client documents" on storage.objects;
create policy "Members can delete client documents"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'client-documents'
  and (storage.foldername(name))[1] = public.get_my_org_id()::text
);

-- ============================================================
-- Catalogue
-- ============================================================

-- Storage alone cannot answer "who uploaded this, and what did they call it":
-- object names have to be unique and sanitised, so the name the person typed
-- is not the name on disk.
create table if not exists public.client_documents (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,

  -- Path within the `client-documents` bucket.
  storage_path     text not null unique,

  -- The name as uploaded, shown in the UI.
  file_name        text not null,
  mime_type        text,
  size_bytes       bigint,

  -- Optional note from the uploader: "supersedes v2", "applies to Zone 4".
  description      text,

  uploaded_by      uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint client_documents_file_name_not_blank
    check (length(btrim(file_name)) > 0),
  constraint client_documents_size_sane
    check (size_bytes is null or size_bytes >= 0)
);

alter table public.client_documents enable row level security;

-- The only query the library runs: this org's documents, newest first.
create index if not exists idx_client_documents_org
  on public.client_documents (organization_id, created_at desc);

-- ── RLS ──────────────────────────────────────────────────────────────
-- Unlike `sop_imports`, reads are not manager-gated: these are the
-- organisation's own documents and every member of it may see them. FOX staff
-- can read them too — the whole point is that we work to them.

drop policy if exists "Members can read own documents" on public.client_documents;
create policy "Members can read own documents"
  on public.client_documents for select
  using (
    organization_id = public.get_my_org_id()
    or public.is_fox_staff()
  );

drop policy if exists "Members can add documents" on public.client_documents;
create policy "Members can add documents"
  on public.client_documents for insert
  with check (organization_id = public.get_my_org_id());

drop policy if exists "Members can update own documents" on public.client_documents;
create policy "Members can update own documents"
  on public.client_documents for update
  using (organization_id = public.get_my_org_id());

drop policy if exists "Members can delete own documents" on public.client_documents;
create policy "Members can delete own documents"
  on public.client_documents for delete
  using (organization_id = public.get_my_org_id());

drop trigger if exists on_client_documents_updated on public.client_documents;
create trigger on_client_documents_updated
  before update on public.client_documents
  for each row execute function public.handle_updated_at();
