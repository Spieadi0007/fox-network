-- 027: Public "Get a quote" submissions from the landing page.
-- No auth account needed — anyone can submit; staff read them.

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company_name text not null,
  network_size text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.quote_requests enable row level security;

drop policy if exists "Anyone can submit a quote request" on public.quote_requests;
create policy "Anyone can submit a quote request"
  on public.quote_requests for insert
  with check (true);

drop policy if exists "Staff can read quote requests" on public.quote_requests;
create policy "Staff can read quote requests"
  on public.quote_requests for select
  using (
    public.is_fox_staff()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
