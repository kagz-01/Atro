// ATRO notifications — an outbox with swappable channels.
//
// Why an outbox rather than sending inline: a staff member pressing "post
// update" must never fail because a provider is down, rate-limited or simply
// not configured yet. So the write path records intent, and delivery happens
// after it, per channel. A channel that is not configured records `skipped`
// rather than disappearing, so nothing is silently lost.
//
// Channels:
//   inapp     always available — the portal already renders these
//   email     Resend (RESEND_API_KEY). Absent key => skipped, logged.
//   whatsapp  WhatsApp Business Cloud API (WHATSAPP_TOKEN + PHONE_NUMBER_ID).
//             Requires Meta-approved templates. Absent creds => skipped.
//   sms       Africa's Talking (AT_API_KEY), for numbers without WhatsApp.
//
// Every recipient is derived from the project row or the signed-in account — a
// client-supplied address is never trusted for delivery.
//
// For a client, consent is the ceiling: the profile's channel switches are
// permission, not preferences, so a channel switched off is never contacted
// (partitionChannels in src/lib/delivery.ts) — and the outbox records it as
// `suppressed`, so the log shows the switch was honoured instead of hiding the
// channel as if nobody had ever meant to use it. The studio's own contact has
// no such switches — staff messages use whatever transport the credentials
// allow.
//
// Time is the other ceiling, and it is read on the client's clock: outside
// their 08:00–20:00 a push channel's row is written `pending` with a
// deliver_after (src/lib/tz.ts computes the morning) instead of being
// attempted at three in their morning. The row still carries intent — the
// definition of this outbox — and the attempt happens when the drain finds it
// due, at the next touch that runs one: every notify(), the studio opening a
// project's delivery log, the client opening their own. In-app never waits
// (the portal is where they would read it), the studio's own audience never
// waits, and a zone that cannot be read sends now rather than being held on a
// guess.

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { toAfricaTalking, toE164 } from "@/lib/phone";
import { type Consent } from "@/lib/abroad";
import { ALL_CHANNELS, partitionChannels, type Channel } from "@/lib/delivery";
import { quietHoldUntil } from "@/lib/tz";

export type { Channel };

export type NotificationInput = {
  projectId: string;
  kind: string;
  title: string;
  body?: string;
  audience?: "client" | "studio";
  /** Channels to try. For a client these are still filtered by consent. */
  channels?: Channel[];
  /** Deep link, e.g. the certificate this message is about. */
  documentUrl?: string;
  /**
   * When set, this notification is sent at most once for that key. The unique
   * index on `dedupe_key` is what enforces it, so a retry cannot double-send.
   */
  dedupeKey?: string;
};

/* ── configuration ── */

type ChannelConfig = { configured: boolean; reason: string };

function emailConfig(): ChannelConfig {
  const key = process.env.RESEND_API_KEY;
  return key
    ? { configured: true, reason: "" }
    : { configured: false, reason: "RESEND_API_KEY not set" };
}

function whatsappConfig(): ChannelConfig {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return { configured: false, reason: "WhatsApp credentials not set" };
  return { configured: true, reason: "" };
}

function smsConfig(): ChannelConfig {
  const key = process.env.AT_API_KEY;
  if (!key) return { configured: false, reason: "AT_API_KEY not set" };
  // Their API rejects an unregistered sender id outright, so say which value is
  // missing rather than letting every send fail with an opaque 400.
  if (!process.env.AT_SENDER?.trim()) {
    return { configured: false, reason: "AT_SENDER not set (a sender id registered with Africa’s Talking)" };
  }
  return { configured: true, reason: "" };
}

const CONFIG: Record<Channel, () => ChannelConfig> = {
  inapp: () => ({ configured: true, reason: "" }),
  email: emailConfig,
  whatsapp: whatsappConfig,
  sms: smsConfig,
};

export function channelStatus(): { channel: Channel; configured: boolean; reason: string }[] {
  return (Object.keys(CONFIG) as Channel[]).map((channel) => ({
    channel,
    ...CONFIG[channel](),
  }));
}

/* ── recipients ── */

type Recipient = {
  email: string | null;
  phone: string | null;
  name: string;
  /** The client's own zone, for reading their waking hours; absent for the studio. */
  timezone?: string;
  /** The client's channel consent; absent for the studio, which has none. */
  consent?: Consent;
};

async function resolveStudio(sql: Sql): Promise<Recipient | null> {
  const rows = await sql<{ email: string; label: string }>`
    select email, label from studio_contact where active order by created_at
  `;
  const row = rows[0];
  if (!row) return null;
  return { email: row.email, phone: null, name: row.label };
}

async function resolveClient(sql: Sql, projectId: string): Promise<Recipient | null> {
  const rows = await sql<{
    email: string | null;
    name: string | null;
    client_phone: string;
    phone: string | null;
    notify_email: boolean;
    notify_whatsapp: boolean;
    notify_sms: boolean;
    timezone: string | null;
  }>`
    select coalesce(nullif(c.email, ''), u.email) as email,
           coalesce(nullif(c.display_name, ''), u.name) as name,
           p.client_phone,
           nullif(c.phone, '') as phone,
           coalesce(c.notify_email, true) as notify_email,
           coalesce(c.notify_whatsapp, true) as notify_whatsapp,
           coalesce(c.notify_sms, false) as notify_sms,
           coalesce(nullif(c.timezone, ''), nullif(p.client_tz, '')) as timezone
    from portal_projects p
    left join "user" u on u.id = p.user_id
    left join client_profile c on c.user_id = p.user_id
    where p.id = ${projectId} limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    // The profile is the record the client maintains — the address they typed
    // and the name they want to be called by — with the account's own details
    // as the fallback. Both joins are LEFT: nothing in this deployment ever
    // writes to `user`, so an inner join there made this function return null
    // on every call and the whole client branch quietly ran on the all-false
    // consent fallback instead.
    email: row.email ?? null,
    // Normalise rather than pattern-match: the strict E.164 test used to throw
    // away every number stored the way a client actually types it
    // ("0799 034 712"), so SMS and WhatsApp silently never reached them.
    // A diaspora client may have left this blank entirely.
    phone: toE164(row.phone ?? row.client_phone),
    name: row.name ?? "there",
    timezone: row.timezone ?? "",
    consent: {
      email: row.notify_email,
      whatsapp: row.notify_whatsapp,
      sms: row.notify_sms,
    },
  };
}

/* ── sending ── */

/** The public origin, so links in an email actually resolve. */
function baseUrl(): string {
  const configured = process.env.ATRO_SITE_URL ?? process.env.VITE_PUBLIC_HOSTNAME;
  if (configured) return configured.startsWith("http") ? configured : `https://${configured}`;
  return "https://atro.ke";
}

/** Resolve a link that may already be absolute. */
function absoluteUrl(target: string): string {
  return target.startsWith("http") ? target : `${baseUrl()}${target}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendEmail(
  to: string,
  title: string,
  body: string,
  projectRef: string,
  documentUrl?: string,
) {
  const from = process.env.RESEND_FROM ?? "ATRO <portal@atro.ke>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: title,
      text: [
        title,
        "",
        body,
        "",
        documentUrl
          ? `Open it: ${absoluteUrl(documentUrl)}`
          : `Open your project: ${baseUrl()}/portal`,
      ].join("\n"),
      html: `<div style="font-family:Georgia,serif;color:#3C0508;max-width:560px">
  <p style="letter-spacing:.14em;text-transform:uppercase;font-size:11px;color:#8a6a3a">ATRO · ${escapeHtml(projectRef)}</p>
  <h1 style="font-size:24px;margin:16px 0">${escapeHtml(title)}</h1>
  <p style="font-size:15px;line-height:1.7;color:#4a4a4a">${escapeHtml(body).replace(/\n/g, "<br>")}</p>
  <p style="margin-top:28px">
    <a href="${escapeHtml(documentUrl ? absoluteUrl(documentUrl) : `${baseUrl()}/portal`)}"
       style="display:inline-block;background:#3C0508;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-family:system-ui,sans-serif;font-size:13px">
      ${documentUrl ? "Open the document" : "Open your portal"}
    </a>
  </p>
  <p style="font-size:13px;color:#777;margin-top:20px">
    Sign in to your portal to approve milestones, release certified payments or record a decision.
  </p>
</div>`,
    }),
  });
  if (!res.ok) {
    return { ok: false as const, detail: `resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
  }
  return { ok: true as const, detail: `resend ${res.status}` };
}

/**
 * WhatsApp Business Cloud API. Business-initiated messages must use a template
 * Meta has approved — a plain text body will be rejected outside the 24-hour
 * customer service window. Templates are named below so they can be registered.
 */
async function sendWhatsApp(
  to: string,
  title: string,
  body: string,
  template: string,
) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;
  const version = process.env.WHATSAPP_API_VERSION ?? "v21.0";
  const res = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toAfricaTalking(to) ?? to.replace(/^\+/, ""),
      type: "template",
      template: {
        name: template,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: title }, { type: "text", text: body }],
          },
        ],
      },
    }),
  });
  if (!res.ok) {
    return { ok: false as const, detail: `whatsapp ${res.status}: ${(await res.text()).slice(0, 200)}` };
  }
  return { ok: true as const, detail: `whatsapp ${res.status}` };
}

async function sendSms(to: string, title: string, body: string) {
  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      apiKey: process.env.AT_API_KEY ?? "",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      from: process.env.AT_SENDER ?? "ATRO",
      to: toAfricaTalking(to) ?? to.replace(/^\+/, ""),
      message: `${title}. ${body}`,
    }),
  });
  if (!res.ok) {
    return { ok: false as const, detail: `sms ${res.status}: ${(await res.text()).slice(0, 200)}` };
  }
  return { ok: true as const, detail: `sms ${res.status}` };
}

/* ── the outbox ── */

const TEMPLATE_FOR: Record<string, string> = {
  update: "atro_project_update",
  decision: "atro_decision_required",
  milestone: "atro_milestone_update",
  payment: "atro_payment_certified",
};

/**
 * Record the intent, then try each channel. Never throws for a delivery
 * problem: the row keeps the outcome so staff can see what went out.
 */
export type NotifyResult = {
  /** False when a dedupe key refused the message — it was already sent. */
  created: boolean;
  channels: Channel[];
};

export async function notify(input: NotificationInput): Promise<NotifyResult> {
  const sql = await getSql();
  // Arriving is also a chance to deliver: anything whose client morning has
  // come since the last touch goes out before this new message is written.
  await drainDue(sql);
  const body = input.body ?? "";
  const audience = input.audience ?? "client";
  const recipient =
    audience === "studio" ? await resolveStudio(sql) : await resolveClient(sql, input.projectId);
  // The clock ceiling, read on the client's own zone: outside 08:00–20:00
  // there, every push channel holds its row for the morning instead of
  // firing into their night. The studio's own audience never holds, and an
  // unreadable zone resolves to the site's clock rather than being guessed.
  const zone = recipient?.timezone?.trim() || "Africa/Nairobi";
  const holdUntil =
    audience === "client" ? quietHoldUntil(new Date().toISOString(), zone) : null;
  // The portal feed is always on; everything else follows consent for a client,
  // and for the studio whichever transports have credentials. A channel with
  // no credentials is not silently omitted — it is recorded as skipped, so the
  // delivery log shows the studio is not reaching that person yet.
  //
  // The client's split is consent alone: `partitionChannels` aims the message
  // at everything the caller chose (or all four channels when it chose
  // nothing) and divides it into what we may try and what we may not. The
  // studio's ceiling is configuration instead, and its explicit choice stands
  // even for an unconfigured transport — recorded as skipped, which is how the
  // log shows a provider missing. A client's explicit choice can still never
  // exceed what they consented to.
  const { wanted, suppressed } =
    audience === "studio"
      ? {
          wanted:
            input.channels ??
            (Object.keys(CONFIG) as Channel[]).filter((c) => CONFIG[c]().configured),
          suppressed: [] as Channel[],
        }
      : partitionChannels(
          input.channels ?? ALL_CHANNELS,
          recipient?.consent ?? { email: false, whatsapp: false, sms: false },
        );

  const projectRow = await sql<{ reference: string }>`
    select reference from portal_projects where id = ${input.projectId} limit 1
  `;
  const projectRef = projectRow[0]?.reference ?? "";

  for (const channel of wanted) {
    const config = CONFIG[channel]();
    const dedupe = input.dedupeKey && channel === wanted[0] ? input.dedupeKey : null;
    // inapp never holds — the portal is where they would read it — and a held
    // row is recorded as intent whatever the channel's credentials say today:
    // keys can be configured before the morning comes, and the drain checks.
    const held = holdUntil !== null && channel !== "inapp";
    const status = held || config.configured ? "pending" : "skipped";
    const detail = held
      ? `outside your waking hours (${zone})`
      : config.configured
        ? ""
        : config.reason;
    const deliverAfter = held ? holdUntil : null;

    const rows = dedupe
      ? await sql.query<{ id: string }>(
          `insert into portal_notification
             (project_id, channel, audience, kind, title, body, status, detail,
              document_url, deliver_after, dedupe_key)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           on conflict (dedupe_key) where dedupe_key is not null
             and status in ('pending', 'sent') do nothing
           returning id`,
          [
            input.projectId,
            channel,
            audience,
            input.kind,
            input.title,
            body,
            status,
            detail,
            input.documentUrl ?? null,
            deliverAfter,
            dedupe,
          ],
        )
      : await sql<{ id: string }>`
          insert into portal_notification
            (project_id, channel, audience, kind, title, body, status, detail,
             document_url, deliver_after)
          values (${input.projectId}, ${channel}, ${audience}, ${input.kind},
                  ${input.title}, ${body}, ${status}, ${detail},
                  ${input.documentUrl ?? null}, ${deliverAfter})
          returning id
        `;

    const id = rows[0]?.id;
    // Already handled for this dedupe key — the unique index refused the row,
    // so this message was sent before and must not be sent twice.
    if (dedupe && !id) return { created: false, channels: [] };
    if (!id) continue;
    // Held for the client's morning — the drain attempts it when due.
    if (held) continue;
    if (!config.configured) continue;

    // inapp needs no transport — the row in this table IS the portal's feed,
    // so the insert was the delivery. Settle it: a log that says "queued"
    // forever for a message the portal already shows is just noise.
    if (channel === "inapp") {
      await sql`
        update portal_notification set status = 'sent', sent_at = now()
        where id = ${id}
      `;
      continue;
    }

    await attemptSend(
      sql,
      {
        id,
        project_id: input.projectId,
        kind: input.kind,
        channel,
        audience,
        title: input.title,
        body,
        document_url: input.documentUrl ?? null,
      },
      recipient,
      projectRef,
    );
  }

  // Consent deserves a row of its own. A forbidden channel is the one fact
  // this log used to omit entirely: now it is recorded as suppressed with the
  // client's own switch as the reason, so "we did not send it" and "we were
  // not allowed to" are different sentences on the page — which is the entire
  // point of having asked for consent. When a dedupe key already claimed the
  // event above the loop returned before reaching here; the explicit check
  // covers the callers that aim at nothing the client allows.
  for (const channel of suppressed) {
    if (input.dedupeKey) {
      const previous = await sql<{ id: string }>`
        select id from portal_notification
        where dedupe_key = ${input.dedupeKey} and channel = ${channel}
          and status = 'suppressed'
        limit 1
      `;
      if (previous[0]) continue;
    }
    await sql`
      insert into portal_notification
        (project_id, channel, audience, kind, title, body, status, detail, dedupe_key)
      values (${input.projectId}, ${channel}, ${audience}, ${input.kind},
              ${input.title}, ${body}, 'suppressed',
              'switched off in your profile', ${input.dedupeKey ?? null})
    `;
  }

  return { created: true, channels: wanted };
}

/** One row's attempt: credentials, address, provider, settle — in that order. */
type AttemptRow = {
  id: string;
  project_id: string;
  kind: string;
  channel: string;
  audience: string;
  title: string;
  body: string;
  document_url: string | null;
};

async function attemptSend(
  sql: Sql,
  row: AttemptRow,
  recipient: Recipient | null,
  projectRef: string,
): Promise<void> {
  const channel = row.channel as Channel;
  const config = CONFIG[channel]();
  if (!config.configured) {
    await sql`
      update portal_notification set status = 'skipped', detail = ${config.reason}
      where id = ${row.id}
    `;
    return;
  }
  const target = channel === "email" ? recipient?.email : recipient?.phone;
  if (!target) {
    await sql`
      update portal_notification set status = 'skipped', detail = 'no contact on file'
      where id = ${row.id}
    `;
    return;
  }
  const result =
    channel === "email"
      ? await sendEmail(target, row.title, row.body, projectRef, row.document_url ?? undefined)
      : channel === "whatsapp"
        ? await sendWhatsApp(
            target,
            row.title,
            row.body,
            TEMPLATE_FOR[row.kind] ?? TEMPLATE_FOR.update,
          )
        : await sendSms(target, row.title, row.body);
  await sql`
    update portal_notification
    set status = ${result.ok ? "sent" : "failed"}, attempts = attempts + 1,
        detail = ${result.detail}, sent_at = case when ${result.ok} then now() else sent_at end
    where id = ${row.id}
  `;
}

/**
 * Attempt the held rows whose client morning has come — the drain.
 *
 * There is no scheduler in this deployment, so the work runs when somebody
 * arrives, the same trigger style as the attention sweep: every notify(), the
 * studio opening a project's delivery log, and the client opening their own.
 * Each row is claimed by pushing its due-time forward before the attempt, so
 * two arrivals at the same moment cannot send it twice; a transport that
 * throws settles the row as failed rather than breaking the read that woke it.
 */
export async function drainDue(sql: Sql, projectId?: string): Promise<number> {
  const rows = await sql.query<AttemptRow>(
    `select id, project_id, kind, channel, audience, title, body, document_url
     from portal_notification
     where status = 'pending' and deliver_after is not null and deliver_after <= now()
       and ($1::uuid is null or project_id = $1::uuid)
     order by deliver_after asc
     limit 25`,
    [projectId ?? null],
  );
  let attempted = 0;
  for (const row of rows) {
    const claim = await sql<{ id: string }>`
      update portal_notification
      set deliver_after = now() + interval '1 hour'
      where id = ${row.id} and status = 'pending' and deliver_after <= now()
      returning id
    `;
    if (!claim[0]) continue;
    const recipient =
      row.audience === "studio"
        ? await resolveStudio(sql)
        : await resolveClient(sql, row.project_id);
    const ref = await sql<{ reference: string }>`
      select reference from portal_projects where id = ${row.project_id} limit 1
    `;
    try {
      await attemptSend(sql, row, recipient, ref[0]?.reference ?? "");
      attempted++;
    } catch (e) {
      const detail = `error: ${e instanceof Error ? e.message : String(e)}`.slice(0, 200);
      await sql`
        update portal_notification
        set status = 'failed', attempts = attempts + 1, detail = ${detail}
        where id = ${row.id}
      `;
    }
  }
  return attempted;
}

/**
 * The staff override: send this project's held rows now rather than waiting
 * for their morning — a client who says "I am awake, send it" gets their mail.
 */
export async function releaseHeld(sql: Sql, projectId: string): Promise<number> {
  await sql`
    update portal_notification set deliver_after = now()
    where project_id = ${projectId} and status = 'pending' and deliver_after is not null
  `;
  return drainDue(sql, projectId);
}

export type NotificationLog = {
  id: string;
  channel: Channel;
  audience: string;
  kind: string;
  title: string;
  status: string;
  detail: string;
  createdAt: string;
  sentAt: string | null;
  /** When a held row becomes due; null for everything not waiting on a clock. */
  deliverAfter: string | null;
};

export async function notificationLog(sql: Sql, projectId: string, limit = 20): Promise<NotificationLog[]> {
  const rows = await sql<{
    id: string;
    channel: string;
    audience: string;
    kind: string;
    title: string;
    status: string;
    detail: string;
    created_at: unknown;
    sent_at: unknown;
    deliver_after: unknown;
  }>`
    select id, channel, audience, kind, title, status, detail, created_at, sent_at, deliver_after
    from portal_notification where project_id = ${projectId}
    order by created_at desc limit ${limit}
  `;

  return rows.map((r) => ({
    id: r.id,
    channel: r.channel as Channel,
    audience: r.audience,
    kind: r.kind,
    title: r.title,
    status: r.status,
    detail: r.detail,
    createdAt: iso(r.created_at),
    sentAt: iso(r.sent_at),
    deliverAfter: iso(r.deliver_after) || null,
  }));
}

function iso(value: unknown): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export type ClientDelivery = {
  id: string;
  channel: Channel;
  kind: string;
  title: string;
  status: string;
  detail: string;
  createdAt: string;
};

async function myDeliveries(sql: Sql, userId: string, limit: number): Promise<ClientDelivery[]> {
  // Reading their own log is one of the arrivals that runs the drain — a
  // client opening the profile fetches the mail their morning has released.
  await drainDue(sql);
  const rows = await sql<{
    id: string;
    channel: string;
    kind: string;
    title: string;
    status: string;
    detail: string;
    created_at: unknown;
  }>`
    select n.id, n.channel, n.kind, n.title, n.status, n.detail, n.created_at
    from portal_notification n
    join portal_projects p on p.id = n.project_id
    where p.user_id = ${userId} and n.audience = 'client'
    order by n.created_at desc
    limit ${limit}
  `;
  return rows.map((r) => ({
    id: r.id,
    channel: r.channel as Channel,
    kind: r.kind,
    title: r.title,
    status: r.status,
    detail: r.detail,
    createdAt: iso(r.created_at),
  }));
}

/**
 * The client's own log: every message aimed at them, including the ones
 * consent forbade. This is the profile's promise made checkable — the switches
 * say what may happen, and this says what did.
 */
export const listMyDeliveries = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => myDeliveries(await getSql(), context.userId, 12));

/**
 * Retry anything left failed — used by a staff action. deliver_after is set
 * to now so the next drain claims the rows: a pending row with no due time is
 * how a retry used to quietly go nowhere.
 */
export async function retryPending(sql: Sql, projectId: string): Promise<number> {
  const rows = await sql<{ id: string }>`
    update portal_notification set status = 'pending', deliver_after = now()
    where project_id = ${projectId} and status = 'failed'
    returning id
  `;
  return rows.length;
}