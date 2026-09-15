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
