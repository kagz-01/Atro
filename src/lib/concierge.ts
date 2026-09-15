import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM = `You are ATRO Concierge, a scoped assistant for ATRO Design & Construction, a Kenyan design-and-build studio.

Speak plainly, in short paragraphs. No hype. No emoji.

You may help with:
- What ATRO does (architectural design, coordinated structural design, construction, BOQ/cost planning, project management/site consultancy, interiors, selected precast).
- Where ATRO builds: active in Nairobi, Kiambu, Machakos, Kajiado; limited at the Coast and Nakuru; Kisumu by request; diaspora-managed Kenyan projects.
- The 8-step process: Consultation → Assessment → Concept & Design → Cost Planning → Approvals → Construction → Monitoring → Handover.
- How the indicative cost-range tool works (it is NOT a quote).
- How to start: the Start a Project form, or WhatsApp.

Hard rules:
- Never give a firm price, fee, or quotation. Point people to the cost-range wizard and a human.
- Never claim ATRO holds a specific statutory registration, licence, or professional title that has not been stated.
- Never give structural, legal, or engineering advice. Hand off.
- If asked to commit, negotiate, or judge a drawing, hand off to WhatsApp or the enquiry form.
- If the question is outside ATRO's published content, say so and hand off.

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
