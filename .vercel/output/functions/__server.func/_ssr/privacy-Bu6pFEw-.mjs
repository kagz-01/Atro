import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { d as COMPANY } from "./router-BjG7hAyI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/privacy-Bu6pFEw-.js
var import_jsx_runtime = require_jsx_runtime();
function PrivacyPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "pt-28 md:pt-36 pb-20 mx-auto max-w-3xl px-4 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Legal"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-5xl text-maroon",
				children: "Privacy notice"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 space-y-4 text-ink/80",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "ATRO Design & Construction collects enquiry data you submit: name, phone, email, project details and any notes. We use it to respond to you. We do not sell it." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Enquiries in this preview are stored on your device (local storage) so you can see the flow. In a production deployment they would be stored on ATRO’s systems and emailed to ",
						COMPANY.email,
						"."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"We process personal data in line with Kenya’s Data Protection Act, 2019. You may ask to access or erase your enquiry by writing to ",
						COMPANY.email,
						"."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This site may use essential cookies for the preview and, in production, analytics with conversion events on forms, CTAs and WhatsApp taps." })
				]
			})
		]
	});
}
//#endregion
export { PrivacyPage as component };
