-- 024: Link an action directly to a specific asset (the machine being serviced).
--
-- Until now actions only referenced a location; the asset shown to technicians
-- was inferred as "an asset at that location". Add a direct asset_id so each
-- intervention points at exactly one machine.

alter table public.actions
  add column if not exists asset_id uuid references public.assets(id) on delete set null;

create index if not exists idx_actions_asset
  on public.actions(asset_id) where asset_id is not null;
