-- 020: Introduce 'client' account type.
-- Kept in its own migration because ALTER TYPE ... ADD VALUE cannot share a
-- transaction with any code that uses the new value (Postgres restriction).
alter type public.account_type add value if not exists 'client';
