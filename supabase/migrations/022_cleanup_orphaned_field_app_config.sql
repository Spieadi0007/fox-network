-- 022: Remove orphaned field_app_config rows.
--
-- Phase 2 aligned the Field App settings tabs to the real action_type enum
-- values. Configs saved earlier under the old placeholder codes
-- (site_survey, preventive_maintenance, cable_pull, equipment_swap,
-- commissioning, …) can never match a real action, so they're dead rows.
-- Drop anything whose code isn't a valid action_type enum value.

delete from public.field_app_config
where action_type_code not in (
  'survey', 'installation', 'inspection', 'maintenance',
  'repair', 'testing', 'documentation', 'other'
);
