-- ============================================================
-- FOX Network — Seed Data
-- Run this in the Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  org_id uuid := '4da29954-35bb-4cab-a64a-ec02a2e5896b';
  usr_id uuid := '2431fd08-4dd5-4739-bf1f-c4a7be992207';

  -- Location IDs
  loc_london uuid := gen_random_uuid();
  loc_frankfurt uuid := gen_random_uuid();
  loc_mumbai uuid := gen_random_uuid();
  loc_nyc uuid := gen_random_uuid();
  loc_paris uuid := gen_random_uuid();
  loc_dallas uuid := gen_random_uuid();
  loc_singapore uuid := gen_random_uuid();
  loc_dublin uuid := gen_random_uuid();

  -- Project IDs
  prj_london_deploy uuid := gen_random_uuid();
  prj_frankfurt_maint uuid := gen_random_uuid();
  prj_mumbai_survey uuid := gen_random_uuid();
  prj_nyc_upgrade uuid := gen_random_uuid();
  prj_paris_deploy uuid := gen_random_uuid();
  prj_dallas_inspect uuid := gen_random_uuid();
  prj_singapore_deploy uuid := gen_random_uuid();
  prj_dublin_remediation uuid := gen_random_uuid();
  prj_london_maint uuid := gen_random_uuid();
  prj_mumbai_deploy uuid := gen_random_uuid();

BEGIN

-- ============================================================
-- 1. Field Options (Clients, Countries, etc.)
-- ============================================================

INSERT INTO public.configurable_field_options (organization_id, field_key, label, code, sort_order) VALUES
  -- Clients
  (org_id, 'client', 'Vodafone', 'vodafone', 1),
  (org_id, 'client', 'T-Mobile', 'tmobile', 2),
  (org_id, 'client', 'AT&T', 'att', 3),
  (org_id, 'client', 'Orange', 'orange', 4),
  (org_id, 'client', 'Airtel', 'airtel', 5),
  -- Countries
  (org_id, 'country', 'United States', 'US', 1),
  (org_id, 'country', 'United Kingdom', 'UK', 2),
  (org_id, 'country', 'Germany', 'DE', 3),
  (org_id, 'country', 'France', 'FR', 4),
  (org_id, 'country', 'India', 'IN', 5),
  (org_id, 'country', 'Singapore', 'SG', 6),
  (org_id, 'country', 'Ireland', 'IE', 7),
  -- Criticality
  (org_id, 'criticality', 'Low', 'low', 1),
  (org_id, 'criticality', 'Medium', 'medium', 2),
  (org_id, 'criticality', 'High', 'high', 3),
  (org_id, 'criticality', 'Critical', 'critical', 4)
ON CONFLICT (organization_id, field_key, code) DO NOTHING;

-- ============================================================
-- 2. Locations
-- ============================================================

INSERT INTO public.locations (id, name, code, address, city, state, zip_code, country, timezone, client, location_type, status, criticality, latitude, longitude, contact_name, contact_phone, contact_email, region, notes, organization_id, created_by) VALUES
  (loc_london, 'London Docklands DC', 'LON-DC-01', '10 Upper Bank St', 'London', 'Greater London', 'E14 5NP', 'UK', 'Europe/London', 'vodafone', 'data_center', 'active', 'critical', 51.5054, -0.0235, 'James Crawford', '+44 20 7946 0958', 'j.crawford@vodafone.co.uk', 'EMEA', 'Tier 3+ facility, 24/7 staffed', org_id, usr_id),
  (loc_frankfurt, 'Frankfurt Interxion Hub', 'FRA-DC-01', 'Hanauer Landstr. 298', 'Frankfurt', 'Hessen', '60314', 'DE', 'Europe/Berlin', 'tmobile', 'data_center', 'active', 'critical', 50.1109, 8.7147, 'Klaus Weber', '+49 69 1234 5678', 'k.weber@tmobile.de', 'EMEA', 'Main European interconnect point', org_id, usr_id),
  (loc_mumbai, 'Mumbai Tower Cluster Alpha', 'MUM-TW-01', 'Bandra Kurla Complex', 'Mumbai', 'Maharashtra', '400051', 'IN', 'Asia/Kolkata', 'airtel', 'tower_site', 'active', 'high', 19.0596, 72.8656, 'Priya Sharma', '+91 22 6789 0123', 'p.sharma@airtel.in', 'APAC', '12 tower cluster serving financial district', org_id, usr_id),
  (loc_nyc, 'NYC Hudson Yards POP', 'NYC-POP-01', '30 Hudson Yards', 'New York', 'NY', '10001', 'US', 'America/New_York', 'att', 'commercial', 'active', 'critical', 40.7536, -74.0003, 'Mike Reynolds', '+1 212 555 0142', 'm.reynolds@att.com', 'Americas', 'Primary East Coast point of presence', org_id, usr_id),
  (loc_paris, 'Paris La Défense NOC', 'PAR-NOC-01', '1 Place de la Défense', 'Paris', 'Île-de-France', '92800', 'FR', 'Europe/Paris', 'orange', 'commercial', 'active', 'high', 48.8920, 2.2363, 'Marie Dupont', '+33 1 4567 8901', 'm.dupont@orange.fr', 'EMEA', 'Network operations center, 50+ staff', org_id, usr_id),
  (loc_dallas, 'Dallas Equinix DA1', 'DAL-DC-01', '1950 N Stemmons Fwy', 'Dallas', 'TX', '75207', 'US', 'America/Chicago', 'att', 'data_center', 'active', 'high', 32.8004, -96.8194, 'Sarah Chen', '+1 214 555 0198', 's.chen@att.com', 'Americas', 'Southern hub, interconnected to DA2 and DA3', org_id, usr_id),
  (loc_singapore, 'Singapore Tuas Tower Farm', 'SG-TW-01', '20 Tuas South Ave 14', 'Singapore', 'West Region', '637312', 'SG', 'Asia/Singapore', 'vodafone', 'tower_site', 'planned', 'medium', 1.3153, 103.6365, 'David Tan', '+65 6789 0123', 'd.tan@vodafone.sg', 'APAC', 'New 5G tower farm — construction Q2 2026', org_id, usr_id),
  (loc_dublin, 'Dublin Parkwest Campus', 'DUB-DC-01', 'Parkwest Business Park', 'Dublin', 'Dublin', 'D12 X2F8', 'IE', 'Europe/Dublin', 'vodafone', 'data_center', 'active', 'medium', 53.3331, -6.3752, 'Sean O''Brien', '+353 1 234 5678', 's.obrien@vodafone.ie', 'EMEA', 'Edge compute facility', org_id, usr_id);

-- ============================================================
-- 3. Projects
-- ============================================================

INSERT INTO public.projects (id, name, code, description, location_id, project_type, status, priority, start_date, end_date, budget, completion_percentage, organization_id, created_by, owner_id) VALUES
  (prj_london_deploy, '5G Core Deployment — London DC', 'PRJ-LON-001', 'Deploy 5G standalone core infrastructure at London Docklands', loc_london, 'deployment', 'active', 'critical', '2026-01-15', '2026-06-30', 2500000.00, 35, org_id, usr_id, usr_id),
  (prj_frankfurt_maint, 'Frankfurt Cooling System Overhaul', 'PRJ-FRA-001', 'Upgrade HVAC and liquid cooling across all server halls', loc_frankfurt, 'maintenance', 'active', 'high', '2026-02-01', '2026-04-30', 850000.00, 60, org_id, usr_id, usr_id),
  (prj_mumbai_survey, 'Mumbai Tower Structural Survey', 'PRJ-MUM-001', 'Annual structural integrity assessment of all 12 towers', loc_mumbai, 'survey', 'active', 'medium', '2026-02-10', '2026-03-15', 120000.00, 40, org_id, usr_id, usr_id),
  (prj_nyc_upgrade, 'NYC POP 400G Upgrade', 'PRJ-NYC-001', 'Upgrade backbone links from 100G to 400G across Hudson Yards POP', loc_nyc, 'upgrade', 'planned', 'critical', '2026-03-01', '2026-08-31', 4200000.00, 0, org_id, usr_id, usr_id),
  (prj_paris_deploy, 'Paris Edge Compute Rollout', 'PRJ-PAR-001', 'Deploy edge computing nodes at La Défense NOC', loc_paris, 'deployment', 'active', 'high', '2026-01-20', '2026-05-15', 1800000.00, 50, org_id, usr_id, usr_id),
  (prj_dallas_inspect, 'Dallas DC Annual Inspection', 'PRJ-DAL-001', 'Annual compliance and safety inspection — Equinix DA1', loc_dallas, 'inspection', 'completed', 'medium', '2026-01-05', '2026-01-20', 45000.00, 100, org_id, usr_id, usr_id),
  (prj_singapore_deploy, 'Singapore 5G Tower Build-Out', 'PRJ-SG-001', 'New 5G macro tower construction at Tuas farm', loc_singapore, 'deployment', 'draft', 'high', '2026-04-01', '2026-12-31', 6500000.00, 0, org_id, usr_id, usr_id),
  (prj_dublin_remediation, 'Dublin Power Redundancy Fix', 'PRJ-DUB-001', 'Remediate single point of failure in UPS chain at Parkwest', loc_dublin, 'remediation', 'active', 'critical', '2026-02-05', '2026-03-20', 320000.00, 70, org_id, usr_id, usr_id),
  (prj_london_maint, 'London DC Fire Suppression Upgrade', 'PRJ-LON-002', 'Replace halon system with Novec 1230 clean agent', loc_london, 'maintenance', 'planned', 'high', '2026-04-01', '2026-06-15', 680000.00, 0, org_id, usr_id, usr_id),
  (prj_mumbai_deploy, 'Mumbai 4G Densification', 'PRJ-MUM-002', 'Add small cells to improve coverage in BKC area', loc_mumbai, 'deployment', 'active', 'medium', '2026-01-25', '2026-05-30', 950000.00, 25, org_id, usr_id, usr_id);

-- ============================================================
-- 4. Actions
-- ============================================================

INSERT INTO public.actions (name, description, project_id, action_type, status, priority, scheduled_start, scheduled_end, estimated_duration_min, notes, organization_id, created_by) VALUES
  -- London 5G Deploy
  ('Site survey — server hall A', 'Survey rack space, power, and cooling capacity', prj_london_deploy, 'survey', 'completed', 'critical', '2026-01-15', '2026-01-20', 480, 'Completed ahead of schedule', org_id, usr_id),
  ('Install 5G core racks', 'Physical installation of 8x 42U racks', prj_london_deploy, 'installation', 'in_progress', 'critical', '2026-02-01', '2026-02-28', 2400, 'Racks 1-5 done, 6-8 in progress', org_id, usr_id),
  ('Power cabling — phase 1', 'Run dedicated 3-phase power to new racks', prj_london_deploy, 'installation', 'in_progress', 'high', '2026-02-10', '2026-03-10', 1200, NULL, org_id, usr_id),
  ('Integration testing', 'End-to-end testing of 5G SA core', prj_london_deploy, 'testing', 'pending', 'critical', '2026-04-01', '2026-04-30', 4800, NULL, org_id, usr_id),

  -- Frankfurt Cooling
  ('Inspect existing HVAC units', 'Document all units, age, capacity, and condition', prj_frankfurt_maint, 'inspection', 'completed', 'high', '2026-02-01', '2026-02-05', 960, 'Found 3 units past end-of-life', org_id, usr_id),
  ('Remove legacy cooling units', 'Decommission and remove 3 legacy CRAC units from Hall B', prj_frankfurt_maint, 'maintenance', 'completed', 'high', '2026-02-10', '2026-02-20', 1440, NULL, org_id, usr_id),
  ('Install liquid cooling loops', 'New rear-door heat exchangers on 20 racks', prj_frankfurt_maint, 'installation', 'in_progress', 'high', '2026-02-25', '2026-03-31', 3600, '12 of 20 complete', org_id, usr_id),

  -- Mumbai Survey
  ('Tower 1-4 structural assessment', 'Visual + ultrasonic thickness testing', prj_mumbai_survey, 'survey', 'completed', 'medium', '2026-02-10', '2026-02-15', 1920, 'All passed', org_id, usr_id),
  ('Tower 5-8 structural assessment', 'Visual + ultrasonic thickness testing', prj_mumbai_survey, 'survey', 'in_progress', 'medium', '2026-02-17', '2026-02-22', 1920, NULL, org_id, usr_id),
  ('Tower 9-12 structural assessment', 'Visual + ultrasonic thickness testing', prj_mumbai_survey, 'survey', 'pending', 'medium', '2026-02-24', '2026-03-01', 1920, NULL, org_id, usr_id),
  ('Final survey report', 'Compile findings and recommendations', prj_mumbai_survey, 'documentation', 'pending', 'medium', '2026-03-05', '2026-03-15', 480, NULL, org_id, usr_id),

  -- NYC 400G Upgrade
  ('Fiber route survey', 'Survey existing dark fiber paths for 400G readiness', prj_nyc_upgrade, 'survey', 'pending', 'critical', '2026-03-01', '2026-03-15', 960, NULL, org_id, usr_id),
  ('Procure 400G transceivers', 'Order and receive QSFP-DD 400G-ZR modules', prj_nyc_upgrade, 'other', 'pending', 'critical', '2026-03-01', '2026-04-15', 120, 'Lead time ~6 weeks', org_id, usr_id),

  -- Paris Edge
  ('Deploy edge node — rack 1', 'Install and configure first edge compute node', prj_paris_deploy, 'installation', 'completed', 'high', '2026-01-20', '2026-02-05', 960, NULL, org_id, usr_id),
  ('Deploy edge node — rack 2', 'Install and configure second edge compute node', prj_paris_deploy, 'installation', 'completed', 'high', '2026-02-06', '2026-02-20', 960, NULL, org_id, usr_id),
  ('Edge network testing', 'Latency and throughput validation', prj_paris_deploy, 'testing', 'in_progress', 'high', '2026-02-21', '2026-03-10', 1440, 'Latency meeting <5ms SLA', org_id, usr_id),

  -- Dallas Inspection
  ('Electrical systems inspection', 'Annual NFPA 70E compliance check', prj_dallas_inspect, 'inspection', 'completed', 'medium', '2026-01-05', '2026-01-10', 480, 'Passed — minor findings documented', org_id, usr_id),
  ('Fire suppression inspection', 'Check all FM-200 systems and detection', prj_dallas_inspect, 'inspection', 'completed', 'medium', '2026-01-10', '2026-01-15', 480, 'All systems operational', org_id, usr_id),
  ('Inspection report & certification', 'Final compliance documentation', prj_dallas_inspect, 'documentation', 'completed', 'medium', '2026-01-15', '2026-01-20', 240, NULL, org_id, usr_id),

  -- Dublin Remediation
  ('UPS failure mode analysis', 'Map current single points of failure', prj_dublin_remediation, 'survey', 'completed', 'critical', '2026-02-05', '2026-02-08', 480, 'Found 2 critical SPOFs', org_id, usr_id),
  ('Install redundant UPS bypass', 'Add parallel UPS path with automatic transfer', prj_dublin_remediation, 'installation', 'in_progress', 'critical', '2026-02-15', '2026-03-10', 2400, 'Switch gear delivered, installation underway', org_id, usr_id),
  ('Load bank testing', 'Full load test of redundant UPS chain', prj_dublin_remediation, 'testing', 'pending', 'critical', '2026-03-12', '2026-03-18', 960, NULL, org_id, usr_id),

  -- Mumbai Densification
  ('Small cell site survey — zone A', 'Identify mounting locations for 15 small cells', prj_mumbai_deploy, 'survey', 'completed', 'medium', '2026-01-25', '2026-02-05', 960, '15 sites identified and approved', org_id, usr_id),
  ('Small cell installation — batch 1', 'Install first 8 small cells', prj_mumbai_deploy, 'installation', 'in_progress', 'medium', '2026-02-10', '2026-03-15', 2400, '5 of 8 installed', org_id, usr_id);

-- ============================================================
-- 5. Assets
-- ============================================================

INSERT INTO public.assets (name, asset_type, serial_number, asset_tag, status, condition, location_id, manufacturer, model, description, install_date, warranty_end, purchase_cost, criticality, organization_id, created_by) VALUES
  ('5G Core Server — Node 1', 'server', 'SRV-5GC-001', 'AST-LON-001', 'deployed', 'excellent', loc_london, 'Nokia', 'AirFrame Cloud Server', '5G SA core processing node', '2026-02-01', '2029-02-01', 185000.00, 'critical', org_id, usr_id),
  ('5G Core Server — Node 2', 'server', 'SRV-5GC-002', 'AST-LON-002', 'deployed', 'excellent', loc_london, 'Nokia', 'AirFrame Cloud Server', '5G SA core processing node', '2026-02-01', '2029-02-01', 185000.00, 'critical', org_id, usr_id),
  ('Core Router — London', 'router', 'RTR-LON-001', 'AST-LON-003', 'deployed', 'good', loc_london, 'Juniper', 'MX10008', 'Core backbone router', '2025-06-15', '2028-06-15', 320000.00, 'critical', org_id, usr_id),
  ('Liquid Cooling Unit — Hall B', 'other', 'COOL-FRA-001', 'AST-FRA-001', 'deployed', 'excellent', loc_frankfurt, 'CoolIT', 'DLC R4000', 'Rear-door liquid cooling heat exchanger', '2026-02-25', '2031-02-25', 28000.00, 'high', org_id, usr_id),
  ('UPS System — Primary', 'power_supply', 'UPS-DUB-001', 'AST-DUB-001', 'deployed', 'fair', loc_dublin, 'Eaton', '93PM 200kVA', 'Primary UPS — being supplemented with redundant path', '2022-03-10', '2027-03-10', 95000.00, 'critical', org_id, usr_id),
  ('UPS System — Redundant', 'power_supply', 'UPS-DUB-002', 'AST-DUB-002', 'available', 'excellent', loc_dublin, 'Eaton', '93PM 200kVA', 'Redundant UPS — pending installation', NULL, '2031-02-15', 105000.00, 'critical', org_id, usr_id),
  ('Backup Generator', 'generator', 'GEN-DAL-001', 'AST-DAL-001', 'deployed', 'good', loc_dallas, 'Caterpillar', 'C32 1000kW', 'Diesel backup generator', '2023-08-20', '2028-08-20', 450000.00, 'critical', org_id, usr_id),
  ('Fiber Patch Panel — MDF', 'cable', 'FIB-NYC-001', 'AST-NYC-001', 'deployed', 'good', loc_nyc, 'Corning', 'EDGE8 HD', '144-port fiber patch panel', '2024-11-01', '2034-11-01', 8500.00, 'high', org_id, usr_id),
  ('400G Transceiver Module', 'other', 'QSFP-NYC-001', 'AST-NYC-002', 'available', 'excellent', NULL, 'Cisco', 'QDD-400G-ZR-S', 'QSFP-DD 400G-ZR coherent module — awaiting deployment', NULL, '2031-01-01', 12000.00, 'high', org_id, usr_id),
  ('Edge Compute Node — Rack 1', 'server', 'EDG-PAR-001', 'AST-PAR-001', 'deployed', 'excellent', loc_paris, 'Dell', 'PowerEdge XR4000', 'Multi-access edge computing server', '2026-01-25', '2029-01-25', 42000.00, 'high', org_id, usr_id),
  ('Edge Compute Node — Rack 2', 'server', 'EDG-PAR-002', 'AST-PAR-002', 'deployed', 'excellent', loc_paris, 'Dell', 'PowerEdge XR4000', 'Multi-access edge computing server', '2026-02-10', '2029-02-10', 42000.00, 'high', org_id, usr_id),
  ('5G Macro Antenna — Tower 1', 'antenna', 'ANT-MUM-001', 'AST-MUM-001', 'deployed', 'good', loc_mumbai, 'Ericsson', 'AIR 6449 B77', '5G NR massive MIMO antenna', '2024-09-15', '2029-09-15', 18000.00, 'high', org_id, usr_id),
  ('Small Cell Unit — Zone A', 'antenna', 'SC-MUM-001', 'AST-MUM-002', 'deployed', 'excellent', loc_mumbai, 'Samsung', '5G Link SC', '5G NR small cell for densification', '2026-02-12', '2031-02-12', 5500.00, 'medium', org_id, usr_id),
  ('Environmental Sensor Array', 'sensor', 'SENS-FRA-001', 'AST-FRA-002', 'deployed', 'good', loc_frankfurt, 'Vertiv', 'Liebert iCOM', 'Temperature, humidity, and airflow monitoring', '2025-01-10', '2030-01-10', 3200.00, 'medium', org_id, usr_id),
  ('Cable Testing Kit', 'tool', 'TOOL-GEN-001', 'AST-GEN-001', 'available', 'good', NULL, 'Fluke', 'DSX-8000', 'Cat6A/fiber cable certification tester', '2024-06-01', '2027-06-01', 22000.00, 'low', org_id, usr_id);

-- ============================================================
-- 6. Workflow Steps (Action Templates)
-- ============================================================

-- Vodafone + UK + Deployment
INSERT INTO public.workflow_steps (organization_id, client_code, country_code, project_type_code, action_type_code, default_name, step_order, is_required) VALUES
  (org_id, 'vodafone', 'UK', 'deployment', 'survey', 'Site Survey', 0, true),
  (org_id, 'vodafone', 'UK', 'deployment', 'installation', 'Equipment Installation', 1, true),
  (org_id, 'vodafone', 'UK', 'deployment', 'testing', 'Integration Testing', 2, true),
  (org_id, 'vodafone', 'UK', 'deployment', 'documentation', 'Handover Documentation', 3, true);

-- AT&T + US + Deployment
INSERT INTO public.workflow_steps (organization_id, client_code, country_code, project_type_code, action_type_code, default_name, step_order, is_required) VALUES
  (org_id, 'att', 'US', 'deployment', 'survey', 'Pre-deployment Survey', 0, true),
  (org_id, 'att', 'US', 'deployment', 'installation', 'Hardware Installation', 1, true),
  (org_id, 'att', 'US', 'deployment', 'testing', 'Acceptance Testing', 2, true),
  (org_id, 'att', 'US', 'deployment', 'inspection', 'Safety Inspection', 3, true),
  (org_id, 'att', 'US', 'deployment', 'documentation', 'As-built Documentation', 4, true);

-- Airtel + All Countries + Deployment
INSERT INTO public.workflow_steps (organization_id, client_code, country_code, project_type_code, action_type_code, default_name, step_order, is_required) VALUES
  (org_id, 'airtel', '', 'deployment', 'survey', 'Site Assessment', 0, true),
  (org_id, 'airtel', '', 'deployment', 'installation', 'Installation', 1, true),
  (org_id, 'airtel', '', 'deployment', 'testing', 'Network Testing', 2, true);

-- All Clients + All Countries + Maintenance (global fallback)
INSERT INTO public.workflow_steps (organization_id, client_code, country_code, project_type_code, action_type_code, default_name, step_order, is_required) VALUES
  (org_id, '', '', 'maintenance', 'inspection', 'Pre-maintenance Inspection', 0, true),
  (org_id, '', '', 'maintenance', 'maintenance', 'Maintenance Work', 1, true),
  (org_id, '', '', 'maintenance', 'testing', 'Post-maintenance Testing', 2, true),
  (org_id, '', '', 'maintenance', 'documentation', 'Maintenance Report', 3, false);

-- Orange + FR + Inspection
INSERT INTO public.workflow_steps (organization_id, client_code, country_code, project_type_code, action_type_code, default_name, step_order, is_required) VALUES
  (org_id, 'orange', 'FR', 'inspection', 'inspection', 'On-site Inspection', 0, true),
  (org_id, 'orange', 'FR', 'inspection', 'documentation', 'Inspection Report', 1, true);

RAISE NOTICE 'Seed data inserted successfully!';
RAISE NOTICE 'Created: 8 locations, 10 projects, 24 actions, 15 assets, 5 clients, 7 countries, 6 action templates';

END $$;
