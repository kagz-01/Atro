import { y as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { a as Route$6 } from "./_ssr/router-BjG7hAyI.mjs";
import { t as CtaBand } from "./_ssr/page-hero-BQSa4Z8Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-CWKfdRfx.js
var import_jsx_runtime = require_jsx_runtime();
function ArticlePage() {
	const { article } = Route$6.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "pt-28 md:pt-36 pb-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl px-4 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] uppercase tracking-[0.18em] text-gold",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/insights",
								className: "hover:text-burgundy",
								children: "Insights"
							}),
							" / ",
							article.kicker,
							" · ",
							article.date
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 font-display text-4xl md:text-6xl text-maroon",
						children: article.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-lg text-ink/75",
						children: article.excerpt
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-5xl px-4 sm:px-6 mt-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: article.image,
					alt: "",
					className: "w-full aspect-[16/8] object-cover"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-3xl px-4 sm:px-6 mt-12 space-y-6",
				children: article.body.map((block, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [block.h ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl text-maroon mb-2",
					children: block.h
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-ink/80 leading-relaxed",
					children: block.p
				})] }, i))
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtaBand, {})] });
}
//#endregion
export { ArticlePage as component };
