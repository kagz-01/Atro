import { createHmac, timingSafeEqual } from "node:crypto";

export function paystackAmountSubunits(amountKes: number): number {
  if (!Number.isSafeInteger(amountKes) || amountKes < 3) {
    throw new Error("Paystack payments must be at least KES 3 and a whole-shilling amount.");
  }
  const amount = amountKes * 100;
  if (!Number.isSafeInteger(amount)) {
    throw new Error("The payment amount is outside Paystack's supported range.");
  }
  return amount;
}

export function verifyPaystackSignature(
  rawBody: Uint8Array,
  headers: Headers,
  webhookSecret: string,
  legacySecret?: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  const signature = headers.get("paystack-signature");
  if (signature && webhookSecret) {
    let timestamp: number | null = null;
    const signatures: string[] = [];
    for (const part of signature.split(",")) {
      const equals = part.indexOf("=");
      if (equals < 0) continue;
      const key = part.slice(0, equals).trim();
      const value = part.slice(equals + 1).trim();
      if (key === "t") {
        if (timestamp !== null || !/^\d+$/.test(value)) return false;
        timestamp = Number(value);
      } else if (key === "v1") {
        const colon = value.indexOf(":");
        const digest = colon >= 0 ? value.slice(colon + 1) : value;
        if (/^[0-9a-f]{128}$/i.test(digest)) signatures.push(digest.toLowerCase());
      }
    }

    if (
      timestamp === null ||
      Math.abs(nowSeconds - timestamp) > 300 ||
      signatures.length === 0
    ) {
      return false;
    }
    const expected = createHmac("sha512", webhookSecret)
      .update(`${timestamp}.`)
      .update(rawBody)
      .digest();
    return signatures.some((value) =>
      timingSafeEqual(expected, Buffer.from(value, "hex")),
    );
  }

  const legacySignature = headers.get("x-paystack-signature");
  if (!legacySecret || !legacySignature || !/^[0-9a-f]{128}$/i.test(legacySignature)) {
    return false;
  }
  const expected = createHmac("sha512", legacySecret).update(rawBody).digest();
  return timingSafeEqual(expected, Buffer.from(legacySignature, "hex"));
}
