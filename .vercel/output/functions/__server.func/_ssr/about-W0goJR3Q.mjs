import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { d as COMPANY, g as VALUES, l as Button } from "./router-BjG7hAyI.mjs";
import { n as PageHero, t as CtaBand } from "./page-hero-BQSa4Z8Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-W0goJR3Q.js
var import_jsx_runtime = require_jsx_runtime();
function AboutPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
			kicker: "Studio",
			title: "A design-and-build company, not a van with a logo.",
			lede: "ATRO is a modern design-and-construction company focused on creating well-designed, technically sound and efficiently delivered structures.",
			image: "/images/interior.webp"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 py-16 grid lg:grid-cols-12 gap-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-7 space-y-6 text-lg text-ink/80",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "We started from a simple frustration: too many Kenyan projects split design, cost and construction into three conversations that do not speak. The drawing is beautiful. The number is fiction. The site invents a third building." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "ATRO holds those conversations in one studio. We design with quantities in the room. We build from a locked scope. We tell you, in writing, when something changes." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "We are based in Nairobi and we publish where we actually deliver — including work managed for Kenyans who live abroad. We do not claim registrations, awards or years we have not earned a public record for." })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "lg:col-span-5 space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quote, {
					title: "Vision",
					body: "Structures that are designed, costed and built as one act — in Kenya, to a standard that does not need an excuse."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quote, {
					title: "Mission",
					body: "Take a brief from concept to handover with drawings, quantities, a present site and a client who is never guessing."
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "bg-stone/60 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-4 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl text-maroon",
					children: "Values"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 grid sm:grid-cols-2 gap-6",
					children: VALUES.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "bg-paper border border-line p-6 rounded-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-2xl text-maroon",
							children: v.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-ink/75",
							children: v.body
						})]
					}, v.title))
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-10 items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/images/detail.webp",
				alt: "Concrete and stone junction",
				className: "w-full aspect-[4/3] object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl text-maroon",
					children: "Philosophy"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-ink/80",
					children: "A building is a set of joints, levels, waterproofing details and decisions. Taste matters. So does the damp proof course. We will not photograph a house we would not hand to our own family."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-ink/80",
					children: "Team profiles and verified credentials will be published here when they are ready to stand in public. Until then, the work is the proof."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-6 text-sm text-muted",
					children: [
						COMPANY.address,
						" · ",
						COMPANY.email,
						" · ",
						COMPANY.phoneDisplay
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/start",
						children: "Work with us"
					})
				})
			] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtaBand, {})
	] });
}
function Quote({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-l-2 border-gold pl-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] uppercase tracking-[0.16em] text-gold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-ink/80",
			children: body
		})]
	});
}
//#endregion
export { AboutPage as component };
