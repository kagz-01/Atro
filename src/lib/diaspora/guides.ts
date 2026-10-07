// ATRO — Guides
// The education backbone for building in Kenya from abroad. Written to be read
// before money moves, not after it has.

export type GuideBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "ordered"; items: string[] }
  | { kind: "warn"; text: string }
  | { kind: "tip"; text: string }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "link"; href: string; label: string };

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  category: "Getting started" | "Land" | "Money" | "People" | "During the build";
  readMinutes: number;
  stage?: string;
  blocks: GuideBlock[];
};

export const GUIDES: Guide[] = [
  {
    slug: "building-from-abroad",
    title: "Building in Kenya from abroad: the whole picture",
    summary:
      "What you are actually taking on, what the real sequence is, and the five decisions that determine whether a remote build goes well or badly.",
    category: "Getting started",
    readMinutes: 9,
    blocks: [
      {
        kind: "p",
        text: "Building a house in Kenya while living in another country is entirely feasible, and a large number of our clients never return during construction. It is not, however, something you can do by sending money and receiving photographs. The projects that go badly almost always share the same cause: the client made a series of small decisions without enough information, and by the time the gaps became visible, the money had already gone.",
      },
      {
        kind: "p",
        text: "This guide is the overview. Everything else in this section goes deeper on a specific stage.",
      },
      {
        kind: "h",
        text: "The honest starting position",
      },
      {
        kind: "p",
        text: "You are buying something you cannot see, in a legal and market system you do not live in, using contractors whose incentives are not necessarily aligned with yours. That is not a reason not to proceed — it is the actual situation, and pretending otherwise is how people get hurt. The response is not paranoia. It is structure.",
      },
      {
        kind: "p",
        text: "Anyone who tells you building from abroad is easy, or that you simply need to find the right contractor, is telling you something slightly untrue. It can be managed well. It cannot be managed by trust alone.",
      },
      {
        kind: "h",
        text: "The five decisions that matter",
      },
      {
        kind: "ordered",
        items: [
          "Who verifies the land, and did they verify it independently of the seller?",
          "Who is professionally appointed to your project, and have you checked their registration numbers yourself?",
          "Is there a measured bill of quantities behind the price, or just a number?",
          "Does the payment schedule tie each payment to verified, completed work?",
          "Who is the named person you can contact, and what happens when they are unavailable?",
        ],
      },
      {
        kind: "p",
        text: "Get those five right and the rest is difficult but manageable. Get any one of them wrong and you have a problem that money cannot solve. Notice that all five are answerable before you pay a shilling.",
      },
      {
        kind: "h",
        text: "What you are actually managing",
      },
      {
        kind: "list",
        items: [
          "A legal process you cannot attend in person — land searches, transfers, and statutory approvals.",
          "A construction industry with real variation in quality, and no visible reputation system to help you tell the difference.",
          "A payment relationship across thousands of kilometres and an eight to ten hour time difference.",
          "A building, which is a physical thing, subject to weather, supply chains, labour availability and human error.",
        ],
      },
      {
        kind: "h",
        text: "Where remote clients most often fail",
      },
      {
        kind: "p",
        text: "The common failure is not being cheated out of the entire budget. It is approving things they cannot see, on information from someone whose interest it is that they approve. A verbal approval given on a video call, or a finish chosen from a photograph, is an approval you will regret. Everything approved should be approved against a document, and every approval should be recorded.",
      },
      {
        kind: "tip",
        text: "Write down the reason for every decision you make. When something is questioned in month eight, the decision log is what turns an argument into a discussion.",
      },
      {
        kind: "h",
        text: "What good remote management looks like",
      },
      {
        kind: "list",
        items: [
          "A named project manager whose direct contact details you hold.",
          "A written report on a fixed day each week, whether or not there is anything to report.",
          "Payment released only against a certificate from a registered quantity surveyor.",
          "Photographic evidence captured at the stage immediately before work becomes invisible.",
          "A decision log recording every approval, with date and cost impact.",
          "A document vault you own, holding the contract, approvals, certificates, warranties and as-built drawings.",
        ],
      },
      {
        kind: "p",
        text: "That list is not a service you have to hope for. It is the standard we hold every project to, and it is what the client portal on this site is built to demonstrate.",
      },
    ],
  },
  {
    slug: "buying-land-safely",
    title: "Buying land in Kenya from abroad",
    summary:
      "The highest-risk transaction most diaspora buyers will ever make, in the one area where you are least able to verify anything yourself.",
    category: "Land",
    readMinutes: 8,
    stage: "land",
    blocks: [
      {
        kind: "p",
        text: "Land is the most dangerous purchase a diaspora client makes, for one reason: everything about it is verifiable, and almost none of it is verified remotely. The plot has an identity — a parcel number — and that identity can be checked against an official register. Most of the trouble happens because that check is skipped, or done by whoever introduced the land.",
      },
      {
        kind: "h",
        text: "Start from the parcel number, not the plot",
      },
      {
        kind: "p",
        text: "A plot described as 'quarter acre next to the road' is not an identity. A parcel number is. Every check begins with it, and every genuine transaction should be able to state it immediately.",
      },
      {
        kind: "ordered",
        items: [
          "Obtain the parcel number of the land being sold.",
          "Commission an official search at the Ministry of Lands or the county land office, against that number.",
          "Run an encumbrance search on the same number.",
          "Commission an independent physical survey to establish real boundaries and computed area.",
          "Confirm zoning and that development permission is achievable on that parcel.",
          "Confirm with neighbours who has actually occupied the land, and for how long.",
        ],
      },
      {
        kind: "warn",
        text: "Pay for the searches yourself and instruct them yourself. If the search is arranged by the seller or their agent, the result is worth nothing — they control who conducts it and what gets reported.",
      },
      {
        kind: "h",
        text: "The searches that matter",
      },
      {
        kind: "table",
        head: ["Search", "What it establishes", "What it cannot tell you"],
        rows: [
          [
            "Official land search",
            "Who is registered as owner, and the parcel's particulars",
            "Whether a claim exists that is not yet registered",
          ],
          [
            "Encumbrance search",
            "Whether a charge, mortgage or caveat is registered over the land",
            "Unregistered disputes, or a community or customary claim",
          ],
          [
            "Physical survey",
            "True boundaries, beacons, and computed area",
            "Anything about ownership",
          ],
          [
            "Neighbour confirmation",
            "Who has occupied it, and whether that has been contested",
            "Legal ownership",
          ],
          [
            "County records",
            "Development permissions issued, rates status",
            "Whether building on it is permitted",
          ],
        ],
      },
      {
        kind: "h",
        text: "Timing",
      },
      {
        kind: "p",
        text: "Searches go stale in weeks, not months. A search conducted before you travelled and relied on six months later is close to worthless, because circumstances change. Keep the sequence tight: search, survey, decision, transfer.",
      },
      {
        kind: "h",
        text: "Transfer mechanics from abroad",
      },
      {
        kind: "list",
        items: [
          "Use a Kenyan advocate instructed by you, not by the seller.",
          "Expect a power of attorney if you cannot attend the transfer in person. Draft it specifically for the transaction and confirm it covers what is needed.",
          "Verify the advocate's registration on the Law Society of Kenya register.",
          "Ensure rates, transfer fees and consents are settled as part of the transfer, not after.",
          "Register the transfer in your name. An unregistered transfer is a dispute waiting to happen.",
        ],
      },
      {
        kind: "warn",
        text: "If a seller refuses an independent search, insists on their own advocate handling it, or pressures you to pay a deposit before the search is complete — that refusal is the answer. Do not proceed.",
      },
    ],
  },
  {
    slug: "sending-money-legally",
    title: "Sending money to Kenya, and sending it legally",
    summary:
      "How money actually moves from abroad to a construction project, what it costs, and the routes that are common but risky.",
    category: "Money",
    readMinutes: 7,
    blocks: [
      {
        kind: "p",
        text: "How you transfer money is not a neutral administrative choice. It determines what evidence you will hold, what it costs, how quickly a fraud can be recalled, and in some cases whether the transaction is legal.",
      },
      {
        kind: "h",
        text: "The legitimate routes",
      },
      {
        kind: "table",
        head: ["Route", "Typical use", "Trade-off"],
        rows: [
          [
            "Bank wire (SWIFT)",
            "Large stage payments",
            "Traceable and defensible. Slower, with correspondent bank fees and an exchange rate margin.",
          ],
          [
            "Diaspora remittance service",
            "Mid-value stage payments",
            "Usually cheaper and faster than a wire. Compare the all-in rate and any receiving fees.",
          ],
          [
            "Card or account funding",
            "Small payments",
            "Easy. Poor for large amounts due to limits and fees.",
          ],
          [
            "Mobile money to a paybill",
            "Only where the paybill is in the company's name",
            "Convenient. Must be a company paybill, never an individual.",
          ],
        ],
      },
      {
        kind: "h",
        text: "Common routes that create problems",
      },
      {
        kind: "list",
        items: [
          "Sending through an individual 'agent' who then transfers to the contractor. This breaks the paper trail between you and the party you are paying, and you lose the ability to recall.",
          "Third-party P2P platforms used to move large sums. Often breaches the platform's terms for that size, and leaves no usable record.",
          "Crypto. Irreversible, unregulated, and untraceable in practice. Not appropriate for construction payments at any value.",
          "Cash. Unreceipted, untraceable, and impossible to reconcile against a bill of quantities.",
        ],
      },
      {
        kind: "warn",
        text: "Money transferred through a friend or relative is also your money. If a stage payment fails to arrive, arrives late, or arrives in the wrong amount, you will have no standing with the bank to recover it.",
      },
      {
        kind: "h",
        text: "Currency",
      },
      {
        kind: "p",
        text: "Most Kenyan contractors and suppliers price and settle in shillings. Quote and pay in KES where you can, so there is no exchange risk sitting between you and your contractor. Where you hold funds in another currency, you are carrying a position on the shilling that has nothing to do with your building.",
      },
      {
        kind: "h",
        text: "Documents your bank will ask for",
      },
      {
        kind: "list",
        items: [
          "Certificate of residence, or proof of address",
          "Source of funds letter for larger transfers",
          "Identification, sometimes notarised",
          "A purpose of payment, sometimes with supporting invoices",
        ],
      },
      {
        kind: "p",
        text: "Expect this before you need it rather than during a payment deadline. Banks routinely delay large first transfers while they complete checks, and that should not coincide with a contractor's due date.",
      },
      {
        kind: "tip",
        text: "Make one test transfer early in the process, small, and confirm it arrives and clears. Doing this before it matters is far better than discovering a problem on the day a stage payment is due.",
      },
      {
        kind: "h",
        text: "Keeping records",
      },
      {
        kind: "p",
        text: "Every transfer should be referenced to an invoice and a certificate number, and the reference should appear in your bank's confirmation. This is what links your money to verified work, and it is what you will need if anything is disputed.",
      },
    ],
  },
  {
    slug: "verifying-a-contractor",
    title: "How to verify a builder before you pay them",
    summary:
      "A practical sequence for checking that a contractor is real, registered for the right work, and actually trading.",
    category: "People",
    readMinutes: 6,
    blocks: [
      {
        kind: "p",
        text: "This is the check most likely to prevent a bad outcome, and it takes under two hours. All of it can be done from abroad.",
      },
      {
        kind: "h",
        text: "Check the registration, not the certificate",
      },
      {
        kind: "p",
        text: "Every contractor in Kenya must be registered with the National Construction Authority, in categories matching the work they are contracted to do. Ask for the registration number, then search it on the NCA register yourself. Confirm that it resolves, that it is current, and that the categories cover your project.",
      },
      {
        kind: "tip",
        text: "A category mismatch is a serious finding. A contractor registered only for 'Roofing' cannot lawfully take on the full frame of a maisonette, whatever their history.",
      },
      {
        kind: "h",
        text: "Check the professionals, separately",
      },
      {
        kind: "p",
        text: "The contractor's registration says nothing about the architect, engineer or quantity surveyor. Ask for each of their registration numbers and the body that holds them, then search each independently.",
      },
      {
        kind: "table",
        head: ["Role", "Register", "Why it matters"],
        rows: [
          [
            "Architect",
            "Architectural Association of Kenya (AAK)",
            "Only a registered architect may sign and stamp architectural plans",
          ],
          [
            "Engineer",
            "Engineers Board of Kenya (EBK)",
            "Structural sign-off must come from a registered engineer in that discipline",
          ],
          [
            "Quantity surveyor",
            "BORAQS",
            "Only a registered QS can properly certify work for payment release",
          ],
          [
            "Advocate",
            "Law Society of Kenya (LSK)",
            "Relevant where they conduct land searches or transfers",
          ],
        ],
      },
      {
        kind: "h",
        text: "Check the company",
      },
      {
        kind: "list",
        items: [
          "Search the company on eCitizen to confirm it exists and note the incorporation date.",
          "A company incorporated weeks before requesting a large deposit has no track record, however good the references.",
          "Confirm the registered particulars match the name on your contract and the payee account.",
          "Check the directors, where the information is available, for other recently incorporated companies.",
        ],
      },
      {
        kind: "h",
        text: "Check the people",
      },
      {
        kind: "list",
        items: [
          "Ask for two or three completed projects, then contact those clients on numbers you find independently.",
          "Ask something specific — what was the hardest problem on site, what went wrong — that a non-client could not answer.",
          "Ask to visit a site that is currently in progress and unoccupied. Rented show houses prove nothing about a builder.",
          "Ask who will be the named site supervisor, and whether they will be there every working day.",
        ],
      },
      {
        kind: "h",
        text: "The questions worth the answers",
      },
      {
        kind: "list",
        items: [
          "What are you actually contracting for — the frame, or the whole building?",
          "Who is my named project manager, and what is their direct number?",
          "Who certifies each payment, and what is their registration number?",
          "What happens if you go over the contract price — how is that handled?",
          "What is your professional indemnity cover, and with which insurer?",
          "What were the last three projects you had a dispute on, and how were they resolved?",
        ],
      },
      {
        kind: "warn",
        text: "The final question does most of the work. A contractor who answers it directly has nothing to hide. An evasive answer is more informative than any certificate.",
      },
    ],
  },
  {
    slug: "reading-a-bill-of-quantities",
    title: "How to read a bill of quantities",
    summary:
      "The document that turns a building into a list of measurable, priced items — and the only reliable way to compare two quotes.",
    category: "People",
    readMinutes: 7,
    stage: "design",
    blocks: [
      {
        kind: "p",
        text: "A bill of quantities, or BOQ, is a measured list of everything needed to build a specific design, each item given a quantity and a rate. It is prepared to Kenya's Standard Method of Measurement, Second Edition, 2008.",
      },
      {
        kind: "h",
        text: "Why it is the document that matters most",
      },
      {
        kind: "p",
        text: "Two quotes can differ by thirty percent and describe the same building. Without a BOQ, there is no way to tell whether the difference is a better price, a different specification, or an omitted scope. With a BOQ, you compare line by line in an afternoon.",
      },
      {
        kind: "p",
        text: "It also gives you payment control. Payment certificates are issued against measured quantities in the BOQ, so the document that sets the price is also the document that proves progress.",
      },
      {
        kind: "h",
        text: "Structure",
      },
      {
        kind: "p",
        text: "Kenyan BOQs follow the eleven sections of SMM2. Recognising them tells you whether a document is complete:",
      },
      {
        kind: "list",
        items: [
          "Preliminaries — site setup, temporary works, supervision, contractor's facilities",
          "Demolition and alterations, if any",
          "Substructure — foundation, slab, DPC, earthworks",
          "Superstructure — walls, columns, beams",
          "Finishes — plastering, painting, flooring, ceilings",
          "Roofing",
          "External works — paving, fencing, drainage, landscaping",
          "Services — plumbing, electrical, drainage",
          "Measured work by building element",
          "Provisional sums and prime cost items",
          "Summary — preliminaries, totals, VAT and the grand total",
        ],
      },
      {
        kind: "h",
        text: "Reading it as a client",
      },
      {
        kind: "ordered",
        items: [
          "Check the total against the area and quality. A rate per square metre outside the normal Kenyan band means something is missing or misstated.",
          "Find the preliminaries. These are a legitimate cost, and they are also the easiest place for an inflated number to hide.",
          "Look at the material names, not just the rates. 'Cement 32.5R' and 'Cement 42.5N' are different products with different behaviour.",
          "Identify every provisional sum. These are estimates that will be replaced by actual invoices, and they should be visible to you.",
          "Check whether external works, landscaping and fencing are included. They are the most commonly omitted scope in a headline price.",
          "Confirm the quantities are consistent with the drawings — an item that should be calculable from the plan and is not is worth querying.",
        ],
      },
      {
        kind: "warn",
        text: "Treat any BOQ produced from a website tool, including ours, as a budgeting tool. It gives you a realistic order of magnitude and a structure to compare against. A contract BOQ is measured from your specific drawings by a registered quantity surveyor, and only that document binds.",
      },
      {
        kind: "h",
        text: "What should not be in a lump sum",
      },
      {
        kind: "list",
        items: [
          "Land, and legal fees on the title",
          "County building permit and development permission fees",
          "NEMA licence, where required",
          "Utility connection fees — water, sewer, electricity",
          "Financing and lender's supervision costs",
          "Furniture, fittings and equipment, unless included",
          "Extraordinary ground conditions, until investigated",
        ],
      },
    ],
  },
  {
    slug: "statutory-approvals",
    title: "Permits and approvals you will need",
    summary:
      "What must be in hand before construction starts, who applies, what it costs roughly, and why this stage derails more programmes than any other.",
    category: "During the build",
    readMinutes: 6,
    stage: "approvals",
    blocks: [
      {
        kind: "p",
        text: "Approvals are where remote clients lose control most easily, because they involve authorities, they take weeks, and they require your authority as owner — which usually means a power of attorney.",
      },
      {
        kind: "h",
        text: "What is required",
      },
      {
        kind: "table",
        head: ["Approval", "Authority", "Indicative cost", "Lead time"],
        rows: [
          [
            "Development permission and building plans",
            "County government",
            "KES 80,000–200,000",
            "6–12 weeks",
          ],
          [
            "NCA project registration",
            "National Construction Authority",
            "Modest, category-dependent",
            "2–4 weeks",
          ],
          [
            "Environmental impact assessment and licence",
            "NEMA",
            "KES 50,000–100,000, where required",
            "8–16 weeks",
          ],
          [
            "Water connection",
            "Water utility",
            "KES 50,000–100,000",
            "4–10 weeks",
          ],
          [
            "Sewerage connection",
            "County / water utility",
            "KES 60,000–150,000",
            "6–12 weeks",
          ],
          [
            "Electrical connection",
            "Kenya Power",
            "KES 35,000–85,000",
            "4–8 weeks",
          ],
        ],
      },
      {
        kind: "p",
        text: "These are indicative planning figures, not quotations. They vary by county, plot area and project value.",
      },
      {
        kind: "h",
        text: "The order matters",
      },
      {
        kind: "ordered",
        items: [
          "Land due diligence complete. There is no point applying for approval on land you may not own.",
          "Power of attorney executed, if you are abroad.",
          "Designs complete enough to submit.",
          "Applications lodged, with fees paid against official receipts.",
          "Approvals issued. Only now does site mobilisation begin.",
        ],
      },
      {
        kind: "warn",
        text: "Construction must not start before the approved plans are stamped. Building unapproved is illegal, makes the building effectively uninsurable and unsaleable, and exposes you to enforcement action regardless of who directed it.",
      },
      {
        kind: "h",
        text: "Where clients get overcharged",
      },
      {
        kind: "p",
        text: "Consultants charge for obtaining approvals, and a genuine fee for professional time is legitimate. The problem is an unexplained margin added to statutory fees, or fees paid to a consultant with no approvals to show. Always ask to see the approvals, and ask for the official receipts for the amounts paid to authorities.",
      },
      {
        kind: "h",
        text: "As a diaspora client",
      },
      {
        kind: "list",
        items: [
          "Execute a properly drafted power of attorney early — it is on the critical path.",
          "Ask for scanned copies of every stamped approval as it is issued, not at the end.",
          "Keep copies in your document vault. You should never need to ask whether something exists.",
          "Confirm which approvals your project genuinely needs. NEMA does not apply to every project, and a written determination is as useful as a licence.",
        ],
      },
    ],
  },
  {
    slug: "managing-a-build-remotely",
    title: "Managing a build you are not standing next to",
    summary:
      "The reporting, evidence and payment rhythm that lets a client in another country know precisely where a project stands.",
    category: "During the build",
    readMinutes: 7,
    blocks: [
      {
        kind: "p",
        text: "The purpose of remote management is not to watch the build. It is to be able to answer three questions at any moment without asking: what has been done, what has it cost, and what needs my decision.",
      },
      {
        kind: "h",
        text: "The reporting rhythm",
      },
      {
        kind: "list",
        items: [
          "A written report on a fixed day each week. Friday works. Fixed days matter more than the day itself, because predictability is what allows you to notice an absence.",
          "Scheduled calls, bi-weekly, at a time agreed in advance rather than negotiated each week.",
          "WhatsApp for quick questions only — never for decisions. A decision agreed in a chat thread is a decision that can be disputed later.",
        ],
      },
      {
        kind: "p",
        text: "A good weekly report has five sections and takes about an hour to produce: what was completed, with photographs; what is planned next week; expenditure against the budget; decisions needed from you, with options and cost impact; and any risk or delay.",
      },
      {
        kind: "h",
        text: "Photographic evidence, and when to take it",
      },
      {
        kind: "p",
        text: "Photographs are only useful if they are taken at the moment before something becomes invisible. Once concrete is poured, reinforcement cannot be verified by any means, ever.",
      },
      {
        kind: "table",
        head: ["Stage", "What must be photographed before it is hidden"],
        rows: [
          [
            "Set-out",
            "Setting-out dimensions with the building's corners marked",
          ],
          [
            "Foundation",
            "Excavation open, reinforcement fixed, before any pour",
          ],
          [
            "Frame",
            "Ring beam reinforcement and starters before each pour",
          ],
          [
            "Services",
            "Every first-fix run, in every wall and under every floor",
          ],
          [
            "Slab",
            "DPC and anti-termite treatment before hardcore",
          ],
          [
            "Roof",
            "Structure and underlay before the covering goes on",
          ],
        ],
      },
      {
        kind: "tip",
        text: "Ask for photographs with dates and enough context to know what you are looking at. A close-up of reinforcement without the surrounding context is much harder to assess than a wider shot with a caption.",
      },
      {
        kind: "h",
        text: "The decision log",
      },
      {
        kind: "p",
        text: "Every decision, with its date, the options considered, what was chosen, and the cost impact. This exists so that in month nine nobody has to reconstruct what was agreed in month three. It is boring and it is the single most useful document in a remote build.",
      },
      {
        kind: "h",
        text: "Payment control",
      },
      {
        kind: "list",
        items: [
          "A payment certificate from a registered quantity surveyor before each release.",
          "Payment tied to measured quantities, never to a percentage of time elapsed.",
          "Retention of 5–10% held until defects are closed.",
          "Variations priced and approved in writing before work begins.",
          "Each payment referenced to a certificate number in your bank transfer.",
        ],
      },
      {
        kind: "h",
        text: "Appointing a representative",
      },
      {
        kind: "p",
        text: "If you are not visiting, consider appointing someone on the ground with written authority to inspect, photograph and report — chosen by you, not introduced by your contractor, and paid by you. This does not replace independent certification, but it closes the gap between weekly reports and site visits.",
      },
      {
        kind: "h",
        text: "When you do visit",
      },
      {
        kind: "list",
        items: [
          "Ask for a progress report in advance so you know what to look at.",
          "Walk the site with the project manager, against the drawings.",
          "Take your own photographs, including of anything you want evidenced.",
          "Agree action items before you leave, with dates.",
          "The most valuable visit is at structural stage, while errors are still correctable.",
        ],
      },
    ],
  },
];

export const GUIDE_CATEGORIES = [
  "Getting started",
  "Land",
  "Money",
  "People",
  "During the build",
] as const;

export function guideBySlug(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
