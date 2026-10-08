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

import { getSql, type Sql } from "@/lib/db";

export type Channel = "inapp" | "email" | "whatsapp" | "sms";

export type NotificationInput = {
  projectId: string;
  kind: string;
  title: string;
  body?: string;
  audience?: "client" | "studio";
  /** Channels to try. Defaults to inapp plus every configured transport. */
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
  return { configured: Boolean(key), reason: key ? "" : "AT_API_KEY not set" };
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
  const rows = await sql<{ email: string | null; name: string | null; client_phone: string }>`
    select u.email, u.name, p.client_phone
    from portal_projects p
    join "user" u on u.id = p.user_id
    where p.id = ${projectId} limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    email: row.email ?? null,
    // Stored as digits with a leading +; a diaspora client may have left it blank.
    phone: row.client_phone && /^\+\d{8,15}$/.test(row.client_phone) ? row.client_phone : null,
    name: row.name ?? "there",
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
      to: to.replace(/^\+/, ""),
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
      to: to.replace(/^\+/, ""),
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
  const body = input.body ?? "";
  const audience = input.audience ?? "client";
  // Default: the portal feed always, plus whichever transports have credentials.
  // A channel without credentials is not silently omitted — it is recorded as
  // skipped, so the delivery log shows the studio is not reaching that person yet.
  const wanted =
    input.channels ?? (Object.keys(CONFIG) as Channel[]).filter((c) => CONFIG[c]().configured);
  const recipient =
    audience === "studio" ? await resolveStudio(sql) : await resolveClient(sql, input.projectId);

  const projectRow = await sql<{ reference: string }>`
    select reference from portal_projects where id = ${input.projectId} limit 1
  `;
  const projectRef = projectRow[0]?.reference ?? "";

  for (const channel of wanted) {
    const config = CONFIG[channel]();
    const dedupe = input.dedupeKey && channel === wanted[0] ? input.dedupeKey : null;

    const rows = dedupe
      ? await sql.query<{ id: string }>(
          `insert into portal_notification
             (project_id, channel, audience, kind, title, body, status, detail, dedupe_key)
           values ($1, $2, $3, $4, $5, $6,
                   case when $7 then 'pending' else 'skipped' end, $8, $9)
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
            config.configured,
            config.configured ? "" : config.reason,
            dedupe,
          ],
        )
      : await sql<{ id: string }>`
          insert into portal_notification
            (project_id, channel, audience, kind, title, body, status, detail)
          values (${input.projectId}, ${channel}, ${audience}, ${input.kind},
                  ${input.title}, ${body},
                  ${config.configured ? "pending" : "skipped"},
                  ${config.configured ? "" : config.reason})
          returning id
        `;

    const id = rows[0]?.id;
    // Already handled for this dedupe key — the unique index refused the row,
    // so this message was sent before and must not be sent twice.
    if (dedupe && !id) return { created: false, channels: [] };
    if (!id) continue;
    if (!config.configured) continue;

    // inapp needs no transport — the portal feed is the delivery.
    if (channel === "inapp") continue;

    const target = channel === "email" ? recipient?.email : recipient?.phone;
    if (!target) {
      await sql`
        update portal_notification set status = 'skipped', detail = 'no contact on file'
        where id = ${id}
      `;
      continue;
    }

    const result =
      channel === "email"
        ? await sendEmail(target, input.title, body, projectRef, input.documentUrl)
        : channel === "whatsapp"
          ? await sendWhatsApp(
              target,
              input.title,
              body,
              TEMPLATE_FOR[input.kind] ?? TEMPLATE_FOR.update,
            )
          : await sendSms(target, input.title, body);

    await sql`
      update portal_notification
      set status = ${result.ok ? "sent" : "failed"}, attempts = attempts + 1,
          detail = ${result.detail}, sent_at = case when ${result.ok} then now() else sent_at end
      where id = ${id}
    `;
  }

  return { created: true, channels: wanted };
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
  }>`
    select id, channel, audience, kind, title, status, detail, created_at, sent_at
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
  }));
}

function iso(value: unknown): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/** Retry anything left pending or failed — used by a staff action. */
export async function retryPending(sql: Sql, projectId: string): Promise<number> {
  const rows = await sql<{ id: string }>`
    update portal_notification set status = 'pending'
    where project_id = ${projectId} and status = 'failed'
    returning id
  `;
  return rows.length;
}