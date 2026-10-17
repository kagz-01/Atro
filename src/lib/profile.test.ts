import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AVATAR_MAX_BYTES,
  checkAvatarSize,
  cleanProfileText,
  initialsFrom,
  isClientType,
  parseImageDataUrl,
  splitName,
} from "./profile.ts";

/** A real 1×1 JPEG, base64 — small enough to pass the size gate. */
const JPEG_1PX =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==";

test("accepts a small jpeg data url", () => {
  const result = parseImageDataUrl(JPEG_1PX);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.image.mime, "image/jpeg");
  assert.ok(result.image.bytes.byteLength > 0);
});

test("rejects a non-image", () => {
  const result = parseImageDataUrl("data:text/plain;base64,aGVsbG8=");
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /JPEG, PNG or WebP/);
});

test("rejects something that is not a data url at all", () => {
  const result = parseImageDataUrl("https://example.com/me.png");
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /could not be read/);
});

test("rejects an image over the size ceiling, and says how big it is", () => {
  const result = checkAvatarSize(AVATAR_MAX_BYTES + 1);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /KB/);
});

test("accepts an image exactly at the ceiling", () => {
  assert.equal(checkAvatarSize(AVATAR_MAX_BYTES).ok, true);
});

test("rejects an empty file", () => {
  const result = checkAvatarSize(0);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /empty/);
});

test("initials come from the first two words", () => {
  assert.equal(initialsFrom("Wanjiku Njeri"), "WN");
  assert.equal(initialsFrom("Amina Yusuf"), "AY");
  assert.equal(initialsFrom("Grace"), "G");
});

test("initials ignore the domain of an address", () => {
  assert.equal(initialsFrom("amina@example.com"), "AE");
  assert.equal(initialsFrom("b.otieno@example.com"), "BO");
});

test("initials survive punctuation and return empty for nothing", () => {
  assert.equal(initialsFrom("  "), "");
  assert.equal(initialsFrom("!!!"), "");
  assert.equal(initialsFrom("Mary-Jane O'Neill"), "MO");
});

test("client types are a closed set", () => {
  assert.equal(isClientType("diaspora"), true);
  assert.equal(isClientType("developer"), true);
  assert.equal(isClientType("landlord"), false);
  assert.equal(isClientType(""), false);
});

test("profile text is collapsed to one line and capped", () => {
  assert.equal(cleanProfileText("  Wanjiku   Njeri  ", 80), "Wanjiku Njeri");
  assert.equal(cleanProfileText("abcdef", 3), "abc");
});

test("a name splits into first and rest", () => {
  assert.deepEqual(splitName("Wanjiku Njeri Kamau"), {
    first: "Wanjiku",
    rest: "Njeri Kamau",
  });
  assert.deepEqual(splitName("Prince"), { first: "Prince", rest: "" });
});
