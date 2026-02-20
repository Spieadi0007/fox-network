-- ============================================================
-- Migration 010: Saved views enhancements
--   - preferred view flag
--   - search text persistence
--   - shared/team views with org scope
-- ============================================================

-- Add preferred flag (one per user+module, enforced in app code)
alter table public.user_saved_views
  add column is_preferred boolean not null default false;

-- Add search text persistence
alter table public.user_saved_views
  add column search_text text not null default '';

-- Add shared view support
alter table public.user_saved_views
  add column is_shared boolean not null default false,
  add column organization_id uuid references public.organizations(id) on delete cascade;

-- Drop the old unique constraint and re-add (same logic, just documenting)
alter table public.user_saved_views
  drop constraint user_saved_views_user_id_module_name_key;

alter table public.user_saved_views
  add constraint user_saved_views_unique_name unique(user_id, module, name);

-- Update RLS: allow reading shared views from own org
drop policy "Users can read own saved views" on public.user_saved_views;
create policy "Users can read own or shared views"
  on public.user_saved_views for select
  using (
    user_id = auth.uid()
    or (is_shared = true and organization_id = public.get_my_org_id())
  );

-- Insert/update/delete policies stay user_id = auth.uid() (unchanged)
