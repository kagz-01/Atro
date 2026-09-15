import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { u as ARTICLES } from "./router-BjG7hAyI.mjs";
import { n as PageHero, t as CtaBand } from "./page-hero-BQSa4Z8Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/insights-DXzN-4lM.js
var import_jsx_runtime = require_jsx_runtime();
function InsightsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
			kicker: "Insights",
			title: "Useful pages. Not a newsroom.",
			lede: "How costing, geography and remote clients actually behave on Kenyan sites."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 pb-20 grid md:grid-cols-3 gap-8",
			children: ARTICLES.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/insights/$slug",
				params: { slug: a.slug },
				className: "group border border-line bg-cream rounded-sm overflow-hidden hover:border-burgundy",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "aspect-[16/10] overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: a.image,
						alt: "",
						className: "w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] uppercase tracking-[0.16em] text-muted",
							children: [
								a.kicker,
								" · ",
								a.date,
								" · ",
								a.read
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-2xl text-maroon group-hover:text-burgundy",
							children: a.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-ink/70",
							children: a.excerpt
						})
					]
				})]
			}, a.slug))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtaBand, {})
	] });
}
//#endregion
export { InsightsPage as component };
