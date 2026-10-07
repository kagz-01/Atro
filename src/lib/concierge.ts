import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { KB } from "@/lib/kb";

// Build a concise knowledge snapshot from the KB for the system prompt
function buildKBContext() {
  const d = KB.design;
  const c = KB.construction;
  const q = KB.consultancy;
  const di = KB.diaspora;

  return `
## ABOUT ATRO
${d.definition}
Founded: ${d.founded}. Location: ${d.location}.
We do: Design, Construction, Consultancy — across residential, commercial, institutional, religious, industrial.

## SERVICES
Design: ${d.services.map((s) => s.name).join(", ")}.
Construction: Full build from foundations to handover.
Consultancy: ${q.services.map((s) => s.name).join(", ")}.

## WHERE WE BUILD
Nairobi (hub), Kiambu, Machakos, Kajiado — active.
Coast, Nakuru — limited.
Kisumu — by request.
Diaspora — managed Kenyan projects from abroad.

## PROCESS (5 phases)
${d.process.map((p) => `${p.phase}. ${p.name}: ${p.description}`).join("\n")}

## CONSTRUCTION PHASES
${c.phases.map((p) => `${p.name}: ${p.description}`).join("\n")}

## FINISH LEVELS
${d.finishLevels.map((f) => `${f.name}: ${f.costRange} — ${f.description}`).join("\n")}

## RATES (Q1 2026, indicative)
Residential: KES 35,000-120,000/m². Commercial: KES 30,000-180,000/m².
Zone multipliers: Nairobi 1.10, Kiambu 1.03, Machakos 0.98, Kajiado 0.98, Coast 1.18, Nakuru 0.92, Kisumu 0.90, Diaspora 1.40.

## COST BREAKDOWN (typical)
Structure 35%, Finishes 25%, Services 18%, External 10%, Professional 7%, Contingency 5%.

## PROFESSIONAL FEES
Architect 5-8%, QS 0.8-1.5%, Structural 3-5%, MEP 3-5%, PM 3-6% of construction cost.

## EXCLUSIONS FROM QUOTES
Land, stamp duty, legal fees, county permits (KES 80K-200K), NEMA (KES 50K-100K), utility connections, FF&E, landscaping, pools/generators/solar (unless specified).

## REGULATIONS
NCA registration required for all projects. NEMA EIA for larger projects. County building approval. Professional registration via AAK, BORAQS, EBK.

## STANDARDS
Kenya Building Code 2020. BS 8110 structural. SMM2 measurement. Energy Act 2019.

## CONSTRUCTION METHODS
Conventional RC+masonry (baseline), Precast (+5-10%), Steel frame (+15-25%), Timber (variable).

## TYPICAL PROGRAMME
3-bed bungalow 6-9 months. 4-bed maisonette 9-14 months. Apartment block G+3 to G+6: 12-18 months. Commercial 12-24 months. Renovation 3-6 months.

## DIASPORA CLIENTS (Kenyans building from abroad)
Market: 3M Kenyans abroad. Remittances KES 593B in 2025 (+34.8%). More than half of some developers' units sold to diaspora before completion.
Motivations: Retirement home, family housing, rental income, land banking, return home.
${di.painPoints.map((p) => `- ${p.title}: ${p.description.substring(0, 100)}...`).join("\n")}

What ATRO does differently for diaspora:
${di.differentiators.map((d) => `- ${d.title}: ${d.description.substring(0, 120)}...`).join("\n")}

Communication: Weekly written reports (Friday EAT), scheduled video calls (EAT morning or evening), WhatsApp for quick questions, decision log for every decision.
Payment: Milestone-based. Pay for done work, not promises. Payment certificate before each release. No advance for unstarted work.
Trust signals: Registered architects (AAK) and engineers (EBK), NCA-registered, physical office in Nairobi, completed projects, named project manager, open-book costing.
Red flags to warn about: Large upfront deposits (>15%), no NCA registration, no written contract, no references, pressure to pay quickly, no BOQ, new company with no track record.

${di.faqs.slice(0, 5).map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}
`;
}

const SYSTEM = `You are ATRO Concierge, a scoped assistant for ATRO Design & Construction — a Kenyan design-and-build studio.

Speak plainly, in short paragraphs. No hype. No emoji. Be direct and helpful.

KNOWLEDGE BASE:
${buildKBContext()}

You may help with:
- What ATRO does (design, construction, consultancy across 5 building types).
- Where ATRO builds (8 zones with different availability).
- The 5-phase design process and 7-phase construction process.
- Cost planning, rates, fee structures — indicative only, never a quote.
- BOQ, project management, contract administration.
- Regulations (NCA, NEMA, county, AAK, BORAQS, EBK).
- Diaspora clients — how ATRO manages projects for Kenyans building from abroad, trust signals, red flags, communication protocols, payment protection.
- How to start a project.

Hard rules:
- Never give a firm price, fee, or quotation. Always say "indicative" and point to the cost-range tool or a human.
- Never claim ATRO holds a specific statutory registration, licence, or professional title that has not been stated.
- Never give structural, legal, or engineering advice. Hand off.
- If asked to commit, negotiate, or judge a drawing, hand off to WhatsApp or the enquiry form.
- If the question is outside ATRO's published content, say so and hand off.
- Keep responses under 150 words.

Handoff line to use when needed:
"This needs a person. Use Start a Project on the site, or WhatsApp the studio."`;

const Input = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      }),
    )
    .max(12),
});

export const askConcierge = createServerFn({ method: "POST" })
  .validator(Input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "The concierge is not available in this environment." };
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 380,
        temperature: 0.4,
        messages: [{ role: "system", content: SYSTEM }, ...data.messages],
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: "The concierge could not answer just now. Try WhatsApp." };
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return { ok: false as const, error: "Empty reply. Please try again." };
    }
    return { ok: true as const, text };
  });
