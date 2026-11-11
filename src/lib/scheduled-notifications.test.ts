import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { test } from "node:test";
import type { Sql } from "./db.ts";
import { runScheduledNotifications } from "./scheduled-notifications.server.ts";

function createSql(db: PGlite): Sql {
  const query = async <T = Record<string, unknown>>(
    text: string,
    params: unknown[] = [],
  ): Promise<T[]> => (await db.query<T>(text, params)).rows;

  const sql = async <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]> => {
    let text = strings[0] ?? "";
    for (let index = 0; index < values.length; index += 1) {
      text += `$${index + 1}${strings[index + 1] ?? ""}`;
    }
    return query<T>(text, values);
  };
  sql.query = query;
  return sql;
}

test("the canonical schema includes the follow-up reminder outbox", async () => {
  const db = new PGlite();
  try {
    await db.exec(readFileSync("migrations/schema.sql", "utf8"));
    const rows = await db.query<{ table_name: string; migration: string }>(
      `select to_regclass('staff_follow_up_reminder')::text as table_name,
              (select name from _migrations
               where name = '0037_scheduled_staff_follow_up_reminders.sql') as migration`,
    );
    assert.equal(rows.rows[0]?.table_name, "staff_follow_up_reminder");
    assert.equal(rows.rows[0]?.migration, "0037_scheduled_staff_follow_up_reminders.sql");
  } finally {
    await db.close();
  }
});

test("follow-up reminders wait for Nairobi 08:00, deduplicate, and retry safely", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create table scheduler_test_clock (value timestamptz not null);
      insert into scheduler_test_clock values ('2025-03-01T04:59:00Z');
      create function public.now() returns timestamptz
        language sql stable as $clock$ select value from scheduler_test_clock limit 1 $clock$;
      set search_path to public, pg_catalog;
      create table portal_projects (
        id uuid primary key,
        title text not null,
        reference text not null
      );
      create table staff_follow_up (
        id uuid primary key default gen_random_uuid(),
        assigned_to text not null,
        created_by text not null,
        project_id uuid references portal_projects (id),
        title text not null,
        due_date date not null,
        completed_at timestamptz,
        created_at timestamptz not null default now()
      );
    `);
    await db.exec(
      readFileSync("migrations/0037_scheduled_staff_follow_up_reminders.sql", "utf8"),
    );
    await db.exec(`
      insert into portal_projects (id, title, reference)
        values ('11111111-1111-4111-8111-111111111111', 'Project One', 'REF-1');
      insert into staff_follow_up
        (id, assigned_to, created_by, project_id, title, due_date)
        values
          ('22222222-2222-4222-8222-222222222222', 'staff@example.test',
           'staff@example.test', '11111111-1111-4111-8111-111111111111',
           'Review project', '2025-03-01'),
          ('33333333-3333-4333-8333-333333333333', 'other@example.test',
           'other@example.test', null, 'Retry follow-up', '2025-03-01');
    `);

    const sentTo: string[] = [];
    const delivery = {
      drainDue: async () => 3,
      sendStaffFollowUpReminder: async (input: { to: string; title: string }) => {
        sentTo.push(input.to);
        return input.title === "Retry follow-up"
          ? { status: "failed" as const, detail: "Resend unavailable" }
          : { status: "sent" as const, detail: "resend 200" };
      },
    };
    const sql = createSql(db);

    const beforeEight = await runScheduledNotifications(sql, delivery);
    assert.equal(beforeEight.followUpRemindersQueued, 0);
    assert.deepEqual(sentTo, []);

    await db.exec("update scheduler_test_clock set value = '2025-03-01T05:00:00Z'");
    const atEight = await runScheduledNotifications(sql, delivery);
    assert.equal(atEight.outboundNotificationsAttempted, 3);
    assert.equal(atEight.followUpRemindersQueued, 2);
    assert.equal(atEight.followUpRemindersAttempted, 2);
    assert.equal(atEight.followUpRemindersSent, 1);
    assert.equal(atEight.followUpRemindersFailed, 1);
    assert.deepEqual(sentTo.sort(), ["other@example.test", "staff@example.test"]);

    const rows = await sql.query<{ status: string; attempts: number; due_date: string }>(
      `select status, attempts, due_date
       from staff_follow_up_reminder
       order by follow_up_id`,
    );
    assert.deepEqual(
      rows.map((row) => row.status),
      ["sent", "failed"],
    );
    assert.deepEqual(
      rows.map((row) => row.attempts),
      [1, 1],
    );

    const nextHourlyRun = await runScheduledNotifications(sql, delivery);
    assert.equal(nextHourlyRun.followUpRemindersQueued, 0);
    assert.equal(nextHourlyRun.followUpRemindersAttempted, 0);
    assert.equal(sentTo.length, 2);

    await db.exec(`
      insert into staff_follow_up
        (id, assigned_to, created_by, title, due_date, completed_at)
        values ('44444444-4444-4444-8444-444444444444', 'done@example.test',
          'done@example.test', 'Completed follow-up', '2025-03-01', now());
      insert into staff_follow_up_reminder (follow_up_id, due_date)
        values ('44444444-4444-4444-8444-444444444444', '2025-03-01');
    `);
    await runScheduledNotifications(sql, delivery);
    const cancelled = await sql.query<{ status: string }>(
      `select status from staff_follow_up_reminder
       where follow_up_id = '44444444-4444-4444-8444-444444444444'`,
    );
    assert.equal(cancelled[0]?.status, "cancelled");
    assert.equal(sentTo.length, 2);
  } finally {
    await db.close();
  }
});
