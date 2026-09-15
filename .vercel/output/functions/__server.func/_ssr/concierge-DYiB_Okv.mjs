import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as object, n as array, o as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/concierge-DYiB_Okv.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var SYSTEM = `You are ATRO Concierge, a scoped assistant for ATRO Design & Construction, a Kenyan design-and-build studio.

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
var Input = object({ messages: array(object({
	role: _enum(["user", "assistant"]),
	content: string().max(2e3)
})).max(12) });
var askConcierge_createServerFn_handler = createServerRpc({
	id: "104ab998a74b2c68797d912e64133b8591b961b4d1026dcb4caaa6e711018f75",
	name: "askConcierge",
	filename: "src/lib/concierge.ts"
}, (opts) => askConcierge.__executeServer(opts));
var askConcierge = createServerFn({ method: "POST" }).validator(Input).handler(askConcierge_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "The concierge is not available in this environment."
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 380,
			temperature: .4,
			messages: [{
				role: "system",
				content: SYSTEM
			}, ...data.messages]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: "The concierge could not answer just now. Try WhatsApp."
	};
	const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
	if (!text) return {
		ok: false,
		error: "Empty reply. Please try again."
	};
	return {
		ok: true,
		text
	};
});
//#endregion
export { askConcierge_createServerFn_handler };
