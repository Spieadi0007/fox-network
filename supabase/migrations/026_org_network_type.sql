-- 026: Companies (network operators) pick their network type once, at company
-- creation. Stored on the organization; client requests inherit it instead of
-- asking on every request.

alter table public.organizations
  add column if not exists network_type text;
