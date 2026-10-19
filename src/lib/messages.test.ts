import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  authorLabel,
  composerHint,
  MESSAGE_MAX,
  MESSAGE_MIN,
  newestFirst,
  oldestFirst,
  summariseThread,
  unreadFor,
  validateMessage,
  type Message,
} from "./messages.ts";

const msg = (over: Partial<Message> = {}): Message => ({
  id: "m1",
  projectId: "p1",
  ord: 1,
  authorRole: "client",
  authorId: "dev-user",
  authorLabel: "Wanjiku Njeri",
  body: "Has the roof covering arrived?",
  createdAt: "2026-03-10T09:00:00Z",
  readAt: null,
  ...over,
});

describe("validateMessage", () => {
  it("accepts a normal message and trims it", () => {
    const r = validateMessage("  Has the roof   covering arrived?  ");
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.body, "Has the roof covering arrived?");
  });

  it("accepts a short reply — a portal people actually use", () => {
    assert.equal(validateMessage("ok, thanks").ok, true);
  });

  it("refuses an empty or whitespace-only message", () => {
    assert.equal(validateMessage("   ").ok, false);
    assert.equal(validateMessage("\n\n").ok, false);
  });

  it("says so plainly rather than failing silently", () => {
    const r = validateMessage("");
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.match(r.reason, /Write a message/);
  });

  it("refuses one well over the cap and reports the length", () => {
    const r = validateMessage("a".repeat(MESSAGE_MAX + 1));
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.match(r.reason, new RegExp(String(MESSAGE_MAX)));
  });

  it("accepts one exactly at the cap", () => {
    assert.equal(validateMessage("a".repeat(MESSAGE_MAX)).ok, true);
  });

  it("keeps the minimum low enough for a real reply", () => {
    assert.ok(MESSAGE_MIN <= 3, "minimum should not demand an essay");
  });

  it("collapses runs of blank lines but keeps paragraphs", () => {
    const r = validateMessage("para one\n\n\n\npara two");
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.body, "para one\n\npara two");
  });
});

describe("authorLabel", () => {
  it("uses the stored name when there is one", () => {
    assert.equal(authorLabel({ authorRole: "studio", authorLabel: "Nanjala Oduor" }), "Nanjala Oduor");
  });

  it("falls back to the role when the name is empty", () => {
    assert.equal(authorLabel({ authorRole: "studio", authorLabel: "  " }), "ATRO studio");
    assert.equal(authorLabel({ authorRole: "client", authorLabel: "" }), "The client");
  });
});

describe("unreadFor", () => {
  it("counts only what the other side wrote and nobody has opened", () => {
    const messages = [
      msg({ id: "a", authorRole: "client", readAt: "2026-03-10T10:00:00Z" }),
      msg({ id: "b", authorRole: "studio", readAt: null }),
      msg({ id: "c", authorRole: "studio", readAt: "2026-03-10T11:00:00Z" }),
    ];
    assert.equal(unreadFor(messages, "client"), 1);
  });

  it("never counts your own messages as unread to you", () => {
    const messages = [msg({ authorRole: "client", readAt: null })];
    assert.equal(unreadFor(messages, "client"), 0);
    assert.equal(unreadFor(messages, "studio"), 1);
  });

  it("is zero on an empty thread", () => {
    assert.equal(unreadFor([], "client"), 0);
    assert.equal(unreadFor([], "studio"), 0);
  });

  it("drops to zero once the other side has opened everything", () => {
    const messages = [
      msg({ authorRole: "studio", readAt: "2026-03-11T08:00:00Z" }),
      msg({ id: "m2", ord: 2, authorRole: "studio", readAt: "2026-03-11T08:05:00Z" }),
    ];
    assert.equal(unreadFor(messages, "client"), 0);
  });
});

describe("summariseThread", () => {
  it("reports the newest message whichever side wrote it", () => {
    const messages = [
      msg({ ord: 1, authorRole: "client" }),
      // Already opened by the client, so the thread reads as settled.
      msg({ ord: 2, authorRole: "studio", body: "Arrives Thursday.", readAt: "2026-03-10T10:00:00Z" }),
    ];
    const s = summariseThread(messages, "client");
    assert.equal(s.last?.body, "Arrives Thursday.");
    assert.equal(s.unread, 0);
  });

  it("counts unread from the reader's side", () => {
    const messages = [
      msg({ ord: 1, authorRole: "client" }),
      // The studio's reply, opened by the client but not yet by the studio.
      msg({ ord: 2, authorRole: "studio", body: "Thursday.", readAt: "2026-03-10T10:00:00Z" }),
    ];
    assert.equal(summariseThread(messages, "client").unread, 0);
    assert.equal(summariseThread(messages, "studio").unread, 1);
  });

  it("says the thread is empty rather than showing nothing", () => {
    const s = summariseThread([], "client");
    assert.equal(s.last, null);
    assert.match(s.preview, /No messages yet/);
  });

  it("flattens a long message into a one-line preview", () => {
    const s = summariseThread([msg({ body: "word ".repeat(60) })], "client");
    assert.ok(s.preview.length <= 90, `preview too long: ${s.preview.length}`);
    assert.ok(s.preview.endsWith("…"));
  });

  it("keeps a short message whole", () => {
    const s = summariseThread([msg({ body: "Thursday." })], "client");
    assert.equal(s.preview, "Thursday.");
  });
});

describe("ordering", () => {
  it("reads a conversation oldest first", () => {
    const ordered = oldestFirst([msg({ ord: 3 }), msg({ ord: 1 }), msg({ ord: 2 })]);
    assert.deepEqual(ordered.map((m) => m.ord), [1, 2, 3]);
  });

  it("shows newest first for a badge or list", () => {
    const ordered = newestFirst([msg({ ord: 1 }), msg({ ord: 3 }), msg({ ord: 2 })]);
    assert.deepEqual(ordered.map((m) => m.ord), [3, 2, 1]);
  });

  it("does not mutate the input", () => {
    const input = [msg({ ord: 2 }), msg({ ord: 1 })];
    oldestFirst(input);
    assert.equal(input[0].ord, 2);
  });
});

describe("composerHint", () => {
  it("tells the client where the message actually goes", () => {
    assert.match(composerHint("client"), /project manager/);
    assert.match(composerHint("client"), /WhatsApp/);
  });

  it("tells the studio the client will see it dated", () => {
    assert.match(composerHint("studio"), /client sees this/);
  });
});
