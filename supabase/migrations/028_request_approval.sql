-- 028: Approval workflow for client requests.
-- Each client request (an action in the client's org) gets an approval_status
-- that Fox staff flip to approved/rejected. Staff also need to update actions
-- across orgs, so add a fox_staff update bypass.

alter table public.actions
  add column if not exists approval_status text not null default 'pending';

drop policy if exists "Fox staff can update all actions" on public.actions;
create policy "Fox staff can update all actions"
  on public.actions for update
  using (public.is_fox_staff());
