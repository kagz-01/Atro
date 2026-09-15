import { i as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { l as Button, n as Route, o as useSiteStore } from "./_ssr/router-BjG7hAyI.mjs";
import { t as CtaBand } from "./_ssr/page-hero-BQSa4Z8Q.mjs";
import { n as ProjectCard, t as Badge } from "./_ssr/project-card-BrI84kSF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-XrWzUPwE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ZoneDetail() {
	const { zone, projects } = Route.useLoaderData();
	const setZone = useSiteStore((s) => s.setSelectedZone);
	(0, import_react.useEffect)(() => {
		setZone(zone.slug);
	}, [zone.slug, setZone]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "pt-28 md:pt-36 pb-12 bg-maroon text-paper",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-4 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] uppercase tracking-[0.18em] text-gold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/zones",
								className: "hover:text-paper",
								children: "Zones"
							}),
							" / ",
							zone.region
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "gold",
							children: zone.coverage
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 font-display text-5xl md:text-7xl text-paper max-w-4xl",
						children: zone.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-2xl text-paper/75 text-lg",
						children: zone.summary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "gold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/start",
								children: ["Start a project in ", zone.name]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "line",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/projects",
								children: "Work in this zone"
							})
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 py-16 grid md:grid-cols-3 gap-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
					label: "Coverage",
					value: zone.coverage
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
					label: "Typical work",
					value: zone.typical
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
					label: "Logistics",
					value: zone.logistics
				})
			]
		}),
		projects.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 pb-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "font-display text-3xl text-maroon mb-8",
				children: ["Work in ", zone.name]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-6",
				children: projects.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectCard, { project: p }, p.slug))
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 pb-12 text-ink/70",
			children: "No published projects in this zone yet. The enquiry form still works — we will tell you if the site is outside current coverage."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 pb-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl text-maroon mb-6",
				children: "Questions we hear here"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: zone.faqs.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "border border-line bg-cream p-5 rounded-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
						className: "cursor-pointer font-display text-xl text-maroon",
						children: f.q
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-ink/75",
						children: f.a
					})]
				}, f.q))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtaBand, {})
	] });
}
function Fact({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-line p-6 bg-cream rounded-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] uppercase tracking-[0.16em] text-gold",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-ink/80",
			children: value
		})]
	});
}
//#endregion
export { ZoneDetail as component };
