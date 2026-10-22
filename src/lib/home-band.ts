// Which line the home screen shows for the next call.
//
// The label the studio wrote (`when`) is the site's own wording, in EAT —
// right for a client who lives on that clock. A client abroad gets the
// pre-converted line instead (`localTimeForYou`, "…your time"), because
// handing them an EAT wall time is asking them to do arithmetic before they
// know when they are expected. Everything falls through to the studio's
// wording rather than inventing a schedule the studio never wrote.

export type NextCall = {
  when: string;
  localTimeForYou: string;
  at: string | null;
};

/** Which section of the console a band's link is allowed to open. */
export type HomeSection = "money" | "messages" | "decisions" | "abroad";

const usable = (s: string) => Boolean(s && s !== "To be scheduled");

export function nextCallLine(call: NextCall, abroad: boolean): string {
  if (abroad && usable(call.localTimeForYou)) return call.localTimeForYou;
  if (usable(call.when)) return call.when;
  if (usable(call.localTimeForYou)) return call.localTimeForYou;
  return "";
}
