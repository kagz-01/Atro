export const PROJECT_CIRCLE_INVITE_DAYS = 7;
export const PROJECT_CIRCLE_ACCESS_DAYS = 90;

export function normaliseCircleEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hasActiveCircleAccess(
  status: string,
  expiresAt: string | Date,
  now = new Date(),
): boolean {
  const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  return status === "active" && Number.isFinite(expiry.getTime()) && expiry > now;
}

export function canAcceptCircleInvite(input: {
  status: string;
  expiresAt: string | Date;
  inviteEmail: string;
  sessionEmail: string;
  emailVerified: boolean;
  now?: Date;
}): boolean {
  const expiry = input.expiresAt instanceof Date ? input.expiresAt : new Date(input.expiresAt);
  return (
    input.status === "pending" &&
    Number.isFinite(expiry.getTime()) &&
    expiry > (input.now ?? new Date()) &&
    input.emailVerified &&
    normaliseCircleEmail(input.inviteEmail) === normaliseCircleEmail(input.sessionEmail)
  );
}
