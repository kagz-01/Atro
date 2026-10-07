// ATRO — Build Journey
// The full sequence of building in Kenya as a diaspora client, stage by stage.
// Every stage: what happens, how long, what you must approve, what you receive,
// what it costs, and how it most often goes wrong.

export type JourneyStage = {
  id: string;
  order: number;
  name: string;
  phase: "Before you build" | "Getting it built";
  duration: string;
  costShare: string;
  summary: string;
  happens: string[];
  youApprove: string[];
  youReceive: string[];
  verify: string[];
  failure: string[];
  fromAbroad: string;
};

export const JOURNEY: JourneyStage[] = [
  {
    id: "land",
    order: 1,
    name: "Land and due diligence",
    phase: "Before you build",
    duration: "2–8 weeks",
    costShare: "No build cost",
    summary:
      "Confirming the land is genuinely owned, genuinely for sale, and genuinely the size it claims — while you are physically unable to stand on it.",
    happens: [
      "Official search at the Ministry of Lands or the county land office, against the parcel number",
      "Encumbrance check to confirm nobody has a charge or caveat over it",
      "Physical survey by an independent surveyor to establish real boundaries and area",
      "Confirmation of the land's zoning and whether development permission is achievable",
      "Confirmation the land is not subject to a community, customary or court claim",
    ],
    youApprove: [
      "Which parcel — always confirm against the official search, never against a seller's PDF",
      "Whether to proceed at all if the search reveals a problem",
      "The surveyor's appointment",
    ],
    youReceive: [
      "Official land search certificate",
      "Encumbrance search result",
      "Surveyor boundary report and area computation",
      "A written due diligence summary with anything unresolved flagged plainly",
    ],
    verify: [
      "The parcel number exists on the official register at all",
      "The registered owner's name matches the person selling to you",
      "The search date is recent — searches go stale in weeks, not months",
      "The surveyed area matches the area being sold to you",
      "Two neighbours can confirm who has actually occupied the land and for how long",
    ],
    failure: [
      "Buying from someone who is not the registered owner",
      "Buying a parcel whose number does not exist on the register",
      "Buying land that is genuinely in dispute, where the 'search' was done by the seller's own agent",
      "Buying 1/2 acre and discovering the survey is 1/4 acre",
      "Paying a deposit with no independent search having taken place",
    ],
    fromAbroad:
      "This is the highest-risk stage for a diaspora client and the one most often skipped, because it is the hardest to do remotely. Use a Kenyan advocate or your own independent lawyer — not the seller's lawyer. Ask for the search in writing and pay for it yourself so the seller cannot control who does it. If nobody will let you run an independent search, that is your answer.",
  },
  {
    id: "team",
    order: 2,
    name: "Appoint and verify the team",
    phase: "Before you build",
    duration: "1–3 weeks",
    costShare: "1–3%",
    summary:
      "Deciding who designs it, who measures it, who builds it, and who checks them — then verifying every one of those registrations yourself.",
    happens: [
      "Appoint an architect to produce the design, and confirm their AAK registration",
      "Appoint a quantity surveyor to produce the bill of quantities and run the cost control",
      "Appoint the contractor, confirming NCA registration in the relevant category",
      "Appoint a structural engineer if the structure requires one, confirming EBK registration",
      "Agree a named project manager who will be your single point of contact",
    ],
    youApprove: [
      "Each appointment, made against a registration number you verified yourself",
      "The scope split between design, consultancy and construction",
      "The fee basis — fixed, stage, or time charge",
    ],
    youReceive: [
      "Registration numbers for every professional, with the body that holds them",
      "Written scope of services for each appointment",
      "A named project manager with a direct contact number",
    ],
    verify: [
      "Every registration number against the registering body directly, not against the contractor's website",
      "That the contractor's NCA category actually covers the work being contracted",
      "That the professional indemnity cover named is real and current",
      "References on projects that were actually built, with clients you can call independently",
    ],
    failure: [
      "Appointing whoever the land seller recommended",
      "Accepting a registration number without looking it up",
      "A contractor registered in a lower category than the work requires",
      "No named project manager, so every question goes through a rotating inbox",
    ],
    fromAbroad:
      "Appointing in person is not required and is not even possible for most clients. What matters is that each appointment is verified independently. We publish the registration numbers of everyone on your project and where to check each one.",
  },
  {
    id: "design",
    order: 3,
    name: "Design and drawings",
    phase: "Before you build",
    duration: "4–10 weeks",
    costShare: "6–12%",
    summary:
      "Producing drawings specific to your plot and brief, then a specification and bill of quantities that turn those drawings into a number you can hold someone to.",
    happens: [
      "Brief, site survey and concept design",
      "Developed design: plans, sections, elevations, structural and services drawings",
      "A written specification — what is being built, to what standard, with which materials",
      "A bill of quantities measuring every item, priced by the quantity surveyor",
      "Submission package for the authorities",
    ],
    youApprove: [
      "The design itself, in detail, before it is built from",
      "The specification — this is where finish quality is actually decided",
      "The bill of quantities, and therefore the budget",
    ],
    youReceive: [
      "Drawings at every stage, not just the final set",
      "A written material and workmanship specification",
      "A priced bill of quantities you can compare any later quote against",
      "A realistic programme with durations per stage",
    ],
    verify: [
      "That the drawings are specific to your plot, not a template adapted for you",
      "That the specification names actual products, not 'good quality'",
      "That quantities in the bill of quantities are reasonable against the drawings",
      "That any quote you receive matches the same bill of quantities",
    ],
    failure: [
      "Signing off a design you have not actually seen in detail",
      "Approving verbally — everything agreed verbally is forgotten the moment it is expensive",
      "A specification so vague that any material passes as compliant",
      "Building to drawings that were never approved by the authorities",
    ],
    fromAbroad:
      "This is the stage where remote approval works well, because drawings are precise and comparable. Review them in a scheduled video call, screen-shared, section by section. Approve in writing. Never approve a design from photographs.",
  },
  {
    id: "approvals",
    order: 4,
    name: "Statutory approvals",
    phase: "Before you build",
    duration: "6–16 weeks",
    costShare: "3–8%",
    summary:
      "Getting every approval the law requires before a single block is laid. Delays here are the single biggest cause of programme overrun in Kenya.",
    happens: [
      "Development permission and building plan approval from the county",
      "National Construction Authority registration of the project",
      "NEMA environmental impact assessment and licence where the project thresholds require it",
      "Utility applications — water, sewerage and electrical",
      "Any wayleave or consent required for the plot",
    ],
    youApprove: [
      "Applications submitted in your name",
      "Fees — know which are statutory and which are the consultant's charge",
      "Programme implications of any extension they require",
    ],
    youReceive: [
      "Approved building plans, stamped by the county",
      "NEMA licence where applicable",
      "NCA registration certificate",
      "Utility connection approvals and their connection dates",
    ],
    verify: [
      "That approvals are in hand and stamped before construction starts, not promised",
      "That fees paid to authorities are supported by official receipts",
      "That your consultant is not adding an unexplained margin to statutory fees",
    ],
    failure: [
      "Starting construction before the stamped approved plan exists",
      "Paying a consultant for 'permits' without seeing the stamped approvals",
      "NEMA assessed late, when the design is already fixed",
      "Assuming a permit is approved because an application was submitted",
    ],
    fromAbroad:
      "Approvals need your authority as the owner, which usually means a power of attorney to a Kenyan advocate. Draft this properly at the appointment stage. Get copies of every stamped approval — you should never have to ask whether something exists.",
  },
  {
    id: "foundation",
    order: 5,
    name: "Site set-up and foundation",
    phase: "Getting it built",
    duration: "4–8 weeks",
    costShare: "10–15%",
    summary:
      "Setting out the building exactly as drawn, then excavating, reinforcing and casting the foundation. Everything above this level depends on it being right.",
    happens: [
      "Setting out with a surveyor using the approved drawings",
      "Excavation to foundation level, with foundation trenches opened",
      "Blinding, reinforcement and formwork to the foundation",
      "Foundation walling, DPC (damp-proof course) and hardcore filling",
      "Slab construction with anti-termite treatment and DPC",
    ],
    youApprove: [
      "Set-out dimensions, confirmed against the drawings before excavation",
      "Any variation in foundation depth if ground conditions require it",
    ],
    youReceive: [
      "Foundation completion photographs, including trenches before and after",
      "Concrete cube test results for the pour",
      "A written confirmation of set-out dimensions",
    ],
    verify: [
      "That set-out matches the drawings — do this stage by stage, errors here are structural",
      "Concrete cube test results, ideally from an independent lab",
      "That anti-termite treatment and DPC were actually applied, not billed only",
      "Excavation photographs before the pour, which is your only evidence of depth",
      "Foundation depth against the structural design, especially if rock was expected",
    ],
    failure: [
      "Set-out wrong, discovered only when walls are built",
      "No cube tests, meaning nobody can prove the concrete was of the specified strength",
      "Anti-termite treatment skipped as an 'extra'",
      "DPC omitted under the slab, leading to rising damp for the life of the building",
      "Backfilling without testing the fill",
    ],
    fromAbroad:
      "If you can make one trip, this is the trip worth making. Foundation problems are the most expensive and most disruptive to fix, and they are invisible the moment the slab is cast. If you cannot travel, insist on excavation photographs, cube test results and a written set-out confirmation before the foundation is signed off as complete.",
  },
  {
    id: "frame",
    order: 6,
    name: "Structural frame",
    phase: "Getting it built",
    duration: "6–14 weeks",
    costShare: "18–25%",
    summary:
      "Building the walls, ring beam, columns and roof structure. This is the stage where a building's shape becomes undeniable, and where the most money is spent.",
    happens: [
      "Wall construction in block or appropriate materials to the designed thickness",
      "Reinforced concrete columns and ring beams to the structural design",
      "Stiffening columns and wall ties where specified",
      "Beam and lintel casting at openings",
      "First stage of roof structure",
    ],
    youApprove: [
      "Wall finishes — this decision is expensive to reverse and permanently visible",
      "Any structural variation, which must come from the engineer, never the site",
    ],
    youReceive: [
      "Weekly photographs with dates and stage context",
      "Progress measured against the programme",
      "Structural engineer's inspection at completion of the frame",
    ],
    verify: [
      "Wall thickness against the drawings, measured not estimated",
      "Column and beam sizes against the structural drawings",
      "Openings in the positions drawn — a shifted door opening is obvious now and costly later",
      "That block, cement and reinforcement are of specified grade, with delivery notes",
      "Curing time being observed, not rushed to save programme",
    ],
    failure: [
      "Under-thickness walls to save block",
      "Reinforcement of the wrong diameter, because nobody checked the delivery",
      "Rushed curing, producing weak concrete",
      "Openings moved on site 'to save breaking later'",
      "No engineer's inspection before the roof goes on, when it can no longer be corrected",
    ],
    fromAbroad:
      "The frame is the largest single cost, so this is where milestone payment protection matters most. Payment should follow an independent certificate confirming measured quantities, not a percentage of the total contract. Ask to see reinforcement fixed before it is covered — once concrete is poured, no verification of any kind is possible.",
  },
  {
    id: "roof",
    order: 7,
    name: "Roofing and rainwater",
    phase: "Getting it built",
    duration: "3–6 weeks",
    costShare: "8–12%",
    summary:
      "Covering the building so rain stops entering, and getting water away from it safely. Getting this wrong causes damp for years.",
    happens: [
      "Roof structure, trusses or rafters, and sheathing",
      "Underlay, battens and covering — tiles, steel sheet or another specified system",
      "Fascia, bargeboards, guttering and downpipes",
      "Roof treatment where specified",
      "Internal ceilings below, where in the programme",
    ],
    youApprove: [
      "The covering material, which affects both cost and appearance for decades",
      "Gutter and downpipe routing",
    ],
    youReceive: [
      "Photographs of the roof structure before it is covered",
      "Confirmation of the covering specification used",
      "Photographs of completed guttering and downpipes",
    ],
    verify: [
      "Roof structure before covering — photograph it while it is still visible",
      "Pitch and overhang against the drawings",
      "That underlay is present, not just the visible covering",
      "Gutter falls toward the downpipe, not away from it",
      "That the roof is watertight, tested before internal work proceeds",
    ],
    failure: [
      "No underlay, so the roof leaks as soon as it is covered",
      "Covering installed over damp or untreated timber",
      "Gutters falling the wrong way, discharging onto the foundation",
      "Roof declared 'done' in a report while it still leaks in the rain",
    ],
    fromAbroad:
      "A photo of the roof structure before covering is the single most useful piece of evidence you can hold on to. Ask for it every time, at every stage. It costs nothing and it cannot be recreated.",
  },
  {
    id: "mep",
    order: 8,
    name: "Plumbing, electrical and drainage",
    phase: "Getting it built",
    duration: "4–10 weeks",
    costShare: "10–16%",
    summary:
      "Everything hidden inside the walls and under the floor. Once it is covered, nobody can check it without breaking into the building.",
    happens: [
      "Water supply, drainage and septic or sewer connection",
      "Electrical wiring, consumer unit, and fittings",
      "Under-floor drainage and venting",
      "Water heater installation and provision",
      "Testing before any walls are closed",
    ],
    youApprove: [
      "The plumbing and electrical specification, and which fittings you want",
      "Hot water system choice — solar, electric, or both",
    ],
    youReceive: [
      "Test certificates for the electrical installation",
      "Pressure test results on the water supply",
      "Photographs of every service run before it is concealed",
    ],
    verify: [
      "Photographs of all services before they are hidden — this is non-negotiable",
      "Electrical installation tested and certified by a competent electrician",
      "Water pressure tested and left pressurised",
      "Drainage falls correct, and the septic tank sized for the household",
      "That nothing has been buried in concrete without being photographed first",
    ],
    failure: [
      "Services buried without a single photograph",
      "No test certificate for the electrical work",
      "Undersized water supply, discovered as low pressure years later",
      "Drainage laid to the wrong fall, causing permanent blockage",
      "Attic or in-wall voids with no access panel for servicing",
    ],
    fromAbroad:
      "This is the stage that most often makes remote ownership genuinely frightening, because the evidence is destroyed the moment the walls close. Our requirement is photographic records of every concealed service before it is concealed, held in your document vault permanently. If a contractor resists this, they are telling you something.",
  },
  {
    id: "finishes",
    order: 9,
    name: "Finishes and fit-out",
    phase: "Getting it built",
    duration: "8–20 weeks",
    costShare: "20–30%",
    summary:
      "Plastering, painting, flooring, ceilings, joinery, sanitary fittings and kitchen — where the specification decisions actually become visible.",
    happens: [
      "Internal and external plastering",
      "Floor screeds, tiling and finishes",
      "Painting and decoration",
      "Doors, windows, ironmongery and joinery",
      "Sanitary fittings, kitchen units and electrical fittings",
      "External works — paving, fencing, drainage, landscaping",
    ],
    youApprove: [
      "Every finish sample, physically, before it is applied at scale",
      "Tile, flooring and paint selections",
      "Any substitution of specified materials",
    ],
    youReceive: [
      "Approved finish samples, retained for your records",
      "Defects list process with dates for completion",
      "As-built records of what was actually installed",
    ],
    verify: [
      "That installed materials match the approved specification — check the actual product, not the invoice",
      "Paint and plaster thickness on a test patch before full walls",
      "Tile adhesive and grout quality, which determines whether tiles fail later",
      "Silicone and sealant correctly applied in wet areas, which is where mould appears",
      "External drainage falls and paving falls away from the building",
    ],
    failure: [
      "Substituting cheaper materials without telling you",
      "Applying full paint before a test patch",
      "Rushed tiling, causing lippage and hollow-sounding floors",
      "Wet-area sealing skipped because it is invisible",
      "Defects left unrecorded, so they become 'your problem' at handover",
    ],
    fromAbroad:
      "Approve physical samples, never photographs — colour, texture and finish are badly represented in photos, and screens are unreliable for judging colour. Ask for samples to be couriered to you, or approve them in person at a single grouped decision session. Batch the finish approvals rather than making 40 separate decisions.",
  },
  {
    id: "handover",
    order: 10,
    name: "Handover and defects period",
    phase: "Getting it built",
    duration: "2 weeks + 3–12 months",
    costShare: "Retention released",
    summary:
      "Testing everything, listing what is wrong, getting it fixed, and releasing the retention only once it is.",
    happens: [
      "Joint snagging walkthrough with a written defects list",
      "Testing of electrical, plumbing, drainage and appliances",
      "Handover of keys, as-built drawings, warranties and guarantees",
      "Defects rectification within the defects liability period",
      "Final account reconciliation and retention release",
    ],
    youApprove: [
      "The defects list itself",
      "Practical completion, which triggers the defects period and final payment",
      "Release of retention, once defects are closed",
    ],
    youReceive: [
      "Keys and access to every part of the building",
      "As-built drawings matching what was actually built",
      "All warranties, guarantees and equipment manuals",
      "Test certificates for every system",
      "The final account, reconciled against the original bill of quantities",
    ],
    verify: [
      "Every defect actually fixed, not marked off on paper only",
      "As-built drawings reflecting reality, not the original design intent",
      "Warranties in your name, not the contractor's supplier's name",
      "The final account reconciled line by line against the contract BOQ",
      "Retention not released until the defects are genuinely closed",
    ],
    failure: [
      "Practical completion declared while defects remain",
      "Retention released early, losing your leverage",
      "As-built drawings never issued",
      "Warranties issued in the supplier's name, worthless to you",
      "Final account showing more than the contract, with variations you never approved",
    ],
    fromAbroad:
      "If you cannot be present at handover, commission an independent snagging inspection — a different party from the one supervising the build. Pay for it yourself. Do this before accepting practical completion and before any retention is released. It is the cheapest money you will spend on the whole project.",
  },
];

export const JOURNEY_PHASES = [
  {
    id: "Before you build",
    note: "Where diaspora projects are actually won or lost. Nothing here is on site; all of it can be done remotely, and all of it is verifiable.",
  },
  {
    id: "Getting it built",
    note: "The physical build. Progress is photographed, measured and certified at every stage, so you can track it from anywhere.",
  },
] as const;

export function journeyStageById(id: string) {
  return JOURNEY.find((s) => s.id === id);
}
