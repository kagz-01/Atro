import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import {
  approveProjectExpense,
  createProjectExpense,
  listProjectExpenses,
  markProjectExpensePaid,
  rejectProjectExpense,
} from "@/lib/project-expenses-server";

const KES = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });
const kes = (value: number) => `KES ${KES.format(value)}`;

type Props = { staffEmail: string };

export function ProjectExpensesPanel({ staffEmail }: Props) {
  const query = useQuery({
    queryKey: ["project-expenses"],
    queryFn: () => listProjectExpenses({ data: undefined }),
  });
  const [projectId, setProjectId] = useState("");
  const [payee, setPayee] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [bankReferences, setBankReferences] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");

  const projects = query.data?.projects ?? [];
  const expenses = query.data?.expenses ?? [];
  const selectedProject = projects.find((project) => project.id === projectId);

  async function run(key: string, action: () => Promise<unknown>, message: string) {
    setBusy(key);
    try {
      await action();
      await query.refetch();
      toast.success(message);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The expense action failed.");
      return false;
    } finally {
      setBusy("");
    }
  }

  async function submitExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amountKes = Number(amount);
    if (!Number.isSafeInteger(amountKes) || amountKes <= 0) {
      toast.error("Enter a whole-shilling amount greater than zero.");
      return;
    }
    const saved = await run(
      "create",
      () =>
        createProjectExpense({
          data: { projectId, payee, description, amountKes },
        }),
      "Expense submitted and project funds reserved.",
    );
    if (saved) {
      setPayee("");
      setDescription("");
      setAmount("");
    }
  }

  if (query.isLoading) {
    return <p className="py-10 text-center text-sm text-muted">Loading project accounts…</p>;
  }
  if (query.error) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
        {query.error.message}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Project funds"
        subtitle="Verified client receipts stay allocated to their project"
      >
        <p className="text-[13px] leading-relaxed text-ink/70">
          Only Paystack-confirmed receipts are available for project expenses. Entering an expense
          reserves that amount against this project; a different admin must approve it before it can
          be marked paid. This records manual bank transfers and does not send money from Paystack.
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-ink/55">
          Paystack settles to ATRO’s configured bank account. These project allocations are an
          internal ledger, not separate bank accounts or escrow.
        </p>
        {projects.length === 0 ? (
          <p className="mt-5 rounded-xl border border-ink/10 bg-cream p-4 text-[13px] text-ink/60">
            No eligible projects are available. Protected project records cannot receive or spend
            real funds.
          </p>
        ) : (
          <form onSubmit={(event) => void submitExpense(event)} className="mt-5 space-y-4">
            <div>
              <Label htmlFor="expense-project">Project</Label>
              <Select
                id="expense-project"
                required
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
              >
                <option value="">Choose a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.reference} · {project.title}
                  </option>
                ))}
              </Select>
              {selectedProject ? (
                <p className="mt-2 text-[12px] text-ink/60">
                  Verified receipts {kes(selectedProject.received)} · Available to allocate{" "}
                  <strong className="text-maroon">
                    {kes(
                      selectedProject.received - selectedProject.reserved - selectedProject.spent,
                    )}
                  </strong>
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="expense-payee">Payee</Label>
                <Input
                  id="expense-payee"
                  required
                  minLength={2}
                  maxLength={120}
                  value={payee}
                  onChange={(event) => setPayee(event.target.value)}
                  placeholder="Supplier or contractor"
                />
              </div>
              <div>
                <Label htmlFor="expense-amount">Amount (KES)</Label>
                <Input
                  id="expense-amount"
                  required
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="expense-description">What is this payment for?</Label>
              <Input
                id="expense-description"
                required
                minLength={3}
                maxLength={240}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Materials for the ground-floor slab"
              />
            </div>
            <Button
              type="submit"
              disabled={
                busy === "create" ||
                !projectId ||
                Number(amount) >
                  (selectedProject
                    ? selectedProject.received - selectedProject.reserved - selectedProject.spent
                    : 0)
              }
            >
              {busy === "create" ? "Submitting…" : "Submit for independent approval"}
            </Button>
          </form>
        )}
      </Panel>

      <Panel title="Expense approvals" subtitle="A maker-checker record for manual bank payments">
        {expenses.length === 0 ? (
          <p className="text-sm text-ink/60">No project expenses have been recorded.</p>
        ) : (
          <ul className="space-y-3">
            {expenses.map((expense) => {
              const isMaker = expense.requestedBy.toLowerCase() === staffEmail.toLowerCase();
              const key = expense.id;
              return (
                <li key={expense.id} className="rounded-2xl border border-ink/10 bg-paper p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold">
                        {expense.projectReference} · {expense.projectTitle}
                      </p>
                      <h3 className="mt-1 font-display text-lg text-maroon">{expense.payee}</h3>
                      <p className="mt-1 text-[13px] text-ink/70">{expense.description}</p>
                      <p className="mt-2 text-[11px] text-muted">
                        Entered by {expense.requestedBy} ·{" "}
                        {new Date(expense.createdAt).toLocaleDateString("en-KE")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl text-maroon">{kes(expense.amountKes)}</p>
                      <Badge
                        tone={
                          expense.status === "paid"
                            ? "live"
                            : expense.status === "rejected"
                              ? "stone"
                              : "gold"
                        }
                      >
                        {expense.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  {expense.approverEmail ? (
                    <p className="mt-3 text-[11px] text-ink/55">
                      {expense.approvalDecision === "approved" ? "Approved" : "Declined"} by{" "}
                      {expense.approverEmail}
                    </p>
                  ) : null}
                  {expense.status === "pending_approval" ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={busy === key || isMaker}
                        onClick={() =>
                          void run(
                            key,
                            () => approveProjectExpense({ data: { expenseId: expense.id } }),
                            "Expense approved. Record the bank transfer after it is made.",
                          )
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy === key || isMaker}
                        onClick={() =>
                          void run(
                            key,
                            () => rejectProjectExpense({ data: { expenseId: expense.id } }),
                            "Expense rejected and its project allocation released.",
                          )
                        }
                      >
                        Reject
                      </Button>
                      {isMaker ? (
                        <span className="self-center text-[11px] text-muted">
                          You entered this expense and cannot approve it.
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  {expense.status === "approved" ? (
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      <div className="min-w-56 flex-1">
                        <Label htmlFor={`bank-reference-${expense.id}`}>
                          Bank transfer reference
                        </Label>
                        <Input
                          id={`bank-reference-${expense.id}`}
                          required
                          minLength={3}
                          maxLength={100}
                          value={bankReferences[expense.id] ?? ""}
                          onChange={(event) =>
                            setBankReferences((current) => ({
                              ...current,
                              [expense.id]: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <Button
                        size="sm"
                        disabled={
                          busy === key || (bankReferences[expense.id] ?? "").trim().length < 3
                        }
                        onClick={() =>
                          void run(
                            key,
                            () =>
                              markProjectExpensePaid({
                                data: {
                                  expenseId: expense.id,
                                  bankReference: bankReferences[expense.id].trim(),
                                },
                              }),
                            "Bank transfer recorded against the project.",
                          )
                        }
                      >
                        Record as paid
                      </Button>
                    </div>
                  ) : null}
                  {expense.status === "paid" ? (
                    <p className="mt-3 text-[11px] text-ink/55">
                      Bank reference {expense.bankReference} · Recorded by {expense.paidBy}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
