import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-DgjzUpi5.mjs";
import { I as ArrowRight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/page-hero-BFeZQGDD.js
var import_jsx_runtime = require_jsx_runtime();
function PageHero({ kicker, title, lede, image, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("relative pt-28 md:pt-36 pb-12 md:pb-16 overflow-hidden", image && "min-h-[52vh] text-paper"),
		children: [image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: image,
				alt: "",
				className: "absolute inset-0 w-full h-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-maroon via-maroon/70 to-maroon/40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-gold/10 rounded-full blur-[150px] pointer-events-none" })
		] }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16",
			children: [
				kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-maroon/10 mb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-1.5 rounded-full bg-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.2em] text-burgundy",
						children: kicker
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: cn("reveal reveal-delay-1 font-display text-5xl sm:text-6xl md:text-7xl max-w-4xl", image ? "text-paper" : "text-maroon"),
					children: title
				}),
				lede ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("reveal reveal-delay-2 mt-6 max-w-2xl text-lg", image ? "text-paper/80" : "text-ink/75"),
					children: lede
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "reveal reveal-delay-3",
					children
				})
			]
		})]
	});
}
function CtaBand({ title = "Have a project in mind?", body = "Tell us the plot, the building, and the budget band. We will tell you whether we are the right studio — and where we actually build." }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-maroon" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-burgundy/50 via-maroon to-maroon" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 overflow-hidden pointer-events-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-32 -right-32 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[140px]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-burgundy/30 rounded-full blur-[120px]" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16 py-16 md:py-20 flex flex-col md:flex-row md:items-end gap-8 justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-4xl md:text-5xl text-paper",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-paper/75",
						children: body
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/start",
					className: "group inline-flex h-14 px-8 items-center gap-3 bg-gradient-to-r from-gold to-gold-light text-maroon text-[12px] uppercase tracking-[0.16em] font-bold rounded-2xl shadow-glow-gold btn-lift overflow-hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "relative z-10",
							children: "Start a project"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-5 relative z-10 group-hover:translate-x-1 transition-transform" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" })
					]
				})]
			})
		]
	});
}
//#endregion
export { PageHero as n, CtaBand as t };
