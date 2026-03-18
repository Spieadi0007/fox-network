-- Allow any admin in the organization to update it (not just the creator)
drop policy "Creator can update own organization" on public.organizations;

create policy "Admins can update own organization"
  on public.organizations for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.organization_id = organizations.id
        and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.organization_id = organizations.id
        and profiles.role = 'admin'
    )
  );
