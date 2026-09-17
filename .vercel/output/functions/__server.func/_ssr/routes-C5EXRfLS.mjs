import { i as __toESM } from "../_runtime.mjs";
import { c as WHY, d as featuredProjects, i as PROCESS_STEPS, l as ZONES, n as COMPANY } from "./site-CZI1B5CN.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-DgjzUpi5.mjs";
import { C as Eye, F as ArrowUpRight, I as ArrowRight, _ as MapPin, s as Shield, w as Clock } from "../_libs/lucide-react.mjs";
import { l as Button, o as useSiteStore } from "./router-cfT7QsAO.mjs";
import { t as CtaBand } from "./page-hero-BFeZQGDD.mjs";
import { t as Badge } from "./badge-CIjbLax0.mjs";
import { t as ProjectCard } from "./project-card-D4mUX2CC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C5EXRfLS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useRevealOnScroll(threshold = .15) {
	const ref = (0, import_react.useRef)(null);
	const [revealed, setRevealed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				setRevealed(true);
				observer.disconnect();
			}
		}, { threshold });
		observer.observe(el);
		return () => observer.disconnect();
	}, [threshold]);
	return {
		ref,
		revealed
	};
}
function useParallax(speed = .5) {
	const ref = (0, import_react.useRef)(null);
	const [offset, setOffset] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const onScroll = () => {
			if (!ref.current) return;
			const rect = ref.current.getBoundingClientRect();
			const scrolled = window.innerHeight - rect.top;
			setOffset(scrolled * speed);
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener("scroll", onScroll);
	}, [speed]);
	return {
		ref,
		offset
	};
}
function Marquee({ children, speed = 40, className, pauseOnHover = true, direction = "left" }) {
	const containerRef = (0, import_react.useRef)(null);
	const contentRef = (0, import_react.useRef)(null);
	const [contentWidth, setContentWidth] = (0, import_react.useState)(0);
	const [isPaused, setIsPaused] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!contentRef.current) return;
		const observer = new ResizeObserver(() => {
			if (contentRef.current) setContentWidth(contentRef.current.offsetWidth / 2);
		});
		observer.observe(contentRef.current);
		return () => observer.disconnect();
	}, []);
	const duration = contentWidth / speed;
	const dir = direction === "left" ? "normal" : "reverse";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: containerRef,
		className: cn("overflow-hidden", className),
		onMouseEnter: () => pauseOnHover && setIsPaused(true),
		onMouseLeave: () => pauseOnHover && setIsPaused(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: contentRef,
			className: "flex w-max",
			style: {
				animation: `${duration}s linear infinite ${dir} marquee`,
				animationPlayState: isPaused ? "paused" : "running"
			},
			children: [children, children]
		})
	});
}
function TestimonialMarquee() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-paper to-transparent z-10 pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-paper to-transparent z-10 pointer-events-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marquee, {
				speed: 30,
				pauseOnHover: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-6 px-3",
					children: [
						{
							quote: "ATRO turned our half-finished house into a home we are proud of. The quantities saved us from overspending.",
							author: "Wanjiku M.",
							role: "Homeowner, Kiambu"
						},
						{
							quote: "Working with them from London was seamless. Weekly photo updates, honest timelines, no surprises.",
							author: "David K.",
							role: "Diaspora Client, UK"
						},
						{
							quote: "The design studio understood our budget constraints and still delivered something beautiful.",
							author: "Sarah N.",
							role: "Architect, Nairobi"
						},
						{
							quote: "Professional, transparent, and they actually finish on time. Rare in this industry.",
							author: "James O.",
							role: "Developer, Mombasa"
						},
						{
							quote: "From concept to handover, every step was documented. No hidden costs, no drama.",
							author: "Grace W.",
							role: "Homeowner, Karen"
						},
						{
							quote: "They redesigned our office space and the team productivity actually improved. Form meeting function.",
							author: "Peter M.",
							role: "CEO, Tech Startup"
						}
					].map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-[350px] shrink-0 p-6 bg-cream border border-line/50 rounded-2xl hover:shadow-card transition-all duration-300",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-1 mb-3",
								children: [...Array(5)].map((_, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									className: "size-4 text-gold fill-current",
									viewBox: "0 0 20 20",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" })
								}, j))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-ink/80 italic leading-relaxed",
								children: [
									"\"",
									t.quote,
									"\""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 pt-4 border-t border-line/50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-maroon text-sm",
									children: t.author
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: t.role
								})]
							})
						]
					}, i))
				})
			})
		]
	});
}
function LogoMarquee() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marquee, {
		speed: 20,
		pauseOnHover: false,
		className: "py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-12 px-6",
			children: [
				{
					name: "Nairobi County",
					icon: "🏛️"
				},
				{
					name: "KEBS Certified",
					icon: "✅"
				},
				{
					name: "Architects Assoc.",
					icon: "📐"
				},
				{
					name: "Green Building",
					icon: "🌿"
				},
				{
					name: "Quality Assured",
					icon: "⭐"
				},
				{
					name: "Safety First",
					icon: "🛡️"
				}
			].map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 text-muted/60 hover:text-maroon transition-colors duration-300",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-2xl",
					children: l.icon
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] uppercase tracking-[0.16em] font-medium whitespace-nowrap",
					children: l.name
				})]
			}, i))
		})
	});
}
function ScrollRevealText({ children, className, delay = 0 }) {
	const ref = (0, import_react.useRef)(null);
	const [visible, setVisible] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				setTimeout(() => setVisible(true), delay);
				observer.disconnect();
			}
		}, { threshold: .3 });
		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, [delay]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: cn("transition-all duration-1000 ease-out", visible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-8 blur-[2px]", className),
		children
	});
}
function SplitText({ text, className, tag: Tag = "h2", delay = 0, staggerDelay = 30 }) {
	const ref = (0, import_react.useRef)(null);
	const [visible, setVisible] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				setTimeout(() => setVisible(true), delay);
				observer.disconnect();
			}
		}, { threshold: .3 });
		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, [delay]);
	const words = text.split(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
		className: cn("overflow-hidden", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref,
			className: "flex flex-wrap",
			children: words.map((word, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-block mr-[0.3em]",
				style: {
					transition: `opacity 600ms ease ${i * staggerDelay}ms, transform 600ms ease ${i * staggerDelay}ms`,
					opacity: visible ? 1 : 0,
					transform: visible ? "translateY(0)" : "translateY(100%)"
				},
				children: word
			}, i))
		})
	});
}
function FloatingElement({ children, className, speed = 2, range = 20 }) {
	const [offset, setOffset] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		let frame;
		const animate = () => {
			setOffset(Math.sin(Date.now() / 1e3 / speed) * range);
			frame = requestAnimationFrame(animate);
		};
		frame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(frame);
	}, [speed, range]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("pointer-events-none", className),
		style: { transform: `translateY(${offset}px)` },
		children
	});
}
function Home() {
	const diaspora = useSiteStore((s) => s.diasporaMode);
	const featured = featuredProjects();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
		diaspora ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiasporaBanner, {}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Problem, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Solution, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Proof, { projects: featured }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Process, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Social, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Testimonials, {}),
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
	const { ref: parallaxRef, offset } = useParallax(.3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		ref: parallaxRef,
		className: "relative min-h-[85svh] md:min-h-[90svh] flex items-center overflow-hidden bg-maroon",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-burgundy via-maroon to-[#1a0204]",
				style: { transform: `translateY(${offset * .5}px)` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 overflow-hidden pointer-events-none",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingElement, {
						speed: 3,
						range: 30,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-32 -left-32 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[140px] animate-[pulse-soft_4s_ease-in-out_infinite]" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingElement, {
						speed: 4,
						range: 20,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-0 right-0 w-[400px] h-[400px] bg-burgundy/30 rounded-full blur-[120px] animate-[pulse-soft_4s_ease-in-out_infinite_1s]" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingElement, {
						speed: 5,
						range: 15,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[100px] animate-[pulse-soft_4s_ease-in-out_infinite_2s]" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/images/hero.webp",
				alt: "",
				className: "absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay",
				style: { transform: `translateY(${offset * .8}px) scale(1.1)` },
				fetchPriority: "high"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16 py-20 md:py-28 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-3xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "reveal inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 mb-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-2 rounded-full bg-gold animate-[pulse-soft_2s_ease-in-out_infinite]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] uppercase tracking-[0.2em] text-white/80",
								children: "Nairobi · Design · Construction · Consultancy"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitText, {
							text: "Designing & building better structures.",
							tag: "h1",
							className: "font-display font-bold text-white text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight",
							delay: 200,
							staggerDelay: 50
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollRevealText, {
							delay: 800,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-8 max-w-xl text-lg text-white/70 leading-relaxed",
								children: COMPANY.lede
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollRevealText, {
							delay: 1e3,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-10 flex flex-wrap gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/start",
									className: "group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold to-gold-light text-maroon font-bold text-lg rounded-2xl shadow-glow-gold btn-lift overflow-hidden",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "relative z-10",
											children: "Start a project"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-5 relative z-10 group-hover:translate-x-1 transition-transform" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/projects",
									className: "inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl text-lg hover:bg-white/15 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-lift transition-all duration-300",
									children: "View our work"
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollRevealText, {
							delay: 1200,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-12 flex flex-wrap items-center gap-6 text-sm text-white/50",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-1.5 rounded-full bg-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "85+ projects" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-1.5 rounded-full bg-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "7 zones" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-1.5 rounded-full bg-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Since 2018" })]
									})
								]
							})
						})
					]
				})
			})
		]
	});
}
function Problem() {
	const { ref, revealed } = useRevealOnScroll();
	const problems = [
		{
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-5" }),
			title: "No visibility",
			desc: "Clients cannot see what is happening on their site. Progress equals WhatsApp photos with no context."
		},
		{
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-5" }),
			title: "No accountability",
			desc: "Quotes are verbal. Changes are assumed. The final bill is a surprise nobody can argue with."
		},
		{
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-5" }),
			title: "No honest coverage",
			desc: "Firms claim nationwide delivery but only show up in Nairobi. Diaspora clients find out too late."
		},
		{
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-5" }),
			title: "No timeline",
			desc: "Projects drift. Decisions evaporate. Almost finished can mean six more months."
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-24 md:py-32",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref,
				className: cn("reveal-on-scroll", revealed && "revealed"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "maroon",
						className: "mb-4",
						children: "The problem"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitText, {
						text: "Kenyan construction is built on trust that never gets tested.",
						tag: "h2",
						className: "font-display text-4xl md:text-5xl text-maroon max-w-3xl",
						delay: 100
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-ink/70 text-lg max-w-2xl",
						children: "Until it does. Then everyone discovers the drawings were suggestions, the quote was a wish, and the timeline was fiction."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger",
				children: problems.map((p, i) => {
					const { ref: cardRef, revealed: cardRevealed } = useRevealOnScroll();
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: cardRef,
						className: cn("reveal-on-scroll p-6 bg-cream border border-line rounded-2xl card-lift hover:shadow-card-hover transition-all duration-300", cardRevealed && "revealed"),
						style: { transitionDelay: `${i * 80}ms` },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-12 rounded-xl bg-maroon/10 flex items-center justify-center text-burgundy mb-4",
								children: p.icon
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-xl text-maroon",
								children: p.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-ink/70",
								children: p.desc
							})
						]
					}, p.title);
				})
			})]
		})
	});
}
function Solution() {
	const { ref, revealed } = useRevealOnScroll();
	const { ref: parallaxRef, offset } = useParallax(.1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		ref: parallaxRef,
		className: "relative py-24 md:py-32 overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 bg-maroon",
				style: { transform: `translateY(${offset * .3}px)` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-burgundy/50 via-maroon to-maroon" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatingElement, {
				speed: 4,
				range: 25,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[200px] pointer-events-none" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref,
					className: cn("reveal-on-scroll", revealed && "revealed"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "gold",
							className: "mb-4",
							children: "How we work"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitText, {
							text: "Three principles. No slogans.",
							tag: "h2",
							className: "font-display text-4xl md:text-5xl text-paper max-w-3xl",
							delay: 100
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 text-paper/70 text-lg max-w-2xl",
							children: "ATRO is not a directory of contractors. We design, we quantity, we build. One team, one responsibility."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-16 grid lg:grid-cols-3 gap-6",
					children: [
						{
							number: "01",
							title: "Design + Build, one team",
							desc: "The architect and the contractor are the same people. The drawing does not get thrown over a wall. A beautiful wall is also a buildable one.",
							link: "/services"
						},
						{
							number: "02",
							title: "Quantities before construction",
							desc: "Every project starts with a Bill of Quantities. You see the cost before you fall in love with a stair the budget cannot carry.",
							link: "/tools/cost-calculator"
						},
						{
							number: "03",
							title: "Visible project management",
							desc: "Photo timelines, written decisions, weekly updates. You know the status without chasing a voice note.",
							link: "/tools/live-tracker"
						}
					].map((p, i) => {
						const { ref: cardRef, revealed: cardRevealed } = useRevealOnScroll();
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: cardRef,
							className: cn("reveal-on-scroll", cardRevealed && "revealed"),
							style: { transitionDelay: `${i * 100}ms` },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: p.link,
								className: "group block p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-gold/30 hover:bg-white/10 hover:shadow-[0_20px_60px_rgba(201,146,79,0.12)] card-lift transition-all duration-300 h-full",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gradient-gold font-display text-3xl font-bold",
										children: p.number
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-4 font-display text-2xl text-paper group-hover:text-gold transition-colors duration-300",
										children: p.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-paper/70 leading-relaxed",
										children: p.desc
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-6 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-gold",
										children: ["Learn more ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 group-hover:translate-x-1 transition-transform" })]
									})
								]
							})
						}, p.number);
					})
				})]
			})
		]
	});
}
function Proof({ projects }) {
	const { ref, revealed } = useRevealOnScroll();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-24 md:py-32",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref,
					className: cn("reveal-on-scroll flex items-end justify-between gap-6 mb-12", revealed && "revealed"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "maroon",
						className: "mb-4",
						children: "Our work"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitText, {
						text: "Evidence, not slogans.",
						tag: "h2",
						className: "font-display text-4xl md:text-5xl text-maroon",
						delay: 100
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/projects",
						className: "hidden sm:inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-burgundy hover:text-maroon underline-animate",
						children: ["All projects ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger",
					children: projects.slice(0, 3).map((p, i) => {
						const { ref: cardRef, revealed: cardRevealed } = useRevealOnScroll();
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: cardRef,
							className: cn("reveal-on-scroll", cardRevealed && "revealed"),
							style: { transitionDelay: `${i * 100}ms` },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectCard, { project: p })
						}, p.slug);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 text-center sm:text-left",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						className: "rounded-2xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/projects",
							children: ["View all projects", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
						})
					})
				})
			]
		})
	});
}
function Process() {
	const { ref, revealed } = useRevealOnScroll();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-24 md:py-32 bg-gradient-to-b from-stone/60 to-paper",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-12 gap-12 items-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref,
					className: cn("lg:col-span-4 reveal-on-scroll", revealed && "revealed"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "maroon",
							className: "mb-4",
							children: "Process"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitText, {
							text: "Eight steps. None of them are we will see.",
							tag: "h2",
							className: "font-display text-4xl md:text-5xl text-maroon",
							delay: 100
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 text-ink/70",
							children: "From first conversation to handover — a defined process that keeps decisions on paper and money in check."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-8 rounded-2xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/process",
								children: ["Full process", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-8 grid sm:grid-cols-2 gap-4 stagger",
					children: PROCESS_STEPS.slice(0, 4).map((s, i) => {
						const { ref: cardRef, revealed: cardRevealed } = useRevealOnScroll();
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							ref: cardRef,
							className: cn("reveal-on-scroll p-6 bg-paper border border-line rounded-2xl card-lift hover:shadow-card transition-all duration-300", cardRevealed && "revealed"),
							style: { transitionDelay: `${i * 80}ms` },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-gradient-gold font-display text-2xl font-bold",
									children: s.n
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-2 font-display text-lg text-maroon",
									children: s.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-ink/70 line-clamp-2",
									children: s.body
								})
							]
						}, s.n);
					})
				})]
			})
		})
	});
}
function Social() {
	const { ref, revealed } = useRevealOnScroll();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-24 md:py-32",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref,
				className: cn("reveal-on-scroll text-center max-w-3xl mx-auto", revealed && "revealed"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "maroon",
					className: "mb-4",
					children: "Why ATRO"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitText, {
					text: "Integrated thinking. Then the unglamorous work of making it stand up.",
					tag: "h2",
					className: "font-display text-4xl md:text-5xl text-maroon",
					delay: 100
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger",
				children: WHY.map((w, i) => {
					const { ref: cardRef, revealed: cardRevealed } = useRevealOnScroll();
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollRevealText, {
						delay: i * 100,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: cn("p-8 bg-cream border border-line rounded-2xl card-lift hover:shadow-card transition-all duration-300 h-full"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-xl text-maroon",
								children: w.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-ink/70",
								children: w.body
							})]
						})
					}, w.title);
				})
			})]
		})
	});
}
function Testimonials() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "py-16 overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16 mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "gold",
					className: "mb-4",
					children: "What clients say"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl md:text-4xl text-maroon",
					children: "Trusted by homeowners across Kenya"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TestimonialMarquee, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMarquee, {})
			})
		]
	});
}
function DiasporaBanner() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "bg-gradient-to-r from-gold to-gold-light text-maroon",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16 py-3 text-sm flex flex-col sm:flex-row sm:items-center gap-2 justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Diaspora mode is on. Contact, timelines and proof of progress are set up for clients who are not on the site." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/zones/$slug",
				params: { slug: "diaspora" },
				className: "uppercase tracking-[0.14em] text-[11px] font-medium underline-animate",
				children: "How we run remote projects →"
			})]
		})
	});
}
//#endregion
export { Home as component };
