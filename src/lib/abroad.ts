// ATRO — what actually differs when the client is not in the country.
//
// Three promises already written elsewhere are kept here: the profile's
// timezone decides how a call is quoted (the profile panel says so), the
// contact switches are consent — "the studio may only use a channel the client
// has switched on" (the profile panel says that too, and the notification
// outbox has been ignoring it) — and the journey library has a fromAbroad
// paragraph on every stage that nobody was showing to a client abroad.
//
// All decisions are pure so the panel is only ever paint: it decides nothing,
// it renders what these functions answer.
//
// The journey import carries its `.ts` extension like every other import from
// a tested module (see evidence.ts → image.ts): node's test runner has no
// alias resolver, so `@/lib/...` would not load under `node --test`.

import { journeyStageById, type JourneyStage } from "./diaspora/journey.ts";

/** The client profile's `client_type` value that means "lives abroad". */
export function isAbroad(clientType: string): boolean {
  return clientType === "diaspora";
}

/**
 * Which journey stage a milestone name belongs to.
 *
 * The nine construction milestone names are the same vocabulary the journey
 * was written against, so they map exactly. Other tracks' names fall through
 * keyword matching only where the meaning is genuinely the same — a name we do
 * not recognise maps to null and the panel simply omits the card, because a
 * wrong "here is where you are" is worse than no guidance at all.
 */
const EXACT: Record<string, string> = {
  "Land and due diligence": "land",
  "Concept and cost options": "design",
  "Developed design and approvals": "approvals",
  "Bill of Quantities and contract": "team",
  "Site establishment and substructure": "foundation",
  Superstructure: "frame",
  "Roof, first fix and finishes": "roof",
  "Second fix, testing and approvals": "mep",
  "Snagging and handover": "handover",
};

const KEYWORDS: [RegExp, string][] = [
  [/land|due diligence|title|conveyanc/i, "land"],
  [/contract|bill of quantit|boq|tender|fee basis|cost option/i, "team"],
  [/concept|feasibility|design|drawing|sketch/i, "design"],
  [/approval|planning|permit|statutory/i, "approvals"],
  [/foundation|substructure|excavat|setting out|site (set-)?up|demolition/i, "foundation"],
  [/roof|truss/i, "roof"],
  [/superstructure|frame|slab|column|ring beam|structural/i, "frame"],
  [/second fix|first fix|mep|plumbing|electrical|commission|testing/i, "mep"],
  [/finish|paint|joinery|tile|snag|handover|defect/i, "handover"],
];

export function journeyStageFor(milestoneName: string): JourneyStage | null {
  const name = milestoneName.trim();
  if (!name) return null;
  const exact = EXACT[name];
  if (exact) return journeyStageById(exact) ?? null;
  for (const [pattern, id] of KEYWORDS) {
    if (pattern.test(name)) return journeyStageById(id) ?? null;
  }
  return null;
}

/**
 * The channels the studio may actually try for this client.
 *
 * The portal feed is not a transport — it is the dashboard itself and is
 * always on. Every other channel is consent: the switches in the profile are
 * a record of permission, not a preference list, so a channel switched off is
 * never contacted, not contacted and quietly marked failed. Missing contact
 * details are deliberately not filtered out here — that is the outbox's
 * business, and it records "no contact on file" so the studio can see it.
 */
export type Consent = {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
};

export type ReachChannel = "inapp" | "email" | "whatsapp" | "sms";

export function channelsFor(consent: Consent): ReachChannel[] {
  const channels: ReachChannel[] = ["inapp"];
  if (consent.email) channels.push("email");
  if (consent.whatsapp) channels.push("whatsapp");
  if (consent.sms) channels.push("sms");
  return channels;
}

/** A one-line answer to "how will you reach me?" — the panel renders this. */
export function reachLine(channels: ReachChannel[]): string {
  const rest = channels.filter((c) => c !== "inapp");
  const names: Record<string, string> = {
    email: "email",
    whatsapp: "WhatsApp",
    sms: "SMS",
  };
  const spoken = rest.map((c) => names[c]);
  if (spoken.length === 0) return "The portal only — every other channel is switched off in your profile.";
  if (spoken.length === 1) return `The portal and ${spoken[0]}.`;
  const last = spoken.pop();
  return `The portal, ${spoken.join(", ")} and ${last}.`;
}
