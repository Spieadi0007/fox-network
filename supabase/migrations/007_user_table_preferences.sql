-- ============================================================
-- Migration 007: User table preferences (column order/visibility)
-- ============================================================

create table public.user_table_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  module text not null,
  column_config jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, module)
);

alter table public.user_table_preferences enable row level security;

create policy "Users can read own preferences"
  on public.user_table_preferences for select
  using (user_id = auth.uid());

create policy "Users can insert own preferences"
  on public.user_table_preferences for insert
  with check (user_id = auth.uid());

create policy "Users can update own preferences"
  on public.user_table_preferences for update
  using (user_id = auth.uid());

create trigger on_user_table_preferences_updated
  before update on public.user_table_preferences
  for each row execute function public.handle_updated_at();
