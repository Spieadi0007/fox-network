# FOX Network — Architecture Reference

> Complete reference document for the FOX Network codebase. Covers project structure, database schema, auth flows, signup state machine, API integrations, and all key files.

---

## 1. Project Structure

pnpm monorepo with Turbo build orchestration.

```
FOX/
├── apps/
│   ├── landing/              # Marketing + auth site (port 3000)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx              # Landing page
│   │   │   │   ├── signin/page.tsx       # Sign in
│   │   │   │   ├── signup/page.tsx       # Signup state machine (Company/Partner)
│   │   │   │   ├── pitch/page.tsx        # Pitch deck
│   │   │   │   ├── auth/callback/route.ts # OAuth callback handler
│   │   │   │   └── api/
│   │   │   │       └── company-lookup/route.ts  # AI company enrichment
│   │   │   ├── components/ui/
│   │   │   │   └── grid-background.tsx   # Animated canvas grid
│   │   │   └── middleware.ts             # Auth redirect guard
│   │   └── package.json
│   │
│   └── platform/             # Protected dashboard app (port 3001)
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx              # Dashboard
│       │   │   ├── unauthorized/page.tsx
│       │   │   └── auth/callback/route.ts
│       │   └── middleware.ts             # Auth + role injection
│       └── package.json
│
├── packages/
│   ├── supabase/             # Supabase client + auth utilities
│   │   ├── src/
│   │   │   ├── client/
│   │   │   │   ├── browser.ts            # createBrowserClient()
│   │   │   │   ├── server.ts             # createServerClient()
│   │   │   │   └── middleware.ts          # createMiddlewareClient()
│   │   │   ├── auth/
│   │   │   │   └── actions.ts            # Server actions (signup, signin, OAuth)
│   │   │   ├── types.ts                  # Database type definitions
│   │   │   └── index.ts                  # Package exports
│   │   └── package.json
│   │
│   ├── shared/               # Shared types + permissions
│   │   ├── src/
│   │   │   ├── types/index.ts            # Enums, interfaces
│   │   │   └── permissions/index.ts      # RBAC permission matrix
│   │   └── package.json
│   │
│   └── eslint-config/        # Shared ESLint config
│
├── supabase/
│   └── migrations/
│       ├── 001_profiles.sql              # Profiles + auth trigger
│       └── 002_organizations_and_partners.sql  # Orgs + partners + RPC
│
├── .env.example              # Environment template
├── package.json              # Root (turbo scripts)
├── pnpm-workspace.yaml
└── turbo.json
```

### Key Dependencies

| Package | Landing | Platform | Supabase pkg |
|---------|---------|----------|--------------|
| next | 16.1.6 | 16.1.6 | (peer) |
| react | 19.2.3 | 19.2.3 | — |
| @supabase/ssr | — | — | 0.6.1 |
| @supabase/supabase-js | — | — | 2.95.3 |
| @anthropic-ai/sdk | 0.74.0 | — | — |
| lucide-react | 0.563.0 | — | — |
| framer-motion | 12.29.2 | — | — |
| tailwindcss | 4.x | 4.x | — |

### Build

```bash
npx -y pnpm build    # pnpm not directly on PATH
npx -y pnpm dev      # starts both apps via turbo
```

---

## 2. Environment Variables

Defined in root `.env.example`, copied to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://lrvfqyesbjiqwlhnhnxw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_LANDING_URL=http://localhost:3000
NEXT_PUBLIC_PLATFORM_URL=http://localhost:3001
ANTHROPIC_API_KEY=sk-ant-api03-...
```

- `NEXT_PUBLIC_*` — exposed to client
- `ANTHROPIC_API_KEY` — server-only, used by `/api/company-lookup`

---

## 3. Database Schema

### 3.1 Enums

```sql
app_role:              admin | manager | technician | viewer
account_type:          company | partner
org_size:              1-10 | 11-50 | 51-200 | 201-500 | 500+
partner_request_status: pending | approved | rejected
```

### 3.2 Tables

#### `profiles` (Migration 001 + 002)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | FK → auth.users (cascade delete) |
| email | text NOT NULL | |
| name | text | |
| role | app_role | Default: `viewer` |
| avatar_url | text | |
| organization_id | uuid | FK → organizations (added in 002) |
| account_type | account_type | `company` or `partner` (added in 002) |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated via trigger |

**RLS Policies:**
- Users read/update own profile
- Admins read/update all profiles (via `is_admin()` helper to avoid RLS recursion)

#### `organizations` (Migration 002)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | Auto-generated |
| name | text NOT NULL | |
| size | org_size NOT NULL | |
| industry | text | |
| website | text | Company website URL |
| description | text | AI-generated, user-editable |
| logo_url | text | Google Favicon URL |
| created_by | uuid | FK → profiles |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated via trigger |

**RLS Policies:**
- Creator OR org members (via profiles.organization_id) can SELECT
- Creator can UPDATE
- Any authenticated user can INSERT

#### `partner_requests` (Migration 002)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | Auto-generated |
| name | text NOT NULL | |
| email | text NOT NULL | |
| phone | text | Optional |
| trade | text NOT NULL | e.g. HVAC, Electrical |
| status | partner_request_status | Default: `pending` |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated via trigger |

**RLS Policies:**
- Anyone can INSERT (including anon — no auth required)
- Admins can SELECT and UPDATE (approve/reject)

### 3.3 Functions & Triggers

#### `handle_new_user()` (SECURITY DEFINER)

Fires `AFTER INSERT ON auth.users`. Creates the profile, and for company signups with metadata, also creates the organization and links it.

```
auth.users INSERT → handle_new_user() →
  1. INSERT profiles (id, email, name, avatar_url, account_type)
  2. IF account_type = 'company' AND company_name in metadata:
     a. INSERT organizations (name, size, industry, website, description, logo_url)
     b. UPDATE profiles SET organization_id = new_org_id
```

User metadata fields read: `name`, `full_name`, `avatar_url`, `account_type`, `company_name`, `company_size`, `company_industry`, `company_website`, `company_description`, `company_logo_url`

#### `setup_company()` RPC (SECURITY DEFINER)

Used by OAuth flow where the user is already authenticated but needs org creation. Bypasses RLS.

```
Parameters: p_user_id, p_user_email, p_user_name, p_avatar_url,
            p_company_name, p_company_size, p_industry, p_website,
            p_description, p_logo_url

1. INSERT profiles ON CONFLICT DO NOTHING (ensures profile exists)
2. INSERT organizations → get new_org_id
3. UPDATE profiles SET organization_id, account_type = 'company'
```

#### `is_admin()` (SECURITY DEFINER)

Helper function to check admin status without RLS recursion. Used in admin RLS policies.

#### `handle_updated_at()`

Generic trigger function. Sets `updated_at = now()` on UPDATE. Applied to profiles, organizations, partner_requests.

---

## 4. Auth System

### 4.1 Supabase Clients

| Client | File | Used In |
|--------|------|---------|
| `createBrowserClient()` | `packages/supabase/src/client/browser.ts` | Client components |
| `createServerClient()` | `packages/supabase/src/client/server.ts` | Server actions, route handlers |
| `createMiddlewareClient()` | `packages/supabase/src/client/middleware.ts` | Middleware |

All typed with `Database` from `packages/supabase/src/types.ts`.

**Important gotcha:** supabase-js v2.95.3 `SupabaseClient` has 5 generic params but `@supabase/ssr` v0.6.1 `createServerClient` passes only 3. When `Database["public"]` doesn't match `GenericSchema`, Schema resolves to `never` (not `any`). Fix: use `(supabase as any).from("table")` for operations on new tables.

### 4.2 Server Actions

File: `packages/supabase/src/auth/actions.ts`

| Action | Purpose | Used By |
|--------|---------|---------|
| `signInWithEmail(formData)` | Email/password login → redirect to platform | Sign in page |
| `signUpWithEmail(formData)` | Legacy signup (unused in new flow) | — |
| `signInWithOAuth("google")` | Generic OAuth → redirect to platform | Sign in page |
| `signOut()` | Sign out → redirect to landing | Platform |
| `signUpCompany(formData)` | Email signup: creates user with all company metadata | Signup step 2 (email path) |
| `submitPartnerRequest(formData)` | Inserts partner_requests row (no auth) | Signup partner form |
| `signInWithOAuthCompany("google")` | OAuth with `next=/signup?step=company-2` | Signup step 1 |
| `completeCompanySetup(formData)` | OAuth path: calls `setup_company` RPC | Signup step 2 (OAuth path) |

### 4.3 Auth Callback

File: `apps/landing/src/app/auth/callback/route.ts`

```
GET /auth/callback?code=...&next=...
  1. Exchange code for session
  2. If next starts with "/signup" → redirect to LANDING_URL + next (stay on landing for company setup)
  3. Otherwise → redirect to PLATFORM_URL/auth/callback (establish platform session)
```

### 4.4 Landing Middleware

File: `apps/landing/src/middleware.ts`

Matched paths: `/signin`, `/signup`

```
If user is authenticated:
  - /signin → redirect to PLATFORM_URL
  - /signup (without ?step= param) → redirect to PLATFORM_URL
  - /signup?step=company-2 → allow through (OAuth returning for setup)
```

### 4.5 Platform Middleware

File: `apps/platform/src/middleware.ts`

```
1. Allow /auth/callback through
2. If NOT authenticated → redirect to LANDING_URL/signin
3. Fetch profile role
4. Inject headers: x-user-id, x-user-email, x-user-role
```

---

## 5. Signup Flow — State Machine

File: `apps/landing/src/app/signup/page.tsx`

All views on the same `/signup` route. Client-side state machine with 5 states:

```
/signup → [select] → Company or Partner?
              │                │
              ▼                ▼
        [company-1]       [partner]
        name, email,      name, email,
        password          phone, trade
        + Google OAuth         │
              │                ▼
              ▼         [partner-success]
        [company-2]     "We'll be in touch"
        company name,
        website URL
        → AI lookup →
        logo, description,
        size, industry
              │
              ▼
     Email: "Check your email"
     OAuth: redirect to platform
```

### 5.1 State: `select`

Two cards — Company (Building2 icon) and Partner (Wrench icon). Clicking sets step.

### 5.2 State: `company-1` (client-side only)

Personal info form: name, email, password. Clicking "Continue" saves `PersonalInfo` in React state and transitions to `company-2`. No server action called.

Also has Google OAuth button (calls `signInWithOAuthCompany`).

### 5.3 State: `company-2`

Two-phase UI:
1. **Input phase**: Company name + website URL + "Look up company" button
2. **Preview phase** (after lookup): Preview card with logo + editable description, company size dropdown, industry field + "Complete setup" button

Lookup calls `POST /api/company-lookup` which uses Claude API.

Form submission:
- **Email path** (`isOAuth=false`): Hidden fields carry personal info from step 1. Action: `signUpCompany` → creates auth user with all metadata → trigger creates org → "Check your email"
- **OAuth path** (`isOAuth=true`): No personal info needed (already authenticated). Action: `completeCompanySetup` → calls `setup_company` RPC → redirect to platform

### 5.4 State: `partner`

Form: name, email, phone (optional), trade/specialty. Action: `submitPartnerRequest` → inserts into partner_requests → redirects with `?success=partner_submitted`.

### 5.5 State: `partner-success`

Success message with CheckCircle2 icon. "Back to home" link.

### 5.6 URL Params

| Param | Values | Purpose |
|-------|--------|---------|
| `step` | `company-1`, `company-2`, `partner` | Direct navigation / OAuth return |
| `error` | string | Display error message |
| `success` | `partner_submitted` or message string | Show success state |

---

## 6. AI Company Lookup

File: `apps/landing/src/app/api/company-lookup/route.ts`

### Request

```
POST /api/company-lookup
Content-Type: application/json
{ "name": "Acme Inc.", "website": "https://acme.com" }
```

### Flow

1. Parse domain from website URL
2. Generate `logoUrl` = `https://www.google.com/s2/favicons?domain={domain}&sz=128`
3. Fetch website HTML (5s timeout, custom User-Agent)
4. Strip HTML to plain text (max 8000 chars)
5. Call Claude (`claude-haiku-4-5-20251001`, max 256 tokens):
   - With site content: "Given this website content for {name}... return JSON with description + industry"
   - Without site content (name only): "For a company named {name}... return JSON with description + industry"
6. Parse JSON response, extract `description` and `industry`

### Response

```json
{ "description": "Acme Inc. is a...", "industry": "Manufacturing", "logoUrl": "https://..." }
```

Graceful degradation: returns empty strings on any failure (never returns errors to client).

---

## 7. Type System

### 7.1 Supabase Types (`packages/supabase/src/types.ts`)

Manually maintained (not `supabase gen types`). Mirrors database schema exactly.

```typescript
Database.public.Tables.profiles     → Row, Insert, Update, Relationships
Database.public.Tables.organizations → Row, Insert, Update, Relationships
Database.public.Tables.partner_requests → Row, Insert, Update, Relationships

Database.public.Views → empty
Database.public.Functions → empty
Database.public.Enums → app_role, account_type, org_size, partner_request_status
Database.public.CompositeTypes → empty
```

Exports: `Profile`, `Organization`, `PartnerRequest`

### 7.2 Shared Types (`packages/shared/src/types/index.ts`)

```typescript
// Enums
Role          → Admin, Manager, Technician, Viewer
AccountType   → Company, Partner
OrgSize       → XSmall (1-10), Small (11-50), Medium (51-200), Large (201-500), Enterprise (500+)
PartnerRequestStatus → Pending, Approved, Rejected

// Interfaces
User          → id, email, name, role, avatarUrl?, createdAt, updatedAt
Organization  → id, name, size, industry?, website?, description?, logoUrl?, createdBy?, createdAt, updatedAt
PartnerRequest → id, name, email, phone?, trade, status, createdAt, updatedAt
WorkOrder     → id, title, description, status, priority, assigneeId?, assetId?, createdAt, updatedAt
Asset         → id, name, type, location, status, metadata?, createdAt, updatedAt
```

### 7.3 Package Exports (`packages/supabase/src/index.ts`)

```typescript
export { createBrowserClient } from "./client/browser";
export { createServerClient } from "./client/server";
export { createMiddlewareClient } from "./client/middleware";
export type { Database, Profile, Organization, PartnerRequest } from "./types";
```

---

## 8. Permissions (RBAC)

File: `packages/shared/src/permissions/index.ts`

| Action | Admin | Manager | Technician | Viewer |
|--------|-------|---------|------------|--------|
| work_order:create | Y | Y | | |
| work_order:read | Y | Y | Y | Y |
| work_order:update | Y | Y | Y | |
| work_order:delete | Y | Y | | |
| work_order:assign | Y | Y | | |
| asset:create | Y | Y | | |
| asset:read | Y | Y | Y | Y |
| asset:update | Y | Y | | |
| asset:delete | Y | Y | | |
| user:invite | Y | Y | | |
| user:read | Y | Y | Y | Y |
| user:update | Y | | | |
| user:delete | Y | | | |
| user:role_change | Y | | | |
| settings:read | Y | Y | Y | Y |
| settings:update | Y | | | |

API: `hasPermission(role, action)` and `getPermissions(role)`

---

## 9. Design System

### Colors
- Primary: `fox-orange` (actually maps to `#3B82F6` blue)
- Dark: `fox-dark` (`#1c1917` / stone-900)
- Accent: `fox-amber` (`#2563EB`)
- Palette: stone-50 through stone-900

### Fonts
- Heading: `Space Grotesk` (var: `--font-heading`)
- Body: `DM Sans` (var: `--font-body`)
- Mono: `DM Mono` (var: `--font-mono`)

### Component Patterns

```
Glass card:     rounded-2xl border border-stone-200/80 bg-white/80 p-8 shadow-xl shadow-stone-200/40 backdrop-blur-xl
Input:          mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900
                placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange
Primary btn:    rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-800
Secondary btn:  rounded-full border border-stone-200/80 bg-white px-5 py-3 text-sm font-medium text-stone-700
                shadow-sm shadow-stone-200/20 hover:border-stone-300 hover:bg-stone-50
Error alert:    rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700
Success alert:  rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700
```

### Background Effects
- Mesh gradient: radial gradients with blue tones (`.mesh-gradient`)
- Grid: Animated canvas-based grid with traveling light pulses (`GridBackground`)
- Grain: SVG noise overlay (opacity 0.035)

### Logo
```tsx
<img src="/fox-logo.png" alt="Fox" className="h-8 w-8" />
<span className="font-[family-name:var(--font-heading)] text-[17px] font-bold tracking-[-0.03em]">
  Fox<span className="text-fox-orange">Network</span>
</span>
```

---

## 10. Known Gotchas

1. **pnpm not on PATH** — Use `npx -y pnpm build` instead of `pnpm build`

2. **Supabase type `never` errors** — supabase-js v2.95.3 SupabaseClient has 5 generic params but @supabase/ssr v0.6.1 createServerClient passes only 3. When `Database["public"]` doesn't match `GenericSchema`, Schema resolves to `never`. Fix: `(supabase as any).from("table")` for new table operations.

3. **Middleware redirect loop** — Landing middleware redirects authenticated users from `/signup` to platform. Must allow `?step=` param through for OAuth company setup flow.

4. **Email signup org creation** — After `auth.signUp()`, user has no session (email confirmation required). Org is created in the `handle_new_user` trigger via metadata, not via client-side RLS operations.

5. **OAuth signup org creation** — User IS authenticated but profile may not exist yet (trigger race). `setup_company` RPC uses `ON CONFLICT DO NOTHING` for profile insert to handle this safely.
