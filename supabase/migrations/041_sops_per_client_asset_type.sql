-- 041: Several SOPs per service type, each tied to a client and an asset type.
--
-- Until now a service type had exactly one live procedure: the unique index
-- below allowed one active template per (organization, action_type_code), and
-- every version of every import replaced it. Issue #5 asks for the shape the
-- work actually has: a Maintenance service type holds several SOPs — one for
-- Vodafone's sites, one for a particular asset type, a general fallback — and
-- each SOP is its own record with its own steps and its own versions.
--
-- sop_id is that record's identity. Every version of one SOP shares it;
-- saving an edit or a re-import adds a version under the same sop_id and
-- deactivates the previous one, exactly as versioning worked before, just
-- per SOP rather than per service type.
--
-- client_code and asset_type_code scope the SOP. Both are codes from
-- configurable_field_options ('client' and 'asset_type'), the same lists
-- locations.client and assets.asset_type draw from, and '' means "all" —
-- the convention workflow_steps already uses for client_code. A visit picks
-- the most specific live SOP for its service type: client and asset type both
-- matching, then client only, then asset type only, then the general one.
--
-- Existing templates become one SOP per service type, scoped to all clients
-- and all asset types, so every visit keeps getting the procedure it gets now.

alter table public.procedure_templates
  add column if not exists sop_id uuid,
  add column if not exists client_code text not null default '',
  add column if not exists asset_type_code text not null default '';

-- Every existing version of a service type's procedure belongs to one SOP.
with families as (
  select organization_id, action_type_code, gen_random_uuid() as sop_id
  from public.procedure_templates
  where sop_id is null
  group by organization_id, action_type_code
)
update public.procedure_templates t
set sop_id = f.sop_id
from families f
where t.sop_id is null
  and t.organization_id = f.organization_id
  and t.action_type_code = f.action_type_code;

alter table public.procedure_templates
  alter column sop_id set default gen_random_uuid(),
  alter column sop_id set not null;

-- One live template per service type is no longer the rule.
drop index if exists public.idx_procedure_templates_one_active;

-- One live version per SOP: saving a new version deactivates the old first.
create unique index if not exists idx_procedure_templates_sop_one_active
  on public.procedure_templates (sop_id)
  where is_active;

-- And never two live SOPs for the same service type, client and asset type,
-- or a visit could match both and the choice between them would be arbitrary.
create unique index if not exists idx_procedure_templates_scope_one_active
  on public.procedure_templates (organization_id, action_type_code, client_code, asset_type_code)
  where is_active;

-- Version history of one SOP, newest first.
create index if not exists idx_procedure_templates_sop_version
  on public.procedure_templates (sop_id, version desc);

comment on column public.procedure_templates.sop_id is
  'The SOP this row is a version of. All versions of one SOP share it.';
comment on column public.procedure_templates.client_code is
  'Client this SOP applies to (configurable_field_options client code); empty for all clients.';
comment on column public.procedure_templates.asset_type_code is
  'Asset type this SOP applies to (asset_type code); empty for all asset types.';
