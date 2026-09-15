import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as formatKes } from "./utils-DgjzUpi5.mjs";
import { l as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { _ as WHY, d as COMPANY, f as PROCESS_STEPS, h as TRUST_POINTS, l as Button, m as SERVICES, o as useSiteStore, u as ARTICLES, v as ZONES, y as featuredProjects } from "./router-BjG7hAyI.mjs";
import { t as CtaBand } from "./page-hero-BQSa4Z8Q.mjs";
import { n as ProjectCard, t as Badge } from "./project-card-BrI84kSF.mjs";
import { a as estimateCost, n as FINISHES, r as PROJECT_TYPES } from "./cost-Vx5HAJni.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dl3Ljlkp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const diaspora = useSiteStore((s) => s.diasporaMode);
	const featured = featuredProjects();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustStrip, {}),
		diaspora ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiasporaBanner, {}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProblemAndZone, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkPreview, { projects: featured }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CostTeaser, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Why, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProcessPreview, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServicesPreview, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsPreview, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtaBand, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
			type: "application/ld+json",
			dangerouslySetInnerHTML: { __html: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "GeneralContractor",
				name: COMPANY.name,
				url: "https://atro.ke",
				email: COMPANY.email,
				telephone: COMPANY.phoneTel,
				address: {
					"@type": "PostalAddress",
					addressLocality: "Nairobi",
					addressCountry: "KE"
				},
				areaServed: ZONES.map((z) => z.name),
				description: COMPANY.lede
			}) }
		})
	] });
}
function Hero() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative min-h-[100svh] flex items-end text-paper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/images/hero.webp",
				alt: "Contemporary Kenyan courtyard house at dusk",
				className: "absolute inset-0 w-full h-full object-cover",
				fetchPriority: "high"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-maroon via-maroon/55 to-maroon/25" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto max-w-7xl px-4 sm:px-6 w-full pb-16 md:pb-24 pt-32",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "reveal text-[11px] uppercase tracking-[0.22em] text-gold",
						children: "Kenya · Design · Construction · Consultancy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "reveal reveal-delay-1 mt-5 font-display text-5xl sm:text-6xl md:text-8xl text-paper max-w-5xl",
						children: [
							"Designing & building",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
								className: "italic font-medium",
								children: "better structures."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "reveal reveal-delay-2 mt-6 max-w-xl text-lg text-paper/80",
						children: COMPANY.lede
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "reveal reveal-delay-3 mt-8 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "gold",
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/start",
								children: "Start a project"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "line",
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/projects",
								children: "View our work"
							})
						})]
					})
				]
			})
		]
	});
}
function TrustStrip() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "bg-maroon text-paper border-t border-gold/20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-5 gap-6",
			children: TRUST_POINTS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.16em] text-gold",
				children: t.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-paper/75",
				children: t.body
			})] }, t.title))
		})
	});
}
function DiasporaBanner() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "bg-gold text-maroon",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 py-3 text-sm flex flex-col sm:flex-row sm:items-center gap-2 justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Diaspora mode is on. Contact, timelines and proof of progress are set up for clients who are not on the site." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/zones/$slug",
				params: { slug: "diaspora" },
				className: "uppercase tracking-[0.14em] text-[11px] font-medium",
				children: "How we run remote projects →"
			})]
		})
	});
}
function ProblemAndZone() {
	const setZone = useSiteStore((s) => s.setSelectedZone);
	const selected = useSiteStore((s) => s.selectedZone);
	const [query, setQuery] = (0, import_react.useState)("");
	const match = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q && selected) return ZONES.find((z) => z.slug === selected);
		if (!q) return null;
		return ZONES.find((z) => z.name.toLowerCase().includes(q) || z.region.toLowerCase().includes(q) || z.slug.includes(q));
	}, [query, selected]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-20 md:py-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-12 gap-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.2em] text-gold",
						children: "The gap"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-display text-4xl md:text-5xl",
						children: "Most Kenyan construction sites do not tell you where they actually build."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-ink/75",
						children: "Buyers — and especially diaspora clients — cannot tell if a firm will show up in Kiambu, or only keep a Nairobi phone number. ATRO publishes coverage, then routes the enquiry."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-7 border border-line bg-cream p-6 md:p-8 rounded-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.16em] text-muted",
						children: "Zone intelligence"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-3xl text-maroon mt-2",
						children: "Do we build where you are?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] uppercase tracking-[0.16em] text-muted",
							children: "County, town, or “diaspora”"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Kiambu, Nyali, Nakuru…",
							className: "mt-2 w-full h-12 border border-line bg-paper px-3 rounded-sm outline-none focus:border-burgundy"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: ZONES.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setQuery(z.name);
								setZone(z.slug);
							},
							className: "h-9 px-3 text-[11px] uppercase tracking-[0.12em] border border-line rounded-xs hover:border-burgundy",
							children: z.name
						}, z.slug))
					}),
					match ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 pt-6 border-t border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "gold",
									children: match.coverage
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-2xl text-maroon",
									children: match.name
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-ink/75",
								children: match.summary
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex flex-wrap gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									size: "sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/zones/$slug",
										params: { slug: match.slug },
										children: "Zone page"
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
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-sm text-muted",
						children: "Type a place. If we are not there yet, the enquiry form will say so before you write a novel."
					})
				]
			})]
		})
	});
}
function WorkPreview({ projects }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "pb-20 md:pb-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-6 mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.2em] text-gold",
					children: "Work"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-4xl md:text-5xl",
					children: "Evidence, not slogans."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/projects",
					className: "hidden sm:inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-burgundy",
					children: ["All projects ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-6",
				children: projects.slice(0, 6).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectCard, { project: p }, p.slug))
			})]
		})
	});
}
function CostTeaser() {
	const zone = useSiteStore((s) => s.selectedZone) ?? "nairobi";
	const [type, setType] = (0, import_react.useState)("Residential");
	const [finish, setFinish] = (0, import_react.useState)("standard");
	const [sqm, setSqm] = (0, import_react.useState)(220);
	const result = estimateCost({
		type,
		zone,
		sqm,
		finish
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "bg-stone/70 py-20 md:py-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.2em] text-gold",
						children: "Cost range"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-display text-4xl md:text-5xl",
						children: "A number you can argue with — not a quote."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-ink/75",
						children: "Three questions. An indicative band. Then a person. We would rather show you the arithmetic than hide it behind “it depends.”"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-7 bg-cream border border-line p-6 md:p-8 rounded-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid sm:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] uppercase tracking-[0.16em] text-muted",
							children: "Type"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "mt-2 w-full h-12 border border-line bg-paper px-3 rounded-sm",
							value: type,
							onChange: (e) => setType(e.target.value),
							children: PROJECT_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: t }, t))
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] uppercase tracking-[0.16em] text-muted",
							children: "Finish"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "mt-2 w-full h-12 border border-line bg-paper px-3 rounded-sm",
							value: finish,
							onChange: (e) => setFinish(e.target.value),
							children: FINISHES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: f.id,
								children: f.label
							}, f.id))
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[11px] uppercase tracking-[0.16em] text-muted",
							children: [
								"Area · ",
								sqm,
								" m² · ",
								ZONES.find((z) => z.slug === zone)?.name
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 80,
							max: 600,
							step: 10,
							value: sqm,
							onChange: (e) => setSqm(Number(e.target.value)),
							className: "mt-3 w-full accent-burgundy",
							suppressHydrationWarning: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 bg-maroon text-paper p-6 rounded-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-[0.18em] text-gold",
								children: "Indicative"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-4xl mt-2 tabular-nums",
								children: result.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-paper/70 mt-2",
								children: [
									"Midpoint about ",
									formatKes(result.perSqm),
									" / m². Not a quotation."
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "mt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/start",
							children: "Turn this into an enquiry"
						})
					})
				]
			})]
		})
	});
}
function Why() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-20 md:py-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.2em] text-gold",
					children: "Why ATRO"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-display text-4xl md:text-5xl max-w-3xl",
					children: "Integrated thinking. Then the unglamorous work of making it stand up."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line",
					children: WHY.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "bg-paper p-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-2xl text-maroon",
							children: w.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-ink/75",
							children: w.body
						})]
					}, w.title))
				})
			]
		})
	});
}
function ProcessPreview() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "bg-maroon text-paper py-20 md:py-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.2em] text-gold",
					children: "Process"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-display text-4xl md:text-5xl text-paper",
					children: "Eight steps. None of them are “we will see.”"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/process",
					className: "hidden sm:inline-flex text-[12px] uppercase tracking-[0.16em] text-gold",
					children: "Full journey →"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8",
				children: PROCESS_STEPS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-gold font-display text-3xl",
						children: s.n
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-2 font-display text-2xl text-paper",
						children: s.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-paper/70",
						children: s.body
					})
				] }, s.n))
			})]
		})
	});
}
function ServicesPreview() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-20 md:py-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.2em] text-gold",
					children: "Services"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-display text-4xl md:text-5xl",
					children: "What we actually deliver."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4",
					children: SERVICES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/services/$slug",
						params: { slug: s.slug },
						className: "group border border-line p-6 rounded-sm hover:border-burgundy bg-cream",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-[0.16em] text-muted",
								children: s.kicker
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-2 font-display text-2xl text-maroon group-hover:text-burgundy",
								children: s.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-ink/70 line-clamp-3",
								children: s.lede
							})
						]
					}, s.slug))
				})
			]
		})
	});
}
function InsightsPreview() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "pb-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.2em] text-gold",
					children: "Insights"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-4xl",
					children: "Notes from the site, not from a brochure."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/insights",
					className: "hidden sm:inline-flex text-[12px] uppercase tracking-[0.16em] text-burgundy",
					children: "All notes →"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid md:grid-cols-3 gap-6",
				children: ARTICLES.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/insights/$slug",
					params: { slug: a.slug },
					className: "group",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "aspect-[16/10] overflow-hidden bg-stone",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: a.image,
								alt: "",
								className: "w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500",
								loading: "lazy"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-[11px] uppercase tracking-[0.16em] text-muted",
							children: [
								a.kicker,
								" · ",
								a.read
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-2 font-display text-2xl text-maroon group-hover:text-burgundy",
							children: a.title
						})
					]
				}, a.slug))
			})]
		})
	});
}
//#endregion
export { Home as component };
