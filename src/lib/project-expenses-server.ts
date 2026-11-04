import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { requireAdmin } from "@/lib/staff-session.server";

const CreateExpenseInput = z.object({
  projectId: z.string().uuid(),
  payee: z.string().trim().min(2).max(120),
  description: z.string().trim().min(3).max(240),
  amountKes: z.number().int().positive().max(1_000_000_000),
});

const ExpenseActionInput = z.object({ expenseId: z.string().uuid() });

const MarkPaidInput = z.object({
  expenseId: z.string().uuid(),
  bankReference: z.string().trim().min(3).max(100),
});

export type ProjectExpenseList = Awaited<ReturnType<typeof listProjectExpensesForStaff>>;

async function listProjectExpensesForStaff() {
  await requireAdmin("approve-project-expense");
  const sql = await getSql();
  const projects = await sql<{
    id: string;
    reference: string;
    title: string;
    client_label: string;
    received: number;
    reserved: number;
    spent: number;
  }>`
    select id, reference, title, client_label,
      paystack_received_kes as received,
      project_expenses_reserved_kes as reserved,
      project_expenses_paid_kes as spent
    from portal_projects
    where source <> 'sample' and deleted_at is null
    order by created_at desc
  `;
  const expenses = await sql<{
    id: string;
    project_id: string;
    reference: string;
    title: string;
    payee: string;
    description: string;
    amount_kes: number;
    requested_by: string;
    status: string;
    bank_reference: string | null;
    paid_by: string | null;
    created_at: unknown;
    approver_email: string | null;
    approval_decision: string | null;
  }>`
    select expense.id, expense.project_id, project.reference, project.title,
      expense.payee, expense.description, expense.amount_kes, expense.requested_by,
      expense.status, expense.bank_reference, expense.paid_by, expense.created_at,
      approval.approver_email, approval.decision as approval_decision
    from portal_project_expense expense
    join portal_projects project on project.id = expense.project_id
    left join portal_project_expense_approval approval on approval.expense_id = expense.id
    where project.source <> 'sample'
    order by expense.created_at desc
  `;
  return {
    projects: projects.map((project) => ({
      id: project.id,
      reference: project.reference,
      title: project.title,
      clientLabel: project.client_label,
      received: Number(project.received),
      reserved: Number(project.reserved),
      spent: Number(project.spent),
    })),
    expenses: expenses.map((expense) => ({
      id: expense.id,
      projectId: expense.project_id,
      projectReference: expense.reference,
      projectTitle: expense.title,
      payee: expense.payee,
      description: expense.description,
      amountKes: Number(expense.amount_kes),
      requestedBy: expense.requested_by,
      status: expense.status,
      bankReference: expense.bank_reference,
      paidBy: expense.paid_by,
      createdAt: expense.created_at instanceof Date
        ? expense.created_at.toISOString()
        : String(expense.created_at),
      approverEmail: expense.approver_email,
      approvalDecision: expense.approval_decision,
    })),
  };
}

export const listProjectExpenses = createServerFn({ method: "GET" }).handler(
  listProjectExpensesForStaff,
);

export const createProjectExpense = createServerFn({ method: "POST" })
  .validator(CreateExpenseInput)
  .handler(async ({ data }) => {
    const maker = await requireAdmin("record-project-expense");
    const sql = await getSql();
    const inserted = await sql<{ id: string }>`
      with reserve as (
        update portal_projects
        set project_expenses_reserved_kes = project_expenses_reserved_kes + ${data.amountKes},
            updated_at = now()
        where id = ${data.projectId}
          and source <> 'sample'
          and deleted_at is null
          and paystack_received_kes - project_expenses_reserved_kes - project_expenses_paid_kes
            >= ${data.amountKes}
        returning id
      )
      insert into portal_project_expense (
        project_id, payee, description, amount_kes, requested_by
      )
      select id, ${data.payee}, ${data.description}, ${data.amountKes}, ${maker.email}
      from reserve
      returning id
    `;
    if (!inserted[0]) {
      throw new Error("This project does not have enough verified Paystack funds available for that expense.");
    }
    return { id: inserted[0].id };
  });

export const approveProjectExpense = createServerFn({ method: "POST" })
  .validator(ExpenseActionInput)
  .handler(async ({ data }) => {
    const approver = await requireAdmin("approve-project-expense");
    const sql = await getSql();
    const updated = await sql<{ id: string }>`
      with eligible as (
        select id from portal_project_expense
        where id = ${data.expenseId} and status = 'pending_approval'
          and lower(requested_by) <> lower(${approver.email})
        for update
      ),
      approval as (
        insert into portal_project_expense_approval (expense_id, approver_email, decision)
        select id, ${approver.email}, 'approved' from eligible
        on conflict (expense_id, approver_email) do nothing
        returning expense_id
      )
      update portal_project_expense
      set status = 'approved', updated_at = now()
      where id in (select expense_id from approval)
        and status = 'pending_approval'
      returning id
    `;
    if (!updated[0]) {
      throw new Error("Expense not found, already reviewed, or you entered the expense.");
    }
    return { ok: true as const };
  });

export const rejectProjectExpense = createServerFn({ method: "POST" })
  .validator(ExpenseActionInput)
  .handler(async ({ data }) => {
    const approver = await requireAdmin("approve-project-expense");
    const sql = await getSql();
    const rejected = await sql<{ id: string; project_id: string; amount_kes: number }>`
      with rejected as (
        update portal_project_expense
        set status = 'rejected', updated_at = now()
        where id = ${data.expenseId} and status = 'pending_approval'
          and lower(requested_by) <> lower(${approver.email})
        returning id, project_id, amount_kes
      ),
      release as (
        update portal_projects project
        set project_expenses_reserved_kes =
          greatest(0, project.project_expenses_reserved_kes - rejected.amount_kes),
          updated_at = now()
        from rejected
        where project.id = rejected.project_id
        returning rejected.id
      ),
      approval as (
        insert into portal_project_expense_approval (expense_id, approver_email, decision)
        select rejected.id, ${approver.email}, 'rejected' from rejected
        on conflict (expense_id, approver_email) do nothing
        returning expense_id
      )
      select id from rejected
    `;
    if (!rejected[0]) {
      throw new Error("Expense not found, already reviewed, or you entered the expense.");
    }
    return { ok: true as const };
  });

export const markProjectExpensePaid = createServerFn({ method: "POST" })
  .validator(MarkPaidInput)
  .handler(async ({ data }) => {
    const staff = await requireAdmin("approve-project-expense");
    const sql = await getSql();
    const paid = await sql<{ id: string }>`
      with recorded as (
        update portal_project_expense
        set status = 'paid', bank_reference = ${data.bankReference},
            paid_by = ${staff.email}, paid_at = now(), updated_at = now()
        where id = ${data.expenseId} and status = 'approved'
        returning id, project_id, amount_kes
      ),
      totals as (
        update portal_projects project
        set project_expenses_reserved_kes =
              greatest(0, project.project_expenses_reserved_kes - recorded.amount_kes),
            project_expenses_paid_kes =
              project.project_expenses_paid_kes + recorded.amount_kes,
            updated_at = now()
        from recorded
        where project.id = recorded.project_id
        returning recorded.id
      )
      select id from totals
    `;
    if (!paid[0]) {
      throw new Error("Only an approved expense can be marked paid. Record the bank reference after the transfer.");
    }
    return { ok: true as const };
  });
