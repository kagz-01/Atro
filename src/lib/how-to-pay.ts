// How to pay: which of the studio's two sheets a client should see.
//
// A client in Nairobi needs an M-Pesa paybill and a local account; a client in
// Melbourne needs the SWIFT code, the branch, and the reference to quote on a
// wire. Both are staff-entered prose (how-to-pay-server.ts holds the reading
// and writing of them); this half is the pure choice between the two, kept
// free of server imports so the test runner — which has no alias resolver —
// can load it, the same split abroad.ts and delivery.ts already use.

export type PaymentInstructions = {
  local: string;
  international: string;
};

/**
 * The variant the portal shows. Abroad reads the international half first;
 * at home reads the local one and never the international (wire details are
 * not the local client's to use). An abroad client with no wire sheet on file
 * still gets the local one — something to pay with beats a blank panel.
 */
export function pickInstructions(local: string, international: string, abroad: boolean): string {
  const primary = (abroad ? international : local).trim();
  if (primary) return primary;
  return abroad ? local.trim() : "";
}
