import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { p as PROJECTS, v as ZONES } from "./router-BjG7hAyI.mjs";
import { n as PageHero, t as CtaBand } from "./page-hero-BQSa4Z8Q.mjs";
import { n as ProjectCard } from "./project-card-BrI84kSF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects-CUuRGztR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TYPES = [
	"All",
	"Residential",
	"Commercial",
	"Institutional",
	"Church",
	"School",
	"Renovation"
];
var STATUSES = [
	"All",
	"Completed",
	"Ongoing",
	"Proposed"
];
function ProjectsPage() {
	const [type, setType] = (0, import_react.useState)("All");
	const [status, setStatus] = (0, import_react.useState)("All");
	const [zone, setZone] = (0, import_react.useState)("All");
	const filtered = (0, import_react.useMemo)(() => {
		return PROJECTS.filter((p) => {
			if (type !== "All" && p.type !== type) return false;
			if (status !== "All" && p.status !== status) return false;
			if (zone !== "All" && p.zone !== zone) return false;
			return true;
		});
	}, [
		type,
		status,
		zone
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
			kicker: "Work",
			title: "Projects, tagged to the ground they stand on.",
			lede: "Filter by type, status and zone. Ongoing work is labelled ongoing — never dressed as finished.",
			image: "/images/karen.webp"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 py-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterRow, {
							label: "Type",
							value: type,
							onChange: setType,
							options: TYPES
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterRow, {
							label: "Status",
							value: status,
							onChange: setStatus,
							options: STATUSES
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterRow, {
							label: "Zone",
							value: zone,
							onChange: setZone,
							options: ["All", ...ZONES.map((z) => z.slug)],
							labels: {
								All: "All",
								...Object.fromEntries(ZONES.map((z) => [z.slug, z.name]))
							}
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-8 text-[11px] uppercase tracking-[0.16em] text-muted",
					children: [
						filtered.length,
						" project",
						filtered.length === 1 ? "" : "s"
					]
				}),
				filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-ink/70",
					children: "Nothing in that combination yet. Clear a filter or pick another zone."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6",
					children: filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectCard, { project: p }, p.slug))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtaBand, { title: "Discuss your project" })
	] });
}
function FilterRow({ label, value, onChange, options, labels }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] uppercase tracking-[0.16em] text-muted w-16",
			children: label
		}), options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(opt),
			className: `h-10 px-3 text-[11px] uppercase tracking-[0.12em] border rounded-xs ${value === opt ? "bg-burgundy text-paper border-burgundy" : "border-line text-ink hover:border-burgundy"}`,
			children: labels?.[opt] ?? opt
		}, opt))]
	});
}
//#endregion
export { ProjectsPage as component };
