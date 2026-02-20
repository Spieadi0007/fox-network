-- Add code column to actions table (matching locations/projects pattern)
alter table public.actions add column if not exists code text;

create unique index if not exists actions_code_org_unique
  on public.actions (organization_id, code)
  where code is not null;
