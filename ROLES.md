# ATRO Platform Roles and Dashboard Manual

This manual explains who each ATRO workspace is for, what its dashboard tabs
are used for, and how the workspaces differ. It describes the current product
so clients, staff, and developers can tell what each area is meant to do.

## The four workspaces at a glance

| Workspace       | Intended user                                               | Main purpose                                                                                                    | Route              |
| --------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------ |
| Admin           | The business owner or person with final authority           | Oversee the full portfolio, make high-impact decisions, manage access and control financial actions             | `/admin`           |
| Staff / Office  | The office team coordinating projects and client follow-up  | Keep delivery, communication, schedules, and enquiries moving                                                   | `/staff`           |
| Kenyan client   | A client whose project is coordinated from Kenya            | Follow practical project progress, make project decisions, and handle local coordination                        | `/portal`          |
| Diaspora client | A client managing a Kenya-based project while living abroad | Follow progress remotely with clear evidence, decisions, financial visibility, and time-zone-aware coordination | `/portal/diaspora` |

The public Kenya and diaspora websites are separate from the signed-in project
portals. The client portal toolbar includes a **Back to Kenya site** or
**Back to diaspora site** link so a client can return to the appropriate public
site.

## Role and access boundaries

### Admin

**Admin** is the business-level authority role. It is the only studio role with
the high-impact controls that can change business, financial, or access records.
Admin can certify payment stages, issue statements and quotations, release
retention, manage project expenses, close or archive projects, and grant or
revoke studio access.

Admin still uses project records and operational tools, but should use the
portfolio and priority views to decide where to focus rather than treating the
dashboard as one undifferentiated task list.

### Staff / Office

**Staff** is the day-to-day operations workspace for people on the studio access
list. Staff can work with project records, follow-up, client communication,
enquiries, and payment visibility. The **Payments** tab is read-only: it helps
staff understand each project's ledger and follow up, but does not let staff
certify or record a payment.

The access list has three role values:

- `staff`: standard studio access.
- `office_manager`: studio access with the additional ability to schedule
  project calls.
- `admin`: Admin authority described above.

Staff and Office Manager can see the calendar; only Office Manager and Admin
can schedule calls. The role shown in the UI is **Staff** or **Office Manager**;
“office/admin lead” is not a second business-admin role.

The Staff workspace is for studio coordination; it is not an HR system. An
Office Manager may coordinate office work, but does not inherit Admin's
financial, project-closeout, or access-management authority.

### Kenyan and Diaspora clients

Clients see only projects they are authorized to access. Their tabs are
project-focused; they cannot browse the studio's portfolio, other clients'
ledgers, staff access, or internal studio controls.

Clients can respond to project requests such as approvals and decisions, and
pay a certified amount from their own project ledger. Payment checkout is
hosted securely by Paystack. A checkout attempt is not a payment: ATRO records
the stage as paid only after the transaction is verified. Project ledgers are
separate records, not bank accounts or escrow.

### Demonstration projects

A project marked **Demonstration** or **Sample** is for exploring the portal
with sample information. It is not a live client account and must not be used
to infer a real balance, initiate a real payment, or spend real project funds.

## Admin dashboard manual

Admin's desktop navigation is grouped into **Executive view** and **Controls**.
Mobile navigation presents a shorter set of quick links; additional areas
remain in the dashboard navigation.

| Tab                  | Purpose                                                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Admin priorities** | A personal work queue for claimed enquiries, client chases, and notes. Use it to see what Admin has taken responsibility for.                                                                                                                          |
| **Portfolio**        | Business-wide overview of live jobs, projects needing attention, money position, contracted-versus-collected amounts, enquiries, workload, and items needing a human response. It is a summary, not a substitute for opening a project record.         |
| **Projects**         | Search and filter the studio project register. Open a project to inspect its delivery, client activity, decisions, documents, and financial details.                                                                                                   |
| **New leads**        | Review incoming enquiries and move the conversation toward a project.                                                                                                                                                                                  |
| **Client payments**  | Search and filter payment stages across active client projects. Shows each project separately, including its contract and ledger amounts, payment status, and latest Paystack attempt. This view is for tracking; it does not itself certify payments. |
| **Project funds**    | Record and review project expense reservations, approvals, and bank-payment references. Admin actions are required for financial controls. This is an internal allocation ledger, not an instruction to Paystack to transfer money.                    |
| **Client updates**   | Review and respond to project conversation threads.                                                                                                                                                                                                    |
| **Access**           | Review studio access, invitations, and requests, and grant or revoke access. Admin-only controls are shown only to Admin.                                                                                                                              |

### Opening a project as Admin

Opening a project switches to a focused project workspace. Use its project
navigation to move between **Overview**, **Delivery**, **Client**, **Money**,
and **Documents** instead of scanning one long page. On mobile, the project
section menu and **All projects** return control stay pinned beneath the app
header while scrolling. Counts flag sections with items needing attention.
Within a section, task cards show the available work at a glance. Opening a
card focuses the workspace on that task; **Back to [section]** returns to the
task list without leaving the project. This replaces stacked accordion panels.

- **Overview** — progress, programme, financial position, items needing
  attention, and project lifecycle. Closing and archiving are Admin-controlled.
- **Delivery** — workflow checklist, milestone status, evidence, client
  decisions and project updates, approvals, selections, variations, and defects
  and care. Choose a task card to open its focused record and controls.
- **Client** — client and consent details, activity, messages, site presence,
  and recorded decisions. Attention items link directly to the relevant task.
- **Money** — financial summary, payment instructions, payment certification,
  statement of account, and retention. The section opens with key financial
  totals; choose a task card for the ledger or an action. Certification makes a
  payment request available; it does **not** mean the client has paid. Issuing
  statements and releasing retention are Admin actions.
- **Documents** — document vault, delivery log, and issued project documents.
  Each is a separate task view; Admin-only document actions remain restricted.

## Staff / Office dashboard manual

Staff's dashboard is an operational workspace. It uses the same project records
as Admin, but does not show Admin's portfolio controls or privileged financial
and access actions.
Opening a project uses the same focused **Overview**, **Delivery**, **Client**,
**Money**, and **Documents** sections. On mobile, the section menu and **All
projects** control stay pinned below the app header. Admin-only financial and
close-out actions remain unavailable to Staff. Task cards open one focused
record at a time and provide a direct return to the section task list. The
project overview includes follow-up items that link to the relevant work; it
does not expose Admin-only controls.

| Tab                | Purpose                                                                                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Today**          | Office overview of projects needing attention, projects running cleanly, and the follow-up queue. It is the starting point for the day's coordination work.                                                                                                                                                   |
| **Projects**       | Search and open project records to review current status and coordinate delivery. The project list includes filters such as local, diaspora, needs follow-up, and sample. Results are shown 10 at a time; compact mobile rows keep the key client, stage, and status visible without a long card per project. |
| **Payments**       | Read-only view of client payment ledgers. Use the per-project payment stage, status, date, and checkout reference to answer questions or follow up. A pending, failed, or expired checkout must not be treated as money received.                                                                             |
| **Calendar**       | View project calls, visits, and walkthroughs. Scheduling is available to Office Manager and Admin, not standard Staff.                                                                                                                                                                                        |
| **Client updates** | Monitor project conversation threads and reply when the studio owes a response.                                                                                                                                                                                                                               |
| **New leads**      | Work with incoming enquiries and help make sure people who contacted ATRO receive follow-up.                                                                                                                                                                                                                  |
| **My profile**     | Review the staff member's own studio identity and profile information.                                                                                                                                                                                                                                        |

Staff does not have the Admin-only **Admin priorities**, **Portfolio**,
**Project funds**, or **Access** navigation areas. Admin-only actions remain
protected on the server as well as being hidden in the interface.

## Client dashboard manual

Both client experiences use the same project records and core ideas: a client
can see their progress, review project information, communicate with ATRO, and
act when the project asks for their input. The dashboards are not two different
contracts or payment systems; the difference is how the information is
prioritized and which coordination tools are surfaced.

### Shared client tabs

| Tab                       | Purpose                                                                                                                                                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview**              | A project home with progress, recent activity, dates to watch, money context, and actions waiting on the client. The Kenya and Diaspora home panels prioritize different information.                                                  |
| **Calendar**              | View scheduled project calls and coordination details in the client's relevant time zone.                                                                                                                                              |
| **Progress / Milestones** | Review project stages and their status. The milestone record includes supporting evidence; an approval action appears when the studio marks a stage ready.                                                                             |
| **Money**                 | Review contract and budget position, payment stages, receipts/documents, and the project's payment instructions. Pay a certified stage from the portal using Paystack checkout. A stage is not marked paid until Paystack confirms it. |
| **Decisions**             | Review choices raised by the studio and submit a response. Open decisions may affect what can proceed next.                                                                                                                            |
| **Documents**             | Find project paperwork such as contracts, certificates, payment requests, receipts, and statements. Available documents depend on what the studio has issued.                                                                          |
| **Messages / Updates**    | Read and send project messages. Kenya calls this **Messages**; Diaspora calls it **Updates** to emphasize remote project updates.                                                                                                      |
| **Project circle / Team** | Review the people associated with the project. The Kenya navigation says **Project circle**; the Diaspora navigation says **Team**.                                                                                                    |
| **Profile**               | Manage the client's own profile and relevant contact/time-zone details.                                                                                                                                                                |

### Kenyan client tabs

The Kenya portal is oriented toward practical involvement in the project and
local coordination. In addition to the shared tabs, its navigation currently
surfaces:

| Tab                | Purpose                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| **Approvals**      | Review formal project approvals and any client action required.                                          |
| **Selections**     | Review or make project selections where the studio has requested a choice.                               |
| **Changes**        | Review proposed project variations, their cost or time impact, and respond where a decision is required. |
| **After handover** | Review defects and care items after handover and respond to requests to check completed fixes.           |

The Kenya overview emphasizes the next practical action, project messages, and
local progress. The portal uses local payment instructions when these have
been configured for the project.

### Diaspora client tabs

The Diaspora portal is arranged for remote oversight: it brings progress,
decisions, payments, updates, calendar, documents, and the project team into a
more focused set of navigation choices. Its additional **Abroad** tab provides
abroad-specific guidance and checklist content.

The Diaspora overview highlights remote-relevant activity, unread updates,
open decisions, and payment actions. Dates and calls are presented with the
client's time-zone context when it is available. The portal uses international
payment instructions when configured for the project.

The Kenya portal currently exposes separate **Approvals**, **Selections**,
**Changes**, and **After handover** tabs; these are not separate top-level
tabs in the current Diaspora navigation. The underlying project continues to
use its project records and workflows. Do not interpret the shorter Diaspora
navigation as different payment verification or project ownership rules.

## How common workflows fit together

### Progress and approval

1. Studio staff update milestones and attach evidence to the project record.
2. The studio marks eligible work ready for client approval.
3. The client reviews the milestone and evidence, then approves when satisfied.
4. The project activity and status update so both sides can follow what
   happened.

### Decisions and changes

1. The studio raises a decision or variation with the project context and any
   cost/time impact.
2. The client reviews it in **Decisions** or **Changes** (where exposed in the
   portal navigation).
3. The client responds; the choice is recorded on the project.
4. The studio can see which decisions remain unanswered and follow up.

### Payments

1. Admin certifies inspected work or approves an agreed fee stage.
2. The certified stage appears as ready for payment in the client's **Money**
   tab.
3. The client starts or continues secure hosted Paystack checkout from their
   project portal.
4. The app verifies the result with Paystack. Only verified payment updates the
   ledger to paid and allows a receipt to be issued.
5. Admin and Staff can track the stage from the **Client payments / Payments**
   view. Staff has read-only access; Admin retains certification and other
   privileged controls.

Bank instructions are project-specific guidance for a client to pay ATRO.
They do not automatically reconcile a bank transfer or mark the project
ledger paid. The studio must record and reconcile such payments through its
approved process.

## Product principles

- **Admin oversees and controls.** Use the portfolio for business-wide
  decisions and project records for detail.
- **Staff coordinates and follows through.** The office workspace is
  operational; payment visibility does not grant financial authority.
- **Clients act on their own project.** Keep client information and balances
  project-scoped.
- **Kenyan and Diaspora are different experiences for the same platform.**
  They adapt navigation, language, payment instructions, and time context—not
  the underlying ownership or payment-confirmation rules.
- **A status must say what actually happened.** Certified means approved for
  payment; checkout started means the client began checkout; paid means the
  payment has been recorded after confirmation.
- **Sample data is not live business data.** Keep demonstration projects
  visibly separate from client work.
