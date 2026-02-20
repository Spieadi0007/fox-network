-- ============================================================
-- Migration 009: User saved views (column + sort + filter state)
-- ============================================================

create table public.user_saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module text not null check (module in ('locations','projects','actions','assets')),
  name text not null,
  column_config jsonb not null default '[]',
  sort_config jsonb default null,
  filter_config jsonb default null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, module, name)
);

alter table public.user_saved_views enable row level security;

create policy "Users can read own saved views"
  on public.user_saved_views for select
  using (user_id = auth.uid());

create policy "Users can insert own saved views"
  on public.user_saved_views for insert
  with check (user_id = auth.uid());

create policy "Users can update own saved views"
  on public.user_saved_views for update
  using (user_id = auth.uid());

create policy "Users can delete own saved views"
  on public.user_saved_views for delete
  using (user_id = auth.uid());

create trigger on_user_saved_views_updated
  before update on public.user_saved_views
  for each row execute function public.handle_updated_at();
