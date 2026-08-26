-- 036: The spare parts a client keeps, as a named-and-pictured list.
--
-- `parts` (031) already exists, and is not this. That table is the catalogue
-- a technician consumes from: `part_number` is mandatory and unique per org,
-- rows are written by managers, and a step's `suggested_parts` points at
-- them. Putting a client's stock list there would force a part number onto
-- entries that may only ever be "the grey filter housing, this one" with a
-- photograph, and would drop those entries into the technician's picker
-- whether or not we hold them.
--
-- This is the other half of the client library: alongside the procedures they
-- want followed, the parts they keep on site. Name and picture are the point
-- — a photograph settles which component is meant far faster than a
-- description does.

create table if not exists public.client_spare_parts (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,

  name             text not null,

  -- Optional, unlike `parts.part_number`: a client often knows the thing by
  -- sight and not by code.
  part_number      text,

  -- Path within the `client-documents` bucket, under `{org}/spare-parts/`.
  -- Null when no photograph was supplied.
  image_path       text,

  quantity         integer,
  notes            text,

  created_by       uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint client_spare_parts_name_not_blank
    check (length(btrim(name)) > 0),
  constraint client_spare_parts_quantity_sane
    check (quantity is null or quantity >= 0)
);

alter table public.client_spare_parts enable row level security;

-- The only query the page runs: this org's parts, newest first.
create index if not exists idx_client_spare_parts_org
  on public.client_spare_parts (organization_id, created_at desc);

-- ── RLS ──────────────────────────────────────────────────────────────
-- Same shape as `client_documents` (035): the organisation's own record,
-- readable by every member of it and by FOX staff, writable only by the
-- organisation itself.

drop policy if exists "Members can read own spare parts" on public.client_spare_parts;
create policy "Members can read own spare parts"
  on public.client_spare_parts for select
  using (
    organization_id = public.get_my_org_id()
    or public.is_fox_staff()
  );

drop policy if exists "Members can add spare parts" on public.client_spare_parts;
create policy "Members can add spare parts"
  on public.client_spare_parts for insert
  with check (organization_id = public.get_my_org_id());

drop policy if exists "Members can update own spare parts" on public.client_spare_parts;
create policy "Members can update own spare parts"
  on public.client_spare_parts for update
  using (organization_id = public.get_my_org_id());

drop policy if exists "Members can delete own spare parts" on public.client_spare_parts;
create policy "Members can delete own spare parts"
  on public.client_spare_parts for delete
  using (organization_id = public.get_my_org_id());

drop trigger if exists on_client_spare_parts_updated on public.client_spare_parts;
create trigger on_client_spare_parts_updated
  before update on public.client_spare_parts
  for each row execute function public.handle_updated_at();
