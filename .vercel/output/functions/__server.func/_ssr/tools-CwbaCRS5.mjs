import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { I as ArrowRight, M as Calculator, S as FileText, _ as MapPin, o as TrendingUp } from "../_libs/lucide-react.mjs";
import { l as Button } from "./router-cfT7QsAO.mjs";
import { t as Badge } from "./badge-CIjbLax0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tools-CwbaCRS5.js
var import_jsx_runtime = require_jsx_runtime();
var TOOLS = [
	{
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, { className: "size-6" }),
		title: "Cost Calculator",
		desc: "Get an instant indicative range for your project. Select type, zone, area and finish level — see where your money goes.",
		link: "/tools/cost-calculator",
		badge: "Popular"
	},
	{
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-6" }),
		title: "Zone Map",
		desc: "Interactive coverage map. See where ATRO builds, availability status, logistics and FAQs for each county.",
		link: "/tools/zone-map",
		badge: null
	},
	{
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-6" }),
		title: "Material Prices",
		desc: "Current cement, steel, timber and aggregate prices by county. Updated regularly from market data.",
		link: "/tools/material-prices",
		badge: "New"
	},
	{
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-6" }),
		title: "BOQ Generator",
		desc: "Generate a preliminary Bill of Quantities from your project parameters. Download as PDF.",
		link: "/tools/boq-generator",
		badge: "Coming soon"
	}
];
function ToolsIndex() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "pt-32 pb-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-2xl mb-16",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "maroon",
							className: "mb-4",
							children: "Tools"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl md:text-5xl text-maroon",
							children: "Plan smarter. Build better."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 text-ink/70 text-lg",
							children: "Interactive tools to help you understand costs, coverage and timelines before you commit."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid sm:grid-cols-2 gap-6",
					children: TOOLS.map((tool) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: tool.link,
						className: "group p-8 border border-line bg-cream rounded-sm hover:border-burgundy transition-colors",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-12 rounded-sm bg-maroon/10 flex items-center justify-center text-maroon",
									children: tool.icon
								}), tool.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: tool.badge === "Coming soon" ? "stone" : "gold",
									children: tool.badge
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-6 font-display text-2xl text-maroon group-hover:text-burgundy transition-colors",
								children: tool.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-ink/70",
								children: tool.desc
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-6 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-burgundy group-hover:text-maroon",
								children: ["Open tool ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5" })]
							})
						]
					}, tool.title))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-16 p-8 md:p-12 bg-maroon text-paper rounded-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-3xl text-paper",
								children: "Need a real quote?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-paper/70",
								children: "These tools give indicative ranges. For a proper BOQ and a number you can build to, talk to a person."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "gold",
								className: "mt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/start",
									children: ["Start a project", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
								})
							})
						]
					})
				})
			]
		})
	});
}
//#endregion
export { ToolsIndex as component };
