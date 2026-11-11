import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { canRespondToCalendarRequest, calendarRequestLabel } from "./project-calendar.ts";

describe("project calendar requests", () => {
  it("allows only a single transition from requested to a final response", () => {
    assert.equal(canRespondToCalendarRequest("requested", "confirmed"), true);
    assert.equal(canRespondToCalendarRequest("requested", "declined"), true);
    assert.equal(canRespondToCalendarRequest("confirmed", "declined"), false);
    assert.equal(canRespondToCalendarRequest("declined", "confirmed"), false);
  });

  it("uses readable event type labels", () => {
    assert.equal(calendarRequestLabel("meeting"), "Project meeting");
    assert.equal(calendarRequestLabel("other"), "Other project event");
  });
});
