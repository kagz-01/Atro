import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

const EnquiryInput = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().min(1),
  projectType: z.string(),
  zone: z.string(),
  stage: z.string().default(""),
  startDate: z.string().default(""),
  description: z.string().default(""),
  sqm: z.number().optional(),
  finish: z.string().optional(),
  indicativeMin: z.number().optional(),
  indicativeMax: z.number().optional(),
  diaspora: z.boolean().default(false),
  diasporaCountry: z.string().default(""),
  diasporaTimezone: z.string().default(""),
  diasporaKenyaContact: z.string().default(""),
  diasporaVisitPlans: z.string().default(""),
});

export const saveEnquiryToDb = createServerFn({ method: "POST" })
  .validator(EnquiryInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ id: string; created_at: string }>`
      insert into enquiries (
        name, phone, email, project_type, zone, stage, start_date,
        description, sqm, finish, indicative_min, indicative_max,
        diaspora, diaspora_country, diaspora_timezone,
        diaspora_kenya_contact, diaspora_visit_plans
      ) values (
        ${data.name}, ${data.phone}, ${data.email}, ${data.projectType},
        ${data.zone}, ${data.stage}, ${data.startDate},
        ${data.description}, ${data.sqm ?? null}, ${data.finish ?? null},
        ${data.indicativeMin ?? null}, ${data.indicativeMax ?? null},
        ${data.diaspora}, ${data.diasporaCountry}, ${data.diasporaTimezone},
        ${data.diasporaKenyaContact}, ${data.diasporaVisitPlans}
      )
      returning id, created_at
    `;
    return { ok: true as const, id: String(rows[0]?.id ?? ""), createdAt: String(rows[0]?.created_at ?? "") };
  });

type EnquiryRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  project_type: string;
  zone: string;
  stage: string;
  start_date: string;
  description: string;
  sqm: number | null;
  finish: string | null;
  indicative_min: number | null;
  indicative_max: number | null;
  diaspora: boolean;
  diaspora_country: string;
  diaspora_timezone: string;
  diaspora_kenya_contact: string;
  diaspora_visit_plans: string;
  created_at: string;
};

/**
 * Every enquiry is a named person's phone number and email, so this is
 * account-gated: signed out it throws 401 rather than returning the list. The
 * admin page is the only caller.
 */
export const listEnquiriesFromDb = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql<EnquiryRow>`select * from enquiries order by created_at desc limit 50`;
  });
