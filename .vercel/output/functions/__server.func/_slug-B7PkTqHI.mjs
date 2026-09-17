import { i as __toESM } from "./_runtime.mjs";
import { a as PROJECTS, l as ZONES } from "./_ssr/site-CZI1B5CN.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { O as ChevronRight, k as ChevronLeft, t as X } from "./_libs/lucide-react.mjs";
import { i as Route$8, l as Button } from "./_ssr/router-cfT7QsAO.mjs";
import { t as CtaBand } from "./_ssr/page-hero-BFeZQGDD.mjs";
import { t as Badge } from "./_ssr/badge-CIjbLax0.mjs";
import { t as ProjectCard } from "./_ssr/project-card-D4mUX2CC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-B7PkTqHI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Lightbox({ images, index, onClose, onIndex }) {
	const current = images[index];
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
			if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
		}
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [
		index,
		images.length,
		onClose,
		onIndex
	]);
	if (!current) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 bg-maroon/95 flex flex-col",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Image viewer",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 h-14 text-paper",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[11px] uppercase tracking-[0.16em] text-gold",
					children: [
						index + 1,
						" / ",
						images.length
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "size-11 inline-flex items-center justify-center",
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-6" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 flex items-center justify-center px-4 pb-8 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "hidden sm:inline-flex size-12 items-center justify-center text-paper",
						onClick: () => onIndex((index - 1 + images.length) % images.length),
						"aria-label": "Previous",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-8" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: current.src,
						alt: current.alt,
						className: "max-h-[78vh] max-w-full object-contain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "hidden sm:inline-flex size-12 items-center justify-center text-paper",
						onClick: () => onIndex((index + 1) % images.length),
						"aria-label": "Next",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-8" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-6 pb-6 text-center text-sm text-paper/70",
				children: current.alt
			})
		]
	});
}
function ProjectDetail() {
	const { project } = Route$8.useLoaderData();
	const zone = ZONES.find((z) => z.slug === project.zone);
	const related = PROJECTS.filter((p) => p.slug !== project.slug && (p.zone === project.zone || p.type === project.type)).slice(0, 3);
	const [open, setOpen] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative min-h-[70vh] flex items-end text-paper",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: project.image,
					alt: project.name,
					className: "absolute inset-0 w-full h-full object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-maroon via-maroon/50 to-maroon/20" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto max-w-7xl px-4 sm:px-6 w-full pb-12 pt-32",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] uppercase tracking-[0.18em] text-gold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/projects",
									className: "hover:text-paper",
									children: "Work"
								}),
								" / ",
								project.location
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: project.status === "Ongoing" ? "live" : "paper",
									children: project.status
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "gold",
									children: project.type
								}),
								zone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "paper",
									children: zone.name
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 font-display text-5xl md:text-7xl text-paper max-w-4xl",
							children: project.name
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 py-16 grid lg:grid-cols-12 gap-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "grid grid-cols-2 gap-6 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Location",
							value: project.location
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Year",
							value: project.year
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Area",
							value: project.area
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Duration",
							value: project.duration
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Scope",
							value: project.scope
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							label: "Status",
							value: project.status
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-12 space-y-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
							title: "Challenge",
							body: project.challenge
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
							title: "ATRO’s role",
							body: project.role
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
							title: "Solution",
							body: project.solution
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "lg:col-span-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.16em] text-muted",
						children: "Gallery"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid grid-cols-2 gap-3",
						children: project.gallery.map((g, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setOpen(i),
							className: "aspect-[4/3] overflow-hidden bg-stone",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: g.src,
								alt: g.alt,
								className: "w-full h-full object-cover"
							})
						}, g.src + i))
					}),
					project.timeline ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] uppercase tracking-[0.16em] text-gold",
							children: "Living timeline"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-4 space-y-4",
							children: project.timeline.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "border border-line p-4 bg-cream rounded-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] uppercase tracking-[0.16em] text-muted",
										children: t.date
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-xl text-maroon mt-1",
										children: t.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-ink/75 mt-1",
										children: t.caption
									})
								]
							}, t.date))
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "mt-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/start",
							children: "Discuss a project like this"
						})
					})
				]
			})]
		}),
		related.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 pb-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl text-maroon mb-8",
				children: "Related work"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid sm:grid-cols-3 gap-6",
				children: related.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectCard, { project: p }, p.slug))
			})]
		}) : null,
		open !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbox, {
			images: project.gallery,
			index: open,
			onClose: () => setOpen(null),
			onIndex: setOpen
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CtaBand, {})
	] });
}
function Item({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-[11px] uppercase tracking-[0.16em] text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-1 text-ink",
		children: value
	})] });
}
function Block({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-display text-2xl text-maroon",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-ink/80",
		children: body
	})] });
}
//#endregion
export { ProjectDetail as component };
