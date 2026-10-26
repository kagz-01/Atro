import assert from "node:assert/strict";
import test from "node:test";
import {
  coordinationDateKey,
  coordinationMonthGrid,
  coordinationToday,
  moveCoordinationMonth,
} from "./coordination-calendar.ts";

test("calendar dates follow Nairobi time across UTC midnight", () => {
  assert.equal(coordinationDateKey("2025-03-31T21:30:00.000Z"), "2025-04-01");
  assert.equal(coordinationToday(new Date("2025-03-31T21:30:00.000Z")), "2025-04-01");
});

test("month navigation handles year boundaries", () => {
  assert.equal(moveCoordinationMonth("2025-01-31", -1), "2024-12-01");
  assert.equal(moveCoordinationMonth("2024-12-10", 1), "2025-01-01");
});

test("month grid is a 42-day Monday-first range containing the selected month", () => {
  const days = coordinationMonthGrid("2024-02-20");

  assert.equal(days.length, 42);
  assert.equal(days[0], "2024-01-29");
  assert.equal(days[days.length - 1], "2024-03-10");
  assert.ok(days.includes("2024-02-29"));
  assert.equal(new Date(`${days[0]}T00:00:00Z`).getUTCDay(), 1);
});
