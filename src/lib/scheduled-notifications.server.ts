import type { Sql } from "@/lib/db";

const NAIROBI_DUE_CONDITION = `
  f.due_date <= (now() at time zone 'Africa/Nairobi')::date
  and (now() at time zone 'Africa/Nairobi')::time >= time '08:00'
`;

export type ScheduledNotificationResult = {
  outboundNotificationsAttempted: number;
  followUpRemindersQueued: number;
  followUpRemindersAttempted: number;
  followUpRemindersSent: number;
  followUpRemindersFailed: number;
  followUpRemindersSkipped: number;
};

type ClaimedReminder = {
  id: string;
  follow_up_id: string;
  due_date: string;
  assigned_to: string;
  title: string;
  project_title: string | null;
  reference: string | null;
};

type ReminderEmailInput = {
  to: string;
  title: string;
  dueDate: string;
  projectTitle: string;
  reference: string;
  idempotencyKey: string;
};

type ScheduledDelivery = {
  drainDue(sql: Sql): Promise<number>;
  sendStaffFollowUpReminder(
    input: ReminderEmailInput,
  ): Promise<{ status: "sent" | "failed" | "skipped"; detail: string }>;
};

export async function runScheduledNotifications(
  sql: Sql,
  delivery?: ScheduledDelivery,
): Promise<ScheduledNotificationResult> {
  const { drainDue, sendStaffFollowUpReminder } =
    delivery ?? (await import("@/lib/notify"));
  const outboundNotificationsAttempted = await drainDue(sql);

  const queued = await sql.query<{ id: string }>(
    `insert into staff_follow_up_reminder (follow_up_id, due_date)
     select f.id, f.due_date
     from staff_follow_up f
     where f.completed_at is null and ${NAIROBI_DUE_CONDITION}
     on conflict (follow_up_id, due_date) do nothing
     returning id`,
  );

  await sql.query(
    `update staff_follow_up_reminder r
     set status = 'cancelled',
         detail = 'Follow-up completed before delivery',
         claim_expires_at = null
     from staff_follow_up f
     where r.follow_up_id = f.id
       and r.due_date = f.due_date
       and f.completed_at is not null
       and r.status in ('pending', 'failed')`,
  );

  const claimed = await sql.query<ClaimedReminder>(
    `with claimable as (
      select r.id, r.follow_up_id
       from staff_follow_up_reminder r
       join staff_follow_up f on f.id = r.follow_up_id and f.due_date = r.due_date
       where f.completed_at is null
         and ${NAIROBI_DUE_CONDITION}
         and (
           (r.status in ('pending', 'failed') and r.next_attempt_at <= now())
           or (r.status = 'sending' and r.claim_expires_at <= now())
         )
       order by r.next_attempt_at asc, r.created_at asc
       for update of r skip locked
       limit 25
     )
     update staff_follow_up_reminder r
     set status = 'sending',
         attempts = r.attempts + 1,
         claim_expires_at = now() + interval '15 minutes'
     from claimable c
     join staff_follow_up f on f.id = c.follow_up_id
     left join portal_projects p on p.id = f.project_id
     where r.id = c.id
     returning r.id, r.follow_up_id, r.due_date, f.assigned_to, f.title,
       p.title as project_title, p.reference`,
  );

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  for (const reminder of claimed) {
    try {
      const result = await sendStaffFollowUpReminder({
        to: reminder.assigned_to,
        title: reminder.title,
        dueDate: String(reminder.due_date).slice(0, 10),
        projectTitle: reminder.project_title ?? "",
        reference: reminder.reference ?? "",
        idempotencyKey: `staff-follow-up-${reminder.follow_up_id}-${String(reminder.due_date).slice(0, 10)}`,
      });

      if (result.status === "sent") {
        await sql`
          update staff_follow_up_reminder
          set status = 'sent', detail = ${result.detail}, sent_at = now(),
              claim_expires_at = null
          where id = ${reminder.id} and status = 'sending'
        `;
        sent += 1;
      } else if (result.status === "skipped") {
        await sql`
          update staff_follow_up_reminder
          set status = 'skipped', detail = ${result.detail}, claim_expires_at = null
          where id = ${reminder.id} and status = 'sending'
        `;
        skipped += 1;
      } else {
        await sql`
          update staff_follow_up_reminder
          set status = 'failed', detail = ${result.detail},
              next_attempt_at = now() + interval '1 hour', claim_expires_at = null
          where id = ${reminder.id} and status = 'sending'
        `;
        failed += 1;
      }
    } catch (error) {
      const detail = `Email request failed: ${error instanceof Error ? error.message : String(error)}`.slice(
        0,
        240,
      );
      await sql`
        update staff_follow_up_reminder
        set status = 'failed', detail = ${detail},
            next_attempt_at = now() + interval '1 hour', claim_expires_at = null
        where id = ${reminder.id} and status = 'sending'
      `;
      failed += 1;
    }
  }

  return {
    outboundNotificationsAttempted,
    followUpRemindersQueued: queued.length,
    followUpRemindersAttempted: claimed.length,
    followUpRemindersSent: sent,
    followUpRemindersFailed: failed,
    followUpRemindersSkipped: skipped,
  };
}
