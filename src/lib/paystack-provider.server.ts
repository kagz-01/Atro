import { randomUUID } from "node:crypto";
import { issueReceiptFor } from "@/lib/invoice-server";
import { getSql, type Sql } from "@/lib/db";
import { logActivity } from "@/lib/diaspora/server";
import { paystackAmountSubunits, verifyPaystackSignature } from "@/lib/paystack";
import { notify } from "@/lib/notify";

type CheckoutInput = {
  projectId: string;
  paymentId: string;
  experience: "local" | "diaspora";
};

type PaystackEnvelope = {
  status?: unknown;
  data?: unknown;
};

type VerifiedCharge = {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  id?: string | number;
  channel?: string;
  paid_at?: string | null;
  customer?: { email?: string | null };
};

type PaymentAttempt = {
  reference: string;
  project_id: string;
  payment_id: string;
  initiated_by: string;
  customer_email: string;
  amount_kes: number;
  status: string;
};

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) throw new Error("Paystack is not configured. Ask ATRO to complete payment setup.");
  return key;
}

function siteOrigin(): string {
  const value = process.env.ATRO_SITE_URL?.trim();
  if (!value) throw new Error("ATRO_SITE_URL must be configured before accepting payments.");
  const url = new URL(value);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("ATRO_SITE_URL must use HTTPS in production.");
  }
  return url.origin;
}

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    signal: AbortSignal.timeout(15_000),
  });
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("Paystack returned an unreadable response. No payment was recorded.");
  }
  if (
    !response.ok ||
    !body ||
    typeof body !== "object" ||
    (body as PaystackEnvelope).status !== true
  ) {
    throw new Error("Paystack could not complete the request. Please try again or contact ATRO.");
  }
  return body as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseVerifiedCharge(envelope: unknown): VerifiedCharge {
  if (!isRecord(envelope) || !isRecord(envelope.data)) {
    throw new Error("Paystack returned incomplete verification details.");
  }
  const data = envelope.data;
  if (
    typeof data.reference !== "string" ||
    typeof data.status !== "string" ||
    typeof data.amount !== "number" ||
    !Number.isSafeInteger(data.amount) ||
    typeof data.currency !== "string"
  ) {
    throw new Error("Paystack returned invalid verification details.");
  }
  const customer = isRecord(data.customer) ? data.customer : undefined;
  return {
    reference: data.reference,
    status: data.status,
    amount: data.amount,
    currency: data.currency,
    id: typeof data.id === "string" || typeof data.id === "number" ? data.id : undefined,
    channel: typeof data.channel === "string" ? data.channel : undefined,
    paid_at: typeof data.paid_at === "string" ? data.paid_at : null,
    customer: customer
      ? { email: typeof customer.email === "string" ? customer.email : null }
      : undefined,
  };
}

function paidDateLabel(value: string | null | undefined): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    throw new Error("Paystack returned an invalid payment date.");
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(date);
}

async function getAttempt(sql: Sql, reference: string): Promise<PaymentAttempt | null> {
  const rows = await sql<PaymentAttempt>`
    select reference, project_id, payment_id, initiated_by, customer_email,
      amount_kes, status
    from portal_paystack_attempt where reference = ${reference} limit 1
  `;
  return rows[0] ?? null;
}

export async function beginPaystackCheckout(
  sql: Sql,
  userId: string,
  email: string,
  emailVerified: boolean,
  input: CheckoutInput,
): Promise<{ authorizationUrl: string; reference: string }> {
  const customerEmail = email.trim().toLowerCase();
  if (!emailVerified || !customerEmail) {
    throw new Error("Verify your email address before paying online.");
  }

  const rows = await sql<{
    id: string;
    project_id: string;
    amount: number;
    status: string;
    label: string;
    certificate: string | null;
    source: string;
    user_id: string;
  }>`
    select payment.id, payment.project_id, payment.amount, payment.status,
      payment.label, payment.certificate, project.source, project.user_id
    from portal_payments payment
    join portal_projects project on project.id = payment.project_id
    where payment.id = ${input.paymentId}
      and payment.project_id = ${input.projectId}
      and project.user_id = ${userId}
      and project.deleted_at is null
    limit 1
  `;
  const payment = rows[0];
  if (!payment || payment.source === "sample") throw new Error("Project not found.");
  if (payment.status !== "certified") {
    throw new Error("This project payment stage is not yet approved for payment.");
  }
  const amount = Number(payment.amount);
  const subunits = paystackAmountSubunits(amount);

  const pending = await sql<{ reference: string; authorization_url: string | null }>`
    select reference, authorization_url from portal_paystack_attempt
    where project_id = ${input.projectId} and payment_id = ${input.paymentId}
      and status = 'pending' order by created_at desc limit 1
  `;
  if (pending[0]) {
    if (pending[0].authorization_url) {
      return {
        authorizationUrl: pending[0].authorization_url,
        reference: pending[0].reference,
      };
    }
    throw new Error("A checkout is already being prepared. Please wait a moment and retry.");
  }

  const reference = `ATRO-${randomUUID().replace(/-/g, "")}`;
  await sql`
    insert into portal_paystack_attempt (
      reference, project_id, payment_id, initiated_by, customer_email, amount_kes
    ) values (
      ${reference}, ${input.projectId}, ${input.paymentId}, ${userId},
      ${customerEmail}, ${amount}
    )
  `;

  try {
    const envelope = await paystackRequest<PaystackEnvelope>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: customerEmail,
        amount: subunits,
        currency: "KES",
        reference,
        callback_url: `${siteOrigin()}/payment/callback?experience=${input.experience}`,
        metadata: {
          atro_project_id: input.projectId,
          atro_payment_id: input.paymentId,
          project_reference: input.projectId,
          installment: payment.label,
          stage_reference: payment.certificate ?? "",
        },
      }),
    });
    const data = envelope.data;
    const authorizationUrl = isRecord(data) ? data.authorization_url : null;
    let checkoutUrl: URL | null = null;
    if (typeof authorizationUrl === "string") {
      try {
        checkoutUrl = new URL(authorizationUrl);
      } catch {
        checkoutUrl = null;
      }
    }
    if (
      !checkoutUrl ||
      checkoutUrl.protocol !== "https:" ||
      checkoutUrl.hostname !== "checkout.paystack.com"
    ) {
      throw new Error("Paystack returned an invalid checkout address.");
    }
    await sql`
      update portal_paystack_attempt
      set authorization_url = ${authorizationUrl}, updated_at = now()
      where reference = ${reference} and status = 'pending'
    `;
    return { authorizationUrl: checkoutUrl.toString(), reference };
  } catch (error) {
    await sql`
      update portal_paystack_attempt set status = 'failed', updated_at = now()
      where reference = ${reference} and status = 'pending'
    `;
    throw error;
  }
}

async function verifyCharge(reference: string): Promise<VerifiedCharge> {
  const envelope = await paystackRequest<PaystackEnvelope>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
  return parseVerifiedCharge(envelope);
}

async function settleVerifiedCharge(
  sql: Sql,
  attempt: PaymentAttempt,
  charge: VerifiedCharge,
): Promise<{ status: "success" | "pending" | "failed"; receiptNumber?: string }> {
  if (charge.reference !== attempt.reference) {
    throw new Error("The verified Paystack reference did not match this payment.");
  }
  if (charge.status !== "success") {
    if (charge.status === "failed" || charge.status === "abandoned") {
      await sql`
        update portal_paystack_attempt set status = 'failed', updated_at = now()
        where reference = ${attempt.reference} and status = 'pending'
      `;
      return { status: "failed" };
    }
    return { status: "pending" };
  }

  if (
    charge.currency !== "KES" ||
    charge.amount !== paystackAmountSubunits(Number(attempt.amount_kes))
  ) {
    throw new Error("The verified payment amount or currency does not match the project invoice.");
  }
  if (
    charge.customer?.email &&
    charge.customer.email.trim().toLowerCase() !== attempt.customer_email.toLowerCase()
  ) {
    throw new Error("The verified payment email does not match the checkout.");
  }

  const payment = await sql<{
    label: string;
    amount: number;
    status: string;
    certificate: string | null;
    paid_date: string | null;
    gateway_reference: string | null;
  }>`
    select label, amount, status, certificate, paid_date, gateway_reference
    from portal_payments
    where id = ${attempt.payment_id} and project_id = ${attempt.project_id}
    limit 1
  `;
  const current = payment[0];
  if (!current) throw new Error("The project payment no longer exists.");
  if (Number(current.amount) !== Number(attempt.amount_kes)) {
    throw new Error("The certified project amount has changed; ask ATRO to reconcile this payment.");
  }

  let newlyPaid = false;
  if (current.status === "certified") {
    const settled = await sql<{
      payment_id: string;
      amount: number;
    }>`
      with paid as (
        update portal_payments
        set status = 'paid', paid_date = ${paidDateLabel(charge.paid_at)}, method = 'Paystack',
            gateway_reference = ${attempt.reference}
        where id = ${attempt.payment_id} and project_id = ${attempt.project_id}
          and status = 'certified' and amount = ${attempt.amount_kes}
        returning id, project_id, amount
      ),
      ledger as (
        update portal_projects project
        set paid_to_date = project.paid_to_date + paid.amount,
            currently_certified = greatest(0, project.currently_certified - paid.amount),
            paystack_received_kes = project.paystack_received_kes + paid.amount,
            updated_at = now()
        from paid
        where project.id = paid.project_id
        returning paid.id, paid.amount
      )
      select id as payment_id, amount from ledger
    `;
    newlyPaid = settled.length > 0;
  } else if (current.status === "paid" && current.gateway_reference !== attempt.reference) {
    throw new Error("This instalment is already recorded as paid. Contact ATRO before trying another payment.");
  } else if (current.status !== "paid") {
    throw new Error("This project payment is no longer certified and cannot be settled.");
  }

  await sql`
    update portal_paystack_attempt
    set status = 'success', provider_transaction_id = ${charge.id === undefined ? null : String(charge.id)},
        payment_channel = ${charge.channel ?? null},
        paid_at = ${charge.paid_at ?? null}, updated_at = now()
    where reference = ${attempt.reference}
      and status in ('pending', 'failed', 'expired', 'success')
  `;

  if (newlyPaid) {
    await logActivity(
      sql,
      attempt.project_id,
      "payment",
      `Payment received: ${current.label}`,
      `KES ${Number(attempt.amount_kes).toLocaleString("en-KE")} received through Paystack.`,
    );
  }

  const receipt = await issueReceiptFor(sql, {
    projectId: attempt.project_id,
    paymentId: attempt.payment_id,
    label: current.label,
    certificate: current.certificate ?? "certificate on file",
    amount: Number(attempt.amount_kes),
  });

  if (newlyPaid) {
    await notify({
      projectId: attempt.project_id,
      kind: "payment",
      title: `Payment received: ${current.label}`,
      body: `KES ${Number(attempt.amount_kes).toLocaleString("en-KE")} received through Paystack. Your receipt is ready.`,
      documentUrl: receipt ? `/portal/document/${receipt.id}` : undefined,
    });
    await notify({
      projectId: attempt.project_id,
      kind: "payment",
      title: `Client payment received: ${current.label}`,
      body: `KES ${Number(attempt.amount_kes).toLocaleString("en-KE")} verified through Paystack.`,
      audience: "studio",
    });
  }

  return { status: "success", receiptNumber: receipt?.number };
}

export async function verifyPaystackPaymentForUser(
  sql: Sql,
  userId: string,
  reference: string,
): Promise<{ status: "success" | "pending" | "failed"; receiptNumber?: string }> {
  const attempt = await getAttempt(sql, reference);
  if (!attempt || attempt.initiated_by !== userId) {
    throw new Error("Payment reference not found.");
  }
  const charge = await verifyCharge(reference);
  return settleVerifiedCharge(sql, attempt, charge);
}

export async function handlePaystackWebhook(request: Request): Promise<void> {
  const rawBody = new Uint8Array(await request.arrayBuffer());
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET?.trim() ?? "";
  const legacySecret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!webhookSecret && !legacySecret) {
    throw new Error("Paystack webhook verification is not configured.");
  }
  if (
    !verifyPaystackSignature(
      rawBody,
      request.headers,
      webhookSecret,
      legacySecret,
    )
  ) {
    throw new Error("Invalid Paystack webhook signature.");
  }

  let event: unknown;
  try {
    event = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    throw new Error("Invalid Paystack webhook JSON.");
  }
  if (!isRecord(event) || typeof event.event !== "string" || !isRecord(event.data)) {
    throw new Error("Invalid Paystack webhook event.");
  }
  const reference = event.data.reference;
  if (typeof reference !== "string") return;

  const sql = await getSql();
  const attempt = await getAttempt(sql, reference);
  if (!attempt) return;

  if (event.event === "charge.failed") {
    await sql`
      update portal_paystack_attempt set status = 'failed', updated_at = now()
      where reference = ${reference} and status = 'pending'
    `;
    return;
  }
  if (event.event !== "charge.success") return;

  const charge = await verifyCharge(reference);
  await settleVerifiedCharge(sql, attempt, charge);
}
