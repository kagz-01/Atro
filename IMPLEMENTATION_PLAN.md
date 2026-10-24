# ATRO Platform — Implementation Plan

## Current State

### Existing Navigation
```
Work | Services | Zones | Process | Insights | About
```

### Existing Pages
- `/` — Landing page (hero, trust, zones, work, cost, process, services, insights, CTA)
- `/projects` — Project grid
- `/projects/$slug` — Project detail
- `/services` — Service grid
- `/services/$slug` — Service detail
- `/zones` — Zone map + list
- `/zones/$slug` — Zone detail
- `/process` — 8-step process
- `/insights` — Articles grid
- `/insights/$slug` — Article detail
- `/about` — About page
- `/start` — Enquiry form
- `/privacy`, `/terms` — Legal

---

## Proposed Navigation (Phase 1→3)

### Primary Nav (Desktop)
```
Work | Tools | Services | Zones | Process | Insights | About
```

### What changes:
| Current | New | Why |
|---------|-----|-----|
| — | **Tools** (new) | Houses AI Cost Calculator, Plan Scanner, Material Tracker |
| Work | Work | Stays — portfolio/projects |
| Services | Services | Stays — service offerings |
| Zones | Zones | Stays — coverage intelligence |
| Process | Process | Stays — 8-step journey |
| Insights | Insights | Stays — articles/learn |
| About | About | Stays — company info |

### Mobile Nav
Same items, hamburger menu. Tools gets a "New" badge.

---

## Phased Roadmap

### Phase 1 — Landing Page Upgrade (Week 1-2)
**Goal:** Make the homepage interactive, not just informational.

| # | Feature | Route/Location | Effort | Details |
|---|---------|---------------|--------|---------|
| 1.1 | Hero → 3/4 viewport | `/` Hero section | Done | `h-[75svh]` — already implemented |
| 1.2 | AI Cost Calculator v2 | `/` CostTeaser section | Medium | Upgrade slider → upload sketch, select params, get instant range |
| 1.3 | Interactive Zone Map | `/zones` + `/` ProblemAndZone | Medium | SVG Kenya map with clickable counties, real-time availability |
| 1.4 | Trust Strip Enhancement | `/` TrustStrip | Low | Add counters (projects completed, years, zones) with animation |
| 1.5 | Live Project Teaser | `/` (new section) | Medium | Show 1-2 ongoing projects with latest photo + progress % |

**Deliverables:**
- Updated hero section (done)
- Enhanced cost calculator with more inputs
- Animated trust counters
- "Live from site" section showing ongoing work

---

### Phase 2 — Tools Hub (Week 3-5)
**Goal:** Build the differentiator — interactive tools no Kenyan construction site offers.

| # | Feature | Route | Effort | Details |
|---|---------|-------|--------|---------|
| 2.1 | Tools Landing Page | `/tools` | Low | Hub page listing all tools with descriptions |
| 2.2 | AI Cost Calculator (Full) | `/tools/cost-calculator` | High | Multi-step wizard: type → zone → area → finish → timeline → estimate with BOQ breakdown |
| 2.3 | Material Price Tracker | `/tools/material-prices` | Medium | Live cement, steel, timber, ballast prices by county. Source: EPRA + manual updates |
| 2.4 | House Plan Scanner | `/tools/plan-scanner` | High | Upload floor plan image → AI detects rooms, calculates areas, estimates cost |
| 2.5 | BOQ Generator | `/tools/boq-generator` | High | Input parameters → generate downloadable Bill of Quantities PDF |

**Deliverables:**
- `/tools` hub page
- 4 interactive tools
- Material price data pipeline

---

### Phase 3 — Client Portal (Week 6-9)
**Goal:** Give clients (especially diaspora) a command center.

| # | Feature | Route | Effort | Details |
|---|---------|-------|--------|---------|
| 3.1 | Client Dashboard | `/dashboard` | High | Auth-gated: project status, milestones, documents, messages |
| 3.2 | Live Project Tracker | `/dashboard/projects/$id` | High | Photo timeline, progress %, milestone approvals, decision log |
| 3.3 | Document Vault | `/dashboard/documents` | Medium | BOQ, drawings, contracts, approvals — all in one place |
| 3.4 | Diaspora Command Center | `/dashboard/diaspora` | Medium | Timezone-aware scheduling, WhatsApp integration, video call booking |
| 3.5 | Payment Tracker | `/dashboard/payments` | Medium | Milestone-based payment schedule, M-Pesa integration, receipts |

**Deliverables:**
- Auth system (Better Auth — already wired)
- Client dashboard with 5 modules
- Mobile-responsive portal

---

### Phase 4 — Platform Features (Week 10-14)
**Goal:** Transform from website to platform.

| # | Feature | Route | Effort | Details |
|---|---------|-------|--------|---------|
| 4.1 | Contractor Marketplace | `/marketplace` | High | Vetted builders with real project data, ratings, availability |
| 4.2 | Project Matching | `/marketplace/match` | High | AI matches client brief to best-fit contractors by zone, type, budget |
| 4.3 | Dispute Evidence Layer | `/dashboard/evidence` | Medium | Timestamped photos, decisions, approvals — legally defensible |
| 4.4 | Progress API | API route | High | Structured data for mobile apps, WhatsApp bots, third-party integrations |
| 4.5 | Admin Console | `/admin` | Medium | Manage projects, contractors, material prices, content |

**Deliverables:**
- Marketplace with contractor profiles
- AI matching engine
- Evidence/timeline system
- Admin tools

---

## Site Map (Final State)

```
/                           — Landing page (interactive)
/tools                      — Tools hub
/tools/cost-calculator      — AI cost estimation wizard
/tools/material-prices      — Live material prices by county
/tools/plan-scanner         — Upload plan → get estimate
/tools/boq-generator        — Generate BOQ from parameters
/work                       — Project grid (was /projects)
/work/$slug                 — Project detail with timeline
/services                   — Service grid
/services/$slug             — Service detail
/zones                      — Interactive zone map
/zones/$slug                — Zone detail with FAQs
/process                    — 8-step journey
/insights                   — Articles grid
/insights/$slug             — Article detail
/about                      — About ATRO
/start                      — Enquiry form
/dashboard                  — Client portal (auth-gated)
/dashboard/projects/$id     — Live project tracker
/dashboard/documents        — Document vault
/dashboard/payments         — Payment schedule
/dashboard/diaspora         — Diaspora command center
/marketplace                — Contractor marketplace
/marketplace/match          — AI project matching
/admin                      — Admin console
/privacy                    — Legal
/terms                      — Legal
```

---

## Navigation Component Updates

### `src/lib/site.ts`
```typescript
export const NAV = [
  { to: "/work" as const, label: "Work" },
  { to: "/tools" as const, label: "Tools", badge: "New" },
  { to: "/services" as const, label: "Services" },
  { to: "/zones" as const, label: "Zones" },
  { to: "/process" as const, label: "Process" },
  { to: "/insights" as const, label: "Insights" },
  { to: "/about" as const, label: "About" },
];
```

### Header Actions
```typescript
// Right side of header
<Button variant="outline" to="/tools">Tools</Button>  // or icon
<Button variant="primary" to="/start">Start a project</Button>
// + Diaspora toggle (existing)
```

---

## Technical Architecture

### New Dependencies Needed
| Package | Purpose | Phase |
|---------|---------|-------|
| `@uppy/react` | File upload for plan scanner | 2 |
| `react-pdf` | PDF rendering for BOQ | 2 |
| `recharts` | Price charts, progress charts | 1-2 |
| `@radix-ui/react-dialog` | Tool modals | 1-2 |
| `@radix-ui/react-tabs` | Tool interfaces | 2 |
| `date-fns` | Date formatting (already installed) | — |

### Data Sources
| Data | Source | Update Frequency |
|------|--------|-----------------|
| Material prices | EPRA + manual | Weekly |
| Zone availability | Internal (ATRO team) | Real-time |
| Project progress | Internal (site team) | Weekly |
| Contractor profiles | Internal vetting | Monthly |

### API Routes (Phase 3-4)
```
POST /api/estimate          — Cost calculation
POST /api/scan-plan         — Plan upload + analysis
GET  /api/material-prices   — Current prices by county
POST /api/boq/generate      — BOQ generation
GET  /api/projects/:id/status — Live project status
POST /api/enquiry           — Form submission
```

---

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Hero 3/4 viewport | High | Low | ✅ Done |
| AI Cost Calculator v2 | High | Medium | P1 |
| Interactive Zone Map | High | Medium | P1 |
| Live Project Teaser | High | Medium | P1 |
| Tools Hub page | High | Low | P2 |
| Material Price Tracker | Medium | Medium | P2 |
| Client Dashboard | High | High | P3 |
| Live Project Tracker | High | High | P3 |
| Contractor Marketplace | High | High | P4 |
| Plan Scanner | Medium | High | P4 |

---

## Success Metrics

| Metric | Current | Target (6 months) |
|--------|---------|-------------------|
| Time on site | ~2 min | 4+ min |
| Enquiry conversion | ~2% | 5% |
| Tool usage | 0 | 30% of visitors |
| Diaspora clients | ~20% | 40% |
| Return visitors | ~15% | 35% |

---

## Next Actions

1. **This week:** Upgrade Cost Calculator (Phase 1.2)
2. **Next week:** Interactive Zone Map + Trust counters (Phase 1.3, 1.4)
3. **Week 3:** Tools Hub page + Material Price Tracker (Phase 2.1, 2.3)
4. **Ongoing:** Add content (projects, articles) to populate the platform

---

## Dashboard Role Redesign

### Purpose and current baseline

The dashboard work is a role redesign of the existing `/admin` studio console and
`/portal` client portal—not four new applications. The current code has:

- One studio console with `staff` and `admin` roles (`/admin`).
- One client portal with local and diaspora presentation variants (`/portal`).
- A shared dashboard shell, client project sections, staff project tools, and
  server-side ownership/staff checks already in place.

The current role split does not yet represent the real office/second-in-command
job, and the project portfolio has no explicit operational lifecycle beyond
milestone progress. This plan separates the four experiences while reusing the
existing project records and workflows. It does not imply a new auth system or
four separate data models.

### HCI principles for all four dashboards

1. **Match the user's real work.** Use language and navigation that reflect the
   person's job: portfolio oversight, office coordination, or managing one's
   own build.
2. **Keep status and next actions visible.** Put the most consequential current
   state and pending work on the first screen. Counts must open the records they
   describe; otherwise they create a dead end rather than reducing memory load.
3. **Prefer recognition over recall.** Keep project reference, client, stage,
   progress, money state, and responsible person visible where work is reviewed.
   Do not make users remember values from another page.
4. **Use progressive disclosure and chunking.** Show a concise summary first,
   then reveal detailed ledgers, evidence, forms, and administration when needed.
   Group related work into understandable sections rather than presenting a
   long undifferentiated menu (Miller's Law).
5. **Limit top-level choices.** Hick's Law in `.agent/skills/frontend-design/ux-psychology.md`
   recommends roughly 5–7 main navigation choices. The client feature inventory
   below is not a commitment to nine or more top-level sidebar items: group it
   into a small set of destinations such as Overview, Build, Decisions & changes,
   Money, Records & messages, After handover, and Profile. Keep diaspora guidance
   contextual within the same portal rather than adding another permanent tab.
   Validate labels and grouping with clients before locking navigation.
6. **Prevent high-impact errors.** Separate review from irreversible or
   privileged actions; explain consequences and require confirmation for
   financial, access, and lifecycle transitions. Client actions must be
   attributable and scoped to their own projects.
7. **Support user control and recovery.** Make the current project and role
   obvious, use familiar interaction patterns (Jakob's Law), provide clear back
   paths, and give prompt, visible feedback after writes or failures.
8. **Design for real use conditions.** Critical tasks must work on mobile,
   keyboard and assistive technology. Use adequately sized touch targets (the
   frontend-design guidance recommends 44px minimum for mobile), visible focus,
   readable contrast, and status text/icons in addition to color.
9. **Do not imply evidence the system does not have.** A milestone percentage is
   not proof of physical completion; a recorded payment is not a bank
   reconciliation; a portfolio warning is not a professional inspection.

### Role 1 — Owner / Director ("the boss")

**Primary job:** oversee the whole business, spot exceptions, make reserved
decisions, and understand the status of every project without doing every
operational task.

**Landing view:** portfolio summary with active projects, build-complete
projects, open exceptions, and headline financial exposure. Samples are
visibly separate from live business records.

**Proposed navigation**

| Tab | Purpose | Why it belongs |
|-----|---------|----------------|
| **Portfolio** | All live projects, with Active, Build complete, and All live filters; open a project from any list | The owner's core task is oversight across projects, not performing a single project workflow |
| **Needs attention** | Blocked stages, delayed/on-watch work, client decisions, unread client messages, visit requests, certified payments awaiting release, and client sign-offs | Exception-focused triage reduces the effort of scanning every project |
| **Enquiries** | Studio-wide lead funnel and unresolved follow-up | Shows whether future work is entering and where it needs a decision |
| **Business** | Contracted, certified, paid, retention, projected completion, and enquiry trends | Gives the owner a business-level view while preserving project-level drill-down |
| **Access** | Staff access and invitations; owner-only permission changes | Limits security administration to the accountable role |

**When a project is opened**, present a project command centre before the existing
operational accordions:

- Identity: project title/reference, client, location, project lead, and lifecycle
  state.
- Delivery: stage, progress, programme position, blocked milestones, and recent
  activity.
- Decisions: items waiting on the client or studio, with ownership and age.
- Financial position: contract, certified-to-date, paid, certified-unreleased,
  retention, and projected-at-completion values.
- Client relationship: messages waiting, unread status, visit requests, and
  last client activity/view where available.
- Records: links to milestones/evidence, approvals, selections, variations,
  documents, defects, delivery log, and full payment ledger.

The owner may review business-wide information, decide exceptional matters, and
perform explicitly admin-only financial/access actions. Follow-up responsibility
remains admin-owned unless ATRO later introduces a distinct, authorized delivery
coordination model. The interface must not portray the owner as the certifying
quantity surveyor or a substitute for a qualified site professional.
Professional certification and site verification remain recorded as their own
accountable actions.

### Role 2 — Operations / Office Manager ("second in command")

**Primary job:** coordinate office work and ensure that enquiries, communication,
appointments, records, and follow-ups do not fall through the cracks.

This is a proposed distinct role, but the current product decision is to keep
project follow-up responsibility at the admin level rather than assign a
per-project coordinator. The current database only distinguishes `staff` and
`admin`; implementation must introduce an explicit role/capability model before
claiming the office manager has a safe, distinct permission set.

**Proposed navigation**

| Tab | Purpose | Why it belongs |
|-----|---------|----------------|
| **Today** | Assigned follow-ups, late or due tasks, incoming messages, visit requests, and scheduled meetings | Starts with the next action rather than business-wide analytics |
| **Enquiries** | Intake, contact details, status, owner/assignee, next follow-up, and notes | Matches the recurring office lead-management workflow |
| **Projects** | Searchable project directory with stage, client, next date, and attention indicators | Lets the office locate records quickly without making them the business owner |
| **Calendar** | Calls, visits, reminders, and coordination appointments | Gives scheduling a clear home instead of burying it in project detail |
| **Communications** | Client threads, unread/reply queue, delivery status, and routine update sending | Makes communication ownership and waiting states explicit |
| **Records** | Project documents and administrative completeness/checklists | Supports reliable records and follow-through |
| **Team** (optional, confirm scope) | Staff directory, onboarding/access requests, availability, and HR tasks that ATRO actually wants to digitise | Avoids adding sensitive HR functions by assumption |

**Project access:** view project status and client context; coordinate visits and
calls; send routine communications; maintain administrative records; flag
exceptions for the owner. The default office role must not certify payments,
release retention, issue or void financial records, change owner-level access,
or mark physical work complete unless ATRO explicitly delegates a narrowly
defined capability. Private employee/HR records require separate authorization
and should not be bundled into project access.

### Role 3 — Kenyan client

**Primary job:** understand what is happening on their project, review evidence,
make required decisions, and coordinate locally with ATRO.

**Proposed navigation** (retain one secure client portal and existing features):

| Tab | Purpose | Why it belongs |
|-----|---------|----------------|
| **Overview** | Current stage, progress, next call, local site context, and items needing the client's action | Answers "where is my build and what do I need to do?" immediately |
| **Milestones** | Planned/active/completed stages, evidence, and client sign-off where the studio marked it ready | Puts progress and proof together |
| **Decisions** | Options, cost impact, response state, and recorded choice | Makes client decisions explicit and auditable |
| **Money** | Contract and payment ledger, certified amounts, receipts, retention, and local payment instructions | Supports informed review without presenting an uncertified amount as payable |
| **Documents** | Contract, drawings, approvals, certificates, reports, and receipts | Provides a predictable record location |
| **Messages** | Project-specific conversation and response status | Keeps communication attached to the relevant build |
| **Selections & changes** | Finish/material selections and proposed variations | Separates choices and changes from routine progress |
| **After handover** | Defect reporting, inspection/rectification status, and care plan | Preserves a route back to ATRO after practical completion |
| **Profile** | Client details and communication preferences | Allows clients to maintain their own contact information |

Local emphasis: site/county context, visit requests, local-time scheduling, and
locally applicable payment instructions. Client visibility and write permissions
stay limited to the client's own projects.

### Role 4 — Diaspora client

**Primary job:** do the same client work remotely and asynchronously, with less
dependence on being awake during Kenya business hours or physically visiting
site.

Use the same underlying client tabs, records, and ownership checks as the Kenyan
client; do not fork a separate dashboard or reduce access to project evidence.
Adapt the presentation and priority:

| Tab | Diaspora emphasis |
|-----|-------------------|
| **Overview** | Kenya and client-local clocks; updates since last visit; decisions/messages waiting; next call in the client's time |
| **Milestones** | Dated, photo-rich evidence and clear site-team context |
| **Decisions** | Clear options, cost impact, response deadline/context, and confirmation of the recorded choice |
| **Money** | International transfer instructions, reference to quote, certification state, receipts, and retention |
| **Documents** | Downloadable, consistently named records suitable for sharing with a bank or adviser |
| **Messages** | Asynchronous project thread with visible reply expectations |
| **Selections & changes** | Remote review/approval, alternatives, cost and schedule implications |
| **After handover** | Report defects remotely and track the studio's response |
| **Abroad** (contextual/help) | Time-zone-aware meeting preparation, remote visit/walkthrough guidance, and the existing abroad checklist |

Diaspora status changes time, communication, and payment context—not the
client's ownership scope or the evidence required for a decision.

### Shared project lifecycle (planned; do not infer closure from progress alone)

The current record has milestone progress, `on_track`, and deleted state, but no
formal project lifecycle. Add explicit, owner-governed lifecycle states only
after their meanings and transitions are agreed:

1. **Pre-construction** — preparation, approvals, and registration underway.
2. **Active build** — construction work is in progress.
3. **Handover** — completion inspection and handover records are underway.
4. **Defects period** — handed over, with post-handover obligations still open.
5. **Closed** — close-out criteria met and no active obligations remain.
6. **Archived** — retained for records, not part of current operational queues.

“Build complete” is derived only when at least one tracked milestone exists and
every tracked milestone is marked complete. It is not a lifecycle state and
does not automatically mean Handover, Closed, or Archived. Samples remain a
separate source classification and cannot be transitioned.
Existing projects start from the conservative Active build baseline; new
projects begin in Pre-construction. No historical handover or close-out is
inferred from milestone percentage or legacy stage text.

Routine staff may move a project through Pre-construction, Active build,
Handover, and Defects period. Handover requires every tracked milestone to be
complete; starting the defects period requires a future end date. Closing and
archiving are admin-only. Close-out requires an ended defects period, no open
defect reports, and no held retention. Each transition requires a reason and is
atomically recorded with the prior/new state, actor, and timestamp.

### Delivery sequence — build the boss experience step by step

| Step | Deliverable | Status / exit condition |
|------|-------------|-------------------------|
| 1 | Owner portfolio: separate active, build-complete, live, and sample views; open any project | **Implemented in `/admin`**; build-complete requires all tracked milestones complete |
| 2 | Owner project command centre: delivery, programme, financial position, attention, and recent activity before detailed tools | **Implemented for admins**; existing operational accordions remain available |
| 3 | Replace progress-only completion with agreed lifecycle definitions and safe transition rules | **Implemented in `/admin`**; separate Closed and Archived views, guarded transitions, admin-only close/archive, and an auditable transition record |
| 4 | Make owner exception items actionable and link each to its source record | **Implemented in `/admin`**; attention items open, scroll to, and focus their relevant project sections; blocked-work review preselects the blocked milestone, and certified payments link to their recorded ledger entries |
| 5 | Confirm the operating model for delivery follow-up and keep it explicit | **Implemented as admin-owned responsibility**; no per-project coordinator is assigned and the admin remains accountable for cross-project follow-up |
| 6 | Separate owner-only and staff navigation while preserving role guards | **Implemented in `/admin`**: staff land on Today and cannot see Portfolio or Access; the business overview endpoint requires admin and staff receive only operational queue data. A distinct office-manager capability model is still unimplemented |
| 7 | Build the staff Today/Enquiry/Projects workflow | **Production-oriented first pass implemented in `/admin`**: Today combines studio follow-up, new enquiry status, project navigation, and personal claimed enquiries/chases/notes; Projects has a searchable coordination directory with a needs-follow-up filter and no owner portfolio money columns; Enquiries supports server-side search/filtering across the full inbox, filtered pagination, and explicit load errors. Validate task order and terminology with the office user before adding calendar or HR workflows |
| 8 | Review local and diaspora client tasks against the shared portal tabs | Retain shared ownership boundaries; test mobile and time-zone scenarios |
| 9 | Validate with representative users and operational scenarios | Test comprehension, task completion, errors, and permission refusals before rollout |

### HCI acceptance checks

- In a short first-use test, each role can explain their main responsibility and
  identify their next action without training.
- An owner can find an active, completed, blocked, or sample project using the
  labels that describe it; active and completed records are never conflated.
- Selecting any portfolio item opens that project's identity, current status,
  financial summary, and attention signals before detailed maintenance forms.
- Every warning/count links to the record producing it and reflects the same
  server-side state as its detail panel.
- Local and diaspora clients can complete the same core tasks on mobile; time
  zone and payment presentation do not alter project ownership or rights.
- Unauthorized actions are blocked by server checks even if a user calls a
  server function directly; hiding a button is not authorization.
- Financial and lifecycle transitions state the consequence and are auditable.
- No UI labels generated milestone progress as an independent inspection,
  payment instructions as a confirmed bank transfer, or sample data as live work.

### Agent guidance and design workflow

Workspace guidance exists in `.agent/`. Use it as a practical aid, while
checking each recommendation against ATRO's actual workflows and technology:

- `.agent/agents/product-owner.md` and `.agent/agents/product-manager.md` call
  for explicit personas, acceptance criteria, scope boundaries, and
  stakeholder validation.
- `.agent/skills/frontend-design/ux-psychology.md` informs choice reduction,
  chunking, touch targets, familiar conventions, and feedback. For this design,
  the most relevant references include Hick's Law, Miller's Law, Fitts' Law,
  Jakob's Law, and the psychology checklist. Apply these as heuristics to
  validate—not rigid laws or substitutes for user testing.
- `.agent/skills/frontend-design/SKILL.md` requires constraint analysis and
  warns against assuming style or interaction decisions. In particular, it
  says to ask before assuming a vague design choice; validate major role,
  navigation, or permission ambiguities before committing to them.
- `.agent/workflows/ui-ux-pro-max.md` provides the design-system and React-stack
  workflow for future substantial visual implementation: analyze requirements,
  run its design-system search, supplement with relevant UX and React-stack
  guidance, and check generated suggestions against ATRO's existing visual
  system before adopting them.
- `.agent/skills/plan-writing/SKILL.md` emphasizes small, verifiable tasks and
  updating completion status. The dashboard delivery sequence above is the
  feature backlog; update its status as work is verified.

The role and tab model in this plan is a product hypothesis, not validated user
research. Before finalizing the office manager's scope or lifecycle transitions,
confirm real responsibilities and decision authority with the boss and the
person who runs the office. This follows the `.agent` brainstorming guidance:
ask focused questions when alternative answers materially change the product,
and do not decide high-impact policy by assumption. Test navigation names and
top tasks with local and diaspora clients. Until decisions are validated,
preserve existing server-side ownership and staff/admin checks; never grant
authority based only on a hidden button.

For each implementation step, state the user need, scope, relevant existing
files/data, and observable acceptance checks. Keep a small task focused; verify
the actual behavior before marking it done. Use the UI/UX workflow for substantial
design changes and include keyboard, mobile, feedback, and error-state checks.
