import { i as __toESM } from "../_runtime.mjs";
import { l as ZONES } from "./site-CZI1B5CN.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-DgjzUpi5.mjs";
import { o as useSiteStore } from "./router-cfT7QsAO.mjs";
import { n as PageHero, t as CtaBand } from "./page-hero-BFeZQGDD.mjs";
import { a as getSortedRowModel, i as getCoreRowModel, n as useReactTable, r as createColumnHelper, t as flexRender } from "../_libs/@tanstack/react-table+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/zones-4sHqNK-W.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_LABEL = {
	active: "Active",
	limited: "Limited",
	request: "By request",
	diaspora: "Diaspora"
};
function KenyaMap({ selected, onSelect }) {
	const setZone = useSiteStore((s) => s.setSelectedZone);
	const current = selected ?? null;
	function pick(slug) {
		setZone(slug);
		onSelect?.(slug);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid lg:grid-cols-12 gap-8 items-start",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "lg:col-span-7 relative bg-stone/60 border border-line rounded-md p-4 sm:p-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 200 260",
				className: "w-full h-auto text-maroon",
				role: "img",
				"aria-label": "Kenya coverage map",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M96 10\n               C118 12 142 28 156 48\n               C172 72 184 98 188 128\n               C191 154 186 176 174 196\n               C162 218 150 236 132 246\n               C112 256 92 258 74 250\n               C52 240 36 222 28 200\n               C18 176 10 158 22 146\n               C8 132 10 118 18 102\n               C24 86 16 72 28 56\n               C42 34 66 16 96 10 Z",
						fill: "currentColor",
						className: "text-burgundy/90"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M18 168 C28 162 34 170 26 180 C16 188 12 176 18 168 Z",
						fill: "var(--color-paper)",
						opacity: "0.35"
					}),
					ZONES.filter((z) => z.status !== "diaspora").map((z) => {
						const active = current === z.slug;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: z.cx * 2,
							cy: z.cy * 2.2,
							r: active ? 6.5 : 5,
							className: cn(active ? "fill-gold" : z.status === "active" ? "fill-gold-light" : "fill-paper/70")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
							x: z.cx * 2 + 8,
							y: z.cy * 2.2 + 3,
							className: "fill-paper",
							fontSize: "8",
							fontFamily: "Outfit, sans-serif",
							children: z.name
						})] }, z.slug);
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-[11px] uppercase tracking-[0.16em] text-muted",
				children: "Gold marks current delivery. The shape is Kenya — not a survey drawing."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "lg:col-span-5 space-y-2",
			children: [ZONES.map((z) => {
				const active = current === z.slug;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => pick(z.slug),
					className: cn("w-full text-left border rounded-sm px-4 py-3 transition-colors", active ? "border-burgundy bg-burgundy text-paper" : "border-line bg-cream hover:border-burgundy"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl",
							children: z.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("text-[10px] uppercase tracking-[0.16em]", active ? "text-gold-light" : "text-muted"),
							children: STATUS_LABEL[z.status]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("block text-sm mt-1", active ? "text-paper/80" : "text-ink/70"),
						children: z.coverage
					})]
				}, z.slug);
			}), current ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/zones/$slug",
				params: { slug: current },
				className: "inline-flex mt-3 text-[12px] uppercase tracking-[0.16em] text-burgundy",
				children: [
					"Open ",
					ZONES.find((z) => z.slug === current)?.name,
					" →"
				]
			}) : null]
		})]
	});
}
var helper = createColumnHelper();
function ZoneTable() {
	const [sorting, setSorting] = (0, import_react.useState)([{
		id: "name",
		desc: false
	}]);
	const columns = (0, import_react.useMemo)(() => [
		helper.accessor("name", {
			header: "Zone",
			cell: (info) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/zones/$slug",
				params: { slug: info.row.original.slug },
				className: "font-medium text-maroon hover:text-burgundy",
				children: info.getValue()
			})
		}),
		helper.accessor("coverage", { header: "Coverage" }),
		helper.accessor("typical", { header: "Typical work" }),
		helper.accessor("logistics", { header: "Logistics" })
	], []);
	const table = useReactTable({
		data: ZONES,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto border border-line rounded-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[640px] text-sm text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-stone text-[11px] uppercase tracking-[0.16em] text-muted",
				children: table.getHeaderGroups().map((hg) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: hg.headers.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "px-4 py-3 font-medium",
					children: h.isPlaceholder ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "uppercase tracking-[0.16em]",
						onClick: h.column.getToggleSortingHandler(),
						children: flexRender(h.column.columnDef.header, h.getContext())
					})
				}, h.id)) }, hg.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: table.getRowModel().rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-t border-line bg-cream",
				children: row.getVisibleCells().map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-4 py-4 align-top text-ink/80",
					children: flexRender(cell.column.columnDef.cell, cell.getContext())
				}, cell.id))
			}, row.id)) })]
		})
	});
}
function ZonesPage() {
	const selected = useSiteStore((s) => s.selectedZone);
	const setZone = useSiteStore((s) => s.setSelectedZone);
	const [local, setLocal] = (0, import_react.useState)(selected);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHero, {
			kicker: "Zone intelligence",
			title: "We publish where we build. Then we route the enquiry.",
			lede: "Kenya is not one market. Soil, haulage, county desks and salt air all change the building. Pick a zone — or tell us you are abroad.",
			image: "/images/school.webp"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 py-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KenyaMap, {
					selected: local,
					onSelect: (slug) => {
						setLocal(slug);
						setZone(slug);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-16 font-display text-3xl text-maroon mb-6",
					children: "Coverage matrix"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoneTable, {})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtaBand, { title: "Check your site with us" })
	] });
}
//#endregion
export { ZonesPage as component };
