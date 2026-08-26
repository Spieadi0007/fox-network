-- 037: Invoices, as the client sees them.
--
-- A client can already see what work was requested and what was done, but not
-- what it cost them or whether it has been settled. `actions.estimated_cost`
-- is an estimate on a single work order — it is not a bill, it has no due
-- date, and nothing records payment.
--
-- Direction of writes matters here: an invoice is raised by FOX and read by
-- the client. The client must never be able to mark their own invoice paid,
-- so unlike client_documents (035) and client_spare_parts (036) this table is
-- read-only to the organisation it belongs to.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'invoice_status') then
    create type public.invoice_status as enum (
      'draft',    -- raised, not yet sent to the client
      'sent',     -- awaiting payment
      'paid',
      'void'      -- cancelled; kept for the audit trail
    );
  end if;
end $$;

create table if not exists public.invoices (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,

  -- What the client quotes back at us. Unique within the organisation.
  reference        text not null,

  status           public.invoice_status not null default 'draft',

  -- Stored in minor units to keep money off floating point.
  amount_cents     bigint not null,
  currency         text not null default 'EUR',

  issued_on        date not null default current_date,
  due_on           date,
  paid_on          date,

  -- The work this bills for, when it is a single job. Nulled rather than
  -- cascaded: deleting a work order must not delete the invoice for it.
  action_id        uuid references public.actions(id) on delete set null,

  -- Optional PDF, in the `invoices` bucket under `{organization_id}/`.
  pdf_path         text,

  notes            text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint invoices_reference_not_blank
    check (length(btrim(reference)) > 0),
  constraint invoices_amount_non_negative
    check (amount_cents >= 0),
  -- A paid invoice has a payment date and nothing else does. This is what
  -- stops "paid" and "outstanding" disagreeing on the same row.
  constraint invoices_paid_has_date
    check (
      (status = 'paid' and paid_on is not null)
      or (status <> 'paid' and paid_on is null)
    ),
  constraint invoices_due_after_issue
    check (due_on is null or due_on >= issued_on)
);

alter table public.invoices enable row level security;

create unique index if not exists idx_invoices_org_reference
  on public.invoices (organization_id, lower(reference));

-- The list the client sees: their invoices, newest first.
create index if not exists idx_invoices_org_issued
  on public.invoices (organization_id, issued_on desc);

-- ── RLS ──────────────────────────────────────────────────────────────
-- Read-only to the client. Drafts are excluded: an invoice nobody has sent
-- yet is not something to show the person who would have to pay it.

drop policy if exists "Members can read own invoices" on public.invoices;
create policy "Members can read own invoices"
  on public.invoices for select
  using (
    (organization_id = public.get_my_org_id() and status <> 'draft')
    or public.is_fox_staff()
  );

-- Writes are FOX staff only. No client-side insert/update/delete policy
-- exists, so RLS denies those outright.

drop policy if exists "Fox staff can write invoices" on public.invoices;
create policy "Fox staff can write invoices"
  on public.invoices for all
  using (public.is_fox_staff())
  with check (public.is_fox_staff());

drop trigger if exists on_invoices_updated on public.invoices;
create trigger on_invoices_updated
  before update on public.invoices
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Invoice PDFs
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invoices', 'invoices', false, 16777216, array['application/pdf'])
on conflict (id) do nothing;

-- Read-only to the client here too, matching the table.
drop policy if exists "Members can read own invoice pdfs" on storage.objects;
create policy "Members can read own invoice pdfs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'invoices'
  and (
    (storage.foldername(name))[1] = public.get_my_org_id()::text
    or public.is_fox_staff()
  )
);

drop policy if exists "Fox staff can write invoice pdfs" on storage.objects;
create policy "Fox staff can write invoice pdfs"
on storage.objects for all
to authenticated
using (bucket_id = 'invoices' and public.is_fox_staff())
with check (bucket_id = 'invoices' and public.is_fox_staff());
