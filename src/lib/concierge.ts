import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { KB } from "@/lib/kb";

// Build a concise knowledge snapshot from the KB for the system prompt
function buildKBContext() {
  const d = KB.design;
  const c = KB.construction;
  const q = KB.consultancy;
  const di = KB.diaspora;
  const ref = KB.reference;
  const manual = KB.operatingManual;

  return `
## ABOUT ATRO
${d.definition}
Founded: ${d.founded}. Location: ${d.location}.
We do: Design, Construction, Consultancy — across residential, commercial, institutional, religious, industrial and diaspora delivery.

## SERVICE PLATFORM
Design services: ${d.services.map((s) => s.name).join(", ")}.
Construction stages: ${c.phases.map((p) => p.name).join(", ")}.
Consultancy services: ${q.services.map((s) => s.name).join(", ")}.
Project support tools: Cost Calculator, Zone Map, Material Prices, BOQ Worksheet.

## AGENT OPERATING MANUAL
### Service decision trees
${manual.serviceDecisionTrees.map((s) => `- ${s.service}: trigger = ${s.triggers.join(", ")}. Outputs = ${s.outputs.join(", ")}. Handoff = ${s.handoff}`).join("\n")}

### Cost calculator assumptions
Inputs: ${manual.costCalculatorAssumptions.inputs.join(", ")}. Exclusions: ${manual.costCalculatorAssumptions.exclusions.join(", ")}. Accuracy: ${manual.costCalculatorAssumptions.accuracy}

### Material pricing refresh rules
Cadence: ${manual.materialPriceRefreshRules.cadence.materials}; ${manual.materialPriceRefreshRules.cadence.labour}; ${manual.materialPriceRefreshRules.cadence.utilities}. Decision rule: ${manual.materialPriceRefreshRules.decisionRule}

### Project lifecycle checkpoints
${manual.projectLifecycleCheckpoints.map((p) => `- ${p.phase}: ${p.checkpoints.join(", ")}`).join("\n")}

### Diaspora decision flow
${manual.diasporaClientDecisionFlow.steps.join("; ")}
Red flags: ${manual.diasporaClientDecisionFlow.redFlags.join("; ")}.

## WHAT THE AGENT SHOULD DO
- Answer with ATRO-specific, plain-language guidance.
- Be precise about what is indicative versus what is final.
- Keep pricing directional unless a project-specific briefing or site assessment exists.
- Route the client to the right tool or next step instead of inventing a quote.
- Use the project lifecycle logic: feasibility → concept → design → quantities → procurement → site delivery → handover.

## WHERE WE BUILD
Nairobi (hub), Kiambu, Machakos, Kajiado — active.
Coast, Nakuru — limited.
Kisumu — by request.
Diaspora — remote management for Kenyans building in Kenya from abroad.

## DESIGN PROCESS
${d.process.map((p) => `${p.phase}. ${p.name}: ${p.description}`).join("\n")}

## CONSTRUCTION PHASES
${c.phases.map((p) => `${p.name}: ${p.description}`).join("\n")}

## FINISH LEVELS
${d.finishLevels.map((f) => `${f.name}: ${f.costRange} — ${f.description}`).join("\n")}

## PRICING POLICY (dynamic and indicative)
Pricing principle: ${ref.pricingPolicy.principle}
Refresh cadence: Materials ${ref.pricingPolicy.updateCadence.materials}; labour ${ref.pricingPolicy.updateCadence.labour}; utility connections ${ref.pricingPolicy.updateCadence.utilityConnections}.
Source hierarchy: ${ref.pricingPolicy.sourceHierarchy.join("; ")}.
Update triggers: ${ref.pricingPolicy.updateTriggers.join("; ")}.
Decision rule: ${ref.pricingPolicy.decisionRule}

## RATES (indicative, not fixed)
Residential: KES 35,000-120,000/m². Commercial: KES 30,000-180,000/m².
Zone multipliers: Nairobi 1.10, Kiambu 1.03, Machakos 0.98, Kajiado 0.98, Coast 1.18, Nakuru 0.92, Kisumu 0.90, Diaspora 1.40.
Typical cost split: Structure 35%, Finishes 25%, Services 18%, External 10%, Professional 7%, Contingency 5%.

## PROFESSIONAL FEES
Architect 5-8%, QS 0.8-1.5%, Structural 3-5%, MEP 3-5%, PM 3-6% of construction cost.

## EXCLUSIONS FROM QUOTES
Land, stamp duty, legal fees, county permits, NEMA, utility connections, FF&E, landscaping, pools/generators/solar (unless specified).

## REGULATIONS
NCA registration required for all projects. NEMA EIA for larger projects. County building approval. Professional registration via AAK, BORAQS, EBK.

## STANDARDS
Kenya Building Code 2020. BS 8110 structural. SMM2 measurement. Energy Act 2019.

## CONSTRUCTION METHODS
Conventional RC+masonry (baseline), Precast (+5-10%), Steel frame (+15-25%), Timber (variable).

## TYPICAL PROGRAMME
3-bed bungalow 6-9 months. 4-bed maisonette 9-14 months. Apartment block G+3 to G+6: 12-18 months. Commercial 12-24 months. Renovation 3-6 months.

## DIASPORA CLIENTS (Kenyans building from abroad)
Market: 3M Kenyans abroad. Remittances KES 593B in 2025 (+34.8%).
Motivations: Retirement home, family housing, rental income, land banking, return home.
${di.painPoints.map((p) => `- ${p.title}: ${p.description.substring(0, 110)}...`).join("\n")}

What ATRO does differently for diaspora:
${di.differentiators.map((d) => `- ${d.title}: ${d.description.substring(0, 120)}...`).join("\n")}

Communication: Weekly written reports, scheduled video calls, WhatsApp updates and a decision log.
Payment: Milestone-based. No advance for unstarted work.
Trust signals: Registered professionals, NCA compliance, physical office, named project manager, open-book costing.

${di.faqs.slice(0, 5).map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}

## TOOL routing
- If the client asks for a quick cost sense-check, use the Cost Calculator.
- If the question is about service coverage or working area, use the Zone Map.
- If the issue is material selection or price comparison, use the Material Prices reference tool.
- If the client wants a preliminary BOQ or quantity framing, use the BOQ Worksheet.
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
