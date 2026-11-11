import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { getStudioPayments, type StudioPaymentRow } from "@/lib/ops";

const money = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });
const kes = (value: number) => `KES ${money.format(value)}`;

const paymentLabels: Record<string, string> = {
  paid: "Paid",
  certified: "Ready for payment",
  due: "Awaiting confirmation",
  scheduled: "Scheduled",
  retained: "Retention held",
};
const EMPTY_ROWS: StudioPaymentRow[] = [];

function dateLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Africa/Nairobi",
      });
}

function dateTimeLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-KE", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Nairobi",
      });
}

function checkoutLabel(row: StudioPaymentRow): string | null {
  if (row.status === "paid") return null;
  if (row.attemptStatus === "pending") return "Checkout started · not yet confirmed";
  if (row.attemptStatus === "failed" || row.attemptStatus === "expired") {
    return "Attempt not completed · amount still due";
  }
  return null;
}

export function StudioPaymentsPanel({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  const query = useQuery({
    queryKey: ["studio-payments"],
    queryFn: () => getStudioPayments({ data: undefined }),
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const rows = query.data ?? EMPTY_ROWS;
  const projects = useMemo(() => {
    const groups = new Map<string, { first: StudioPaymentRow; payments: StudioPaymentRow[] }>();
    for (const row of rows) {
      const group = groups.get(row.projectId);
      if (group) group.payments.push(row);
      else groups.set(row.projectId, { first: row, payments: [row] });
    }

    const needle = search.trim().toLocaleLowerCase();
    return [...groups.values()]
      .map((group) => ({
        ...group,
        payments: group.payments.filter((payment) => {
          const matchesStatus =
            status === "all" ||
            (status === "checkout-issue"
              ? payment.status !== "paid" &&
                (payment.attemptStatus === "failed" || payment.attemptStatus === "expired")
              : payment.status === status);
          const matchesSearch =
            !needle ||
            [
              payment.clientLabel,
              payment.projectReference,
              payment.projectTitle,
              payment.paymentLabel,
              payment.attemptReference ?? "",
              ...payment.attemptHistory.map((attempt) => attempt.reference),
            ]
              .join(" ")
              .toLocaleLowerCase()
              .includes(needle);
          return matchesStatus && matchesSearch;
        }),
      }))
      .filter((group) => group.payments.length > 0);
  }, [rows, search, status]);

  const projectTotals = new Map<string, StudioPaymentRow>();
  for (const row of rows) projectTotals.set(row.projectId, row);
  const awaitingCount = rows.filter((row) => row.status === "certified").length;
  const checkoutFollowupCount = rows.filter(
    (row) =>
      row.status !== "paid" &&
      (row.attemptStatus === "pending" ||
        row.attemptStatus === "failed" ||
        row.attemptStatus === "expired"),
  ).length;

  if (query.isPending) {
    return <p className="py-12 text-center text-sm text-muted">Loading project payment ledgers…</p>;
  }
  if (query.error) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900"
      >
        <p>Could not load payment ledgers.</p>
        <p className="mt-1 text-red-800">
          {query.error instanceof Error
            ? query.error.message
            : "The payment register is unavailable."}
        </p>
        <Button className="mt-4" size="sm" variant="outline" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Client payment ledgers"
        subtitle="Each project stays separate; only recorded payments appear as paid."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw className="size-4" aria-hidden />
            {query.isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-ink/8 bg-cream/50 p-4">
            <p className="text-[11px] text-muted">Active project ledgers</p>
            <p className="mt-1 text-lg font-medium text-maroon">{projectTotals.size}</p>
            <p className="mt-1 text-[11px] text-ink/55">Client balances remain separate</p>
          </div>
          <div className="rounded-xl border border-ink/8 bg-cream/50 p-4">
            <p className="text-[11px] text-muted">Certified stages awaiting payment</p>
            <p className="mt-1 text-lg font-medium text-maroon">{awaitingCount}</p>
            <p className="mt-1 text-[11px] text-ink/55">
              Each amount is shown in its project ledger
            </p>
          </div>
          <div className="rounded-xl border border-ink/8 bg-cream/50 p-4">
            <p className="text-[11px] text-muted">Checkout attempts needing attention</p>
            <p className="mt-1 text-lg font-medium text-maroon">{checkoutFollowupCount}</p>
            <p className="mt-1 text-[11px] text-ink/55">Started does not mean payment received</p>
          </div>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-ink/60">
          Paystack checkout attempts are not proof of payment. The ledger changes to paid only after
          the provider confirms the transaction; bank payments must be recorded separately through
          the studio’s reconciliation process.
        </p>
      </Panel>

      <Panel
        title="Find a client or payment"
        subtitle="Search by client, project, stage, or Paystack reference"
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <div>
            <Label htmlFor="studio-payment-search">Client, project, or reference</Label>
            <Input
              id="studio-payment-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, project number, or checkout reference"
            />
          </div>
          <div>
            <Label htmlFor="studio-payment-status">Payment status</Label>
            <Select
              id="studio-payment-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All payments</option>
              <option value="paid">Paid</option>
              <option value="certified">Ready for payment</option>
              <option value="due">Awaiting stage confirmation</option>
              <option value="scheduled">Scheduled</option>
              <option value="retained">Retention held</option>
              <option value="checkout-issue">Failed/expired checkout</option>
            </Select>
          </div>
        </div>
      </Panel>

      {projects.length === 0 ? (
        <Panel title="No matching payments">
          <p className="text-sm text-ink/60">
            {rows.length === 0
              ? "No active client payment stages have been recorded yet."
              : "Try a different search or payment status."}
          </p>
        </Panel>
      ) : (
        <div className="space-y-4">
          {projects.map(({ first, payments }) => (
            <Panel
              key={first.projectId}
              title={first.projectTitle}
              subtitle={`${first.clientLabel} · ${first.projectReference}`}
              actions={
                <Button size="sm" variant="outline" onClick={() => onOpenProject(first.projectId)}>
                  Open project <ArrowUpRight className="size-4" aria-hidden />
                </Button>
              }
            >
              <dl className="mb-4 grid grid-cols-2 gap-3 border-b border-ink/8 pb-4 sm:grid-cols-4">
                {[
                  ["Contract", first.contractValue],
                  ["Paid to date", first.paidToDate],
                  ["Awaiting payment", first.currentlyCertified],
                  ["Stages shown", payments.length],
                ].map(([label, amount]) => (
                  <div key={String(label)}>
                    <dt className="text-[11px] text-muted">{label}</dt>
                    <dd className="mt-1 text-[13px] font-medium text-maroon">
                      {label === "Stages shown" ? amount : kes(Number(amount))}
                    </dd>
                  </div>
                ))}
              </dl>
              <ul className="divide-y divide-ink/8">
                {payments.map((payment) => {
                  const attemptMessage = checkoutLabel(payment);
                  return (
                    <li
                      key={payment.paymentId}
                      className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1.4fr)_auto_minmax(0,1fr)] sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-maroon">
                          {payment.paymentLabel}
                        </p>
                        {payment.certificate ? (
                          <p className="mt-0.5 font-mono text-[11px] text-muted">
                            Certificate/stage reference {payment.certificate}
                          </p>
                        ) : null}
                        {payment.status === "paid" ? (
                          <p className="mt-1 text-[11px] text-ink/55">
                            Paid: {dateLabel(payment.paidDate) ?? "date not recorded"}
                          </p>
                        ) : payment.dueDate ? (
                          <p className="mt-1 text-[11px] text-ink/55">
                            Due: {dateLabel(payment.dueDate) ?? payment.dueDate}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <span className="text-[13px] font-medium text-maroon">
                          {kes(payment.amount)}
                        </span>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                            payment.status === "paid"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : payment.status === "certified"
                                ? "border-amber-300 bg-amber-50 text-amber-900"
                                : "border-ink/10 bg-cream text-ink/70"
                          }`}
                        >
                          {paymentLabels[payment.status] ?? payment.status}
                        </span>
                      </div>
                      <div className="min-w-0 text-[11px] text-ink/55">
                        {attemptMessage ? (
                          <p
                            className={
                              payment.attemptStatus === "pending"
                                ? "text-amber-900"
                                : "text-red-800"
                            }
                          >
                            {attemptMessage}
                          </p>
                        ) : payment.status === "paid" && payment.method ? (
                          <p>Method: {payment.method}</p>
                        ) : (
                          <p>No checkout attempt recorded</p>
                        )}
                        {payment.attemptReference ? (
                          <p className="mt-1 break-all font-mono">
                            Paystack ref: {payment.attemptReference}
                            {payment.attemptChannel ? ` · ${payment.attemptChannel}` : ""}
                            {payment.attemptCreatedAt
                              ? ` · ${dateLabel(payment.attemptCreatedAt)}`
                              : ""}
                          </p>
                        ) : null}
                        {payment.attemptHistory.length > 0 ? (
                          <details className="mt-2 rounded-lg border border-ink/8 bg-cream/40 px-3 py-2">
                              <summary className="cursor-pointer font-medium text-maroon">
                                Full checkout history ({payment.attemptHistory.length})
                              </summary>
                              <ol className="mt-2 space-y-3">
                                {payment.attemptHistory.map((attempt) => (
                                  <li
                                    key={attempt.reference}
                                    className="border-t border-ink/8 pt-2"
                                  >
                                    <p className="font-medium text-ink/75">
                                      {attempt.status === "success"
                                        ? "Payment verified"
                                        : attempt.status === "pending"
                                          ? "Checkout started · awaiting confirmation"
                                          : `Checkout ${attempt.status}`}
                                      {" · "}
                                      {kes(attempt.amount)}
                                    </p>
                                    <p className="mt-0.5">
                                      Started {dateTimeLabel(attempt.createdAt)}
                                      {attempt.paidAt
                                        ? ` · Paid ${dateTimeLabel(attempt.paidAt)}`
                                        : ""}
                                      {attempt.channel ? ` · ${attempt.channel}` : ""}
                                    </p>
                                    <p className="mt-0.5 break-all font-mono">
                                      Ref: {attempt.reference}
                                      {attempt.providerTransactionId
                                        ? ` · Transaction ${attempt.providerTransactionId}`
                                        : ""}
                                    </p>
                                  </li>
                                ))}
                              </ol>
                          </details>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
