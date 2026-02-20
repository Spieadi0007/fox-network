-- Create storage bucket for organization logos
insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true);

-- Allow authenticated users to upload to their org's folder
create policy "Org members can upload logos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'org-logos'
  and (storage.foldername(name))[1] in (
    select o.id::text from public.organizations o
    join public.profiles p on p.organization_id = o.id
    where p.id = auth.uid()
  )
);

-- Allow authenticated users to update (overwrite) their org's logos
create policy "Org members can update logos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'org-logos'
  and (storage.foldername(name))[1] in (
    select o.id::text from public.organizations o
    join public.profiles p on p.organization_id = o.id
    where p.id = auth.uid()
  )
);

-- Allow anyone to read org logos (public bucket)
create policy "Anyone can view org logos"
on storage.objects for select
to public
using (bucket_id = 'org-logos');
