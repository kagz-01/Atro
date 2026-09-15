import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { f as PROCESS_STEPS, l as Button } from "./router-BjG7hAyI.mjs";
import { n as PageHero, t as CtaBand } from "./page-hero-BQSa4Z8Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/process-BbV5ufLM.js
var import_jsx_runtime = require_jsx_runtime();
function ProcessPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
			kicker: "Process",
			title: "A journey you can point to, not a fog of site visits.",
			lede: "Eight steps. If a project skips cost planning or pretends approvals are optional, it is not an ATRO project.",
			image: "/images/site.webp"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-3xl px-4 sm:px-6 py-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "relative border-l border-gold/50 ml-3 space-y-12",
				children: PROCESS_STEPS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "pl-10 relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute -left-3.5 top-1 size-7 rounded-xs bg-burgundy text-paper text-[11px] inline-flex items-center justify-center",
							children: s.n
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl text-maroon",
							children: s.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-ink/75",
							children: s.body
						})
					]
				}, s.n))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-14",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/start",
						children: "Start at step one"
					})
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtaBand, { title: "Start your project" })
	] });
}
//#endregion
export { ProcessPage as component };
