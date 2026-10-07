// ATRO — Verification
// Trust has to be checkable. This is the list of registers that matter in Kenya,
// what each one proves, and how to actually search them.

export type Register = {
  id: string;
  body: string;
  fullName: string;
  proves: string;
  doesNotProve: string;
  url: string;
  searchNote: string;
  covers: string;
};

/** The independent registers a client can check without asking us. */
export const REGISTERS: Register[] = [
  {
    id: "nca",
    body: "National Construction Authority",
    fullName: "National Construction Authority of Kenya",
    proves:
      "A construction contractor is registered, and in which categories they are permitted to contract.",
    doesNotProve:
      "Nothing about quality of work, honesty, capacity, or whether they are currently trading.",
    url: "https://www.nca.go.ke",
    searchNote:
      "Search the contractor's registration number. Confirm the categories on the certificate cover the type of work actually being contracted.",
    covers:
      "All construction contractors. A valid certificate is the minimum legal requirement for contracting in Kenya.",
  },
  {
    id: "aak",
    body: "Architectural Association of Kenya",
    fullName: "Architectural Association of Kenya",
    proves:
      "An architect is registered and eligible to practise and sign architectural drawings in Kenya.",
    doesNotProve:
      "That they are the right architect for your project, or that their registration extends to any other discipline.",
    url: "https://www.aak.or.ke",
    searchNote:
      "Search by registration number or name. Registration is personal to the named architect, not to a company — check that the person signing your drawings is the registered one.",
    covers: "Architects. Registration is required to sign and stamp architectural plans.",
  },
  {
    id: "ebk",
    body: "Engineers Board of Kenya",
    fullName: "Engineers Board of Kenya",
    proves:
      "An engineer is registered and eligible to practise in their declared engineering discipline.",
    doesNotProve:
      "Structural adequacy of any particular building, and not their insurance position.",
    url: "https://www.ebk.go.ke",
    searchNote:
      "Search by registration number. Confirm the declared discipline matches the work being signed — a civil engineer is not automatically a structural one.",
    covers:
      "Engineers, including structural, civil, mechanical, electrical and geotechnical disciplines.",
  },
  {
    id: "boraqs",
    body: "BORAQS",
    fullName:
      "Board of Registration of Architects and Quantity Surveyors",
    proves:
      "A quantity surveyor is registered and eligible to practise, and can certify a bill of quantities and issue payment certificates.",
    doesNotProve:
      "That their measurement will match yours, though a registered QS is accountable for it.",
    url: "https://boraqs.go.ke",
    searchNote:
      "Search by registration number. This is the registration that matters most for payment certificates — only a registered QS can properly certify work for release of funds.",
    covers:
      "Quantity surveyors. Also maintains the architects register in part; confirm which register applies.",
  },
  {
    id: "nema",
    body: "NEMA",
    fullName: "National Environment Management Authority",
    proves:
      "Whether a project required an environmental impact assessment, and whether the licence has been issued.",
    doesNotProve:
      "That the project complies with environmental requirements during construction.",
    url: "https://www.nema.go.ke",
    searchNote:
      "Not all projects require an EIA. If yours does, the licence must exist before construction starts. Ask for the licence or a written determination that one is not required.",
    covers:
      "Environmental approvals for projects above the regulatory thresholds.",
  },
  {
    id: "brs",
    body: "BRS / eCitizen",
    fullName: "Business Registration Service (eCitizen)",
    proves:
      "That a company is legally registered in Kenya, when it was incorporated, and its registered particulars.",
    doesNotProve:
      "Anything at all about whether it is trading, solvent, or honest. Registration only proves existence.",
    url: "https://brs.go.ke",
    searchNote:
      "Search by company name or registration number. Check the incorporation date. A company incorporated weeks or months before asking for a large deposit is a meaningful warning.",
    covers:
      "All Kenyan companies, LLPs and other registered entities.",
  },
  {
    id: "lsk",
    body: "Law Society of Kenya",
    fullName: "Law Society of Kenya",
    proves: "An advocate is admitted and entitled to practise in Kenya.",
    doesNotProve:
      "That they are the right advocate for your matter, or that any search they perform was thorough.",
    url: "https://www.lsk.or.ke",
    searchNote:
      "Relevant where land due diligence is being handled by an advocate. Their name should appear on the search instruction.",
    covers: "Advocates and legal practitioners.",
  },
  {
    id: "county",
    body: "County Government",
    fullName: "Your county government — planning and building department",
    proves:
      "That building plans have been approved and stamped for your specific plot, and that an occupation certificate has been issued.",
    doesNotProve:
      "Compliance of work on site with the approved plans. Nobody checks routinely.",
    url: "",
    searchNote:
      "Visit or write to the county planning department with your plot number. Ask to see the stamped approved plans on file. An occupation certificate at the end is the real test that the building was approved and inspected.",
    covers:
      "Development permission, building plan approval, and the occupation certificate.",
  },
];

/** The checks a client should run before transferring money. */
export const VERIFY_STEPS = [
  {
    id: "call",
    title: "Call the number on the studio's own website",
    body: "Find the contact details yourself by navigating to their site directly. Never use a number supplied in the message or WhatsApp thread that started the conversation. Ask who you are speaking with and where the office is. If the details do not match, you have your answer.",
    cost: "Free",
    time: "5 minutes",
  },
  {
    id: "email",
    title: "Email an address on their own domain",
    body: "Type the address into your mail app. Do not forward or reply. A genuine studio has a controlled domain and answers from it. Confirm the domain is not a free-mail lookalike.",
    cost: "Free",
    time: "1 hour",
  },
  {
    id: "nca",
    title: "Look up the contractor's NCA registration",
    body: "Search the number on the National Construction Authority register yourself. Confirm it exists, is current, and that the categories cover the work being contracted.",
    cost: "Free",
    time: "15 minutes",
  },
  {
    id: "pros",
    title: "Look up every registered professional on the job",
    body: "The architect, the engineer and the quantity surveyor should each give you a registration number and the body that holds it. Search each one directly on AAK, EBK or BORAQS. Refusing to give a registration number is itself the answer.",
    cost: "Free",
    time: "20 minutes",
  },
  {
    id: "brs",
    title: "Check the company exists at BRS",
    body: "Search the company on eCitizen. Note the incorporation date. A company registered a month ago, asking for a large deposit to build a house, does not have a track record.",
    cost: "Free",
    time: "10 minutes",
  },
  {
    id: "visit",
    title: "Ask to visit, and visit",
    body: "A real studio has an address you can walk into. If you are ever in Kenya, go. If they decline or deflect, weigh everything else you have learned accordingly.",
    cost: "Your time",
    time: "Half a day",
  },
  {
    id: "refs",
    title: "Call references they give you",
    body: "Ask for two or three completed projects, then contact those clients yourself using numbers you look up independently. Ask a specific question that only a real client would know the answer to.",
    cost: "Free",
    time: "30 minutes",
  },
  {
    id: "payee",
    title: "Confirm whose account you are paying",
    body: "The payee name must be the company. A personal account, a new paybill in someone else's name, mobile money, or crypto is not a legitimate payment route for a construction contract.",
    cost: "Free",
    time: "Before you transfer",
  },
] as const;

/** Things that are commonly mistaken for proof but are not. */
export const FALSE_PROOF = [
  {
    claim: "A certificate shown in a WhatsApp message or emailed as a PDF",
    why: "Forgeries are trivial. The document proves nothing until you search the number on the register itself.",
  },
  {
    claim: "A branded PDF with a registration number on it",
    why: "Registration numbers can be copied from genuine documents belonging to other companies. Search the number, and check that the name on the register matches the name you are paying.",
  },
  {
    claim: "Photographs of a construction site",
    why: "They may be any site, at any time, anywhere. They are not evidence that this builder is working on your plot.",
  },
  {
    claim: "A show house or completed project",
    why: "Frequently rented, borrowed for a viewing, or built by a different company under a shared brand. It may not belong to the company you are dealing with.",
  },
  {
    claim: "Testimonials and WhatsApp screenshots from 'clients'",
    why: "Unverifiable and easily fabricated. A named testimonial with a location you can call is worth something; an image in a document is worth nothing.",
  },
  {
    claim: "A long, impressive contract with heavy legal language",
    why: "Complexity is not protection. What matters is whether payment is tied to verified work, and whether there is a termination clause that works when things go wrong.",
  },
  {
    claim: "A third-party escrow arrangement offered by the builder",
    why: "Escrow offered by the party you are being asked to trust is not escrow. It should be a genuinely independent institution, and you should be able to verify who holds the funds.",
  },
  {
    claim: "An NCA certificate",
    why: "It proves the contractor is registered and in which categories. It proves nothing about quality, honesty, or whether they will still exist next year.",
  },
] as const;
