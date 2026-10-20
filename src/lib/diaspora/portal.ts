// ATRO — Client Portal demo dataset
// A real-shaped project record: milestones with photographic evidence, a payment
// ledger with retention, a document vault, a decision log, and the registered
// professionals on the job. This is what a diaspora client actually sees.

export type MilestoneStatus = "complete" | "active" | "pending" | "blocked";

export type Evidence = {
  date: string;
  caption: string;
  detail: string;
};

export type Milestone = {
  id: string;
  order: number;
  stage: string;
  name: string;
  status: MilestoneStatus;
  progress: number;
  plannedStart: string;
  plannedEnd: string;
  actualEnd?: string;
  summary: string;
  evidence?: Evidence[];
  verifiedBy?: string;
  /** True once the studio has marked the stage ready for the client to approve. */
  approvalReady?: boolean;
};
export type PaymentStatus =
  | "paid"
  | "certified"
  | "due"
  | "scheduled"
  | "retained";

export type Payment = {
  id: string;
  label: string;
  stage: string;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  certificate?: string;
  method?: string;
  note?: string;
};

export type VaultDoc = {
  id: string;
  name: string;
  category:
    | "Contract"
    | "Approval"
    | "Certificate"
    | "Payment"
    | "Drawing"
    | "Report";
  issued: string;
  reference: string;
  size: string;
  state: "verified" | "signed" | "awaiting";
};

export type Decision = {
  id: string;
  date: string;
  title: string;
  detail: string;
  options: string[];
  chosen?: string;
  costImpact: number;
  state: "open" | "awaiting-client" | "decided";
};

export type Professional = {
  name: string;
  role: string;
  body: string;
  regNo: string;
  verifyUrl: string;
};

export const PORTAL_PROJECT = {
  reference: "ATR-2026-0417",
  title: "4-bedroom maisonette, Karen",
  client: "Wanjiku M. — United Kingdom",
  clientInitials: "WM",
  plot: "Title No. LR 11842/201, Westlands, Nairobi",
  area: "312 m²",
  contractType: "Design and build",
  started: "12 January 2026",
  targetHandover: "18 December 2026",
  contractValue: 41_800_000,
  boqValue: 41_800_000,
  stage: "Structural frame",
  overallProgress: 46,

  budget: {
    certifiedToDate: 18_420_000,
    paidToDate: 17_940_000,
    currentlyCertified: 480_000,
    retentionHeld: 940_000,
    retentionPct: 5,
    committed: 41_800_000,
    projectedAtCompletion: 42_150_000,
  },

  schedule: {
    daysElapsed: 158,
    daysTotal: 310,
    daysRemaining: 152,
    onTrack: true,
    varianceDays: 0,
    note: "Frame completion running 2 days ahead of programme.",
  },

  nextCall: {
    when: "Thursday 13 March, 18:00 EAT",
    localTimeForYou: "15:00 GMT",
    agenda: [
      "Frame progress and window opening sign-off",
      "Roof covering selection — samples dispatched",
      "Electrical first-fix specification",
      "Variation VO-003 decision required",
    ],
  },
} as const;

export const MILESTONES: Milestone[] = [
  {
    id: "m1",
    order: 1,
    stage: "Before you build",
    name: "Land due diligence and survey",
    status: "complete",
    progress: 100,
    plannedStart: "12 Jan 2026",
    plannedEnd: "26 Jan 2026",
    actualEnd: "23 Jan 2026",
    summary:
      "Official search, encumbrance check and independent boundary survey completed. Registered owner confirmed. Surveyed area 314 m² against 312 m² sold — 2 m² variance accepted and recorded.",
    verifiedBy: "M. Kariuki, Advocate — LML/2019/4471",
    evidence: [
      {
        date: "14 Jan 2026",
        caption: "Official land search certificate",
        detail:
          "Registered owner matches seller. No caveat or charge recorded. Search valid at date of issue.",
      },
      {
        date: "19 Jan 2026",
        caption: "Surveyor boundary report",
        detail:
          "All four beacons located and pinned. Computed area 314 m². Two boundary points found to be 1.1 m inside the advertised boundary; variance documented and accepted.",
      },
      {
        date: "23 Jan 2026",
        caption: "Neighbour confirmation, north boundary",
        detail:
          "Written confirmation from the adjacent plot holder that occupation has been continuous and uncontested for over 15 years.",
      },
    ],
  },
  {
    id: "m2",
    order: 2,
    stage: "Before you build",
    name: "Design and specification",
    status: "complete",
    progress: 100,
    plannedStart: "26 Jan 2026",
    plannedEnd: "20 Mar 2026",
    actualEnd: "18 Mar 2026",
    summary:
      "Concept approved by client on 3 Feb. Developed design and specification issued 27 Feb, approved 12 Mar after two revision rounds. Bill of quantities priced at KES 41,800,000.",
    verifiedBy: "A. Wanjiru, Architect — AAK/2016/1187",
    evidence: [
      {
        date: "3 Feb 2026",
        caption: "Concept design approved",
        detail:
          "Four-bedroom, two-storey. Approved by client on video call. Four options tabled; option C selected for daylight and circulation.",
      },
      {
        date: "27 Feb 2026",
        caption: "Developed design and specification issued",
        detail:
          "Full drawing set: plans, sections, elevations, structural and services. 74-page specification naming specific products and grades.",
      },
      {
        date: "18 Mar 2026",
        caption: "Bill of quantities priced",
        detail:
          "312 measured items priced to Q1 2026 rates. Total KES 41,800,000 excluding VAT, statutory fees and external works.",
      },
    ],
  },
  {
    id: "m3",
    order: 3,
    stage: "Before you build",
    name: "Statutory approvals",
    status: "complete",
    progress: 100,
    plannedStart: "16 Mar 2026",
    plannedEnd: "8 May 2026",
    actualEnd: "29 Apr 2026",
    summary:
      "County development permission and approved building plans issued 24 Apr. NCA project registration complete. NEMA not required for this project under the second schedule. Utility applications submitted, connections scheduled.",
    verifiedBy: "Nairobi County Government — reference stamped on plan",
    evidence: [
      {
        date: "24 Apr 2026",
        caption: "Approved building plans, stamped",
        detail:
          "County stamp on all sheets. Condition 4 requires retention at 5% — reflected in the payment schedule.",
      },
      {
        date: "24 Apr 2026",
        caption: "NCA registration certificate",
        detail: "Project registered. Contractor category verified as appropriate for the works.",
      },
      {
        date: "29 Apr 2026",
        caption: "NEMA applicability determination",
        detail:
          "Written determination received confirming the project falls below the EIA threshold. Determination on file.",
      },
    ],
  },
  {
    id: "m4",
    order: 4,
    stage: "Getting it built",
    name: "Foundation and slab",
    status: "complete",
    progress: 100,
    plannedStart: "5 May 2026",
    plannedEnd: "26 Jun 2026",
    actualEnd: "24 Jun 2026",
    summary:
      "Set-out verified against approved drawings before excavation. Foundation cast 2 days ahead. Cube tests from an independent laboratory all passed. Anti-termite treatment and DPC applied and photographed.",
    verifiedBy: "Independent lab: 28-day cubes 32.5 N/mm² against 30 N/mm² specified",
    evidence: [
      {
        date: "12 May 2026",
        caption: "Excavation open — before the pour",
        detail:
          "Trenches to 1.2 m. Photograph taken the same day as excavation, before any backfill. No rock encountered.",
      },
      {
        date: "8 May 2026",
        caption: "Set-out confirmation",
        detail:
          "Setting out dimensions confirmed by surveyor against approved drawings before excavation commenced.",
      },
      {
        date: "16 May 2026",
        caption: "Reinforcement fixed — before concrete",
        detail:
          "Mesh and starter bars photographed at every corner before the pour. D12 as specified.",
      },
      {
        date: "24 Jun 2026",
        caption: "DPC and anti-termite treatment applied",
        detail:
          "Damp-proof course laid across the full slab area before hardcore. Treatment certificate on file.",
      },
    ],
  },
  {
    id: "m5",
    order: 5,
    stage: "Getting it built",
    name: "Structural frame",
    status: "active",
    progress: 62,
    plannedStart: "26 Jun 2026",
    plannedEnd: "22 Aug 2026",
    summary:
      "External and internal walls to first floor level complete. Columns and ring beam to ground floor cast. Currently at first floor ring beam. Running 2 days ahead.",
    verifiedBy: "Structural engineer inspection: 4 March, no defects raised",
    evidence: [
      {
        date: "4 Mar 2026",
        caption: "Reinforcement fixed — first floor ring beam",
        detail:
          "Photographed before the pour. Ring beam links and column starters visible and correctly placed.",
      },
      {
        date: "11 Mar 2026",
        caption: "Wall thickness verification",
        detail:
          "Measured by the site supervisor against drawings at 1.2 m intervals. All readings 200 mm as specified.",
      },
    ],
  },
  {
    id: "m6",
    order: 6,
    stage: "Getting it built",
    name: "Roofing and rainwater",
    status: "pending",
    progress: 0,
    plannedStart: "22 Aug 2026",
    plannedEnd: "3 Oct 2026",
    summary:
      "Roof structure, covering, guttering and downpipes. Covering material pending client approval — samples dispatched.",
  },
  {
    id: "m7",
    order: 7,
    stage: "Getting it built",
    name: "Services — plumbing, electrical, drainage",
    status: "pending",
    progress: 0,
    plannedStart: "28 Sep 2026",
    plannedEnd: "5 Nov 2026",
    summary:
      "All first-fix services. Every concealed run photographed and uploaded before it is covered.",
  },
  {
    id: "m8",
    order: 8,
    stage: "Getting it built",
    name: "Finishes and fit-out",
    status: "pending",
    progress: 0,
    plannedStart: "5 Nov 2026",
    plannedEnd: "30 Nov 2026",
    summary:
      "Plastering, flooring, painting, joinery, sanitary and kitchen. Sample approvals required before application at scale.",
  },
  {
    id: "m9",
    order: 9,
    stage: "Getting it built",
    name: "Handover and defects",
    status: "pending",
    progress: 0,
    plannedStart: "1 Dec 2026",
    plannedEnd: "18 Dec 2026",
    summary:
      "Independent snagging inspection, defects list, rectification, as-built drawings, warranties. Retention released after defects close.",
  },
];

export const PAYMENTS: Payment[] = [
  {
    id: "p1",
    label: "Stage 1 — Land due diligence and survey",
    stage: "Before you build",
    amount: 850_000,
    status: "paid",
    dueDate: "26 Jan 2026",
    paidDate: "23 Jan 2026",
    certificate: "CERT-001",
    method: "Bank transfer",
  },
  {
    id: "p2",
    label: "Stage 2 — Design and specification, 2 of 3",
    stage: "Before you build",
    amount: 2_950_000,
    status: "paid",
    dueDate: "27 Feb 2026",
    paidDate: "27 Feb 2026",
    certificate: "CERT-002",
    method: "Bank transfer",
  },
  {
    id: "p3",
    label: "Stage 3 — Bill of quantities and tender documentation",
    stage: "Before you build",
    amount: 1_180_000,
    status: "paid",
    dueDate: "20 Mar 2026",
    paidDate: "18 Mar 2026",
    certificate: "CERT-003",
    method: "Bank transfer",
  },
  {
    id: "p4",
    label: "Stage 4 — Statutory approvals and applications",
    stage: "Before you build",
    amount: 1_450_000,
    status: "paid",
    dueDate: "8 May 2026",
    paidDate: "29 Apr 2026",
    certificate: "CERT-004",
    method: "Bank transfer",
    note: "Paid on receipt of stamped plans, not on submission of applications.",
  },
  {
    id: "p5",
    label: "Stage 5 — Mobilisation and foundation, certificate 1",
    stage: "Foundation",
    amount: 6_270_000,
    status: "paid",
    dueDate: "26 Jun 2026",
    paidDate: "24 Jun 2026",
    certificate: "CERT-005",
    method: "Bank transfer",
    note: "Released against excavation and cube test evidence.",
  },
  {
    id: "p6",
    label: "Stage 5 — Foundation and slab, certificate 2",
    stage: "Foundation",
    amount: 5_240_000,
    status: "paid",
    dueDate: "26 Jul 2026",
    paidDate: "25 Jul 2026",
    certificate: "CERT-006",
    method: "Bank transfer",
    note: "5% retention of 4,480,000 held against defects.",
  },
  {
    id: "p7",
    label: "Stage 6 — Structural frame, certificate 1",
    stage: "Structural frame",
    amount: 5_000_000,
    status: "certified",
    dueDate: "28 Feb 2026",
    certificate: "CERT-007",
    note: "Certified 13 March. Measured quantities verified by supervising QS. Release on approval.",
  },
  {
    id: "p8",
    label: "Stage 6 — Structural frame, certificate 2",
    stage: "Structural frame",
    amount: 4_780_000,
    status: "due",
    dueDate: "28 Apr 2026",
    note: "Falls due on structural engineer's frame completion certificate.",
  },
  {
    id: "p9",
    label: "Stage 7 — Roofing and rainwater",
    stage: "Roofing",
    amount: 4_180_000,
    status: "scheduled",
    dueDate: "31 Oct 2026",
  },
  {
    id: "p10",
    label: "Stage 8 — Services",
    stage: "Services",
    amount: 5_020_000,
    status: "scheduled",
    dueDate: "30 Nov 2026",
  },
  {
    id: "p11",
    label: "Stage 9 — Finishes and fit-out",
    stage: "Finishes",
    amount: 4_700_000,
    status: "scheduled",
    dueDate: "15 Dec 2026",
  },
  {
    id: "p12",
    label: "Retention — 5% held for defects",
    stage: "Retention",
    amount: 940_000,
    status: "retained",
    dueDate: "18 Dec 2027",
    note: "Released only after the defects liability period closes and defects are rectified.",
  },
];

export const VAULT: VaultDoc[] = [
  {
    id: "d1",
    name: "Design and build contract — executed",
    category: "Contract",
    issued: "26 Jan 2026",
    reference: "ATR-2026-0417",
    size: "2.1 MB",
    state: "signed",
  },
  {
    id: "d2",
    name: "Bill of quantities — priced, 312 items",
    category: "Drawing",
    issued: "18 Mar 2026",
    reference: "BOQ-0417-R1",
    size: "4.8 MB",
    state: "signed",
  },
  {
    id: "d3",
    name: "Approved building plans — county stamped",
    category: "Approval",
    issued: "24 Apr 2026",
    reference: "NCC/WA/2026/1142",
    size: "18.4 MB",
    state: "verified",
  },
  {
    id: "d4",
    name: "NCA project registration certificate",
    category: "Approval",
    issued: "24 Apr 2026",
    reference: "NCA/26/3318",
    size: "640 KB",
    state: "verified",
  },
  {
    id: "d5",
    name: "Independent cube test results — foundation",
    category: "Certificate",
    issued: "22 Jun 2026",
    reference: "LAB/NRB/5521",
    size: "1.2 MB",
    state: "verified",
  },
  {
    id: "d6",
    name: "Anti-termite treatment certificate",
    category: "Certificate",
    issued: "24 Jun 2026",
    reference: "ATT/2026/0912",
    size: "410 KB",
    state: "verified",
  },
  {
    id: "d7",
    name: "Weekly site report — week 8 to 12 March",
    category: "Report",
    issued: "12 Mar 2026",
    reference: "WR-0417-W07",
    size: "6.4 MB",
    state: "verified",
  },
  {
    id: "d8",
    name: "Payment certificate 007 — structural frame 1",
    category: "Payment",
    issued: "13 Mar 2026",
    reference: "CERT-007",
    size: "890 KB",
    state: "awaiting",
  },
  {
    id: "d9",
    name: "Structural engineer inspection report — frame",
    category: "Report",
    issued: "4 Mar 2026",
    reference: "SE/2026/0188",
    size: "2.9 MB",
    state: "verified",
  },
  {
    id: "d10",
    name: "Roof covering samples — dispatch note",
    category: "Report",
    issued: "11 Mar 2026",
    reference: "SMP-0417-02",
    size: "320 KB",
    state: "awaiting",
  },
];

export const DECISIONS: Decision[] = [
  {
    id: "d1",
    date: "3 Feb 2026",
    title: "Concept design option",
    detail:
      "Four layouts tabled. Option C selected for daylight to the rear and a better circulation core.",
    options: ["Option A", "Option B", "Option C", "Option D"],
    chosen: "Option C",
    costImpact: 0,
    state: "decided",
  },
  {
    id: "d2",
    date: "12 Mar 2026",
    title: "Interior wall finish",
    detail:
      "Two options within budget. Neither changes cost materially; the difference is finish and maintenance.",
    options: ["Painted blockwork", "20mm plaster + paint"],
    costImpact: 340_000,
    state: "awaiting-client",
  },
  {
    id: "d3",
    date: "13 Mar 2026",
    title: "Variation VO-003 — relocate utility connection",
    detail:
      "Water connection point falls inside the planned parking bay. County allows relocation at additional cost. Alternatives are a bollard-protected route or a longer connection.",
    options: [
      "Relocate connection (recommended)",
      "Bollard protection over existing route",
      "Extend connection to boundary",
    ],
    costImpact: 285_000,
    state: "awaiting-client",
  },
  {
    id: "d4",
    date: "18 Mar 2026",
    title: "Roof covering material",
    detail:
      "Three systems priced. Samples dispatched for physical approval — photographs are not sufficient to judge colour and texture.",
    options: ["Clay tile", "Colour-coated steel sheet", "Concrete tile"],
    costImpact: 620_000,
    state: "open",
  },
  {
    id: "d5",
    date: "26 Feb 2026",
    title: "Kitchen scope level",
    detail:
      "Client elected fitted units over the standard allowance. Priced separately so it is visible as a decision rather than buried in the total.",
    options: ["Standard allowance", "Fitted units"],
    chosen: "Fitted units",
    costImpact: 1_450_000,
    state: "decided",
  },
];

export const PROFESSIONALS: Professional[] = [
  {
    name: "Achieng' Wanjiru",
    role: "Project architect",
    body: "Architectural Association of Kenya (AAK)",
    regNo: "AAK/2016/1187",
    verifyUrl: "https://www.aak.or.ke",
  },
  {
    name: "Daniel Otieno",
    role: "Structural engineer",
    body: "Engineers Board of Kenya (EBK)",
    regNo: "EBK/2019/2210",
    verifyUrl: "https://www.ebk.go.ke",
  },
  {
    name: "Grace Njeri Mwangi",
    role: "Quantity surveyor",
    body: "Board of Registration of Architects and Quantity Surveyors (BORAQS)",
    regNo: "BORAQS/2018/0947",
    verifyUrl: "https://boraqs.go.ke",
  },
  {
    name: "Kevin Mutiso",
    role: "Site supervisor — independent of contractor",
    body: "Institution of Engineers of Kenya (IEK)",
    regNo: "IEK/2021/4471",
    verifyUrl: "https://www.iek.or.ke",
  },
  {
    name: "Mwakio Kariuki",
    role: "Advocate — land and statutory",
    body: "Law Society of Kenya (LSK)",
    regNo: "LSK/2019/3320",
    verifyUrl: "https://www.lsk.or.ke",
  },
];

export const CONTRACTOR = {
  name: "Sahara Build Contractors Ltd",
  ncaNo: "NCA/2241/2019",
  ncaCategories: ["Buildings — Residential", "Buildings — Commercial"],
  verifyUrl: "https://www.nca.go.ke",
  note: "NCA registration certificate and current category list published on request, and independently checkable against the NCA register.",
} as const;

/** Weekly report, as issued every Friday. */
export const WEEKLY_REPORT = {
  week: "Week 07",
  period: "6–12 March 2026",
  preparedBy: "Kevin Mutiso — site supervisor",
  summary:
    "Frame construction progressed to first floor ring beam. Reinforcement photographed and cast. No defects raised by the structural engineer at the 4 March inspection. Frame running two days ahead of programme.",
  completed: [
    "Ground and first floor walls to 2.4 m completed across the full footprint",
    "First floor ring beam cast 7 March — 21 m³",
    "Reinforcement to first floor slab deck fixed and photographed",
    "Window openings formed to drawings; positions verified against plan",
    "Electrical first-fix conduits set out in ground floor walls",
  ],
  planned: [
    "Cast first floor slab deck",
    "Commence roof blockwork and eaves",
    "Set out and fix first-fix plumbing to ground floor",
    "Begin DPC to internal wet areas",
  ],
  decisionsNeeded: [
    "Interior wall finish — two options within budget, awaiting client selection",
    "Roof covering — physical samples dispatched, approval required before order",
    "Variation VO-003 — utility connection relocation, KES 285,000, awaiting approval",
  ],
  risks: [
    "Rain forecast week 9 may delay slab deck by 2–3 days. Programme retains float.",
    "Portland cement delivery lead time currently 5 days. One delivery delayed to date.",
  ],
  spend: {
    period: 4_180_000,
    cumulative: 17_940_000,
    againstBoq: "On plan. Cumulative spend is 0.4% under the BOQ profile for this date.",
  },
  photos: 34,
} as const;
