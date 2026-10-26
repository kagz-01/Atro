import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { toE164 } from "@/lib/phone";
import { requireStaff } from "@/lib/staff-session.server";

const EnquiryInput = z.object({
  name: z.string().min(1),
  phone: z
    .string()
    .trim()
    .min(1, "Enter a phone number we can reach you on.")
    .transform((value, ctx) => {
      const e164 = toE164(value);
      if (!e164) {
        ctx.addIssue({
          code: "custom",
          message:
            "That does not look like a phone number. Use the local form (0799 034 712) or include your country code.",
        });
        return z.NEVER;
      }
      return e164;
    }),
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
  status: string;
  assigned_to: string;
  project_id: string | null;
  created_at: string;
};

/**
 * Every enquiry is a named person's phone number and email, so this is
 * staff-gated: signed out it throws, and so does any signed-in account that is
 * not on the allowlist — a client must not be able to read the whole leads
 * inbox by calling the admin page's data function directly. The admin page is
 * the only caller.
 */
export const listEnquiriesFromDb = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      offset: z.number().int().nonnegative().default(0),
      search: z.string().trim().max(120).default(""),
      projectType: z.enum(["all", "Residential", "Commercial", "Institutional"]).default("all"),
      clientType: z.enum(["all", "diaspora", "local"]).default("all"),
      status: z.enum(["all", "open", "new", "contacted", "quoted", "won", "lost", "converted"])
        .default("open"),
      owner: z.enum(["all", "unclaimed", "mine", "other"]).default("all"),
      enquiryId: z.string().uuid().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const staff = await requireStaff();
    const sql = await getSql();
    const filters = [
      data.projectType,
      data.clientType,
      data.status,
      data.owner,
      staff.email,
      data.search,
      data.enquiryId ?? null,
    ];
    const where = `
      (
        ($7::uuid is not null and id = $7::uuid)
        or (
          $7::uuid is null
          and ($1 = 'all' or project_type = $1)
          and (
            $2 = 'all'
            or ($2 = 'diaspora' and diaspora = true)
            or ($2 = 'local' and diaspora = false)
          )
          and (
            $3 = 'all'
            or ($3 = 'open' and status not in ('lost', 'converted'))
            or status = $3
          )
          and (
            $4 = 'all'
            or ($4 = 'unclaimed' and coalesce(btrim(assigned_to), '') = '')
            or ($4 = 'mine' and lower(coalesce(btrim(assigned_to), '')) = $5)
            or (
              $4 = 'other'
              and coalesce(btrim(assigned_to), '') <> ''
              and lower(btrim(assigned_to)) <> $5
            )
          )
          and (
            $6 = ''
            or position(
              lower($6) in lower(concat_ws(
                ' ', name, email, phone, zone, description, project_type, assigned_to
              ))
            ) > 0
          )
        )
      )
    `;
    const [rows, count] = await Promise.all([
      sql.query<EnquiryRow>(
        `select * from enquiries where ${where}
         order by created_at desc, id desc
         limit 50 offset $8`,
        [...filters, data.offset],
      ),
      sql.query<{ total: number }>(
        `select count(*) as total from enquiries where ${where}`,
        filters,
      ),
    ]);
    const total = Number(count[0]?.total ?? 0);
    return {
      rows,
      offset: data.offset,
      total,
      hasMore: data.offset + rows.length < total,
    };
  });
