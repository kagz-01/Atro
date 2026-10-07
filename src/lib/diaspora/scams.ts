// ATRO — Red flag signals
// Each signal is a statement or behaviour a buyer actually encounters. Weight
// reflects how strongly it correlates with fraud, and each carries guidance on
// what to do next rather than just a warning.

export type Signal = {
  id: string;
  weight: number;
  group: "Payment" | "Verification" | "Process" | "Pressure" | "Presentation";
  text: string;
  why: string;
  action: string;
};

export const SIGNALS: Signal[] = [
  // ─── Payment ───
  {
    id: "deposit",
    weight: 9,
    group: "Payment",
    text: "Asked for a deposit before any drawings, bill of quantities or signed contract exist.",
    why: "A deposit paid before documentation exists has nothing to attach to. Recovering it means suing, and that is slow from abroad.",
    action:
      "Do not pay. Ask for the drawings, the bill of quantities and a contract first. A payment request should always point to a document.",
  },
  {
    id: "personal-account",
    weight: 10,
    group: "Payment",
    text: "Asked to pay a personal account, or a paybill in the name of an individual rather than the company.",
    why: "Legitimate corporate payment goes to the company. This is the single strongest fraud indicator there is.",
    action:
      "Stop. Do not transfer. Call the company's verified number and ask. If the instruction survives that call, treat it as fraud and report it.",
  },
  {
    id: "advance-for-unstarted",
    weight: 8,
    group: "Payment",
    text: "Asked to pay for work that has not started — 'mobilisation', 'materials already bought', 'secure the site team'.",
    why: "Payment should follow measured, verified work. Money paid for work not yet performed is money the contractor now holds.",
    action:
      "Restructure so that each payment attaches to a completed, verifiable deliverable. If they cannot restructure, they are relying on this.",
  },
  {
    id: "momo-crypto",
    weight: 9,
    group: "Payment",
    text: "Asked to pay by mobile money or cryptocurrency, including Bitcoin or USDT.",
    why: "Both are effectively irreversible. There is no chargeback, no recall, and no way to establish who received the funds.",
    action:
      "Decline. Payment for construction should be traceable through a bank. Irreversible payment methods are for small, low-value transactions.",
  },
  {
    id: "no-milestones",
    weight: 7,
    group: "Payment",
    text: "No milestone-based payment schedule — the contract is payable in a few large instalments unrelated to progress.",
    why: "Without milestones, the contractor holds the balance of your money from very early on, and you hold almost no leverage.",
    action:
      "Require a payment schedule tied to measured progress, released against a certificate from a registered quantity surveyor.",
  },
  {
    id: "third-party-payee",
    weight: 8,
    group: "Payment",
    text: "Asked to pay a different company or individual than the one you have a contract with.",
    why: "Redirecting payment to a third party is either tax or payment fraud, or money moving toward whoever is behind the scheme.",
    action:
      "Refuse. Ask why the payee differs. A genuine explanation exists if genuine — and you can verify it with your own accountant.",
  },

  // ─── Verification ───
  {
    id: "no-nca",
    weight: 9,
    group: "Verification",
    text: "No NCA registration number, or one they will not let you check independently.",
    why: "Contracting without NCA registration is illegal in Kenya. A genuine contractor is registered and expects the question.",
    action:
      "Search the National Construction Authority register yourself. If there is no number, or it does not resolve, stop there.",
  },
  {
    id: "no-reg-numbers",
    weight: 8,
    group: "Verification",
    text: "Architect, engineer or quantity surveyor named but no registration numbers given.",
    why: "Nobody can sign plans, stamp drawings or certify payment in Kenya without registration. An unregistered signer exposes you to real liability.",
    action:
      "Ask each professional for their number and the registering body. Search them on AAK, EBK or BORAQS. Refusal ends the conversation.",
  },
  {
    id: "fake-cert",
    weight: 9,
    group: "Verification",
    text: "Registration certificates supplied as PDFs or photographs rather than letting you search the register.",
    why: "Certificate forgery is trivial, and numbers are frequently copied from genuine documents belonging to other firms.",
    action:
      "Search the number on the official register yourself. Confirm the name on the register matches the company you are paying.",
  },
  {
    id: "no-office",
    weight: 6,
    group: "Verification",
    text: "Cannot give you a physical address, or the address does not correspond to the number calling you.",
    why: "Absence of a verifiable location removes your simplest independent check and makes recovery of anything very difficult.",
    action:
      "Ask for the address and go, or have someone you trust go. A studio unwilling to be visited is telling you something.",
  },
  {
    id: "no-references",
    weight: 5,
    group: "Verification",
    text: "Cannot provide references from completed projects you can contact yourself.",
    why: "Every builder has past clients. Genuinely good work is the strongest sales tool available, so its absence is telling.",
    action:
      "Ask for two or three. Contact them on numbers you find independently, and ask something specific a non-client could not answer.",
  },
  {
    id: "no-liability",
    weight: 6,
    group: "Verification",
    text: "No professional indemnity insurance, and no named professional accountable for the work.",
    why: "Without it, a defect has no remedy. Individual directors can disappear; liability should sit with a body that remains.",
    action:
      "Ask who carries professional liability and with which insurer. This should be answerable without hesitation.",
  },

  // ─── Process ───
  {
    id: "no-boq",
    weight: 7,
    group: "Process",
    text: "Quoting is a lump sum, with no bill of quantities behind it.",
    why: "Without a bill of quantities there is nothing to measure work against, so no payment can be verified and no overrun can be explained or challenged.",
    action:
      "Require a priced bill of quantities. Every later quote can then be compared item by item against it.",
  },
  {
    id: "no-approvals",
    weight: 8,
    group: "Process",
    text: "Wants to start on site before the county has stamped the approved building plans.",
    why: "Building without approved plans is illegal, uninsurable, unsaleable and unfinanceable. It also exposes you to enforcement action.",
    action:
      "Do not allow site mobilisation. Ask to see the stamped approved plans. If they do not exist, this stops here.",
  },
  {
    id: "inspect-refused",
    weight: 8,
    group: "Process",
    text: "Refuses independent inspection, or will not allow your own representative on site.",
    why: "Genuine contractors are comfortable with inspection because they have nothing to hide. Refusal is the signal, not the reason.",
    action:
      "This alone is sufficient reason to walk away. There is no legitimate reason a contractor cannot be inspected.",
  },
  {
    id: "no-variation-order",
    weight: 6,
    group: "Process",
    text: "Variations discussed verbally, or discovered in an invoice after the work is done.",
    why: "Undocumented variations accumulate quietly into an inflated final account you cannot challenge item by item.",
    action:
      "Require a written variation order with cost and programme impact, signed before work starts. State this in the contract.",
  },
  {
    id: "offplan",
    weight: 5,
    group: "Process",
    text: "Selling from a show unit, or a 'ready' development, rather than building to your brief.",
    why: "Off-plan models prioritise the developer's margin and standardisation. You are buying their specification, not your building.",
    action:
      "Not necessarily fraud, but understand what you are buying. Off-plan carries materially different risk from a design-and-build contract on your own land.",
  },
  {
    id: "title-guarantee",
    weight: 7,
    group: "Process",
    text: "Offering a 'title guarantee' or 'title insurance' issued by the company itself.",
    why: "An indemnity from the party whose interest is in selling you the land is not protection. Genuine title cover comes from an independent insurer.",
    action:
      "Ask who the underwriter is. If it cannot be verified independently, treat the guarantee as worthless.",
  },

  // ─── Pressure ───
  {
    id: "urgency",
    weight: 8,
    group: "Pressure",
    text: "Artificial urgency — 'prices are rising', 'another buyer is interested', 'this offer expires today'.",
    why: "Urgency exists to stop you verifying. Genuine construction timelines are measured in months, and genuine deadlines are rarely same-day.",
    action:
      "Any deadline you cannot verify is a reason to slow down, not speed up. Walk away from pressure and revisit when you are calm.",
  },
  {
    id: "deposit-desp",
    weight: 9,
    group: "Pressure",
    text: "Emotionally framed pressure — 'building your dream back home', family and community appeals.",
    why: "Emotional positioning makes it harder to ask the practical questions that would expose the risk. It is a technique, not a service.",
    action:
      "Separate the feeling from the facts. If the commercial terms cannot be verified, the emotional appeal is irrelevant.",
  },
  {
    id: "secret",
    weight: 7,
    group: "Pressure",
    text: "Asks you to keep the arrangement quiet, or not to involve a family member, lawyer or adviser.",
    why: "Secrecy is only ever requested to prevent scrutiny. You should be able to tell everyone about where your money is going.",
    action:
      "Decline. Tell the people you trust. Isolation is the mechanism fraud depends on.",
  },
  {
    id: "no-docs",
    weight: 8,
    group: "Pressure",
    text: "Everything agreed over WhatsApp or phone, with no written contract produced.",
    why: "Verbal agreements cannot be enforced easily and conveniently change meaning after the fact. Nothing agreed verbally is reliable.",
    action:
      "Require a written contract with scope, drawings, specification, bill of quantities, programme and payment schedule. Nothing is agreed until it is written.",
  },

  // ─── Presentation ───
  {
    id: "too-cheap",
    weight: 7,
    group: "Presentation",
    text: "A total price far below every other quote you have received.",
    why: "Published Kenyan construction rates span a wide band. A figure dramatically below the market usually reflects omitted scope, not a bargain.",
    action:
      "Ask for the bill of quantities and compare item by item. The saving is usually a missing item, not a lower price.",
  },
  {
    id: "impressions",
    weight: 5,
    group: "Presentation",
    text: "Artistic renders and photos that do not resemble the actual site or work actually being done.",
    why: "Renders sell a finish quality that may never be installed. They are marketing, not specification.",
    action:
      "Only trust the approved drawings, the written specification and physical finish samples — in that order.",
  },
  {
    id: "new-company",
    weight: 6,
    group: "Presentation",
    text: "A company incorporated recently, with no visible track record.",
    why: "Fraud frequently uses newly incorporated companies specifically because there is no history to check.",
    action:
      "Search it on eCitizen and note the incorporation date. Ask directly how long the team has worked together, and check that separately.",
  },
  {
    id: "unreachable",
    weight: 6,
    group: "Presentation",
    text: "Difficult to reach, or unresponsive for days after payment.",
    why: "Rapid unresponsiveness after a deposit is the most common pattern in reported Kenyan construction fraud.",
    action:
      "Note the dates and be specific. Contact your bank to recall the payment, and report to DCI immediately — recall is most effective within 48 hours.",
  },
];

export const SIGNAL_GROUPS = [
  "Payment",
  "Verification",
  "Process",
  "Pressure",
  "Presentation",
] as const;

export const VERDICTS = {
  low: {
    max: 8,
    label: "No significant warning signs",
    tone: "good" as const,
    body: "Nothing you have described is in itself a fraud indicator. Stay alert to payment structure — that is where most construction disputes actually originate.",
  },
  medium: {
    max: 20,
    label: "Proceed with caution",
    tone: "warn" as const,
    body: "There are signals here worth resolving before any money moves. Each one has a specific action above. Get those answered in writing before paying a deposit.",
  },
  high: {
    max: 40,
    label: "Serious warning signs present",
    tone: "bad" as const,
    body: "What you have described matches patterns strongly associated with construction fraud in Kenya. Do not transfer money. Resolve the payment-structure and verification signals first — if they cannot be answered satisfactorily, walk away.",
  },
  severe: {
    max: Infinity,
    label: "Stop — treat this as likely fraud",
    tone: "bad" as const,
    body: "The combination you have described is characteristic of advance-fee and impersonation fraud targeting diaspora clients. Do not send any further money. Contact your bank to recall existing transfers, report to DCI, and treat every account associated with this contact as compromised.",
  },
} as const;

export function assess(signals: Signal[]) {
  const score = signals.reduce((sum, s) => sum + s.weight, 0);
  const level =
    score <= VERDICTS.low.max
      ? VERDICTS.low
      : score <= VERDICTS.medium.max
        ? VERDICTS.medium
        : score <= VERDICTS.high.max
          ? VERDICTS.high
          : VERDICTS.severe;
  return { score, level, count: signals.length };
}
