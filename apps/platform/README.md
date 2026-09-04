# @fox/platform — staff dashboard and client portal

Everything behind a login. Formerly `apps/landing`, which also served the
marketing site and the pitch deck; those are gone — marketing lives in
`apps/web`, and the deck in the standalone `fox-pitch` repository.

```bash
npx -y pnpm --filter @fox/platform dev     # http://localhost:3000
npx -y pnpm --filter @fox/platform build
```

Copy the root `.env.example` to `.env.local` first.

---

## Surfaces

| Route | Who | What |
|---|---|---|
| `/` | anyone | Redirects to `/signin` |
| `/signin`, `/signup` | staff | Sign-in and the company/partner signup state machine |
| `/invite/[token]` | invitee | Accept an invitation |
| `/dashboard/*` | staff | Locations, projects, actions, assets, members, requests, settings |
| `/client/*` | clients | Raise and track requests, document library, spare parts, invoices |
| `/technician/*` | technicians | Web field app — **retired once `apps/field` ships** |
| `/api/*` | — | Company lookup and SOP import, all Anthropic-backed |

### Two subdomains, one deployment

| Host | Front door | Owns |
|---|---|---|
| `admin.<domain>` | `/signin` | `/dashboard/*`, `/technician/*` |
| `platform.<domain>` | `/client/signin` | `/client/*` |

Both are the same Vercel project and the same build. `src/lib/hosts.ts` reads
the subdomain off the request; `middleware.ts` uses it to decide where `/`
lands and to bounce anyone who arrives on the wrong side — `/dashboard` on
`platform.` redirects across to `admin.`, and vice versa, so no page ends up
with two addresses.

Any other host — `localhost`, a `*.vercel.app` preview — resolves to `"any"`,
where no host rules apply and the app behaves exactly as it did before
subdomains existed. That is what keeps local development and preview
deployments usable, and it is why you cannot verify this behaviour on a
preview URL: use a `Host` header.

```bash
curl -sI -H "Host: platform.foxnetwork.io" localhost:3000/ | grep -i location
```

Both hosts must be registered as Supabase Auth redirect URLs, or OAuth will
fail on whichever one is missing.

### Why staff and clients are one app

They share one login, one database, one component set, and one
`middleware.ts` that routes between `/dashboard` and `/client/dashboard` on
`account_type`. Splitting them into separate deployments would mean scoping
the Supabase session cookie across subdomains, for no benefit. The routes stay
namespaced, so separating them later is still possible — and cheaper then than
speculatively now.

---

## Routing

`src/middleware.ts` is the single place every role decision is made:
`account_type` (company / partner / client) × `role` (admin / manager /
technician / viewer) × the `fox_staff` flag. It also forwards a Supabase auth
`?code=` landing on `/` to `/auth/callback`.

Read it before changing any redirect. Several branches exist to break
ping-pong loops between `/signin`, `/signup?step=company-2` and
`/technician`, and the comments explain which.

---

## Known rough edges

- **`fox-orange` is blue.** The token has held `#3B82F6` since it was
  introduced. It is used across 23 files, so renaming it is its own change —
  `apps/web` already uses an honestly-named `brand` token.
- **`packages/supabase/src/types.ts` is hand-maintained**, 982 lines, and
  drifts from the 39 migrations. Query calls work around it with
  `(supabase as any).from(...)`, which means the compiler will not catch a
  broken query. Replace it with generated types.
- **13 pre-existing lint errors**, all `react-hooks/set-state-in-effect` in
  dashboard forms and the signup page. They predate the split.
- **No tests, no CI.** The largest risk to the remaining migration work.

---

## What comes next

The technician app moves to Expo (`apps/field`). Before it can, the two writes
it performs — `submitFieldEntry` and `submitProcedureEntry` — have to leave
`packages/supabase` and become Postgres functions, because every file in
`packages/supabase/src/actions/` is a Next.js server action and React Native
cannot import one. `/technician` here stays as the working fallback until that
app ships.
