import { y as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { l as Button, r as Route$6 } from "./_ssr/router-cfT7QsAO.mjs";
import { t as CtaBand } from "./_ssr/page-hero-BFeZQGDD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-BiZ9r3l-.js
var import_jsx_runtime = require_jsx_runtime();
function ServiceDetail() {
	const { service } = Route$6.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative min-h-[52vh] flex items-end text-paper",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: service.image,
					alt: "",
					className: "absolute inset-0 w-full h-full object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-maroon via-maroon/60 to-maroon/30" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto max-w-7xl px-4 sm:px-6 w-full pb-12 pt-32",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] uppercase tracking-[0.18em] text-gold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/services",
								className: "hover:text-paper",
								children: "Services"
							}),
							" / ",
							service.kicker
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 font-display text-5xl md:text-7xl text-paper max-w-4xl",
						children: service.title
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 py-16 grid lg:grid-cols-12 gap-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg text-ink/80",
						children: service.lede
					}),
					service.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-sm border-l-2 border-gold pl-4 text-ink/70",
						children: service.note
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "mt-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/start",
							children: "Enquire about this service"
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-5 space-y-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
						title: "What is included",
						items: service.included
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
						title: "Typical project types",
						items: service.types
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
						title: "What we need from you",
						items: service.inputs
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtaBand, {})
	] });
}
function List({ title, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-line bg-cream p-6 rounded-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-[11px] uppercase tracking-[0.16em] text-gold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 space-y-2 text-ink/80",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "pl-4 border-l border-gold/60",
				children: item
			}, item))
		})]
	});
}
//#endregion
export { ServiceDetail as component };
