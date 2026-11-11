# ATRO Platform — Scope and Pricing Guide

## What this estimate covers

ATRO is more than a marketing website. The repository contains a public
construction/design site, lead intake, interactive planning tools, authentication
and role-based project workspaces, project records, and payment workflows.

### A simple way to explain the platform

> ATRO is a connected website and project-management platform for a design and
> construction business. It helps prospective clients understand the services
> and send a project brief, then gives the office and owner tools to coordinate
> that work. Each client gets a private view of their own project's progress,
> decisions, documents, messages and payment records. The public website helps
> bring work in; the private workspaces help the team deliver and account for
> it.

It is not four unrelated dashboards. They are role-specific windows onto shared
project records, with different actions and access depending on who is signed in.
The usual journey is:

1. **A prospective client learns about ATRO.** The Kenya and diaspora public
   experiences explain services, process, coverage and how to get started.
2. **The client sends a useful brief.** The intake flow collects project and
   contact context so the team can review and follow up rather than receiving
   only an unstructured message.
3. **The office coordinates the opportunity and the work.** Staff can follow
   enquiries, projects, messages, visits and schedules. Admin sees the wider
   portfolio and has additional business and financial controls.
4. **The project team keeps a shared record.** Project milestones, evidence,
   decisions, approvals, selections, changes, messages and documents are kept
   with the relevant project.
5. **The client follows and responds.** Kenya and diaspora clients see their
   own project, receive relevant updates, make decisions and approvals, and
   review the payment record. The diaspora experience emphasizes remote
   visibility and time-zone-aware coordination.
6. **Payments are recorded against project stages.** Paystack checkout and
   verification connect eligible payment stages to the ledger. A payment is
   not treated as received merely because a checkout was started.
7. **The owner monitors and closes the work.** Admin can review portfolio
   status, track money, manage access and perform privileged project lifecycle
   actions.

The public planning tools support early conversations; they are not substitutes
for professional measurement, supplier quotations or a project-specific
construction contract.

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
| **Indicative total** |  | **1,740,000–3,260,000** |

### Why each work package has a price

The table gives the estimate; this walkthrough explains what the client is
paying for and what moves a package toward the lower or higher end. The ranges
are estimates for the described work, not externally verified market averages.

1. **Discovery, architecture and UX — KES 80,000–150,000.** This defines the
   audiences, four roles, permissions, information structure and end-to-end
   workflows before implementation. This has a lower cost when requirements
   and content are already approved; it moves higher when workshops, workflow
   revisions, acceptance criteria and edge cases must be developed with the
   client. It reduces expensive rework across every later package.
2. **Visual system and responsive UI — KES 90,000–180,000.** This establishes
   the reusable visual language and interaction patterns used across the
   marketing pages and private workspaces. The cost reflects shared components,
   mobile behavior, accessibility, and consistency—not just choosing colors.
   More bespoke layouts, revision rounds and device-specific refinement move
   the work toward the high end.
3. **Kenya public website — KES 160,000–300,000.** This is the main public
   information and lead-generation experience: service, project, zone, process,
   contact and supporting pages, plus responsive layouts and search metadata.
   It costs more than a one-page brochure because visitors need multiple
   routes through a substantial set of information. Approved copy and imagery
   keep it lower; original content, photography, animation or extra pages raise
   it.
4. **Diaspora public experience — KES 90,000–180,000.** This explains the
   remote-client journey, safety and verification information, guides and
   FAQs, and directs diaspora enquiries appropriately. It is an incremental
   experience that shares the main site's components, so it is priced below a
   second full website. New research, writing, translation or significant
   custom functionality would move it higher.
5. **Enquiry and lead intake — KES 50,000–100,000.** The form turns an initial
   visit into structured information the team can review and follow up. The
   price covers the sequence, validation, conditional questions, submission and
   hand-off—not simply placing fields on a page. Attachments, more complex
   routing or external notification setup increase the effort.
6. **Interactive tools — KES 150,000–300,000.** The BOQ worksheet, dated
   material-price references, cost/planning tools and county coverage map each
   have their own inputs, results, explanatory states and limitations. They
   take more effort than static content because calculations, data
   presentation and user expectations need careful handling. Fewer tools or
   simpler behavior reduce the cost; richer data, export, saved work or
   independently verified rates increase it.
7. **Authentication and role boundaries — KES 120,000–240,000.** Sign-in is
   only part of this package. The system must distinguish Admin, Staff and
   client access, restrict each client to authorized projects, and prevent
   unauthorized financial or administrative actions. Authorization rules and
   their tests justify the cost; additional identity providers, complex
   invitations or a formal security assessment are separate effort.
8. **Data, documents and project workflows — KES 180,000–350,000.** This is
   the shared foundation that stores project status, lifecycle, evidence,
   documents, activity, decisions, approvals, messages and operational
   history. Each workflow needs rules for valid state changes, persistence,
   display and failure handling. A narrow prototype costs less; production
   migration, complex retention rules, audit requirements or multiple external
   integrations add substantial work.
9. **Kenya client workspace — KES 160,000–280,000.** The client needs more
   than a progress page: the workspace organizes milestones, approvals,
   selections, changes, money, documents, messages and decisions around their
   own project. The price covers the role-specific screens and actions against
   the shared project foundation. Fewer workflows lower the estimate; richer
   notification, reporting or approval requirements raise it.
10. **Diaspora workspace increment — KES 80,000–160,000.** Much of the client
    workspace is shared, so this is not priced as a second independent portal.
    The increment covers the distinct navigation and emphasis on remote
    evidence, updates and time zones, plus testing the diaspora journey. A
    larger difference in workflow or language/localization would cost more.
11. **Staff / Office workspace — KES 140,000–240,000.** The office needs its
    own follow-up and coordination workspace for projects, enquiries,
    communications, calendar and payment visibility. It shares project data
    with Admin but must present operational work without granting the same
    authority. Separate role-aware screens, queues and access checks drive the
    cost.
12. **Admin workspace — KES 220,000–380,000.** Admin has the broadest
    responsibility: portfolio oversight, high-impact project controls,
    payment tracking, access administration and project funds. The package is
    higher because it combines cross-project reporting with privileged actions
    whose permissions and consequences need careful design and testing. More
    reporting, approval chains or integrations belong toward the high end.
13. **Paystack payment workflow — KES 100,000–180,000.** The platform must
    initiate checkout, verify the result, handle provider callbacks safely and
    update the correct project ledger. This is more than a payment button:
    duplicate callbacks, failed attempts, references and reconciliation need
    explicit handling. The estimate excludes provider fees and does not imply
    that production merchant configuration or settlement has already been
    proven.
14. **QA, deployment and handover — KES 120,000–220,000.** The finished work
    needs responsive checks, role and workflow testing, defect correction,
    deployment coordination and instructions for the people who will operate
    it. More live integrations, more test devices, data migration or training
    sessions raise the cost. This is a delivery stage, not optional polish.

In short, the largest amounts sit where the platform must enforce permissions,
coordinate persistent project workflows, and safely handle privileged or
financial actions. Reusing the same client-portal foundation keeps the second
client workspace from being charged as a duplicate build.

### A practical quote to put forward

For the listed scope, a reasonable initial fixed-price proposal is **KES
2,500,000**—the midpoint of the itemized ranges—subject to confirming what is
production-ready and agreeing on
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
