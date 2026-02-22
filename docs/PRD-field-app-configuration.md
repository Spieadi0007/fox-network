# PRD: Field App Configuration

## Overview

A settings page in the web dashboard (`/dashboard/settings/field-app`) where managers/admins configure what the technician mobile app (Expo, built later) displays and captures. This is the **control panel** — the mobile app reads this config to render its UI.

---

## Problem

Every organization has different workflows. A telecom company doing tower maintenance needs different card info (site ID, access instructions, tower height) than a retail company doing store inspections (store name, manager contact, brand). Without configuration, we'd either:
- Show everything (cluttered, unusable on a phone)
- Hardcode a layout (doesn't work across industries)

This feature lets each org customize what their technicians see and capture per service type.

---

## User Roles

| Role | Access |
|---|---|
| Admin | Full read/write to field app config |
| Manager | Full read/write to field app config |
| Technician | No access (they consume the config via mobile app) |
| Viewer | No access |

---

## Data Model

### New Table: `field_app_config`

One row per (organization, action_type). Stores the full layout config as JSON.

```sql
create table public.field_app_config (
  id             uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  action_type_code text not null,  -- matches action_type enum or configurable_field_options code

  -- What fields appear on the action card in the mobile app (ordered)
  card_fields    jsonb not null default '[]',

  -- Which modules are enabled for technicians to fill during a visit
  enabled_modules jsonb not null default '{}',

  -- Card vs detail display mode
  display_mode   text not null default 'cards'
                 check (display_mode in ('cards', 'details')),

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint field_app_config_org_type unique (organization_id, action_type_code)
);
```

### `card_fields` JSON Schema

Ordered array of field keys that are visible on the card. Grouped by source table.

```json
[
  { "key": "location_name", "group": "location" },
  { "key": "location_address", "group": "location" },
  { "key": "location_client", "group": "location" },
  { "key": "action_type", "group": "service" },
  { "key": "action_name", "group": "service" }
]
```

Only enabled fields are in the array. Order = display order on card.

### `enabled_modules` JSON Schema

Flat object of module keys → boolean.

```json
{
  "start_time": true,
  "end_time": true,
  "travel_time": false,
  "work_duration": true,
  "parts_used": false,
  "customer_signature": false,
  "technician_signature": true,
  "checklist": false,
  "photos": true,
  "auto_translate": false,
  "notes": true,
  "chat": false
}
```

---

## Available Card Fields

These are the fields a manager can toggle on/off for the mobile card. Grouped by source table. The field keys map directly to database columns — the mobile app uses these to know what to query and display.

### Location Group (7 fields)

| Key | Label | Source Column |
|---|---|---|
| `location_name` | Location Name | `locations.name` |
| `location_address` | Address | `locations.address` |
| `location_city` | City | `locations.city` |
| `location_country` | Country | `locations.country` |
| `location_client` | Client | `locations.client` |
| `location_contact_name` | Contact Person | `locations.contact_name` |
| `location_contact_phone` | Phone | `locations.contact_phone` |

### Project Group (4 fields)

| Key | Label | Source Column |
|---|---|---|
| `project_name` | Project Name | `projects.name` |
| `project_type` | Project Type | `projects.project_type` |
| `project_start_date` | Start Date | `projects.start_date` |
| `project_end_date` | End Date | `projects.end_date` |

### Service / Action Group (7 fields)

| Key | Label | Source Column |
|---|---|---|
| `action_name` | Action Name | `actions.name` |
| `action_code` | Action Code | `actions.code` |
| `action_type` | Action Type | `actions.action_type` |
| `action_priority` | Priority | `actions.priority` |
| `action_status` | Status | `actions.status` |
| `action_scheduled_start` | Scheduled Date | `actions.scheduled_start` |
| `action_due_date` | Due Date | `actions.due_date` |

**Total: 18 fields across 3 groups**

> Custom fields from `custom_field_definitions` (actions module) could also be listed dynamically under a 4th "Custom Fields" group. Phase 2 consideration.

---

## Available Modules

Modules are features the technician interacts with during a field visit. They map to `action_entries` columns or future functionality.

### Time Tracking

| Key | Label | Description | Maps to |
|---|---|---|---|
| `start_time` | Start Time | When technician started working | `action_entries.started_at` |
| `end_time` | End Time | When technician finished working | `action_entries.ended_at` |
| `travel_time` | Travel Time | Time spent traveling to location | `action_entries.custom_fields.travel_time` |
| `work_duration` | Work Duration | Calculated: end - start | `action_entries.duration_minutes` |

### Materials & Parts

| Key | Label | Description | Maps to |
|---|---|---|---|
| `parts_used` | Parts Used | Materials consumed during service | `action_entries.custom_fields.parts_used` |

### Verification

| Key | Label | Description | Maps to |
|---|---|---|---|
| `customer_signature` | Customer Signature | Digital signature from customer | `action_entries.custom_fields.customer_signature` |
| `technician_signature` | Technician Signature | Digital signature from technician | `action_entries.technician_signature` |
| `checklist` | Checklist | Checklist of items to verify | `action_entries.custom_fields.checklist` |

### Media & Photos

| Key | Label | Description | Maps to |
|---|---|---|---|
| `photos` | Photos | Before/after photos from the service | `action_entries.attachments` |

### Language

| Key | Label | Description | Maps to |
|---|---|---|---|
| `auto_translate` | Auto Translate | Auto-translate notes, failure reasons, and text fields to the org's primary language | `action_entries.custom_fields.translated_*` |

### General

| Key | Label | Description | Maps to |
|---|---|---|---|
| `notes` | Notes | Additional notes about the service | `action_entries.notes` |
| `chat` | Chat | Real-time chat with support/team | Future feature (flag only) |

**Total: 12 modules**

---

## UI Design

### Page Location

`/dashboard/settings/field-app` — new tab in the settings layout alongside Custom Fields, Field Options, and Action Templates.

### Layout: Three Sections

#### Section 1: Service Type Configuration (top, full width)

- Horizontal row of action type cards/pills
- Each shows: icon + label + "X modules" count
- Active type has a blue/highlighted border
- Source: `action_type` enum values (or org's configured `action_type` field options)
- Selecting a type loads its config (or defaults if none saved)

#### Section 2: Information Display (left column, ~60%)

- **Cards / Details toggle** at the top right of this section
- **Collapsible field groups**: Location (3/7), Project (0/4), Service (2/7)
  - Group header shows: icon + group name + enabled/total count + chevron
  - Each field row: toggle indicator (green = enabled) + field label
  - Click to toggle on/off
  - Enabled fields appear in the card_fields array
- Count badge updates live as fields are toggled

#### Section 3: Mobile App Preview (right column, ~40%, sticky)

- Phone frame mockup (CSS-only, rounded corners + notch)
- Shows badge for current service type
- Live preview of what the card looks like based on enabled fields
- Updates in real-time as fields are toggled
- Static placeholder data (e.g., "Acme Store #123", "123 Main Street")

#### Section 4: Available Modules (below Information Display, left column)

- Categorized list with section headers (TIME TRACKING, MATERIALS & PARTS, VERIFICATION, etc.)
- Each module: icon + label + description + toggle switch
- Toggle enables/disables the module for the selected service type

### Save Behavior

- Auto-save on toggle (same pattern as field-options: batch changes, save on blur/navigate)
- OR explicit "Save" button if we prefer (same as workflow-manager pattern)
- Recommend: explicit Save button with dirty indicator, matching the workflow-manager pattern

---

## API / Server Actions

### New file: `packages/supabase/src/actions/field-app-config.ts`

```typescript
// Read config for all action types in an org
getFieldAppConfigs(orgId: string): Promise<FieldAppConfig[]>

// Read config for a specific action type
getFieldAppConfig(orgId: string, actionTypeCode: string): Promise<FieldAppConfig | null>

// Create or update config for an action type
upsertFieldAppConfig(actionTypeCode: string, config: {
  card_fields: { key: string; group: string }[];
  enabled_modules: Record<string, boolean>;
  display_mode: 'cards' | 'details';
}): Promise<void>
```

---

## Default Config

When no config exists for a service type, the UI shows a sensible default (not blank). Default enabled card fields:

- `location_name` (Location)
- `location_address` (Location)
- `location_client` (Location)
- `action_type` (Service)
- `action_name` (Service)

Default enabled modules: none (all off — manager must explicitly enable).

This ensures the mobile app always shows at minimum the location and action info even if the manager hasn't configured anything yet.

---

## Mobile App Consumption (Future — Expo App)

The Expo app will:
1. Fetch the config for the current action's `action_type` via Supabase client
2. Use `card_fields` to build the card layout (query only the needed joins)
3. Use `enabled_modules` to show/hide input sections in the entry form
4. Use `display_mode` to switch between card and detail views

This is out of scope for this ticket — we're only building the configuration UI.

---

## Implementation Steps

### Step 1: Database migration (`018_field_app_config.sql`)
- Create `field_app_config` table
- RLS policies (org members read, admins/managers write)
- Indexes on `organization_id`

### Step 2: TypeScript types
- Add `FieldAppConfig` type to `types.ts`
- Add to Database type definition
- Export from package index

### Step 3: Server actions (`field-app-config.ts`)
- `getFieldAppConfigs`, `getFieldAppConfig`, `upsertFieldAppConfig`

### Step 4: Settings layout update
- Add "Field App" tab to `/dashboard/settings/layout.tsx`

### Step 5: Settings page (`/dashboard/settings/field-app/`)
- `page.tsx` — server component, fetches config + field options (for action types)
- `field-app-config-manager.tsx` — client component with full UI

### Step 6: Build the UI
- Service type selector (top)
- Information Display with collapsible field groups (left)
- Available Modules with toggle switches (left, below)
- Mobile App Preview (right, sticky)

---

## Out of Scope

- Expo mobile app itself (separate project, separate PRD)
- Custom fields appearing in the card field list (Phase 2)
- Per-client scoping of field app config (Phase 2 — currently per action_type only)
- Checklist item configuration (what items appear in the checklist module)
- Parts catalog / inventory integration
- Chat infrastructure
- Drag-and-drop field reordering (nice-to-have, not MVP)

---

## Success Criteria

1. Admin can configure card fields per service type and see a live preview
2. Admin can enable/disable modules per service type
3. Config persists to database and loads correctly on page refresh
4. Config for each service type is independent
5. Build passes with no type errors
6. UI matches existing settings page patterns (stone palette, rounded-xl, etc.)
