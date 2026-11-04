# ATRO Role Dashboard Map

This document explains the purpose of each dashboard user in ATRO and what they should be able to do. It is meant to keep product development intentional and to surface the gaps we still need to build.

## 1. Boss / Owner

### Role intent
The boss is the decision-maker. This person is not here to do paperwork or chase individual tasks. They need a high-level command view across the business.

### Dashboard purpose
The owner dashboard should answer four questions quickly:
- What is happening now across the business?
- Which projects are healthy, at risk, or stuck?
- Where is money moving and where is it at risk?
- Which client or project decisions need my attention?

### What the boss should be able to do
- See all active projects in one view
- See all completed or closed projects for comparison
- Track project health by stage, client type, and urgency
- See the money picture: revenue, payments due, retention, and outstanding balances
- Review approvals, decisions, and escalations across projects
- See which projects need follow-up, approval, or intervention
- Understand whether delivery is on track, delayed, or at risk
- See operational summary without getting buried in tasks
- Open a project to drill into details when needed
- Approve or escalate major decisions without manual admin work

### Dashboard expectations
The owner should not be working in the same operational detail as the office team. Their dashboard should be board-like and decision-oriented.

### Use cases
- Check business health at a glance
- See what needs leadership decision
- Review portfolio performance by project
- Decide whether a project must be escalated, paused, or prioritized

### Current gaps to fill
- Stronger project health score and risk highlighting
- Portfolio KPIs for revenue, payments, and delivery health
- A cleaner executive summary with priority alerts
- Better owner-only actions for corporate review and escalation
- Better distinction between office operations and owner decisions

---

## 2. Office / Admin Lead

### Role intent
This is the operational coordinator. They keep the project machine moving. They are responsible for coordination, communication, schedules, evidence, and follow-up.

### Dashboard purpose
The office dashboard should be the working hub for day-to-day delivery and coordination. It should help the office team know:
- what is due today
- which projects need attention
- which responses are pending
- what reminders need to go out
- which decisions or approvals are waiting

### What the office/admin lead should be able to do
- Review all active work in a daily operations view
- See deadlines, pending client updates, and communication needs
- Review project stage progression and blocked tasks
- Track project decisions and approvals
- Manage project messages and coordination with clients
- See new enquiries and leads coming in
- Open project files, evidence, documents, and updates
- Coordinate calls, site visits, and project scheduling
- Assign work internally or monitor who is responsible
- See staff progress and project accountability
- Monitor communication threads and identify when a client needs follow-up

### Dashboard expectations
This dashboard should feel operational, detailed, and action-focused. It is not a boardroom dashboard. It is the command center for getting work done.

### Use cases
- Daily project check-in
- Handling enquiries and leads
- Coordinating meetings and site logistics
- Tracking client messaging and approvals
- Moving work from pending to complete

### Current gaps to fill
- Stronger daily task and workload view
- Clearer assignment responsibility per project/task
- Better delivery reminders and alerts for client follow-up
- More structured project coordination workflow rules
- Better separation between leadership summary and operational work

---

## 3. Local Kenyan Client

### Role intent
This user is building at home in Kenya and usually wants clarity, progress, and reassurance. They need to see their project status without too much operational noise.

### Dashboard purpose
The local client dashboard should feel clear, practical, and reassuring. The user should know:
- where their project is
- what stage it is at
- what has been approved or completed
- what is next
- what they need to do
- how payments and milestones are progressing

### What the local Kenyan client should be able to do
- View their project summary and live status
- See milestones and progress with evidence
- Approve milestones or decisions when requested
- View payment schedule and balances
- Review documents and project records
- Track project communication with the studio
- See what the next step is without reading a full admin log
- Submit or respond to issues when relevant
- Review the project history and key decisions

### Dashboard expectations
This dashboard should be simple and confidence-building. The local client is usually more involved in the physical project and wants a clear operational view without feeling overwhelmed.

### Use cases
- Checking whether work is progressing
- Seeing what is pending from their side
- Approving a stage or document
- Monitoring payments and project value
- Understanding the next stage before site work continues

### Current gaps to fill
- More obvious decision reminders for client-side approvals
- Clearer “what you need to do next” prompts
- Better distinction between project status and account balance state
- Stronger payment/account details with transaction history
- More practical local-language and locally relatable wording in more places

---

## 4. Diaspora Client

### Role intent
This user is outside Kenya and often needs trust, visibility, and remote oversight. They may not be on site and may be more worried about whether work is being done properly and whether money is under control.

### Dashboard purpose
The diaspora dashboard should build confidence from a distance. It must answer the questions that remote clients care about most:
- What is happening on site?
- What evidence proves progress?
- What still needs my decision or approval?
- Is the money flow controlled and transparent?
- Who is responsible for what?

### What the diaspora client should be able to do
- View project progress from abroad
- See photos, milestones, and updates attached to work
- Monitor payment progress and balances
- See what approvals are waiting for them
- Review decisions already made and issues raised
- See project responsibilities and key contacts
- Track whether the project is on schedule or at risk
- Understand the next steps without requiring frequent phone calls
- Review records and documentation digitally from anywhere
- Maintain confidence that the project is being managed properly

### Dashboard expectations
This dashboard should feel trustworthy, calm, and structured. It should reduce anxiety and make the client feel informed without creating confusion.

### Use cases
- Monitoring a build while living abroad
- Approving milestone or payment steps remotely
- Reviewing evidence and documentation
- Understanding project health and risks without being in Kenya
- Seeing the project movement in a digestible format

### Current gaps to fill
- Stronger trust-focused remote dashboard summary
- More obvious “what needs your decision” prompts
- Better payment and balance visibility
- Better structured evidence and milestone storytelling for remote users
- More confidence-building status labels and ownership clarity

---

## Shared system logic

The app is currently structured around four major seats:
- Boss / owner
- Office / admin lead
- Local Kenyan client
- Diaspora client

The dashboard design should never collapse all of these users into one generic shell. Each seat has a different purpose, information density, and decision flow.

### Shared responsibilities
Across all roles, the product should support:
- project visibility
- milestone progress
- evidence capture
- approval flows
- decision log
- communication history
- payment visibility
- account clarity

### What should stay distinct
- Boss wants strategy and risk overview
- Office wants operations and daily coordination
- Local client wants practical progress and next steps
- Diaspora client wants trust, evidence, and remote oversight

---

## Practical gap checklist for development

### Must-have gaps
- Clear owner vs office dashboard separation
- Better role-aware navigation and redirect logic
- Stronger project health / risk summaries
- More decisive “what needs my action” panels
- Better payment wallet/account logic for clients
- More consistent wording and terminology across the app
- Stronger trust-building information for diaspora users

### Medium-priority gaps
- More detailed workload assignment in office operations
- Daily operation queues and follow-up reminders
- Better project accountability views for staff
- More contextual value messaging for local and diaspora users
- More polished role-specific states and empty screens

### Nice-to-have gaps
- Advanced reporting for owners
- Exportable summaries and reports
- Better project timeline and critical-path visibility
- Deeper financial forecasting for portfolio and project cash flow

---

## Product rule

The system should not ask every user to think in the same way. The owner needs oversight, the office needs execution, the client needs clarity, and the diaspora client needs confidence. If we keep those roles clear, the product will feel more intentional and easier to build without duplicate or redundant dashboard work.
