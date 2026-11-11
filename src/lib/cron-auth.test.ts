import assert from "node:assert/strict";
import { test } from "node:test";
import { isAuthorizedCronRequest } from "./cron-auth.server.ts";

const secret = "a-long-random-secret-for-scheduler-tests";

test("cron authorization accepts only an exact bearer secret", () => {
  assert.equal(
    isAuthorizedCronRequest(
      new Request("https://atro.test/api/cron/hourly", {
        headers: { authorization: `Bearer ${secret}` },
      }),
      secret,
    ),
    true,
  );
  assert.equal(
    isAuthorizedCronRequest(
      new Request("https://atro.test/api/cron/hourly", {
        headers: { authorization: `Bearer  ${secret}` },
      }),
      secret,
    ),
    false,
  );
});

test("cron authorization rejects missing, malformed, and unconfigured credentials", () => {
  assert.equal(
    isAuthorizedCronRequest(new Request("https://atro.test/api/cron/hourly"), secret),
    false,
  );
  assert.equal(
    isAuthorizedCronRequest(
      new Request("https://atro.test/api/cron/hourly", {
        headers: { authorization: secret },
      }),
      secret,
    ),
    false,
  );
  assert.equal(
    isAuthorizedCronRequest(
      new Request("https://atro.test/api/cron/hourly", {
        headers: { authorization: "Bearer wrong" },
      }),
      secret,
    ),
    false,
  );
  assert.equal(
    isAuthorizedCronRequest(
      new Request("https://atro.test/api/cron/hourly", {
        headers: { authorization: `Bearer ${secret}` },
      }),
      "",
    ),
    false,
  );
});
