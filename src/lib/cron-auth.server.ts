import { timingSafeEqual } from "node:crypto";

export function isAuthorizedCronRequest(request: Request, secret: string): boolean {
  if (!secret) return false;
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  const token = authorization.slice("Bearer ".length);
  if (!token || /\s/.test(token)) return false;

  const expected = Buffer.from(secret, "utf8");
  const actual = Buffer.from(token, "utf8");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
