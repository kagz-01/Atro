// ATRO delivery — what was attempted, what was forbidden, and what the client
// is told about it.
//
// Two decisions live here, both pure so they can be tested without a database:
//
//   partitionChannels   consent splits the channels a message was aimed at
//                       into the ones we may try and the ones we may not.
//                       "May not" is recorded, not silently dropped — a
//                       suppressed channel is the log admitting the switch was
//                       honoured, rather than the log pretending the message
//                       never considered email.
//
//   clientStatusLine    the outbox speaks in provider terms (skipped,
//                       RESEND_API_KEY not set); the client is told what that
//                       means in plain language, with no environment variable
//                       names leaking into their portal.
//
// The import carries its `.ts` extension like every other import from a tested
// module (see evidence.ts → image.ts): node's test runner has no alias
// resolver, so `@/lib/...` would not load under `node --test`.

import { channelsFor, type Consent, type ReachChannel } from "./abroad.ts";

export type Channel = ReachChannel;

export const ALL_CHANNELS: Channel[] = ["inapp", "email", "whatsapp", "sms"];

/** How the portal names each channel. */
export const CHANNEL_NAMES: Record<Channel, string> = {
  inapp: "Portal",
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
};

/**
 * Split what a message was aimed at by what the client allows.
 *
 * `candidate` is every channel the caller meant to use (or all four when it
 * said nothing). Consent decides the split — never credentials or contact
 * details: a missing address is the outbox's business and shows up as
 * "no contact on file", while a switched-off channel is the client's decision
 * and shows up as suppressed.
 */
export function partitionChannels(
  candidate: Channel[],
  consent: Consent,
): { wanted: Channel[]; suppressed: Channel[] } {
  const allowed = channelsFor(consent);
  return {
    wanted: candidate.filter((c) => allowed.includes(c)),
    suppressed: candidate.filter((c) => !allowed.includes(c)),
  };
}

/**
 * What the client reads instead of the raw status.
 *
 * `detail` is carried through only where it says something to a person —
 * suppression in their own words, "no contact on file" as it is, and missing
 * provider credentials translated to what it means for them: the studio has
 * not set that channel up yet. Nothing here mentions keys, providers or HTTP
 * codes.
 */
export function clientStatusLine(status: string, detail: string, channel: Channel): string {
  switch (status) {
    case "sent":
      return channel === "inapp" ? "Shown in your portal" : "Sent";
    case "pending":
      return "Queued";
    case "failed":
      return "Did not go through — the studio can retry";
    case "suppressed":
      return detail || "Switched off in your profile";
    case "skipped":
      if (detail.includes("not set") || detail.includes("not configured")) {
        return "The studio has not set this channel up yet";
      }
      if (detail.includes("no contact")) return "No contact details on file";
      return detail || "Not sent";
    default:
      return status;
  }
}
