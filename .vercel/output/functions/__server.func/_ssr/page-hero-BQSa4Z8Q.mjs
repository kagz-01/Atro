import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-DgjzUpi5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/page-hero-BQSa4Z8Q.js
var import_jsx_runtime = require_jsx_runtime();
function PageHero({ kicker, title, lede, image, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("relative pt-28 md:pt-36 pb-12 md:pb-16", image && "min-h-[52vh] text-paper"),
		children: [image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: image,
			alt: "",
			className: "absolute inset-0 w-full h-full object-cover"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-maroon via-maroon/70 to-maroon/40" })] }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto max-w-7xl px-4 sm:px-6",
			children: [
				kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.2em] text-gold mb-4",
					children: kicker
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: cn("font-display text-5xl sm:text-6xl md:text-7xl max-w-4xl", image ? "text-paper" : "text-maroon"),
					children: title
				}),
				lede ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("mt-6 max-w-2xl text-lg", image ? "text-paper/80" : "text-ink/75"),
					children: lede
				}) : null,
				children
			]
		})]
	});
}
function CtaBand({ title = "Have a project in mind?", body = "Tell us the plot, the building, and the budget band. We will tell you whether we are the right studio — and where we actually build." }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "bg-burgundy text-paper",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-20 flex flex-col md:flex-row md:items-end gap-8 justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl md:text-5xl text-paper",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-paper/75",
					children: body
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/start",
				className: "inline-flex h-14 px-7 items-center bg-gold text-maroon text-[12px] uppercase tracking-[0.16em] font-medium rounded-xs hover:bg-gold-light",
				children: "Start a project"
			})]
		})
	});
}
//#endregion
export { PageHero as n, CtaBand as t };
