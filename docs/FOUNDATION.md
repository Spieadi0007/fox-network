# FoxNetwork — Foundation

> **The brain of this project.** What we are building, why it exists, who it is for, why we believe our angle is different, and what has to be true for it to work.
>
> Everything else — the pitch deck, the landing page, the schema, the roadmap — is downstream of this file. If a decision contradicts this document, either the decision is wrong or this document needs updating. Update it deliberately.
>
> **Last updated:** 31 July 2026 · **Sources:** founder voice memo (31 Jul 2026), `/pitch` deck, landing site, codebase, external market research (cited at the end).

---

## 0. Reading guide — how to trust the numbers in here

This document mixes three kinds of claims. They are labelled throughout:

| Marker | Meaning |
|---|---|
| **[FACT]** | Externally verifiable, sourced at the bottom of this document. |
| **[INTERNAL]** | Our own operating experience or estimate. Directionally believed, not independently validated. Treat as a hypothesis to test with design partners. |
| **[BET]** | A strategic assumption we are deliberately making. If it is wrong, the business changes shape. |

Being honest about which is which is the point. A brain file full of unlabelled numbers becomes a deck that fools its own authors.

---

## 1. The thesis in one paragraph

The physical world is being rebuilt as a distributed, connected, capital-intensive grid — EV chargers, parcel lockers, ATMs, 5G small cells, micro-mobility docks, industrial IoT. The hardware is futuristic. **The operations keeping it alive are not.** They still run on Excel, WhatsApp, phone calls, opaque 3PL subcontractors and manual photo review. FoxNetwork is the operating system for that layer: a two-sided network that aggregates *demand* (hardware operators who need uptime) and *supply* (certified field technicians), orchestrated end-to-end by software — from IoT alert to dispatch to on-site SOP execution to AI-validated proof-of-work to invoice and technician payout.

**The one-line version:** *The Uber model for physical infrastructure maintenance — starting with maintenance, expanding to all field operations.*

---

## 2. Why now — the macro shift

### 2.1 The asset base has exploded

- **EV charging:** The EU passed **1.1 million public charge points** by end-2025 — a **five-fold increase since 2020**. As of March 2026, **26 of 27 member states** already exceed the AFIR fleet-based charging capacity target; in aggregate the EU overshoots it by **180%**. **[FACT]**
- **Parcel lockers / out-of-home delivery:** Over **184,400 parcel locker units** are now live across Europe, a **77% network expansion in two years**. InPost alone ended 2025 with **61,196 lockers**. OOH volumes grew **>20% to 2bn+ parcels** in 2024 while home delivery grew 5%. **29% of B2C parcels** now go out-of-home. **[FACT]**
- These sit alongside the existing installed base of ATMs, vending, kiosks, telecom sites and industrial sensors.

### 2.2 The critical nuance most decks miss

Infrastructure deployment has **outpaced demand**. In EV charging specifically, charge point growth has run ahead of BEV fleet growth in all but one EU country **[FACT]**. That means:

> **Utilisation per asset is low, and therefore *operating cost per asset* — not deployment cost — is the number that decides whether these networks are profitable.**

This is the single most important framing for our sales motion. We are not selling "growth enablement" into a land-grab. We are selling **margin defence** into an overbuilt, cost-pressured, regulator-watched asset base. Operators who over-deployed in 2021–2025 are now being judged on opex and uptime. That is our buyer, and that is why the conversation lands in 2026 in a way it would not have in 2022.

### 2.3 Reliability is becoming a regulated, contractual obligation

- AFIR (EU) 2023/1804 sets binding requirements on **payment transparency, data sharing and availability reporting**. There is no single EU-wide uptime percentage mandate, but **national and local tenders increasingly specify 97–99% uptime**, and non-compliance risks funding eligibility. New AC chargers must comply with **ISO 15118 from January 2026**. **[FACT]**
- Real-world reliability lags reported uptime: Sweden showed a **94.76 Symbioen Index with only 89.8% successful charging sessions**; Norway **94.15 / 86.3%**. **[FACT]**

That gap between *"the dashboard says it's up"* and *"a customer actually completed a session"* is exactly the gap a field-execution layer closes. **Status-based uptime is a lie that field verification exposes.**

### 2.4 The synthesis

> **Digital world, physical assets.** The devices are smart, connected, and self-reporting. The trucks, technicians, parts, schedules, permits and compliance paperwork that keep them alive are not connected to any of it. Every device generates a signal; almost no operator has an automated path from that signal to a resolved, verified, invoiced intervention.

That path is the product.

---

## 3. The problem — seven failures of the current model

Drawn from lived operating experience running field operations for a physical network **[INTERNAL]**, corroborated by public data where noted.

### 3.1 High cost of field operations (the density problem)

Any single operator has **too few assets in any one geography** to keep a technician busy. The technician spends the day driving, not fixing. Low intervention rate per technician per day ⇒ high fully-loaded cost per intervention.

> This is the root cause. Nearly every other problem below is a symptom of it. **Density is the whole game.**

### 3.2 Manual, non-automated partner operations

The 3PLs and local partners doing the actual work run on **Excel, phone calls and WhatsApp**. They are structurally unable to scale in an automated way — every added asset adds human coordination.

### 3.3 No data feedback loop

Providers and 3PLs **will not share field insight** with the network operator. Failure modes, part failure rates, install defects, site access problems — all of it dies in a subcontractor's inbox. The operator is blind. Nothing improves the product or the process, because nothing is recorded in a structured, comparable way.

### 3.4 Blind validation — and its cost

Because the operator can't trust the field data, they build a **human validation team** to review photos and reports.

> **[INTERNAL]** In the operator the founding team came from, **10–15% of the operations headcount existed purely to validate the work of maintenance and deployment providers.** This is a pure-overhead cost line that grows linearly with asset count.

This is our sharpest, most specific wedge and it should be quantified with every design partner in the discovery workshop. It is a number a COO can find on their own org chart in ten minutes.

### 3.5 SLA breaches and insufficient uptime

Too few technicians relative to incident volume ⇒ missed response windows ⇒ downtime ⇒ contractual penalties and customer churn. Directly linked to §3.1.

### 3.6 Multi-country / multi-partner fragmentation

Every new market starts from **zero**: new partners, new business rules, new labour law, new compliance regime, new commercial terms. Nothing carries over. Geographic expansion is a rebuild, not a rollout — which is why so many hardware networks stall at their second or third country.

### 3.7 Inconsistent quality across partners

A network maintained by a dozen 3PLs has a dozen quality standards, a dozen definitions of "done", and no comparable metrics. Result: rework, disputes, and reputational damage that the operator absorbs but cannot diagnose.

---

## 4. Why nobody has solved this — the competitive landscape

There are three existing categories. Each solves one third of the problem and structurally cannot solve the other two.

### 4.1 Field Service Management software (ServiceTitan, IFS, Salesforce Field Service, Praxedo, FieldPulse, Zinier)

- **What they sell:** a tool. Scheduling, dispatch, mobile forms, invoicing.
- **Market size:** global FSM software ≈ **$5.7–6.3bn in 2026**, growing **~10–16% CAGR** depending on the analyst. **[FACT]**
- **What they don't solve:** they assume **you already have a workforce**. They give a planner a better screen. They do not add a single technician, do not create density, do not validate the work, and do not carry SLA risk. If your problem is "I have 4,000 chargers across 6 countries and no reliable hands", an FSM licence does nothing.

### 4.2 Labour marketplaces (Field Nation, WorkMarket)

- **What they sell:** access to independent technicians. Field Nation connects **20,000+ independent IT technicians**, over **1m work orders/year**, **600K+ sites**, 98% claimed success rate. **[FACT]**
- **What they don't solve:** they are **US/Canada-centric and IT-hardware-centric**. Critically, they hand the buyer a technician and hand back the **quality assurance problem**. You still validate. You still chase. There is no SLA the marketplace itself guarantees, no orchestration from machine signal, and no cross-client density engineering.

### 4.3 3PLs and multi-vendor service providers (Cennox, Rhenus, OEM service arms)

- **What they sell:** managed field service. Cennox, for instance, is a leading multi-vendor ATM services provider operating in **13 countries with customers in 100+**, offering scheduled maintenance and emergency response. **[FACT]**
- **What they don't solve:** they are the **source of problems §3.2, §3.3 and §3.7**. They are operationally strong and digitally opaque. They optimise their own margin, not your uptime. They will not give you the field data. And each one is a separate integration, contract and quality standard.

### 4.4 The gap

| | Brings software | Brings labour | Guarantees the outcome (SLA) | Returns structured field data | Creates cross-client density |
|---|:---:|:---:|:---:|:---:|:---:|
| FSM software | ✅ | ❌ | ❌ | partial | ❌ |
| Labour marketplaces | ✅ | ✅ | ❌ | ❌ | partial |
| 3PLs / OEM service | ❌ | ✅ | partial | ❌ | ❌ |
| **FoxNetwork** | ✅ | ✅ | ✅ | ✅ | ✅ |

**Nobody occupies the last column.** That is the position we are claiming.

---

## 5. Our differentiated perspective — five contrarian positions

This section is the actual intellectual property of the business. Everything else is execution.

### 5.1 Density is not a client-count problem. It is an *asset-type-agnosticism* problem.

Everyone in this market tries to build density by winning more clients in the same vertical. We think that ceiling is low and slow.

> **Our position:** density comes from being **asset-agnostic within a geography**. One certified technician in the 11th arrondissement should service an EV charger at 09:00, a parcel locker at 10:30, and an ATM at 12:00 — three different clients, three different asset classes, one route.

Nobody organises supply this way because nobody owns the certification, routing and validation layer across asset classes. An EV charging CPO can never build this — they only have chargers. A 3PL won't — they're contracted per client. **This is the structural arbitrage.** **[BET]**

### 5.2 AI validation is not a feature. It is the enabling technology for the whole marketplace.

The reason multi-tenant field labour doesn't exist today is **trust**. You cannot dispatch a stranger's technician against your own SLA if you cannot verify what they did without a human reviewing every photo.

> **Our position:** automated proof-of-work is what makes shared labour *possible*, not merely cheaper. Remove the human validator and the marginal cost of trusting an unknown technician collapses — which is precisely what unlocks §5.1.

This reframes the AI from "nice efficiency gain" to "the thing without which the network cannot exist." It also happens to be where the industry is heading — modern platforms already use computer-vision agents with **confidence thresholds and escalation rules** to auto-approve, expedite human review, or request a retake **[FACT]** — so we are building with the grain of the technology, not against it.

### 5.3 We sell the outcome, not the tool.

Software vendors sell licences and hope you succeed. We take **payment per intervention, against a contracted SLA, with penalties we eat if we miss.** That alignment is uncomfortable and capital-intensive and it is exactly why it is defensible: it forces us to actually solve the operational problem rather than shipping a dashboard.

It also removes the buyer's biggest objection. Nobody has budget for "another platform". Everybody has budget for "fix my chargers".

### 5.4 The data exhaust is the compounding moat, not the software.

The software is copyable. The labour graph is not. Every intervention adds: failure-mode data per asset model, technician performance history, real travel/repair durations by geography, part failure rates, site access quirks.

After N interventions we can price risk, route, and predict failures better than any single operator can for their own fleet — because we see across operators. **The network's data advantage grows superlinearly with participants.** That is the real asset being accumulated. **[BET]**

### 5.5 Expansion should be a config change, not a rebuild.

The incumbent model treats each country as a greenfield. We treat business rules, SLA definitions, field forms, SOPs and compliance requirements as **configuration** on one platform. The `field_app_config` / custom-fields / workflow-steps architecture already in the codebase is the concrete expression of this belief — the technician app renders whatever a given org, country and service type requires without a code change.

> Target state: **one platform, all markets. Entering country N+1 costs configuration and supply onboarding, not a rebuild.**

---

## 6. The model — how the network works

### 6.1 Two sides

**Demand — hardware networks**
EV charging networks · Smart locker hubs · ATMs & terminals · Micro-mobility parks · Telecom hubs · Industrial IoT lines

**Supply — trusted partners & technicians (in onboarding order)**
1. **Internal FoxNetwork team** — the cold-start answer. We do the work ourselves first.
2. **Client field staff** — absorb the client's existing technicians into the platform.
3. **Local verified independent technicians** — commission-based, region by region.
4. **Large 3PL partners** — Rhenus, Cennox and equivalents, for coverage and surge.
5. **Supply-chain partners** — e.g. W.W. Grainger-type parts supply, so interventions aren't blocked on materials.

### 6.2 The cold-start strategy (critical — this is where most marketplaces die)

We do **not** launch as an open marketplace. The sequence is deliberately supply-first and geographically narrow:

1. **One metro:** Paris and Île-de-France — the 8 départements (Paris, Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne, Val-d'Oise, Yvelines, Seine-et-Marne, Essonne). Everything outside goes to a waitlist.
2. **Our own technicians first**, so SLA delivery is never hostage to a partner's reliability during the period when reputation is being established.
3. **Multiple asset classes from day one**, because density (§5.1) is the thing being proven — a single-vertical pilot proves nothing about the core thesis.
4. **Only then** open partner supply, once there is enough demand volume in one metro to make joining worthwhile for a partner.

> **The pilot's real success metric is not revenue. It is interventions-per-technician-per-day.** That single number validates or kills the entire density thesis.

### 6.3 What the network solves that a single operator cannot

Higher asset density per geography → more interventions per technician per day → lower unit cost per intervention → the ability to offer tighter SLAs at prices a single operator's in-house team can't match → which attracts more demand → which raises density further.

That loop is the business. Everything else supports it.

---

## 7. The product — from IoT alert to payout

### 7.1 The orchestrated intervention flow

| Stage | What happens |
|---|---|
| **01 · Asset Signals** | Machines self-report faults via IoT integration (or a client raises a request manually). A live map lights up the moment something breaks. |
| **02 · Dispatch & Route** | The nearest *certified* technician is selected and routed automatically — distance, traffic, ETA, skill match and SLA window solved by the system, not a planner. |
| **03 · Execution** | The technician works a **defined SOP** for that incident type, step by step, in the field app — capturing time, parts, photos, signatures and structured outcome data. |
| **04 · Validation** | AI reviews the evidence against the SOP and returns a **confidence score**. Above threshold → auto-approved. Below → human review queue. |
| **05 · Invoice & Payout** | The client is auto-invoiced per intervention. The technician gets a verified receipt and payout. No manual reconciliation. |

### 7.2 Role-based interfaces — one truth, three views

| Interface | User | Purpose |
|---|---|---|
| **Client Dashboard** | Network operator | Fleet health, SLA compliance tracking, uptime trends, intervention history, real-time analytics. |
| **Technician App** | Field technician | Step-by-step SOP workflow, configurable capture (time, parts, photos, signature, checklist, notes), offline-capable, auto-translate. |
| **Partner Portal** | 3PL / local partner | Dispatch their own technicians, manage teams, see coverage maps, track team performance, receive payouts. |

**Design principle:** *a single source of truth, three lenses on it.* Every role sees the same underlying record, filtered and shaped to what that role needs to decide or do. No exports, no reconciliation, no "let me check with the partner."

### 7.3 The AI layer in detail

The wedge from §3.4 and §5.2, implemented in three capabilities:

1. **Visual QA against SOPs.** The system reads the SOP for the intervention type and checks the evidence against it — was the equipment installed correctly, were the bolts done properly, does the cable routing follow the standard, is there visible damage. It checks pictures *and* structured entry data.
2. **Fraud detection.** Flags reused/recycled images, timestamps inconsistent with the visit window, and GPS coordinates that don't match the site. This is what makes a technician you have never met safe to dispatch.
3. **Contextual SOPs.** Real-time guidance surfaced to the technician for their specific situation — raising first-time-fix rate and reducing the skill floor required per asset type (which feeds cross-skilling, §5.1).

**The mechanism that matters:** a **confidence score with a client-agreed threshold**. Above it, auto-approve and invoice. Below it, escalate to human review. The threshold is a commercial parameter negotiated per client and tuned with evidence over time — which means the *validation cost curve is a dial we control*, not a fixed headcount.

---

## 8. The value equation

### 8.1 The linear trap

The traditional model requires **linear hiring as you scale**: double the assets, double the planners, validators and coordinators. Manual processes + fragmented 3PLs + blind validation ⇒ operational cost rises in lockstep with asset count.

FoxNetwork's claim is that automated dispatch, AI validation and unified data **flatten that curve**: you scale assets without scaling headcount.

> If you take one image away from this document, take this: **a rising cost curve versus a nearly flat one, with the gap widening as asset count grows.** That gap is the value we capture.

### 8.2 The numbers we currently claim — and their status

| Claim | Status | Note |
|---|---|---|
| 60–90% reduction in manual data validation and entry | **[INTERNAL]** | Anchored on the 10–15% validation-headcount observation (§3.4). Needs one design partner to confirm before it becomes a public number. |
| 20–40% faster deployment cycles via automated routing | **[INTERNAL]** | Unvalidated. |
| Up to ~60% lower total operating cost vs. manual/fragmented ops | **[INTERNAL]** | The headline claim. Currently the least-evidenced and most-quoted number in our materials. **Priority to validate.** |
| Near-zero linear headcount growth as assets scale | **[BET]** | This is the thesis, not a measurement. |
| One platform for all markets — no rebuild per country | **[BET]** | Architecturally supported today; commercially unproven beyond France. |

> **Discipline note.** The founder memo's headcount figure was stated ambiguously ("5 to 10% less headcount" / "up to 60% of your cost"). We should settle on **one** defensible formulation and use it everywhere. Recommended interim framing until a pilot produces real data: *"we target elimination of the 10–15% of ops headcount currently spent on validating field work, and a materially flatter cost curve as your asset base grows."* That is specific, credible, and directly falsifiable — which makes it more persuasive than "60%".

---

## 9. Go-to-market — the consulting-first model

We are deliberately **not** a self-serve SaaS. We land through operational credibility, not a signup form.

### Stage 1 — Free discovery workshops
One to three sessions, no cost, no commitment. We invest the time to map their assets, workflows, business rules, pain points, and what they actually want from a partnership.
**They receive:** a full operational assessment and a tailored execution roadmap.
**We receive:** the ground truth that makes the product right — and, in the early days, the raw material for the roadmap itself.

### Stage 2 — Pay per intervention
No licence fee, no lock-in. The client pays per intervention, priced by the SLA they choose. Software access is included.

| Tier | Response window | Price |
|---|---|---|
| Relaxed | Within 5 business days | €150 |
| Standard | Within 72 hours | €200 |
| **Urgent** *(most picked)* | Within 24 hours | €300 |
| Emergency | Within 4 hours, 24/7 | €420 |

One price gets us on site with the **first hour included**; additional time is billed hourly. Every tier includes live dashboard tracking and photo evidence on close.

> **Why this pricing shape works:** it is the same unit the client already budgets in (a truck roll), it makes us directly comparable to their incumbent 3PL, and it removes the "new platform, new budget line" objection entirely. The SLA tier — not the feature list — is what the client chooses. We are selling *time-to-site*, which is the only thing they actually care about.
>
> **The risk it creates:** flat-rate-per-intervention with an included hour invites adverse selection (clients route their hardest jobs to us) and exposes us to SLA penalty risk before supply is dense. Watch average-minutes-on-site by client obsessively during the pilot.

### Stage 3 — Long-term partnership
Once trust is established: agreed penalties, **recurring preventive-maintenance contracts** on the installed base (predictable ARR, not just reactive revenue), volume-adaptive pricing, dedicated success team, priority roadmap influence.

> Preventive maintenance is the strategic prize here. Reactive interventions are lumpy and demand-driven; a preventive contract on N assets is recurring, schedulable revenue that *also* lets us pre-plan routes and raise technician utilisation. **Reactive wins the logo; preventive builds the P&L.**

### The continuous improvement cycle

Because we will have **few, high-value design partners** rather than ten thousand self-serve accounts, every client is a product input:

**Discovery** (workshops, operational mapping) → **Solution Design** (architecture, integrations, workflows) → **Pilot & Deploy** (phased rollout, training, go-live) → **Measure** (KPIs, SLA tracking, cost analysis) → **Optimize** (process improvement, scaling, new regions) → back to Discovery.

Improvements built for one client get generalised and shipped to all clients and partners. *Deployment is Day 1; we optimise Day 2 through Day 10,000.*

---

## 10. What exists today — the build reality

A pnpm/Turbo monorepo. Next.js 16 + React 19 + Tailwind 4 + Supabase (Postgres, Auth, RLS). Three apps: `apps/web` (marketing, FR/EN), `apps/platform` (staff dashboard *and* client portal), and `apps/field` (technician, Expo — not built yet).

### 10.1 Shipped

| Surface | Route | State |
|---|---|---|
| Marketing site | `/` | Maintenance-as-a-Service Europe positioning, SLA pricing, Paris/IdF coverage, quote capture |
| Pitch deck | `/pitch` | Full investor/client narrative, PDF export |
| Quote / waitlist | `/quote` | → `quote_requests` |
| Client portal | `/client/dashboard` | Client raises + tracks intervention requests, picks SLA tier, sees price locked before submit |
| Ops dashboard | `/dashboard` | Locations, Projects, Actions, Assets, Members, Requests inbox, Organization settings |
| Configuration | `/dashboard/settings/*` | Custom fields, field options, workflow steps, **Field App config** |
| Technician app (web) | `/technician` | Job list + detail, renders per-org configured fields |

### 10.2 The data model (the shape of the domain)

```
organizations ─┬─ profiles (role: admin|manager|technician|viewer, fox_staff flag)
               ├─ locations (type, status, client, contacts, geo)
               │    └─ projects (deployment|survey|maintenance|inspection|upgrade|remediation)
               │         └─ actions   ← the intervention / work order
               │              ├─ action_entries  ← one per technician visit
               │              └─ approval_status ← Fox staff accept/reject
               ├─ assets (type, status, condition, criticality, serial)
               ├─ custom_field_definitions · configurable_field_options
               ├─ workflow_steps (SOP templates per project+action type)
               └─ field_app_config (per action type: card fields, detail fields,
                                    enabled modules, display mode)
```

**Key architectural choices, and what they encode:**

- **`actions` are the atomic unit** — the intervention. Everything (SLA, price, validation, invoice, payout) hangs off it.
- **`action_entries` are per-visit, not per-action** — because a job can take two visits, and honest data about partial/unsuccessful outcomes (`entry_outcome`: successful | partial | unsuccessful | cancelled) is exactly the feedback loop §3.3 is missing. It carries `submission_location` (GPS), `submitted_at`, `attachments`, `technician_signature` and `sync_status` (synced | pending | conflict) — the offline-first and fraud-detection primitives are already in the schema.
- **`workflow_steps` are the SOP layer** — configurable per (project type, action type), which is what the AI validates against.
- **`field_app_config`** — per org, per action type: which fields appear, which modules the technician fills (time, travel, parts, signatures, checklist, photos, auto-translate, notes). **This is §5.5 made concrete: a new country or client is a config row, not a release.**
- **`fox_staff` flag + RLS bypass** — multi-tenant by default, with Fox operating across all client orgs for dispatch. The marketplace topology is already in the permission model.
- **Multi-tenancy via `organization_id` + RLS on every table** — non-negotiable; the whole thesis depends on many clients coexisting safely.

### 10.3 Not yet built (the honest gap between the deck and the repo)

- **IoT signal ingestion** — Stage 01 of the orchestration flow does not exist. Requests are currently created manually by clients. This is the single largest deck-to-reality gap.
- **AI validation engine** — no confidence scoring, no visual QA, no fraud detection in code. Claude is currently used only for company enrichment at signup.
- **Automated dispatch & routing** — assignment is manual today; no geo-routing, ETA or skill-matching engine.
- **Partner Portal** — no partner-facing surface exists.
- **Native technician app** — an Expo app is specified in the PRD; the current technician surface is web.
- **Invoicing & payouts** — no billing or payout rails.

> Nothing here is a criticism — it is the correct build order (own the record of work before automating it). But every one of these should be named plainly in investor and client conversations. Selling Stage 01 and Stage 04 as live would be the fastest way to lose the design partners we depend on.

---

## 11. Sequencing — what to build in what order, and why

The order follows the dependency chain of the thesis, not feature appeal.

**Phase 1 — Own the record of work.** *(largely done)*
Every intervention, visit, photo, and outcome captured in structured form. Without this there is no data to validate, no metrics to sell, no flywheel. Config-driven so it survives contact with a second client.

**Phase 2 — Prove the density number.** *(next)*
Run Paris/IdF with our own technicians across ≥2 asset classes. Instrument relentlessly: **interventions per technician per day**, travel time share, first-time-fix rate, SLA hit rate, minutes on site by client. This phase either validates §5.1 or forces a strategy change. Nothing further should be built at scale until this number is known.

**Phase 3 — Automate validation.** *(the wedge)*
Confidence scoring against SOPs, fraud detection, threshold-based auto-approval. This is what converts the pilot into a business with non-linear economics, and it is the precondition for trusting non-Fox labour.

**Phase 4 — Automate dispatch + ingest signals.**
Geo-routing and skill-matching, then IoT integration so Stage 01 becomes real. Order matters: routing is valuable even with manually-raised requests; signal ingestion without routing just produces alerts nobody can act on.

**Phase 5 — Open the supply side.**
Partner Portal, partner onboarding, certification, payouts. Only viable once §Phase 3 makes external labour trustworthy and §Phase 2 makes joining worth a partner's time.

**Phase 6 — Second geography.**
The real test of §5.5. Success is measured by *how little code changes*.

---

## 12. Risks — what would have to be true, and what could kill us

| Risk | Why it's serious | How we test / mitigate |
|---|---|---|
| **Density thesis is wrong** | If cross-asset routing doesn't materially raise interventions/tech/day, we're a 3PL with better software and no cost advantage. | Phase 2 measures it directly. Kill criterion, not a vanity metric. |
| **Certification & regulatory ceilings on cross-skilling** | EV high-voltage work needs electrical qualification (in France, *habilitation électrique*); ATM work needs security vetting; telecom sites need working-at-height certification. "One tech, any asset" may be legally impossible for some pairs. | Map the certification matrix per asset class **before** promising cross-skilling. Design around *compatible clusters* (e.g. lockers + kiosks + micro-mobility) rather than universal fungibility. |
| **OEM / warranty lock-in** | Many chargers, ATMs and lockers are under OEM service contracts that forbid third-party intervention without voiding warranty. | Qualify this in discovery workshop #1. Target out-of-warranty estates and multi-vendor fleets first. |
| **SLA penalty exposure before supply density** | We eat the cost when we miss. Selling 4-hour emergency coverage on thin supply is a balance-sheet risk, not just a service risk. | Sell Emergency tier only where supply is proven. Cap emergency volume per geography contractually. |
| **Two-sided cold start** | Classic marketplace failure mode. | Answered by the supply-first, one-metro, own-technicians strategy (§6.2). Do not deviate from it under revenue pressure. |
| **Adverse selection in flat-rate pricing** | Clients route their worst jobs to a fixed-price provider. | Track minutes-on-site per client from day one; enforce the hourly overage; reprice or restructure at renewal. |
| **Clients won't share IoT/asset data** | Stage 01 and the data moat both depend on integration access. | Make the client dashboard valuable enough on manually-raised requests alone that integration becomes *their* ask, not ours. |
| **AI validation false-negatives destroy technician trust** | Wrongly rejected work means unpaid technicians, which kills supply faster than anything. | Threshold starts conservative (bias toward human review), tightens with evidence. Always an appeal path. Never auto-reject payment on AI alone. |
| **Incumbents copy the software** | Cennox/Rhenus have the labour and the client relationships already. | Speed, plus the fact that the moat is the multi-client data graph (§5.4), which a single-client 3PL structurally cannot assemble. |
| **Concentration risk in design partners** | A handful of clients means a lost logo is existential. | Deliberate trade-off for product quality. Manage by keeping the pilot cohort ≥3 and across ≥2 asset classes. |

---

## 13. Canonical vocabulary

Use these terms consistently in code, UI, deck and conversation. Ambiguity here compounds.

| Term | Meaning |
|---|---|
| **Action / Intervention** | The atomic unit of work. One job at one site. The thing that is priced, dispatched, validated and invoiced. |
| **Entry** | One technician visit against an Action. An Action may need several. |
| **Asset** | The physical device being serviced (charger, locker, ATM, sensor). |
| **Location / Site** | The place assets live. |
| **Network operator / Client** | The company that owns the hardware network. Our demand side. |
| **Partner** | An organisation supplying technicians (3PL or local). Our supply side. |
| **Technician** | The person performing the intervention, regardless of employer. |
| **SLA tier** | The response-time commitment the client purchases. Determines price. |
| **Confidence score** | The AI's certainty that the submitted evidence proves the SOP was correctly executed. |
| **Threshold** | The client-agreed confidence level above which work auto-approves. A commercial parameter. |
| **Density** | Serviceable assets per technician per geography. The core metric of the business. |
| **Fox staff** | Us. Cross-org operators with dispatch authority over every client org. |

---

## 14. The five questions this document exists to answer

Anyone joining the project should be able to answer these from this file alone.

1. **What are we building?** A two-sided orchestration network for physical infrastructure field operations — software plus labour plus guaranteed outcome — starting with maintenance in Paris.
2. **Why does it need to exist?** Because the asset base exploded, utilisation is low, opex now decides profitability, and the operating layer is still Excel, WhatsApp and blind manual validation.
3. **Why hasn't it been done?** Because software vendors don't bring labour, marketplaces don't guarantee quality, and 3PLs won't give up their data. Each solves a third.
4. **What's our unfair angle?** Asset-agnostic density within a geography, made possible by AI proof-of-work that removes the human trust bottleneck — and a multi-client data graph no single-client provider can assemble.
5. **What kills us?** If interventions-per-technician-per-day doesn't rise when we route across asset classes, the thesis is wrong. Everything else is a solvable problem.

---

## Sources

**Market & sector data**
- [EU EV charging infrastructure reaches 1.1 million public chargers — GreentechLead](https://greentechlead.com/electric-vehicle/eu-ev-charging-infrastructure-surpasses-electric-vehicle-growth-reaches-1-1-million-public-chargers-54286)
- [Charging infrastructure has far outpaced EV sales in all but one EU country — Transport & Environment](https://www.transportenvironment.org/articles/charging-infrastructure-has-far-outpaced-ev-sales-in-all-but-one-eu-country-analysis)
- [Only one EU country misses AFIR charging target — electrive](https://www.electrive.com/2026/07/20/only-one-eu-country-misses-afir-charging-target/)
- [EV Charging Regulations in 2026: What CPOs Need to Implement — Codibly](https://codibly.com/blog/articles/ev-charging-regulations-2026-implementation-guide)
- [Q1 2026 Sweden & Norway EV Charging Reliability Report — Symbioen](https://symbioen.com/reports/Q1-2026)
- [Reliability at scale: what CPOs need from EV service in 2026 — EV Infrastructure News](https://www.evinfrastructurenews.com/public-charging/reliability-at-scale-what-all-charge-point-operators-need-from-ev-service-and-maintenance-in-2026)
- [Out-of-home delivery 2026: the networks are being reshaped — nshift](https://nshift.com/blog/out-of-home-delivery-2026)
- [Out-of-Home Delivery Europe: PUDO & Parcel Locker Guide 2026 — Zineps](https://www.zineps.com/blog/out-of-home-delivery-europe-pudo-parcel-lockers-2026)
- [Out-of-Home Delivery: 2026 Market Outlook & Trends — ShippyPro](https://www.shippypro.com/blog/en/out-of-home-delivery-market-study)

**Competitive landscape**
- [Field Service Management Market Size & Share 2026–2035 — GMInsights](https://www.gminsights.com/industry-analysis/field-service-management-market)
- [Field Service Management Market Size, Share & Trends — Fortune Business Insights](https://www.fortunebusinessinsights.com/field-service-management-fsm-market-102215)
- [Field Service Management Software in the US, 2026 — IBISWorld](https://www.ibisworld.com/united-states/market-size/field-service-management-software/5393/)
- [Field Nation — official platform information](https://fieldnation.com/llm-info)
- [Cennox — maintenance and multi-vendor field services](https://www.cennox.com/)

**AI validation / proof-of-work**
- [When a Photo Is the Evidence: Automating Field-Service QA with AI-Powered Inspection — MyMobileLyfe](https://www.mymobilelyfe.com/artificial-intelligence/when-a-photo-is-the-evidence-automating-field-service-qa-with-ai-powered-inspection/)
- [The 2026 Guide to Digital Proof of Work for Contractors — Serfy](https://serfy.io/blog/the-2026-guide-to-digital-proof-of-work-for-contractors)
- [Best AI Inspection Software 2026: Photo, Video and Voice Verification — QuantumByte](https://quantumbyte.ai/articles/best-ai-inspection-software)

**Internal**
- Founder voice memo, 31 July 2026 (`Voice 260731_171903`)
- `/pitch` deck — the standalone `fox-pitch` repository
- `docs/ARCHITECTURE.md`, `docs/PRD-field-app-configuration.md`
- Supabase migrations `001`–`028`
