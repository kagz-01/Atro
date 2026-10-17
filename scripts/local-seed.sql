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
