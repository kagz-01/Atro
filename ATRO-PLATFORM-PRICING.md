# ATRO Platform — Scope and Pricing Guide

## What this estimate covers

ATRO is more than a marketing website. The repository contains a public
construction/design site, lead intake, interactive planning tools, authentication
and role-based project workspaces, project records, and payment workflows.

The four workspaces are:

1. **Admin** — owner-level portfolio oversight, project and payment tracking,
   access control, project funds and high-impact project actions.
2. **Staff / Office** — day-to-day project follow-up, communications, calendar,
   enquiries, project records and read-only payment visibility. This is the
   second-in-command/office workspace, not a separate HR system.
3. **Kenya client** — local project progress, approvals, selections, changes,
   decisions, payments, documents and communication.
4. **Diaspora client** — remote project oversight, evidence, decisions, payments,
   documents, updates and time-zone-aware coordination.

There is **no separate contractor or QS dashboard** in the current four
workspaces. Quantity-surveying appears as project work and tools, not as another
role-specific dashboard.

This estimate is a scope-based professional pricing guide, not a quote from a
survey of current Kenyan agencies or freelancers. The figures are planning
estimates in KES and should be adjusted for delivery evidence, the contract,
seniority, support obligations, and whether the client supplies approved
content and assets.

## Scope-based estimate

| Work package | Included scope | Estimate (KES) |
|---|---|---:|
| Discovery, architecture and UX | Product structure, audience/role definition, user flows, responsive behavior and scope decisions | 80,000–150,000 |
| Visual system and responsive UI | Shared components, typography, color, layout, accessibility and mobile patterns | 90,000–180,000 |
| Kenya public website | Marketing pages, services, work/projects, zones, process, contact, legal pages, responsive implementation and SEO metadata | 160,000–300,000 |
| Diaspora public experience | Diaspora-specific process and service content, guides, FAQs, verification/safety content and tailored enquiry entry points | 90,000–180,000 |
| Enquiry and lead intake | Multi-step intake, validation, attachments where applicable, lead capture, notifications and WhatsApp hand-off | 50,000–100,000 |
| Interactive tools | BOQ worksheet, dated material-price references, cost/planning tools and county coverage map | 150,000–300,000 |
| Authentication and role boundaries | Sign-in, staff access roles, client/project scoping, protected actions and access rules | 120,000–240,000 |
| Data, documents and project workflows | Project data model, persistence, lifecycle, evidence/documents, activity, decisions, approvals, messages and operational records | 180,000–350,000 |
| Kenya client workspace | Client dashboard and project actions, including milestones, approvals, selections, changes, money, documents and communication | 160,000–280,000 |
| Diaspora client workspace increment | Shared portal foundation plus diaspora-specific navigation, remote coordination, time zones and presentation | 80,000–160,000 |
| Staff / Office workspace | Office dashboard, project register, follow-up, communications, calendar, enquiries and payment visibility | 140,000–240,000 |
| Admin workspace | Portfolio, project controls, payment tracking, access administration, project funds and privileged actions | 220,000–380,000 |
| Paystack payment workflow | Checkout initiation, transaction verification, webhook handling and project-ledger updates | 100,000–180,000 |
| QA, deployment and handover | Responsive and workflow checks, defect fixing, deployment support, administrator handover and operating documentation | 120,000–220,000 |
| **Indicative total** |  | **1,760,000–3,260,000** |

### A practical quote to put forward

For the listed scope, a reasonable initial fixed-price proposal is **KES
2,500,000**, subject to confirming what is production-ready and agreeing on
content, integrations, acceptance criteria and support. A client with a tight
budget could reduce scope toward **KES 1,800,000–2,100,000** by deferring lower
priority tools or advanced admin workflows. A production-ready, fully tested
delivery with substantial content, data migration, security hardening or
post-launch support belongs toward **KES 2,800,000–3,300,000+**.

Do not charge for the diaspora workspace as if it were an entirely separate
platform: it reuses shared client-portal behavior. Conversely, do not collapse
Admin and Staff into one dashboard: they have different permissions and
operational purposes.

## Estimation cross-check

The breadth of the codebase suggests a build of roughly **700–1,000 hours** for
a comparable end-to-end implementation, depending on how much discovery,
content, production setup and QA are included. This is a planning estimate, not
a reconstruction of hours actually worked.

At an illustrative blended rate of **KES 2,500–3,300 per hour**, that equates to
about **KES 1.75M–3.30M**. Keep time records and agreed change requests: if this
is a retrospective invoice for work already done, reconcile against the
original agreement and actual hours rather than presenting a fresh replacement
quote as though it were the signed price.

## What the estimate does and does not promise

- The repository includes Paystack checkout, verification and webhook code.
  That does not, by itself, prove the live merchant account, production
  credentials, webhook configuration, settlement, refunds or end-to-end
  production behavior have been verified. Make production activation and a
  successful live/sandbox acceptance test explicit deliverables.
- The project ledger records project payment stages and verified payments. It
  is not escrow, a bank account, or an instruction to transfer project funds.
- Material prices are dated planning references, and the BOQ worksheet is a
  drafting tool. Neither substitutes for a measured, professionally verified
  BOQ or current supplier quotations.
- Do not describe the platform as a native iOS/Android app unless native apps
  are separately built. A web/PWA experience is a different deliverable.
- Do not promise that dashboards are operationally correct just because routes
  render. Acceptance should test role access and complete workflows using
  non-production test accounts and data.

## Exclusions to state in the proposal

Unless separately listed and priced, exclude:

- Domain registration, hosting, database, file storage, email delivery,
  monitoring, backups and other recurring third-party subscriptions.
- Paystack processing fees, foreign exchange charges, bank charges, SMS or
  WhatsApp provider fees.
- Legal advice, ODPC registration, privacy impact assessments, security
  certification, professional construction/QS verification or validation of
  the client's regulatory and marketing claims.
- Writing or translating all marketing copy, creating project photography,
  illustration, video or other original brand assets.
- Importing legacy project data, cleaning client records, or migrating files
  from another system.
- Native mobile apps, accounting/ERP integrations, automated contractor
  payouts, escrow, or features not in the agreed acceptance criteria.
- Unlimited revisions, indefinite support, and new requirements discovered
  after scope approval.

The client should approve all company facts, registrations, office details,
project photography, rates, claims and legal text before publication. Treat
those as client-supplied materials unless content creation and verification are
specifically contracted.

## Suggested payment schedule

Use a written contract with deliverables and acceptance checks for each
milestone. For a KES 2,500,000 engagement, one example is:

| Milestone | Share | Amount |
|---|---:|---:|
| Contract signed and work scheduled | 30% | KES 750,000 |
| Approved design system and public-site milestone | 25% | KES 625,000 |
| Four workspaces and core workflows ready for acceptance testing | 25% | KES 625,000 |
| Acceptance fixes, deployment and handover | 20% | KES 500,000 |

Define a review window, what counts as acceptance, and the number of revision
rounds (for example, two consolidated rounds per milestone). Changes outside
the agreed scope should be estimated and approved as written change requests.
Agree repository access, intellectual-property transfer, and production
credential ownership in the contract; never put credentials in the repository
or use unpaid code handover as an informal substitute for clear payment terms.

## Ongoing support

Offer maintenance separately from the build. A small support plan might start
at **KES 25,000–50,000 per month**, with a defined response window, monthly
hours, backup/restore responsibility and included change allowance. Price
larger operational support according to service levels and actual workload.
Pass hosting and provider charges through to the client at cost or itemize any
management fee. Do not promise round-the-clock response under a basic retainer.

## Before sending a final quote

1. Confirm which features are finished, tested and accepted, and which remain
   prototypes or require production configuration.
2. Agree the exact content, integrations, migration and handover obligations.
3. Confirm who pays recurring provider costs and owns the provider accounts.
4. Attach workflow-based acceptance criteria for all four workspaces and the
   public tools.
5. Record the price, tax treatment, payment dates, revision limits, warranty
   period and change-request rate in the contract.

This guide prices the platform scope, not the value of an individual building
project or the fee ATRO should charge its construction clients.
