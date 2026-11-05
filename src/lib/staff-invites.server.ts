import { toE164 } from "./phone.ts";

type StaffInviteMessage = {
  email: string;
  invitedBy: string;
  note: string;
  inviteUrl: string;
};

function siteOrigin(): string {
  const configured = process.env.ATRO_SITE_URL ?? process.env.VITE_PUBLIC_HOSTNAME;
  const value = configured?.trim() || "https://atro.ke";
  const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error("ATRO_SITE_URL must use HTTPS outside localhost.");
  }
  return url.origin;
}

export function staffInviteUrl(): string {
  return new URL("/staff", siteOrigin()).toString();
}

export function staffInviteWhatsAppUrl(phone: string, message: string): string {
  const e164 = toE164(phone);
  if (!e164) throw new Error("Enter a valid phone number, including its country code.");
  const recipient = e164.slice(1);
  return `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendStaffInviteEmail(input: StaffInviteMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      sent: false as const,
      detail: "RESEND_API_KEY is not configured. You can resend this invitation through WhatsApp.",
    };
  }

  const from = process.env.RESEND_FROM ?? "ATRO <portal@atro.ke>";
  const safeNote = input.note ? `<p>${escapeHtml(input.note)}</p>` : "";
  const html = `<div style="font-family:Arial,sans-serif;color:#3C0508;max-width:560px">
  <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8a6a3a">ATRO · Staff access</p>
  <h1 style="font-size:24px">You are invited to ATRO's staff dashboard</h1>
  <p>${escapeHtml(input.invitedBy)} invited you to the staff workspace.</p>
  ${safeNote}
  <p>Open the staff dashboard, sign in with <strong>${escapeHtml(input.email)}</strong>, and accept the invitation. Access is granted only after you sign in with this invited email and accept.</p>
  <p><a href="${escapeHtml(input.inviteUrl)}" style="display:inline-block;background:#3C0508;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Open staff dashboard</a></p>
  <p style="font-size:12px;color:#666">If you were not expecting this invitation, you can ignore this email.</p>
</div>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.email,
        subject: "Invitation to the ATRO staff dashboard",
        text: [
          `${input.invitedBy} invited you to ATRO's staff workspace.`,
          input.note,
          `Open ${input.inviteUrl}, sign in with ${input.email}, and accept the invitation.`,
          "Access is granted only after you sign in with this invited email and accept.",
        ]
          .filter(Boolean)
          .join("\n\n"),
        html,
      }),
    });

    if (!response.ok) {
      return {
        sent: false as const,
        detail: `Resend rejected the invitation email (${response.status}): ${(await response.text()).slice(0, 200)}`,
      };
    }
    return { sent: true as const, detail: `Invitation email sent to ${input.email}.` };
  } catch (error) {
    return {
      sent: false as const,
      detail: `Could not send the invitation email: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
