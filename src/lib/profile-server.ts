// The client's own record: one row per person, not one per project.
//
// Every function is auth-gated and scoped to `context.userId`, including the
// read — a client profile holds a phone number, a city and a note about what
// they are building, which is nobody else's business.
//
// The avatar is stored in Postgres rather than object storage because the
// project has no storage credentials configured yet and a 512px JPEG is small.
// When a bucket is available this file is the only thing that changes: swap the
// two `avatar_*` helpers for an upload call and serve a URL instead of bytes.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { toE164 } from "@/lib/phone";
import {
  AVATAR_MAX_BYTES,
  AVATAR_MIME,
  checkAvatarSize,
  cleanProfileText,
  initialsFrom,
  isClientType,
  PROFILE_LIMITS,
  type AvatarMime,
} from "@/lib/profile";


export type ClientProfile = {
  displayName: string;
  initials: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  timezone: string;
  clientType: string;
  company: string;
  about: string;
  language: string;
  notifyEmail: boolean;
  notifySms: boolean;
  notifyWhatsapp: boolean;
  sitePhotoConsent: boolean;
  referralSource: string;
  /** Present when a picture has been uploaded; served by /portal/avatar. */
  hasAvatar: boolean;
  avatarUpdatedAt: string | null;
  createdAt: string | null;
};

export const EMPTY_PROFILE: ClientProfile = {
  displayName: "",
  initials: "",
  phone: "",
  email: "",
  city: "",
  country: "",
  timezone: "",
  clientType: "individual",
  company: "",
  about: "",
  language: "en",
  notifyEmail: true,
  notifySms: false,
  notifyWhatsapp: true,
  sitePhotoConsent: true,
  referralSource: "",
  hasAvatar: false,
  avatarUpdatedAt: null,
  createdAt: null,
};

const row = (r: Record<string, unknown>): ClientProfile => ({
  displayName: String(r.display_name ?? ""),
  initials: String(r.initials ?? ""),
  phone: String(r.phone ?? ""),
  email: String(r.email ?? ""),
  city: String(r.city ?? ""),
  country: String(r.country ?? ""),
  timezone: String(r.timezone ?? ""),
  clientType: String(r.client_type ?? "individual"),
  company: String(r.company ?? ""),
  about: String(r.about ?? ""),
  language: String(r.language ?? "en"),
  notifyEmail: r.notify_email !== false,
  notifySms: r.notify_sms === true,
  notifyWhatsapp: r.notify_whatsapp !== false,
  sitePhotoConsent: r.site_photo_consent !== false,
  referralSource: String(r.referral_source ?? ""),
  hasAvatar: Boolean(r.avatar_bytes),
  avatarUpdatedAt: r.avatar_updated_at ? String(r.avatar_updated_at) : null,
  createdAt: r.created_at ? String(r.created_at) : null,
});

export async function readProfileFor(sql: Sql, userId: string): Promise<ClientProfile> {
  const [r] = await sql<Record<string, unknown>>`
    select
      display_name, initials, phone, email, city, country, timezone,
      client_type, company, about, language, notify_email, notify_sms,
      notify_whatsapp, site_photo_consent, referral_source,
      avatar_bytes is not null as has_avatar,
      avatar_updated_at, created_at
    from client_profile
    where user_id = ${userId}
  `;
  return r ? row(r) : EMPTY_PROFILE;
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => readProfileFor(await getSql(), context.userId));

const SaveProfileInput = z.object({
  displayName: z.string().max(PROFILE_LIMITS.displayName),
  phone: z.string().max(40).optional().default(""),
  email: z.string().max(160).optional().default(""),
  city: z.string().max(PROFILE_LIMITS.city).optional().default(""),
  country: z.string().max(PROFILE_LIMITS.country).optional().default(""),
  timezone: z.string().max(60).optional().default(""),
  clientType: z.string().optional().default("individual"),
  company: z.string().max(PROFILE_LIMITS.company).optional().default(""),
  about: z.string().max(PROFILE_LIMITS.about).optional().default(""),
  language: z.string().max(10).optional().default("en"),
  notifyEmail: z.boolean().optional().default(true),
  notifySms: z.boolean().optional().default(false),
  notifyWhatsapp: z.boolean().optional().default(true),
  sitePhotoConsent: z.boolean().optional().default(true),
  referralSource: z.string().max(PROFILE_LIMITS.referralSource).optional().default(""),
});

/**
 * Create or update the client's own record.
 *
 * The phone is normalised to E.164 before it is stored, because the number is
 * what the notification layer sends to and "0799 034 712" and "+254799034712"
 * are the same person. A number we cannot normalise is kept as typed rather
 * than discarded — a client is better served by a messy number the studio can
 * read than by no number at all.
 */
export const saveMyProfile = createServerFn({ method: "POST" })
  .validator(SaveProfileInput)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const displayName = cleanProfileText(data.displayName, PROFILE_LIMITS.displayName);
    if (displayName.length < 2) {
      throw new Error("Give the name the studio should call you by.");
    }
    if (!isClientType(data.clientType)) {
      throw new Error("Pick what best describes you.");
    }
    if (data.notifySms && !data.phone.trim()) {
      throw new Error("Add a mobile number before asking for texts.");
    }

    const phone = data.phone.trim() ? (toE164(data.phone) ?? data.phone.trim()) : "";
    const initials = initialsFrom(displayName);

    await sql`
      insert into client_profile (
        user_id, display_name, initials, phone, email, city, country, timezone,
        client_type, company, about, language, notify_email, notify_sms,
        notify_whatsapp, site_photo_consent, referral_source
      ) values (
        ${context.userId}, ${displayName}, ${initials}, ${phone},
        ${data.email.trim()}, ${cleanProfileText(data.city, PROFILE_LIMITS.city)},
        ${cleanProfileText(data.country, PROFILE_LIMITS.country)}, ${data.timezone},
        ${data.clientType}, ${cleanProfileText(data.company, PROFILE_LIMITS.company)},
        ${data.about.trim()}, ${data.language}, ${data.notifyEmail}, ${data.notifySms},
        ${data.notifyWhatsapp}, ${data.sitePhotoConsent},
        ${cleanProfileText(data.referralSource, PROFILE_LIMITS.referralSource)}
      )
      on conflict (user_id) do update set
        display_name = excluded.display_name,
        initials = excluded.initials,
        phone = excluded.phone,
        email = excluded.email,
        city = excluded.city,
        country = excluded.country,
        timezone = excluded.timezone,
        client_type = excluded.client_type,
        company = excluded.company,
        about = excluded.about,
        language = excluded.language,
        notify_email = excluded.notify_email,
        notify_sms = excluded.notify_sms,
        notify_whatsapp = excluded.notify_whatsapp,
        site_photo_consent = excluded.site_photo_consent,
        referral_source = excluded.referral_source,
        updated_at = now()
    `;

    return readProfileFor(sql, context.userId);
  });

/**
 * Store a resized picture for the signed-in client.
 *
 * The browser has already scaled it to 512px; this re-checks the type and the
 * size anyway, because the client is not a trust boundary and the row is not
 * worth filling with a 4MB screenshot.
 */
export const saveMyAvatar = createServerFn({ method: "POST" })
  .validator(
    z.object({
      mime: z.enum(AVATAR_MIME),
      dataUrl: z.string().min(32).max(Math.ceil(AVATAR_MAX_BYTES * 1.5)),
    }),
  )
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const base64 = data.dataUrl.split(",")[1] ?? "";
    const bytes = Buffer.from(base64, "base64");
    const size = checkAvatarSize(bytes.byteLength);
    if (!size.ok) throw new Error(size.reason);

    // Make sure a client profile row exists, so the avatar is never orphaned.
    await sql`
      insert into client_profile (user_id) values (${context.userId})
      on conflict (user_id) do nothing
    `;

    await sql`
      update client_profile
      set avatar_mime = ${data.mime as AvatarMime},
          avatar_bytes = ${bytes},
          avatar_updated_at = now(),
          updated_at = now()
      where user_id = ${context.userId}
    `;

    return { ok: true as const, updatedAt: new Date().toISOString() };
  });

export const deleteMyAvatar = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`
      update client_profile
      set avatar_mime = '', avatar_bytes = null, avatar_updated_at = null, updated_at = now()
      where user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export type MyAvatar = { mime: string; bytes: Uint8Array } | null;

/** Read the signed-in client's picture, or null. Used by /portal/avatar. */
export async function readAvatarFor(sql: Sql, userId: string): Promise<MyAvatar> {
  const [r] = await sql<{ avatar_mime: string; avatar_bytes: Uint8Array | null }>`
    select avatar_mime, avatar_bytes from client_profile where user_id = ${userId}
  `;
  if (!r?.avatar_bytes || !r.avatar_mime) return null;
  return { mime: String(r.avatar_mime), bytes: r.avatar_bytes };
}

/**
 * The signed-in client's picture as a `data:` URL.
 *
 * A server function rather than an image route on purpose: it reuses the
 * auth middleware that already proves whose bytes these are, so there is no
 * second path to get the ownership check wrong. It is only fetched when the
 * profile section is opened, so the 40-odd KB of JPEG never rides along with
 * the dashboard.
 */
export const getMyAvatar = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ dataUrl: string | null; updatedAt: string | null }> => {
    const sql = await getSql();
    const [r] = await sql<{ avatar_mime: string; avatar_bytes: Uint8Array | null; avatar_updated_at: string | null }>`
      select avatar_mime, avatar_bytes, avatar_updated_at
      from client_profile
      where user_id = ${context.userId}
    `;
    if (!r?.avatar_bytes) return { dataUrl: null, updatedAt: null };
    return {
      dataUrl: `data:${r.avatar_mime};base64,${Buffer.from(r.avatar_bytes).toString("base64")}`,
      updatedAt: r.avatar_updated_at ? String(r.avatar_updated_at) : null,
    };
  });
