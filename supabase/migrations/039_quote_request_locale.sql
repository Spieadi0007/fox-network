-- 039: Record which language a quote request arrived in, and the fields the
-- rebuilt marketing form actually collects.
--
-- The site now serves French and English. Without `locale` there is no way to
-- know which language to answer a lead in — the row looks identical either
-- way — so the follow-up would default to whatever the person replying
-- happens to speak. It defaults to 'fr' because that is the site's default
-- locale and the beachhead market.
--
-- The remaining columns were previously squeezed into `notes` as free text,
-- which made them unsearchable and unsortable.

alter table public.quote_requests
  add column if not exists locale text not null default 'fr',
  add column if not exists phone text,
  add column if not exists network_type text,
  add column if not exists region text;

alter table public.quote_requests
  drop constraint if exists quote_requests_locale_check;

alter table public.quote_requests
  add constraint quote_requests_locale_check
  check (locale in ('fr', 'en'));

-- Staff triage the inbox newest-first; the index keeps that cheap as volume
-- grows, and lets the waitlist be filtered out of the quote pipeline.
create index if not exists idx_quote_requests_created_at
  on public.quote_requests (created_at desc);

comment on column public.quote_requests.locale is
  'Language the request was submitted in. Drives the language of the reply.';
