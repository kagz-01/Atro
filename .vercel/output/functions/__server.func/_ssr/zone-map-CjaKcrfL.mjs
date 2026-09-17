import { i as __toESM } from "../_runtime.mjs";
import { l as ZONES } from "./site-CZI1B5CN.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-DgjzUpi5.mjs";
import { D as CircleAlert, E as CircleCheckBig, L as ArrowLeft, r as Users, w as Clock } from "../_libs/lucide-react.mjs";
import { l as Button } from "./router-cfT7QsAO.mjs";
import { t as Badge } from "./badge-CIjbLax0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/zone-map-CjaKcrfL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_CONFIG = {
	active: {
		icon: CircleCheckBig,
		color: "text-green-600",
		label: "Active delivery"
	},
	limited: {
		icon: Clock,
		color: "text-amber-600",
		label: "Limited availability"
	},
	request: {
		icon: CircleAlert,
		color: "text-orange-600",
		label: "By request"
	},
	diaspora: {
		icon: Users,
		color: "text-burgundy",
		label: "Remote-first"
	}
};
function ZoneMap({ compact = false }) {
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [hovered, setHovered] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("grid gap-8", compact ? "lg:grid-cols-2" : "lg:grid-cols-12"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn(compact ? "order-2" : "lg:col-span-7"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative bg-cream border border-line rounded-md p-6 overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 100 100",
					className: "w-full h-auto max-h-[500px]",
					"aria-label": "Interactive map of Kenya showing ATRO coverage zones",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M30,15 L50,10 L70,15 L85,25 L90,40 L85,55 L80,65 L75,80 L65,90 L50,95 L35,90 L25,80 L20,65 L15,50 L20,35 L25,25 Z",
						className: "fill-stone/30 stroke-line stroke-1"
					}), ZONES.map((zone) => {
						STATUS_CONFIG[zone.status];
						const isActive = selected?.slug === zone.slug || hovered === zone.slug;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							className: "cursor-pointer",
							onMouseEnter: () => setHovered(zone.slug),
							onMouseLeave: () => setHovered(null),
							onClick: () => setSelected(zone),
							children: [
								zone.status === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: zone.cx,
									cy: zone.cy,
									r: isActive ? 6 : 4,
									className: "fill-green-500/20 animate-pulse"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: zone.cx,
									cy: zone.cy,
									r: isActive ? 4 : 3,
									className: cn("transition-all duration-200", zone.status === "active" && "fill-green-500", zone.status === "limited" && "fill-amber-500", zone.status === "request" && "fill-orange-500", zone.status === "diaspora" && "fill-burgundy")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
									x: zone.cx,
									y: zone.cy - 6,
									textAnchor: "middle",
									className: cn("text-[4px] font-medium fill-ink transition-opacity", isActive ? "opacity-100" : "opacity-70"),
									children: zone.name
								})
							]
						}, zone.slug);
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.12em]",
					children: Object.entries(STATUS_CONFIG).map(([status, config]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("size-2 rounded-full", config.color.replace("text-", "bg-")) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: config.label
						})]
					}, status))
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn(compact ? "order-1" : "lg:col-span-5"),
			children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoneDetail, {
				zone: selected,
				onBack: () => setSelected(null)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoneList, {
				zones: ZONES,
				onSelect: setSelected
			})
		})]
	});
}
function ZoneList({ zones, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-2xl text-maroon mb-4",
				children: "Where we build"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ink/70 mb-6",
				children: "Tap a county to see coverage, logistics and FAQs."
			}),
			zones.map((zone) => {
				const config = STATUS_CONFIG[zone.status];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onSelect(zone),
					className: "w-full text-left p-4 border border-line rounded-sm hover:border-burgundy bg-paper transition-colors",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(config.icon, { className: cn("size-4", config.color) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium text-maroon",
								children: zone.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: zone.region
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: zone.status === "active" ? "gold" : "maroon",
							children: zone.coverage
						})]
					})
				}, zone.slug);
			})
		]
	});
}
function ZoneDetail({ zone, onBack }) {
	const config = STATUS_CONFIG[zone.status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-paper border border-line rounded-md p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onBack,
				className: "text-[11px] uppercase tracking-[0.14em] text-burgundy hover:text-maroon mb-4",
				children: "← All zones"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(config.icon, { className: cn("size-5", config.color) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-2xl text-maroon",
					children: zone.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: zone.region
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: "gold",
				children: zone.coverage
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-ink/80",
				children: zone.summary
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] uppercase tracking-[0.14em] text-muted",
					children: "Typical projects"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-ink/80",
					children: zone.typical
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] uppercase tracking-[0.14em] text-muted",
					children: "Logistics"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-ink/80",
					children: zone.logistics
				})] })]
			}),
			zone.faqs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 pt-6 border-t border-line",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] uppercase tracking-[0.14em] text-muted mb-3",
					children: "Common questions"
				}), zone.faqs.map((faq, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 last:mb-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium text-sm text-maroon",
						children: faq.q
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-ink/70",
						children: faq.a
					})]
				}, i))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/zones/$slug",
						params: { slug: zone.slug },
						children: "Full zone page"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/start",
						children: "Start a project here"
					})
				})]
			})
		]
	});
}
function ZoneMapPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "pt-32 pb-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/tools",
					className: "inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-burgundy hover:text-maroon mb-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), "All tools"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-2xl mb-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "maroon",
							className: "mb-4",
							children: "Zone Map"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl md:text-5xl text-maroon",
							children: "Do we build where you are?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 text-ink/70 text-lg",
							children: "ATRO publishes coverage honestly. Tap a county to see availability, logistics and answers to the questions that matter."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoneMap, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-16 p-8 md:p-12 bg-maroon text-paper rounded-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-3xl text-paper",
								children: "Not sure about your zone?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-paper/70",
								children: "Tell us where your plot is. We will tell you whether we can serve it — before you write a long brief."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/start",
								className: "mt-6 inline-flex h-12 px-6 items-center bg-gold text-maroon text-[12px] uppercase tracking-[0.16em] font-medium rounded-xs hover:bg-gold-light",
								children: "Enquire now"
							})
						]
					})
				})
			]
		})
	});
}
//#endregion
export { ZoneMapPage as component };
