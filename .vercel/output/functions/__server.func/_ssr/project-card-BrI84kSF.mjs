import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-DgjzUpi5.mjs";
import { v as ZONES } from "./router-BjG7hAyI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/project-card-BrI84kSF.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "stone", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center h-7 px-2.5 text-[10px] uppercase tracking-[0.16em] font-medium rounded-xs", {
			stone: "bg-stone text-ink",
			gold: "bg-gold/15 text-burgundy border border-gold/40",
			maroon: "bg-maroon text-paper",
			live: "bg-burgundy text-paper",
			paper: "bg-paper/15 text-paper border border-paper/30"
		}[tone], className),
		children
	});
}
function ProjectCard({ project }) {
	const zone = ZONES.find((z) => z.slug === project.zone);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/projects/$slug",
		params: { slug: project.slug },
		className: "group block border border-line bg-cream rounded-sm overflow-hidden hover:border-burgundy transition-colors",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[4/3] overflow-hidden bg-stone",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: project.image,
				alt: project.name,
				className: "w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]",
				loading: "lazy"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-3 left-3 flex gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: project.status === "Ongoing" ? "live" : "paper",
					children: project.status
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-5",
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
					className: "mt-2 font-display text-2xl text-maroon group-hover:text-burgundy",
					children: project.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink/70",
					children: project.excerpt
				})
			]
		})]
	});
}
//#endregion
export { ProjectCard as n, Badge as t };
