-- 013: Client field on locations + per-client/country workflow scoping

-- 1A. Add client column to locations
ALTER TABLE public.locations ADD COLUMN client text NOT NULL DEFAULT '';
CREATE INDEX idx_locations_client ON public.locations(organization_id, client);

-- 1B. Expand configurable_field_options CHECK to include 'client'
ALTER TABLE public.configurable_field_options
  DROP CONSTRAINT configurable_field_options_field_key_check;
ALTER TABLE public.configurable_field_options
  ADD CONSTRAINT configurable_field_options_field_key_check
  CHECK (field_key IN ('client', 'country', 'timezone', 'category',
    'location_type', 'location_status', 'criticality',
    'project_type', 'project_status', 'priority',
    'action_type', 'action_status',
    'asset_type', 'asset_status', 'asset_condition'));

-- 1C. Add client_code/country_code to workflow_steps, change unique constraint
ALTER TABLE public.workflow_steps
  ADD COLUMN client_code text NOT NULL DEFAULT '',
  ADD COLUMN country_code text NOT NULL DEFAULT '';

ALTER TABLE public.workflow_steps
  DROP CONSTRAINT workflow_steps_organization_id_project_type_code_action_typ_key;
DROP INDEX IF EXISTS idx_ws_org_project_type;

ALTER TABLE public.workflow_steps
  ADD CONSTRAINT workflow_steps_org_client_country_pt_at_key
  UNIQUE(organization_id, client_code, country_code, project_type_code, action_type_code);
CREATE INDEX idx_ws_org_client_country_pt
  ON public.workflow_steps(organization_id, client_code, country_code, project_type_code);
