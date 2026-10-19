-- ATRO local seed — demonstration data for the embedded PGLite database.
--
-- This runs ONLY on the local PGLite fallback (`src/lib/db.ts`),
-- never against Neon, so a real deployment can never pick up sample figures.
--
-- Without it the console, the portal and every chart open on an empty database:
-- zero contracts, no enquiries, nothing to sort. That is a true picture of a
-- brand-new install and a useless picture of the product.
--
-- Everything written here is marked `source = 'sample'`, which the portal and the
-- console already label as a demonstration project, so it can never be mistaken
-- for a real client.

with seeded as (
  select 1
  where not exists (select 1 from portal_projects)
)
insert into portal_projects (
  user_id, reference, title, client_label, client_initials, client_city, client_tz,
  plot, area, contract_type, started_label, target_label, stage, source, track, zone,
  contract_value, boq_value, certified_to_date, paid_to_date, currently_certified,
  retention_held, retention_pct, projected_at_completion,
  days_elapsed, days_total, days_remaining, on_track, variance_days, programme_note,
  next_call_when, next_call_local, next_call_agenda, progress,
  last_viewed_at, created_at, updated_at
)
select
  'dev-user', v.reference, v.title, v.client_label, v.initials, v.city, v.tz,
  v.plot, v.area, 'Design and build', v.started, v.target, v.stage, 'sample', v.track, v.zone,
  v.value, v.value, v.certified, v.paid, v.unreleased,
  round(v.value * 0.05), 5, round(v.value * 1.04),
  v.elapsed, v.total_days, greatest(0, v.total_days - v.elapsed),
  v.on_track, v.variance, v.note, v.call_when, v.call_local,
  v.call_agenda::jsonb, v.progress,
  now() - (v.stale_days || ' days')::interval,
  now() - (v.age_days || ' days')::interval,
  now() - (v.updated_days || ' days')::interval
from (values
  ('ATRO-2401', '4-bedroom maisonette, Karen', 'Wanjiku Njeri', 'WN', 'Nairobi',
   'Africa/Nairobi', 'Title No. LR 11842/201, Westlands', '312 m²', 'Mar 2024', 'Jun 2025',
   'Superstructure', 'construction', 'nairobi', 42000000::bigint, 21000000::bigint, 26250000::bigint, 5250000::bigint,
   380, 402, true, 0,
   'Frame on track. Slab deck poured last Thursday; roof covering awaiting the client decision.',
   'Friday 14 March, 15:00 EAT', 'Friday 14 March, 13:00 your time',
   '["Ring beam inspection","Roof covering decision","Payment position"]', 62, 2, 4, 14),
  ('ATRO-2402', 'Office refurbishment, Westlands', 'Brian Otieno', 'BO', 'London',
   'Europe/London', 'Plot 5, Westlands business park', '640 m²', 'Sep 2024', 'Apr 2025',
   'Structure and envelope', 'renovation', 'nairobi', 28500000::bigint, 11400000::bigint, 11400000::bigint, 0::bigint,
   190, 210, false, 12,
   'Blocked: the client has not released the revised structural drawings.',
   'Tuesday 18 March, 11:00 EAT', 'Tuesday 18 March, 09:00 your time',
   '["Revised drawings","Temporary works"]', 34, 22, 9, 3),
  ('ATRO-2403', 'Feasibility and cost plan', 'Amina Yusuf', 'AY', 'Dubai',
   'Asia/Dubai', 'Plot 12, Runda Gardens', '1,100 m²', 'Jan 2025', 'Jul 2025',
   'Concept and cost options', 'advisory', 'kiambu', 12000000::bigint, 3600000::bigint, 7200000::bigint, 3600000::bigint,
   95, 120, true, 0,
   'Two cost options issued; the client is comparing them.',
   'Wednesday 19 March, 09:00 EAT', 'Wednesday 19 March, 14:00 your time',
   '["Which cost option"]', 18, 45, 5, 7)
) as v(
  reference, title, client_label, initials, city, tz, plot, area, started, target, stage,
  track, zone, value, paid, certified, unreleased, elapsed, total_days, on_track, variance,
  note, call_when, call_local, call_agenda, progress, age_days, updated_days, stale_days
);

-- ── milestones: nine stages per project, worked to a believable point ──
insert into portal_milestones (
  project_id, ord, stage, name, status, progress, planned_start, planned_end,
  actual_end, summary, evidence, verified_by, approved_at, approved_by
)
select
  p.id, s.ord, s.stage, s.name, s.status, s.progress, s.planned_start, s.planned_end,
  s.actual_end, s.summary, s.evidence::jsonb, s.verified_by, s.approved_at::timestamptz, s.approved_by
from portal_projects p
cross join lateral (values
  (1, 'Pre-construction', 'Land and due diligence', 'complete', 100, 'Mar 2024', 'Apr 2024', '04 Apr 2024',
   'Searches, boundaries and the county plot file checked against the title.',
   '[{"date":"04 Apr 2024","caption":"Title deed and search","detail":"County search returned a clean register over the title number."}]',
   'Nanjala, lands registrar', '04 Apr 2024', 'Wanjiku Njeri'),
  (2, 'Pre-construction', 'Concept and cost options', 'complete', 100, 'Apr 2024', 'May 2024', '21 May 2024',
   'Two massing options costed; the client chose the courtyard option.',
   '[{"date":"18 May 2024","caption":"Option B cost comparison","detail":"Courtyard option 6% over Option A for a larger kitchen court."}]',
   'Nanjala, lands registrar', '21 May 2024', 'Wanjiku Njeri'),
  (3, 'Pre-construction', 'Developed design and approvals', 'complete', 100, 'May 2024', 'Jul 2024', '30 Jul 2024',
   'Planning approved in 41 days; the county raised no conditions.',
   '[{"date":"30 Jul 2024","caption":"Planning approval letter","detail":"NCC/Nairobi/MUN/2024/1187 approved."}]',
   'Nanjala, lands registrar', '30 Jul 2024', 'Wanjiku Njeri'),
  (4, 'Pre-construction', 'Bill of Quantities and contract', 'complete', 100, 'Jul 2024', 'Aug 2024', '12 Aug 2024',
   'BOQ priced line by line; the contract is the priced sum, not a margin on top.',
   '[{"date":"12 Aug 2024","caption":"Signed contract and BOQ","detail":"Four schedules, 612 lines, priced against the March 2024 rate build-up."}]',
   'Nanjala, lands registrar', '12 Aug 2024', 'Wanjiku Njeri'),
  (5, 'Construction', 'Site establishment and substructure', 'complete', 100, 'Aug 2024', 'Nov 2024', '19 Nov 2024',
   'Foundation slab cast and cured; the termite treatment warranty is in the vault.',
   '[{"date":"02 Oct 2024","caption":"Reinforcement before the pour","detail":"Engineer present; bar spacing verified at 150mm throughout."}]',
   'Nanjala, lands registrar', '19 Nov 2024', 'Wanjiku Njeri'),
  (6, 'Construction', 'Superstructure', 'active', 62, 'Nov 2024', 'Mar 2025', null,
   'Ground floor complete; first-floor ring beam cast last week. Formwork striking on Thursday.',
   '[{"date":"06 Mar 2025","caption":"First floor ring beam cast — 21 m³","detail":"Engineer attended; cube results logged at 7 and 28 days."}]',
   null, null, null),
  (7, 'Construction', 'Roof, first fix and finishes', 'pending', 0, 'Mar 2025', 'Jun 2025', null,
   'Begins once the superstructure is struck and dried.', '[]', null, null, null),
  (8, 'Construction', 'Second fix, testing and approvals', 'pending', 0, 'Jun 2025', 'Jul 2025', null,
   'Services testing and the occupancy inspection.', '[]', null, null, null),
  (9, 'Handover', 'Snagging and handover', 'pending', 0, 'Jul 2025', 'Aug 2025', null,
   'Defects list, keys, and the retention clock starts.', '[]', null, null, null)
) as s(
  ord, stage, name, status, progress, planned_start, planned_end, actual_end,
  summary, evidence, verified_by, approved_at, approved_by
)
where p.reference = 'ATRO-2401';

insert into portal_milestones (
  project_id, ord, stage, name, status, progress, planned_start, planned_end,
  actual_end, summary, evidence
)
select
  p.id, s.ord, s.stage, s.name, s.status, s.progress, s.planned_start, s.planned_end,
  s.actual_end, s.summary, s.evidence::jsonb
from portal_projects p
cross join lateral (values
  (1, 'Condition survey', 'Condition survey', 'complete', 100, 'Sep 2024', 'Oct 2024', '08 Oct 2024',
   'Strip survey found solid slab and sound frame; no structural concern.', '[]'),
  (2, 'Condition survey', 'Structural assessment', 'complete', 100, 'Oct 2024', 'Nov 2024', '21 Nov 2024',
   'Frame assessed: adequate for the change of use, no transfer beam required.', '[]'),
  (3, 'Pre-construction', 'Design and services plan', 'blocked', 40, 'Nov 2024', 'Jan 2025', null,
   'Stopped: the client has not released the revised structural drawings, so the MEP layout cannot be frozen.', '[]'),
  (4, 'Pre-construction', 'Bill of Quantities and contract', 'pending', 0, 'Jan 2025', 'Feb 2025', null,
   'Follows the services plan.', '[]'),
  (5, 'Construction', 'Demolition and making good', 'complete', 100, 'Feb 2025', 'Mar 2025', '14 Mar 2025',
   'Core stripped back to the frame; the slab is intact.', '[]'),
  (6, 'Construction', 'Structure and envelope', 'pending', 0, 'Mar 2025', 'May 2025', null,
   'Waiting on the blocked services plan.', '[]'),
  (7, 'Construction', 'Roof and weatherproofing', 'pending', 0, 'May 2025', 'Jun 2025', null,
   'New roof deck and waterproofing.', '[]'),
  (8, 'Fit-out', 'Fit-out and finishes', 'pending', 0, 'Jun 2025', 'Aug 2025', null,
   'Partitions, floor and ceiling.', '[]'),
  (9, 'Handover', 'Practical completion', 'pending', 0, 'Aug 2025', 'Sep 2025', null,
   'Occupancy certificate and handover.', '[]')
) as s(ord, stage, name, status, progress, planned_start, planned_end, actual_end, summary, evidence)
where p.reference = 'ATRO-2402';

insert into portal_milestones (
  project_id, ord, stage, name, status, progress, planned_start, planned_end,
  actual_end, summary, evidence
)
select
  p.id, s.ord, s.stage, s.name, s.status, s.progress, s.planned_start, s.planned_end,
  s.actual_end, s.summary, s.evidence::jsonb
from portal_projects p
cross join lateral (values
  (1, 'Advisory', 'Brief and site walk', 'complete', 100, 'Jan 2025', 'Jan 2025', '09 Jan 2025',
   'Site walked with the client; access, services and neighbours noted.', '[]'),
  (2, 'Advisory', 'Feasibility study', 'complete', 100, 'Jan 2025', 'Feb 2025', '02 Feb 2025',
   'Feasible on the plot; the soakage report sets the foundation type.', '[]'),
  (3, 'Advisory', 'Cost options', 'active', 55, 'Feb 2025', 'Mar 2025', null,
   'Two options priced to the same rate build-up; the client is comparing.', '[]'),
  (4, 'Advisory', 'Programme and cash flow', 'pending', 0, 'Mar 2025', 'Mar 2025', null,
   'Follows the chosen option.', '[]'),
  (5, 'Advisory', 'Design appointment', 'pending', 0, 'Mar 2025', 'Apr 2025', null,
   'Detailed design appointment, if the client proceeds.', '[]'),
  (6, 'Advisory', 'Tender and contractor selection', 'pending', 0, 'Apr 2025', 'May 2025', null,
   'Four contractors to be invited.', '[]'),
  (7, 'Advisory', 'Programme monitoring', 'pending', 0, 'May 2025', 'Jul 2025', null,
   'Monthly site reporting once on site.', '[]'),
  (8, 'Advisory', 'Final account and handover', 'pending', 0, 'Jul 2025', 'Jul 2025', null,
   'Final account and the document handover.', '[]'),
  (9, 'Handover', 'Retention and aftercare', 'pending', 0, 'Jul 2025', 'Jul 2026', null,
   'Twelve-month defects liability period.', '[]')
) as s(ord, stage, name, status, progress, planned_start, planned_end, actual_end, summary, evidence)
where p.reference = 'ATRO-2403';

-- ── the payment schedule: splits that sum to the contract value ──
insert into portal_payments (project_id, ord, label, stage, amount, status, due_date, paid_date, method, note)
select p.id, s.ord, s.label, s.stage, s.amount::bigint, s.status, s.due, s.paid, s.method, s.note
from portal_projects p
cross join lateral (values
  (1, 'Mobilisation and design completion', 'Pre-construction', 9450000, 'paid', '2024-09-01', '2024-08-27'::text, 'RTGS', 'Mobilisation received before site establishment.'),
  (2, 'Substructure complete', 'Site establishment', 6300000, 'paid', '2024-12-15', '2024-12-11'::text, 'RTGS', 'Released against certificate QS/2024/2401-SUB.'),
  (3, 'Superstructure — ground floor', 'Superstructure', 5250000, 'paid', '2025-03-10', '2025-03-04'::text, 'RTGS', 'Released against certificate QS/2025/2401-GF.'),
  (4, 'Superstructure — first floor', 'Superstructure', 5250000, 'certified', '2025-06-10', null, null, 'Certified by the QS, awaiting the client''s release.'),
  (5, 'Roof complete', 'Roof and first fix', 6300000, 'due', '2025-09-10', null, null, 'Falls due on certification.'),
  (6, 'First fix — services', 'First fix', 4200000, 'scheduled', '2025-12-10', null, null, 'Scheduled against the programme.'),
  (7, 'Finishes and second fix', 'Second fix', 3150000, 'scheduled', '2026-03-10', null, null, 'Scheduled against the programme.'),
  (8, 'Practical completion', 'Handover', 2100000, 'scheduled', '2026-08-30', null, null, 'Less five per cent retention.')
) as s(ord, label, stage, amount, status, due, paid, method, note)
where p.reference = 'ATRO-2401';

insert into portal_payments (project_id, ord, label, stage, amount, status, due_date, paid_date, method, note)
select p.id, s.ord, s.label, s.stage, s.amount::bigint, s.status, s.due, s.paid, s.method, s.note
from portal_projects p
cross join lateral (values
  (1, 'Mobilisation', 'Pre-construction', 5700000, 'paid', '2024-10-01', '2024-09-26'::text, 'RTGS', 'Mobilisation received.'),
  (2, 'Demolition complete', 'Demolition', 5700000, 'paid', '2025-04-01', '2025-03-28'::text, 'RTGS', 'Released against certificate QS/2025/2402-DEM.'),
  (3, 'Structure and envelope', 'Structure', 8550000, 'due', '2025-07-01', null, null, 'Held until the blocked drawings are released.'),
  (4, 'Roof and weatherproofing', 'Envelope', 5700000, 'scheduled', '2025-10-01', null, null, 'Scheduled.'),
  (5, 'Fit-out and finishes', 'Fit-out', 2850000, 'scheduled', '2026-01-15', null, null, 'Scheduled.'),
  (6, 'Practical completion', 'Handover', 0, 'scheduled', '2026-09-01', null, null, 'Final stage, less retention.')
) as s(ord, label, stage, amount, status, due, paid, method, note)
where p.reference = 'ATRO-2402';

insert into portal_payments (project_id, ord, label, stage, amount, status, due_date, paid_date, method, note)
select p.id, s.ord, s.label, s.stage, s.amount::bigint, s.status, s.due, s.paid, s.method, s.note
from portal_projects p
cross join lateral (values
  (1, 'Consultancy fee', 'Feasibility', 3600000, 'paid', '2025-02-15', '2025-02-12'::text, 'RTGS', 'First instalment against the feasibility study.'),
  (2, 'Cost options and programme', 'Advisory', 3600000, 'certified', '2025-04-01', null, null, 'Certified, awaiting release.'),
  (3, 'Tender and contractor selection', 'Advisory', 2400000, 'scheduled', '2025-06-01', null, null, 'Scheduled, payable if the client proceeds to tender.'),
  (4, 'Programme monitoring', 'Monitoring', 2400000, 'scheduled', '2025-09-01', null, null, 'Scheduled monthly on site.')
) as s(ord, label, stage, amount, status, due, paid, method, note)
where p.reference = 'ATRO-2403';

-- ── decisions: one waiting on the client, one already answered ──
insert into portal_decisions (project_id, ord, date, title, detail, options, chosen, cost_impact, state, created_at, decided_at)
select
  p.id, s.ord, s.date, s.title, s.detail, s.options::jsonb, s.chosen, s.impact::bigint, s.state,
  now() - (s.age || ' days')::interval,
  case when s.state = 'decided' then now() - ((s.age - 2) || ' days')::interval else null end
from portal_projects p
cross join lateral (values
  (1, '03 Mar 2025', 'Roof covering', 'Three options costed to the same specification.',
   '["Stone-coated tile","Concrete roof tile","Metal sheet"]', null, 0, 'awaiting-client', 6),
  (2, '14 Jan 2025', 'Kitchen counter material', 'Quartz and granite at similar price points.',
   '["Quartz","Granite"]', 'Quartz', 180000, 'decided', 52),
  (3, '20 Nov 2024', 'External wall finish', 'Render against the block, or face it.',
   '["Smooth render","Fair-faced block"]', 'Fair-faced block', -420000, 'decided', 77)
) as s(ord, date, title, detail, options, chosen, impact, state, age)
where p.reference = 'ATRO-2401';

insert into portal_decisions (project_id, ord, date, title, detail, options, cost_impact, state, created_at)
select
  p.id, 1, '08 Mar 2025', 'Temporary works during the strip-out',
  'The frame needs propping while the core is opened up.',
  '["Propping for 4 weeks","Propping for 8 weeks"]', 240000, 'awaiting-client',
  now() - '4 days'::interval
from portal_projects p where p.reference = 'ATRO-2402';

insert into portal_decisions (project_id, ord, date, title, detail, options, chosen, cost_impact, state, created_at, decided_at)
select
  p.id, 1, '24 Feb 2025', 'Which cost option', 'Both are priced to the same rate build-up.',
  '["Option A — 3 levels","Option B — 4 levels"]', 'Option B — 4 levels', 2400000, 'decided',
  now() - '20 days'::interval, now() - '12 days'::interval
from portal_projects p where p.reference = 'ATRO-2403';

-- ── documents and the activity feed ──
insert into portal_documents (project_id, ord, name, category, issued, reference, state)
select p.id, s.ord, s.name, s.category, s.issued, s.reference, s.state
from portal_projects p
cross join lateral (values
  (1, 'Signed contract and priced BOQ', 'Contract', '12 Aug 2024', 'ATRO/2401/CTR', 'verified'),
  (2, 'Planning approval letter', 'Approval', '30 Jul 2024', 'NCC/MUN/2024/1187', 'verified'),
  (3, 'Structural drawings Rev C', 'Drawing', '06 Mar 2025', 'SD/Rev C', 'awaiting'),
  (4, 'Certificate QS/2025/2401-GF', 'Certificate', '04 Mar 2025', 'QS/2025/2401-GF', 'verified')
) as s(ord, name, category, issued, reference, state)
where p.reference = 'ATRO-2401';

insert into portal_activity (project_id, kind, title, body, at)
select p.id, s.kind, s.title, s.body, now() - (s.age || ' hours')::interval
from portal_projects p
cross join lateral (values
  ('note', 'Weekly report — Week 08', 'Frame on track. Slab deck poured Thursday; formwork striking Monday.', 96),
  ('milestone', 'Superstructure at 62%', 'Ground floor complete, first-floor ring beam cast.', 160),
  ('payment', 'Certificate released', 'QS/2025/2401-GF issued for the ground floor.', 300),
  ('note', 'Site meeting minutes — Week 07', 'Agreed the roof covering options go to the client as a decision.', 420)
) as s(kind, title, body, age)
where p.reference = 'ATRO-2401';

insert into portal_activity (project_id, kind, title, body, at)
select p.id, s.kind, s.title, s.body, now() - (s.age || ' hours')::interval
from portal_projects p
cross join lateral (values
  ('note', 'Strip-out complete', 'Core opened up to the frame; the slab is intact as surveyed.', 72),
  ('decision', 'Temporary works raised', 'The frame needs propping; options issued to the client.', 96)
) as s(kind, title, body, age)
where p.reference = 'ATRO-2402';

-- ── enquiries: enough history for the funnel and the monthly chart ──
with seeded as (
  select 1 where not exists (select 1 from enquiries)
)
insert into enquiries (
  name, phone, email, project_type, zone, stage, start_date, description, sqm,
  finish, indicative_min, indicative_max, diaspora, diaspora_country,
  diaspora_timezone, diaspora_kenya_contact, diaspora_visit_plans, status, created_at
)
select
  v.name, v.phone, v.email, v.kind, v.zone, v.stage, '', v.note, v.sqm, v.finish,
  v.lo, v.hi, v.diaspora, v.country, v.tz, v.kenya_contact, v.visit, v.status,
  now() - (v.age || ' days')::interval
from (values
  ('Wanjiku Njeri', '+254799034712', 'wanjiku@example.com', 'Residential', 'nairobi', 'Concept design', 'Four-bedroom maisonette in Karen; plot already bought.', 312, 'Premium', 38000000, 45000000, false, '', 'Africa/Nairobi', '', '', 'converted', 210),
  ('Brian Otieno', '+447700900123', 'b.otieno@example.com', 'Commercial', 'nairobi', 'Feasibility', 'Office refurbishment while our London office is leased.', 640, 'Standard', 24000000, 31000000, true, 'United Kingdom', 'Europe/London', 'Mr. Otieno (brother)', 'Planning a visit in June', 'converted', 168),
  ('Amina Yusuf', '+971501234567', 'amina@example.com', 'Residential', 'kiambu', 'Cost options', 'Feasibility and cost plan before committing to build.', 1100, 'Premium', 10500000, 13500000, true, 'United Arab Emirates', 'Asia/Dubai', 'Mr. Yusuf (uncle)', 'May visit the plot', 'converted', 74),
  ('Faith Chebet', '+254712345678', 'faith@example.com', 'Residential', 'kiambu', 'Enquiry', 'Three-bedroom house for my parents; I work in Nairobi.', 240, 'Standard', 18000000, 22000000, false, '', 'Africa/Nairobi', '', '', 'contacted', 38),
  ('Peter Mwangi', '+254722334455', 'p.mwangi@example.com', 'Institutional', 'nairobi', 'Enquiry', 'Day-care centre for 60 children; need approvals handled.', 480, 'Standard', 32000000, 38000000, false, '', 'Africa/Nairobi', '', '', 'quoted', 21),
  ('Grace Wambui', '+254733445566', 'grace@example.com', 'Residential', 'machakos', 'Enquiry', 'Rental yield check before I commit to a plot.', 200, 'Standard', 14000000, 17000000, false, '', 'Africa/Nairobi', '', '', 'new', 9),
  ('Samuel Adeyemi', '+2348030000000', 's.adeyemi@example.com', 'Commercial', 'coast', 'Enquiry', 'Warehouse conversion for a logistics client in Mombasa.', 1200, 'Standard', 41000000, 52000000, true, 'Nigeria', 'Africa/Lagos', 'Mr. Adeyemi (brother)', 'Visiting Mombasa in April', 'new', 4),
  ('Halima Noor', '+254744556677', 'halima@example.com', 'Residential', 'nairobi', 'Enquiry', 'Two-bedroom apartment for my sister; modest budget.', 95, 'Standard', 9500000, 11500000, false, '', 'Africa/Nairobi', '', '', 'new', 1)
) as v(
  name, phone, email, kind, zone, stage, note, sqm, finish, lo, hi, diaspora,
  country, tz, kenya_contact, visit, status, age
);

-- ── selections: priced choices, one already over its allowance ──
-- Deadlines are relative to the day the seed runs, not hard-coded: a fixed date
-- quietly turns every open selection into "deadline passed" and the client side
-- stops being demonstrable at all.
insert into portal_selection (project_id, ord, title, category, stage, allowance_amount, deadline, status, chosen_at, chosen_by, note)
select p.id, s.ord, s.title, s.category, s.stage, s.allowance::bigint,
  case when s.in_days is null then s.deadline
       else to_char((now() + make_interval(days => s.in_days))::date, 'YYYY-MM-DD') end,
  s.status,
  case when s.chosen_label is null then null else now() - (s.chosen_days || ' days')::interval end,
  'dev-user', s.note
from portal_projects p
cross join lateral (values
  (1, 'Roof covering', 'Roof', 'Superstructure', 6300000, '', 'open', null, null, 18,
   'All three are quoted for the same specification, so the comparison is like for like. The allowance covers supply and laying.'),
  (2, 'Kitchen worktop', 'Kitchen', 'Superstructure', 900000, '2026-02-10', 'chosen', 'Quartz', 14, null,
   'Quartz and granite were within a few thousand of each other at the time of pricing.'),
  (3, 'Living room floor', 'Floor', 'Roof and first fix', 1800000, '', 'open', null, null, 45,
   'Sealed hardwood or porcelain. Both are quoted installed.')
) as s(ord, title, category, stage, allowance, deadline, status, chosen_label, chosen_days, in_days, note)
where p.reference = 'ATRO-2401';

insert into portal_selection_option (selection_id, ord, label, description, supplier, price, lead_time, recommended)
select sel.id, o.opt_ord, o.label, o.description, o.supplier, o.price::bigint, o.lead_time, o.recommended
from portal_selection sel
join portal_projects p on p.id = sel.project_id
cross join lateral (values
  (1, 1, 'Stone-coated tile', 'Concrete tiles with a stone finish, twenty-year profile.', 'Roofline Tiles', 5850000, '3 weeks', true),
  (1, 2, 'Concrete roof tile', 'Standard concrete tile — the base specification.', 'Atlas Roofing', 5250000, '2 weeks', false),
  (1, 3, 'Metal sheet', 'Long-run profiled steel: lightest and quickest to fix.', 'Kenya Steel', 6100000, '4 weeks', false),
  (2, 1, 'Quartz', 'Engineered stone, 20mm, polished.', 'Stoneworks', 1120000, '5 weeks', false),
  (2, 2, 'Granite', 'Natural 20mm slab, honed.', 'Stoneworks', 1080000, '6 weeks', true),
  (3, 1, 'Sealed hardwood', 'Oak, sealed with a matt polyurethane finish.', 'Mwanza Timber', 2450000, '8 weeks', true),
  (3, 2, 'Porcelain', 'Large-format 600x600 porcelain, rectified.', 'Tile Africa', 1950000, '3 weeks', false)
) as o(sel_ord, opt_ord, label, description, supplier, price, lead_time, recommended)
where p.reference = 'ATRO-2401' and sel.ord = o.sel_ord;

-- The chosen option is linked after the fact: a row cannot reference its own id
-- from inside the VALUES list that is inserting it.
update portal_selection set chosen_option_id = o.id
from portal_selection_option o
where o.selection_id = portal_selection.id
  and o.label = 'Quartz'
  and portal_selection.title = 'Kitchen worktop'
  and portal_selection.status = 'chosen';

-- ── approvals: the paperwork, and one that has stopped moving ──
insert into portal_approval (
  project_id, ord, kind, title, authority, reference, status, submitted_on,
  decided_on, fee_amount, fee_paid, blocking, chased_on, chase_note, note, updated_at
)
select p.id, s.ord, s.kind, s.title, s.authority, s.reference, s.status, s.submitted_on,
  s.decided_on, s.fee_amount::bigint, s.fee_paid::bigint, s.blocking, s.chased_on,
  s.chase_note, s.note, now() - (s.idle_days || ' days')::interval
from portal_projects p
cross join lateral (values
  (1, 'ncc', 'Planning consent', 'Nairobi City County', 'NCC/MUN/2024/1187', 'approved',
   '2024-05-18', '2024-07-30', 285000, 285000, true, '', '',
   'Approved in 41 days with no conditions attached.', 200),
  (2, 'nema', 'Environmental impact assessment', 'NEMA', 'NEMA/EIA/2024/2210', 'approved',
   '2024-06-02', '2024-08-15', 120000, 120000, false, '', '',
   'Not required for the house itself, but required for the borehole.', 190),
  (3, 'nca', 'Contractor registration', 'National Construction Authority', 'NCA/2024/8812', 'approved',
   '2024-04-11', '2024-04-28', 45000, 45000, false, '', '',
   'Registration and the annual levy.', 185),
  (4, 'county', 'Building permit', 'Nairobi City County', 'NCC/permit/2024/1187', 'approved',
   '2024-08-05', '2024-08-22', 165000, 165000, true, '', '',
   'Permit issued against the approved drawings.', 170),
  (5, 'utilities', 'Water connection', 'Nairobi Water and Sewerage', 'NWS/2025/4412', 'under_review',
   '2025-09-20', '', 38000, 38000, true, '', '',
   'Application lodged; the surveyor is booked for the boundary.', 40),
  (6, 'utilities', 'Power connection (KPLC)', 'Kenya Power', 'KPLC/DU/NBO/2025/771', 'submitted',
   '2025-10-02', '', 95000, 0, false, '', '',
   'Deposit not yet paid — the transformer deposit is the long pole.', 18)
) as s(ord, kind, title, authority, reference, status, submitted_on, decided_on,
      fee_amount, fee_paid, blocking, chased_on, chase_note, note, idle_days)
where p.reference = 'ATRO-2401';

-- The second project is the one that is stuck: the structural drawings have not
-- been released, and the county permit is sitting on them.
insert into portal_approval (
  project_id, ord, kind, title, authority, reference, status, submitted_on,
  decided_on, fee_amount, fee_paid, blocking, chased_on, chase_note, note, updated_at
)
select p.id, s.ord, s.kind, s.title, s.authority, s.reference, s.status, s.submitted_on,
  s.decided_on, s.fee_amount::bigint, s.fee_paid::bigint, s.blocking, s.chased_on,
  s.chase_note, s.note, now() - (s.idle_days || ' days')::interval
from portal_projects p
cross join lateral (values
  (1, 'ncc', 'Change of use permit', 'Nairobi City County', 'NCC/COU/2025/0044', 'submitted',
   '2025-11-14', '', 210000, 210000, true, '2025-12-02', 'Called the county; the file is with the assessment desk.',
   'Assessment has not been booked — the file is waiting on the revised drawings from the client.', 60),
  (2, 'nca', 'Contractor registration', 'National Construction Authority', 'NCA/2025/4410', 'approved',
   '2025-09-01', '2025-09-19', 45000, 45000, false, '', '', '', 300)
) as s(ord, kind, title, authority, reference, status, submitted_on, decided_on,
      fee_amount, fee_paid, blocking, chased_on, chase_note, note, idle_days)
where p.reference = 'ATRO-2402';


-- Evidence photographs against the stages they prove. These are sample images
-- generated for the demo, standing in for the real site photographs the studio
-- posts from a phone. A photograph is what makes the rest of the record
-- believable: a client building from another country looks at the rebar before
-- the pour, not a count of pictures.


-- Evidence photographs against the stages they prove. These are sample images
-- generated for the demo, standing in for the real site photographs the studio
-- posts from a phone. A photograph is what makes the rest of the record
-- believable: a client building from another country looks at the rebar before
-- the pour, not a count of pictures.
insert into portal_evidence_photo (
  project_id, milestone_id, ord, caption, detail, taken_on, mime, bytes, uploaded_by
)
select p.id, m.id, s.ord, s.caption, s.detail, s.taken_on, 'image/jpeg',
  decode(s.b64, 'base64'), s.uploaded_by
from portal_projects p
cross join lateral (values
  (1, 5, 'Rebar grid photographed before the slab pour',
   'Spacing checked at 150 mm centres. Engineer signed off on the day.', '2024-09-12',
   '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAHgAoADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDtaKKKgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKA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KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9k=', 'Wanjiku Njeri'),
  (2, 5, 'Slab curing, ponded for seven days',
   'Kept wet as specified; no cracking observed on the second inspection.', '2024-09-19',
   '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAHgAoADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDu6KKKyLCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooqK5/1Lfh/OgCWisyigDTorMooA06KzKKANOisyigDTorMooA06KzKKANOisyigDTorMooA06KzKKANOisyigDTorMooA06KzKKANOisyigDTorMooA06KzKKANOisyigDTorMooA06KzKKANOisyigDTorMooA06KzKKANOisyigDTorMooA06KzKKANOisyigDTorMooA06KzKKANOisyigDTorMooA06KzKKANOisyigDTorMooA06KzKKANOisyigDTorMooA06KzKKANOioLP/AFR/3qnoAKKKKACiiigAqK5/1Lfh/Opaiuf9S34fzoAo0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBcs/9Uf8AeqeoLP8A1R/3qnoAKKKKACiiigAqK5/1Lfh/Opaiuf8AUt+H86AKNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAXLP/AFR/3qnqCz/1R/3qnoAKKKKACiiigAqK5/1Lfh/Opaiuf9S34fzoAo0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBcs/wDVH/eqeoLP/VH/AHqnoAKKKKACiiigAqK5/wBS34fzqWorn/Ut+H86AKNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAXLP/VH/eqeoLP/AFR/3qnoAKKKKACiiigAqK5/1Lfh/Opaiuf9S34fzoAo0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBcs/9Uf8AeqeoLP8A1R/3qnoAKKKKACiiigAqK5/1Lfh/Opaiuf8AUt+H86AKNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRSMwXqQKja4UdATTUW9hNpbktFVjcOemBTTK5/iP4Vapsh1EW6Qso6kD6mqfWin7LzF7Qt70/vL+dG9P7y/nVSin7JC9oy4HUnAYE/WlqlRS9l5j9oXaKqCRwc7jThcOPQ/Wk6bH7RFmioVuAeoIqVXVuhBqHFrcpST2FooopFBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAFyz/ANUf96p6gs/9Uf8AeqegAooooAKKKKACorn/AFLfh/Opaiuf9S34fzoAo0UUUAFFFFABRRRQAUUUUAFFFFABRRUMk+OEPPrTSb2E2luSPIqDk/hUDTs3T5RUfWitowSMXNsOtFFFWQFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAPWd16nI96nSVX9j6VVoqZQTLU2i7RUEc+OHPHrU/WsJRa3NVJMKKKKRQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAXLP8A1R/3qnqCz/1R/wB6p6ACiiigAooooAKiuf8AUt+H86lqK5/1Lfh/OgCjRRRQAUUUUAFFFFABRRRQAUUUjHapPoM0ARTyYyg696goJyST1NFdMY2Vjnk7sKKKKZIUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABUsEmPkPQ9KiopNXVhp2dy7RTY23ICetOrmasdCCiiigYUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBcs/wDVH/eqeoLP/VH/AHqnoAKKKKACiiigAqK5/wBS34fzqWorn/Ut+H86AKNFFFABRRRQAUUUUAFFFFABTJv9U1PpHG5SPUU1uJ7FOijpRXScwUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAWLf7h+tS0yJdsYB60+uaT1OiOwUUUUigooooAKKKKACiiigAoopGYL1IFAhaKia4UdATTDct2UD61Sg2S5osUVV86T+9+lJ5jn+I/nVeyYvaIt0VT3v/eb86N7/wB5vzo9kw9oi5RVXzpP736U4XDDqAaXs2HtEWKKiFwp6gipFdW6EGpcWtylJMWiiikUFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBcs/8AVH/eqeoLP/VH/eqegAooooAKKKKACorn/Ut+H86lqK5/1Lfh/OgCjRRRQAUUUUAFFFFABRRRQAUUUUAQTx4y46d6hq71qvJBjlMkelawn0ZlOHVEVFFFamQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABUkMe87j0H60Rwl+WyB/OrAAUYAwKznO2iNIQ6sWiiisTYKKKKACiiigAooooAKa7qgyTSSSCMep7CqpJY5JyauEL6siU7Erzs3C8D9ai60UVsklsYtt7hRRRTEFFFFABRRRQAUUUUAFFFFAEiTsvX5h71Okiv0PPpVSjpUSgmWptF2io4pd/B+9/OpKxatozZO4UUUUhhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAFyz/1R/wB6p6gs/wDVH/eqegAooooAKKKKACorn/Ut+H86lqK5/wBS34fzoAo0UUUAFFFFABRRRQAUUUUAFFFFABRRRQBG8Kv7H1qBonTqMj1FW6KqM2iHBMpUVbaJG6jn1FRNbf3W/OtVUTM3BkNFPMLj+HP0phBHUEfWrTTJaaCiiigQUUUUAFFFFABRQAScAZNOETn+E/jQ2kOw2ipltj/Ew/CpFhRe2frUOokUoMrrGz9Bx61MkCry3zGpaKzlNs0UEgoooqCwooooAKKKKACiiigApCcAn0paZN/qmoSuxPRFZmLMSeppKKK6jnCiiigQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAA4OR1FW0begb1qpVi3+4frWdRaXNKb1sS0UUVibBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAFyz/1R/3qnqCz/wBUf96p6ACiiigAooooAKiuf9S34fzqWorn/Ut+H86AKNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAJsU/wAI/KmmJD/CPwp9FF2KyGeTH/d/WjyY/wC7+tPop8z7hyoYIUBztpdif3V/KnUUXYWQUUUUhhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABSMu5SPWlooApEFTgjBoqzLFv5H3v51W6V0RldHPKNgoooqiQooooAKKKKACiiigAooooAKKKKACiiigA61bjXYgHfvUcMOPmbr2HpU1Y1JX0RtCNtWFFFFZmgUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBcs/8AVH/eqeoLP/VH/eqegAooooAKKKKACorn/Ut+H86lqK5/1Lfh/OgCjRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFMeJX9j60+ihO2wmrlV4WTnqPUUyrtNaJG6jn1Faqp3M3T7FSipmtv7rfnTTA47A/Q1ammQ4sjopdj/3W/Kk6VVxBRRRQIKKXY/8Adb8qcIHPbH1pXQ7MZRUwtj/E35VIsKL2z9al1EilBldImfoOPU1OkKpz1NSUVnKbZooJBRRRUFhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBcs/9Uf8AeqeoLP8A1R/3qnoAKKKKACiiigAqK5/1Lfh/Opaiuf8AUt+H86AKNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAXLP/AFR/3qnqCz/1R/3qnoAKKKKACiiigAqK5/1Lfh/Opaiuf9S34fzoAo0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBcs/wDVH/eqeoLP/VH/AHqnoAKKKKACiiigAqK5/wBS34fzqWorn/Ut+H86AKNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAXLP/VH/eqeoLP/AFR/3qnoAKKKKACiiigAqK5/1Lfh/Opaiuf9S34fzoAo0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBcs/9Uf8AeqeoLP8A1R/3qnoAKKKKACiiigApCAwwQCPelooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAZ5Uf9xfyo8qP+4v5U+igBnlR/wBxfyo8qP8AuL+VPooAQKFGFAA9qWiigAooooAwf+Eo/wCnT/yJ/wDWo/4Sj/p0/wDIn/1qwqKYjd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigDd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigDd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigDd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigDd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigDd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigDd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigDd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigDd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigDd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigDd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigDd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigDd/4Sj/p0/8AIn/1qP8AhKP+nT/yJ/8AWrCooA3f+Eo/6dP/ACJ/9aj/AISj/p0/8if/AFqwqKAN3/hKP+nT/wAif/Wo/wCEo/6dP/In/wBasKigAooooEFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//Z', 'Wanjiku Njeri'),
  (3, 6, 'Frame raised to first floor ring beam',
   'Columns and beams in place. Plumb checked on all four corners.', '2024-10-08',
   '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAHgAoADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD02iiisDQKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiii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/pTAxqKKKYgooooAKmsv+PyD/rov86hqay/4/IP+ui/zoA6yiiipGFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFcbXZVxtNCYUUUUwCiiigArf8P/APHm/wD10P8AIVgVv+H/APjzf/rof5CkCNOiiikMKKKKACiiigAooooAKKKKACiiigAooooAKxvEX/Lv/wAC/pWzWN4i/wCXf/gX9KYGNRRRTEFFFFABU1l/x+Qf9dF/nUNTWX/H5B/10X+dAHWUUUVIwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKxvEX/AC7/APAv6Vs1jeIv+Xf/AIF/SmBjUUUUxBRRRQAVNZf8fkH/AF0X+dQ1NZf8fkH/AF0X+dAHWUUUVIwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArja7KuNpoTCiiimAUUUUAFb/h/wD483/66H+QrArf8P8A/Hm//XQ/yFIEadFFFIYUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVjeIv+Xf/AIF/StmsbxF/y7/8C/pTAxqKKKYgooooAKmsv+PyD/rov86hqay/4/IP+ui/zoA6yiiipGFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABWN4i/wCXf/gX9K2axvEX/Lv/AMC/pTAxqKKKYgooooAKmsv+PyD/AK6L/Ooamsv+PyD/AK6L/OgDrKKKKkYUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVxtdlXG00JhRRRTAKKKKACt/w/wD8eb/9dD/IVgVv+H/+PN/+uh/kKQI06KKKQwooooAKKKKACiiigAooooAKKKKACiiigArG8Rf8u/8AwL+lbNY3iL/l3/4F/SmBjUUUUxBRRRQAVNZf8fkH/XRf51DU1l/x+Qf9dF/nQB1lFFFSMKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACsbxF/y7/8C/pWzWN4i/5d/wDgX9KYGNRRRTEFFFFABU1l/wAfkH/XRf51DU1l/wAfkH/XRf50AdZRRRUjCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACuNrsq42mhMKKKKY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RRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/9k=', 'Nanjala Oduor')
) as s(ord, milestone_ord, caption, detail, taken_on, b64, uploaded_by)
join portal_milestones m on m.project_id = p.id and m.ord = s.milestone_ord
where p.reference = 'ATRO-2401';

-- The conversation, on the record.
--
-- Two states, both worth showing: on ATRO-2401 the studio has replied and the
-- client has not opened it yet (their badge shows 1), and on ATRO-2402 the
-- client is waiting on the studio (the console's attention bell shows it and
-- the thread opens itself). A portal where neither side knows the other has
-- read something is the WhatsApp problem this exists to replace.
insert into portal_message (project_id, ord, author_role, author_id, author_label, body, created_at, read_at)
select p.id, s.ord, s.author_role, '', s.author_label, s.body,
  now() - make_interval(hours => s.age_hours),
  case when s.read_hours is null then null
       else now() - make_interval(hours => s.read_hours) end
from portal_projects p
cross join lateral (values
  (1, 'client', 'Wanjiku Njeri',
   'Has the roof covering arrived? The next call still lists it as outstanding.',
   96, 95),
  (2, 'studio', 'Nanjala Oduor',
   'Arriving Thursday. I will post photographs against the roof stage as it goes up, so you can see it fixed before the finishes start.',
   48, null)
) as s(ord, author_role, author_label, body, age_hours, read_hours)
where p.reference = 'ATRO-2401';

-- The stuck project: the client asked three weeks ago and nobody has opened it.
insert into portal_message (project_id, ord, author_role, author_id, author_label, body, created_at, read_at)
select p.id, 1, 'client', '', s.author_label, s.body,
  now() - make_interval(days => s.age_days), null
from portal_projects p
cross join lateral (values
  ('Brian Otieno', 'Any movement on the change of use permit? It has been two months and I am paying rent on a site that cannot start.', 21)
) as s(author_label, body, age_days)
where p.reference = 'ATRO-2402';

-- ── after handover: a live defect window, four reports, the care fee ──
--
-- Like every other date here the deadline runs from the seed date, so a fresh
-- database always shows a countdown rather than a date that quietly went stale.
-- The state is the one a client meets in the months after the keys: a fix
-- waiting for them to confirm, a fresh report on the studio's desk, a closed one
-- with its full history, and a decline with a reason attached — because a
-- defect window is judged on how the last of those is handled.
update portal_projects
set defect_period_ends = (current_date + 45)::text,
    updated_at = now()
where reference = 'ATRO-2401';

insert into portal_defect (
  project_id, ord, title, detail, area, severity, status,
  reported_on, accepted_on, fixed_on, verified_on, reject_reason, note,
  reported_by, created_at, updated_at
)
select
  p.id, d.ord, d.title, d.detail, d.area, d.severity, d.status,
  (current_date - d.rep)::text,
  case when d.acc is null then '' else (current_date - d.acc)::text end,
  case when d.fix is null then '' else (current_date - d.fix)::text end,
  case when d.ver is null then '' else (current_date - d.ver)::text end,
  d.reject_reason, d.note, d.reported_by,
  now() - make_interval(days => d.rep),
  now() - make_interval(days => d.upd)
from portal_projects p
cross join lateral (values
  (1, 'Paint touch-up on the north elevation',
   'Weather staining above the window head, three patches.',
   'North elevation', 'minor', 'verified',
   40, 38, 30, 25, 0, '',
   'Repaired and confirmed by the client on inspection.', 'client'),
  (2, 'Crack above the ensuite door',
   'Hairline crack on the reveal, about 30 cm, appeared after the plaster dried out.',
   'Ensuite, first floor', 'major', 'fixed',
   25, 20, 6, null, 6, '',
   'Reopened the reveal, filled and repainted. Please check it in daylight — it is most visible late afternoon.', 'client'),
  (3, 'Kitchen cabinetry finish',
   'Two door fronts chipped along the lower edge.',
   'Kitchen', 'minor', 'rejected',
   18, null, null, null, 16,
   'The bought-in cabinetry carries the supplier''s two-year warranty. Report it to them and we will attend with them — this contract covers the fit, not the finish.',
   '', 'studio'),
  (4, 'Garden tap drips when closed',
   'Drips from the spout when fully shut; started after the washer was replaced.',
   'Ground floor, garden', 'minor', 'reported',
   3, null, null, null, 3, '',
   '', 'client')
) as d(ord, title, detail, area, severity, status, rep, acc, fix, ver, upd, reject_reason, note, reported_by)
where p.reference = 'ATRO-2401'
order by d.ord;

-- One care plan, renewing far enough out to read as active but close enough to
-- count down. The fee is 0.35% of contract — the sort of annual figure a client
-- can check against the build without a spreadsheet.
insert into portal_retainer (
  project_id, name, covers, annual_amount, renews_on, status, last_paid_on
)
select p.id,
  'Annual care',
  'Roof and rainwater goods, gutters cleared twice a year, two planned visits a year, and first response to any leak within 24 hours.',
  150000,
  (current_date + 60)::text,
  'active',
  (current_date - 305)::text
from portal_projects p
where p.reference = 'ATRO-2401';

-- ── variations: priced changes, and the one that moved the contract ──
--
-- The project was seeded at its signed figure — 42,000,000 — and approval is
-- what amends a contract, so the seed amends it here in the same order the
-- product does. That leaves the BoQ and every other row untouched, and the
-- client's "signed at" figure derives straight back out of the amended sum.
update portal_projects
set contract_value = 42150000,
    updated_at = now()
where reference = 'ATRO-2401';

insert into portal_variation (
  project_id, ord, title, detail, reason, source_kind, source_id,
  amount, days, status, proposed_on, decided_on, decision_note, decided_by,
  created_at, updated_at
)
select
  p.id, v.ord, v.title, v.detail, v.reason, 'studio', null,
  v.amount::bigint, v.days, v.status,
  (current_date - v.rep)::text,
  case when v.dec is null then '' else (current_date - v.dec)::text end,
  v.note, v.by,
  now() - make_interval(days => v.rep),
  now() - make_interval(days => coalesce(v.dec, v.rep))
from portal_projects p
cross join lateral (values
  -- Settled states first so the ord order reads oldest → newest like the rest
  -- of the seed: withdrawn, approved, declined, and one still with the client.
  (1, 'Gypsum ceiling upgrade, first floor',
   'Set ceiling with cove lighting to the lounge and first-floor landing.',
   'The client asked for it after seeing the sample board.',
   320000, 5, 'withdrawn', 20, 9,
   'The ceiling decision is still open — I will re-price it once you have chosen.', 'studio'),
  (2, 'Underfloor heating, ground floor wet areas',
   'Electric mat to the ensuite and guest WC, thermostat to the wall.',
   'Added before the screed went down, while it was still cheap to fit.',
   150000, 4, 'approved', 42, 38, '', 'client'),
  (3, 'Roof covering to natural slate',
   'Natural slate instead of the stone-coated tile in the roof selection.',
   'The slate quotation came in from the client’s own surveyor after tender.',
   430000, 10, 'declined', 25, 18,
   'We will stay with the stone-coated tile — put the saving into the kitchen instead.',
   'client'),
  (4, 'Bigger roof overhang to the east terrace',
   'Extend the eave from 600 to 900 mm across the east face, fascia and gutter to suit.',
   'The terrace bakes in the afternoon sun and the slider gets no shade after 2 pm.',
   275000, 7, 'proposed', 2, null, '', '')
) as v(ord, title, detail, reason, amount, days, status, rep, dec, note, by)
where p.reference = 'ATRO-2401';
