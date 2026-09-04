# @fox/web — marketing site

The public FoxNetwork site, in French and English. First app of the monorepo
split: it shares the workspace with `apps/landing` but no code, no auth and no
Supabase server actions, so it can be built and deployed on its own.

```bash
npx -y pnpm --filter @fox/web dev     # http://localhost:3002
npx -y pnpm --filter @fox/web build
```

Copy `.env.example` to `.env.local` first.

---

## Locales

French is the default and the product language — the beachhead is Paris and
the eight départements of Île-de-France. English is the second language, for
operators evaluating us from outside France.

Both locales are prefixed, and `/` only ever negotiates on `Accept-Language`
and redirects. A hidden default (`/` serving French) would leave the French
pages with no canonical URL of their own and make `hreflang` ambiguous.

**URLs are translated too**, via the `pathnames` table in
`src/i18n/routing.ts`:

| Internal route | French | English |
|---|---|---|
| `/` | `/fr` | `/en` |
| `/quote` | `/fr/devis` | `/en/quote` |
| `/privacy` | `/fr/confidentialite` | `/en/privacy` |
| `/terms` | `/fr/conditions-utilisation` | `/en/terms` |
| `/legal-notice` | `/fr/mentions-legales` | `/en/legal-notice` |

Link with the **internal** name — `<Link href="/quote">` — and next-intl
renders the right path for the active locale. Requesting the wrong locale's
path (`/fr/quote`) redirects to the right one.

`src/lib/metadata.ts` resolves `hreflang` through that same table, so
alternates stay correct when a translated path changes. Never hand-write
them.

### Adding copy

Everything a visitor reads lives in `messages/fr.json` and
`messages/en.json`, namespaced per section. Both files must hold the same
keys:

```bash
node -e "
const k=o=>Object.entries(o).flatMap(([a,b])=>b&&typeof b=='object'?k(b).map(c=>a+'.'+c):[a]);
const f=require('./messages/fr.json'), e=require('./messages/en.json');
const a=k(f).sort(), b=k(e).sort();
console.log(a.length===b.length&&a.every((x,i)=>x===b[i]) ? 'in sync' : 'DIVERGED');
"
```

What stays in code rather than the catalog: icons, prices, and the
département names and numbers — official proper nouns identical in both
locales, so duplicating them into two files only creates a way for them to
drift.

### Formatting

Always through `useFormatter` / `Intl`, never by hand. The same price renders
`150 €` in French and `€150` in English — separator *and* symbol position
differ.

French text uses a narrow no-break space (U+202F) before `? ! ; :`, which is
correct French typography and already baked into `messages/fr.json`.

### A layout note

French runs roughly 15–20% longer than English. The SLA cards reserve height
for a two-line response window for exactly this reason — without it, "Sous 4
heures, 24h/24 et 7j/7" wraps and pushes one card's price out of line with the
other three. **Check both locales when changing a layout**, not just English.

---

## Outstanding

- **`/privacy` and `/terms` have no text.** They render a visible "in
  preparation" state and are `noindex`. Machine-translating legal text
  produces a document that reads as binding and is not. These need counsel,
  in both languages, and that has a lead time — start it early.
- **`/legal-notice` (mentions légales) is a structured skeleton.** Publishing
  these is a legal obligation for a company trading online in France
  (LCEN art. 6 III) and no such page existed before. The required fields are
  laid out with their values marked *à compléter* rather than invented — a
  wrong RCS number is worse than a visibly empty one. Fill in: forme
  juridique, capital social, RCS, TVA intracommunautaire, siège social,
  directeur de la publication.
- **Sign-in and sign-up links point at the landing app** via
  `NEXT_PUBLIC_PLATFORM_URL` / `NEXT_PUBLIC_PORTAL_URL` in `src/lib/site.ts`.
  Phase 2 moves those to their own subdomains; only those two values change.
- **No tests, no CI** — inherited from the repo, and the largest risk to the
  restructure. Worth fixing before the staff and client apps are extracted.
