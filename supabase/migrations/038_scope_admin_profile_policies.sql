-- 038: Scope the admin profile policies to the admin's own organisation.
--
-- Migration 001 predates organisations. It gave admins:
--
--   "Admins can read all profiles"   using (public.is_admin())
--   "Admins can update all profiles" using (public.is_admin())
--
-- Neither mentions organization_id, and is_admin() only asks whether the
-- caller's role is 'admin' — not which organisation they administer. Once 002
-- introduced organisations, every signup began minting an admin (the founder
-- of each new org), so these two policies grant every one of them read and
-- write access to every profile in the database.
--
-- Demonstrated against a throwaway database with all 37 migrations applied:
-- an admin of an unrelated organisation could read another company's people,
-- change their role, and set their organization_id to their own — moving that
-- user, and their access, into the attacker's organisation.
--
-- Nothing legitimate depends on the unscoped form. Same-organisation reads are
-- already covered by 015's "Org members can read org profiles"; FoxNetwork's
-- own cross-organisation access is covered by 021's fox_staff policies; and
-- every profile-writing path that needs to reach across organisations
-- (handle_new_user, claim_pending_invitation, setup_company) is security
-- definer and bypasses RLS entirely.

-- ── Reads ────────────────────────────────────────────────────────────
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can read org profiles" on public.profiles;

create policy "Admins can read org profiles"
  on public.profiles for select
  using (
    public.is_admin()
    and organization_id is not null
    and organization_id = public.get_my_org_id()
  );

-- ── Writes ───────────────────────────────────────────────────────────
-- with check as well as using: without it an admin could still move a row
-- out of their organisation, since `using` only governs which rows they may
-- reach, not what those rows may become.
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Admins can update org profiles" on public.profiles;

create policy "Admins can update org profiles"
  on public.profiles for update
  using (
    public.is_admin()
    and organization_id is not null
    and organization_id = public.get_my_org_id()
  )
  with check (
    public.is_admin()
    and organization_id = public.get_my_org_id()
  );
