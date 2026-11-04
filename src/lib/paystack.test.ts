import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { paystackAmountSubunits, verifyPaystackSignature } from "./paystack.ts";

test("converts KES to cents without accepting fractional shillings", () => {
  assert.equal(paystackAmountSubunits(3), 300);
  assert.equal(paystackAmountSubunits(125_000), 12_500_000);
  assert.throws(() => paystackAmountSubunits(2), /at least KES 3/);
  assert.throws(() => paystackAmountSubunits(3.5), /whole-shilling/);
  assert.throws(() => paystackAmountSubunits(Number.MAX_SAFE_INTEGER), /supported range/);
});

test("verifies the timestamped Paystack-Signature against the exact raw body", () => {
  const rawBody = Buffer.from('{"event":"charge.success","data":{"reference":"r-1"}}');
  const timestamp = 1_800_000_000;
  const digest = createHmac("sha512", "whsec_test")
    .update(`${timestamp}.`)
    .update(rawBody)
    .digest("hex");
  const headers = new Headers({
    "paystack-signature": `t=${timestamp},v1=whk_test:${digest}`,
  });

  assert.equal(
    verifyPaystackSignature(rawBody, headers, "whsec_test", undefined, timestamp),
    true,
  );
  assert.equal(
    verifyPaystackSignature(Buffer.from(`${rawBody.toString()} `), headers, "whsec_test", undefined, timestamp),
    false,
  );
  assert.equal(
    verifyPaystackSignature(rawBody, headers, "whsec_test", undefined, timestamp + 301),
    false,
  );
});

test("supports Paystack's legacy signature header during key transition", () => {
  const rawBody = Buffer.from('{"event":"charge.success"}');
  const digest = createHmac("sha512", "sk_test").update(rawBody).digest("hex");
  const headers = new Headers({ "x-paystack-signature": digest });

  assert.equal(
    verifyPaystackSignature(rawBody, headers, "", "sk_test"),
    true,
  );
  assert.equal(
    verifyPaystackSignature(rawBody, headers, "", "wrong-secret"),
    false,
  );
});
