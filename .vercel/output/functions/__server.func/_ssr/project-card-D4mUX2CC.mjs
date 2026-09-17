import { l as ZONES } from "./site-CZI1B5CN.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { F as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-CIjbLax0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/project-card-D4mUX2CC.js
var import_jsx_runtime = require_jsx_runtime();
function ProjectCard({ project }) {
	const zone = ZONES.find((z) => z.slug === project.zone);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/projects/$slug",
		params: { slug: project.slug },
		className: "group block bg-cream rounded-2xl overflow-hidden card-lift border border-line/50 hover:border-gold/30 hover:shadow-card-hover",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[4/3] overflow-hidden bg-stone",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: project.image,
					alt: project.name,
					className: "w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105",
					loading: "lazy"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-maroon/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute top-3 left-3 flex gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: project.status === "Ongoing" ? "live" : "paper",
						children: project.status
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-3 right-3 size-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4 text-maroon" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[11px] uppercase tracking-[0.16em] text-muted",
					children: [
						project.type,
						" · ",
						zone?.name ?? project.location
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-2 font-display text-xl text-maroon group-hover:text-burgundy transition-colors duration-300",
					children: project.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink/70 line-clamp-2",
					children: project.excerpt
				})
			]
		})]
	});
}
//#endregion
export { ProjectCard as t };
