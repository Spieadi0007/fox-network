-- 040: Make submitting a client request idempotent.
--
-- submitClientRequest creates four rows — a location, a project, an asset and
-- the action itself — with nothing tying them to the click that asked for
-- them. The submit button disables itself while the form is in flight, but
-- only once React has hydrated; before that the form is plain HTML, and on a
-- slow render a double-click posts twice. Each post then creates its own set
-- of four rows, so the client sees two identical maintenance requests and we
-- have two of everything underneath them.
--
-- This table is the claim. The form carries a key generated when it was
-- rendered, and the insert below is the first statement the action runs:
-- whichever post arrives first takes the key, and the second gets a primary
-- key violation and is sent to the request the first one created. Because the
-- claim happens before any of the four inserts, a losing duplicate leaves
-- nothing behind.

create table if not exists public.request_submissions (
  key             uuid primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by      uuid not null references public.profiles(id) on delete cascade,
  action_id       uuid references public.actions(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_request_submissions_org
  on public.request_submissions (organization_id, created_at desc);

alter table public.request_submissions enable row level security;

drop policy if exists "Members claim their own submissions" on public.request_submissions;
create policy "Members claim their own submissions"
  on public.request_submissions for insert
  to authenticated
  with check (
    organization_id = public.get_my_org_id()
    and created_by = auth.uid()
  );

drop policy if exists "Members read their own submissions" on public.request_submissions;
create policy "Members read their own submissions"
  on public.request_submissions for select
  to authenticated
  using (organization_id = public.get_my_org_id());

-- The action id is attached once the request has been created.
drop policy if exists "Members complete their own submissions" on public.request_submissions;
create policy "Members complete their own submissions"
  on public.request_submissions for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

comment on table public.request_submissions is
  'One row per submitted client request form, keyed by a token the form carries. Stops a double-click creating the request twice.';
