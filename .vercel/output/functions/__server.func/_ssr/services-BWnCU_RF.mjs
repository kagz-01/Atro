import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { m as SERVICES } from "./router-BjG7hAyI.mjs";
import { n as PageHero, t as CtaBand } from "./page-hero-BQSa4Z8Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/services-BWnCU_RF.js
var import_jsx_runtime = require_jsx_runtime();
function ServicesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
			kicker: "Services",
			title: "What is included. What we need from you. What happens next.",
			lede: "Not a list of virtues. Each service is a scope: drawings, quantities, a site, a conversation.",
			image: "/images/detail.webp"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 py-16 space-y-10",
			children: SERVICES.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/services/$slug",
				params: { slug: s.slug },
				className: "grid md:grid-cols-12 gap-6 md:gap-10 items-center group",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `md:col-span-5 ${i % 2 === 1 ? "md:order-2" : ""}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "aspect-[4/3] overflow-hidden bg-stone",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: s.image,
							alt: "",
							className: "w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.16em] text-gold",
							children: s.kicker
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 font-display text-4xl text-maroon group-hover:text-burgundy",
							children: s.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-ink/75 max-w-xl",
							children: s.lede
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-[12px] uppercase tracking-[0.16em] text-burgundy",
							children: "Read the scope →"
						})
					]
				})]
			}, s.slug))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtaBand, { title: "Request a consultation" })
	] });
}
//#endregion
export { ServicesPage as component };
