import { i as __toESM } from "../_runtime.mjs";
import { l as ZONES, n as COMPANY } from "./site-CZI1B5CN.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as formatKes, t as cn } from "./utils-DgjzUpi5.mjs";
import { I as ArrowRight, L as ArrowLeft, N as Building2, S as FileText, T as CircleCheck, _ as MapPin, d as Phone, f as Paintbrush, i as User, j as Calendar, l as Ruler, m as MessageCircle, v as Mail, x as House, y as Landmark } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as whatsappHref, l as Button, o as useSiteStore, s as defaultWhatsappText } from "./router-cfT7QsAO.mjs";
import { t as Badge } from "./badge-CIjbLax0.mjs";
import { a as estimateCost, i as STAGES, n as FINISHES, r as PROJECT_TYPES, t as COST_CAVEAT } from "./cost-CUElgdAu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/start-Br1RtTu_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("block text-[11px] uppercase tracking-[0.16em] text-muted mb-2 font-medium", className),
		...props
	});
}
var fieldClass = "w-full h-12 bg-cream border border-line px-3 text-ink rounded-sm outline-none transition-colors duration-150 placeholder:text-muted/80 focus:border-burgundy";
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn(fieldClass, className),
		...props
	});
}
function Select({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn(fieldClass, className),
		...props,
		children
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn(fieldClass, "h-auto min-h-32 py-3 resize-y", className),
		...props
	});
}
var KEY = "atro.enquiries";
function saveEnquiry(partial) {
	const row = {
		...partial,
		id: crypto.randomUUID(),
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	const prev = listEnquiries();
	localStorage.setItem(KEY, JSON.stringify([row, ...prev].slice(0, 40)));
	return row;
}
function listEnquiries() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
var STEPS = [
	{
		id: "type",
		label: "Type",
		icon: Building2
	},
	{
		id: "place",
		label: "Place",
		icon: MapPin
	},
	{
		id: "scale",
		label: "Scale",
		icon: Ruler
	},
	{
		id: "you",
		label: "You",
		icon: User
	}
];
function EnquiryWizard() {
	const storedZone = useSiteStore((s) => s.selectedZone);
	const diaspora = useSiteStore((s) => s.diasporaMode);
	const setZone = useSiteStore((s) => s.setSelectedZone);
	const [step, setStep] = (0, import_react.useState)(0);
	const [type, setType] = (0, import_react.useState)("Residential");
	const [zone, setLocalZone] = (0, import_react.useState)(storedZone ?? "nairobi");
	const [sqm, setSqm] = (0, import_react.useState)(220);
	const [finish, setFinish] = (0, import_react.useState)("standard");
	const [stage, setStage] = (0, import_react.useState)("Have a plot");
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [startDate, setStartDate] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [hp, setHp] = (0, import_react.useState)("");
	const [done, setDone] = (0, import_react.useState)(false);
	const estimate = (0, import_react.useMemo)(() => estimateCost({
		type,
		zone,
		sqm,
		finish
	}), [
		type,
		zone,
		sqm,
		finish
	]);
	function chooseZone(slug) {
		setLocalZone(slug);
		setZone(slug);
	}
	function submit() {
		if (hp) return;
		if (!name.trim() || !phone.trim() || !email.trim()) {
			toast.error("Name, phone and email are required.");
			return;
		}
		saveEnquiry({
			name: name.trim(),
			phone: phone.trim(),
			email: email.trim(),
			projectType: type,
			zone,
			stage,
			startDate,
			description: description.trim(),
			sqm,
			finish,
			indicativeMin: Math.round(estimate.min),
			indicativeMax: Math.round(estimate.max),
			diaspora
		});
		setDone(true);
		toast.success("Enquiry received. The studio has a copy on this device.");
	}
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-line/50 bg-cream p-8 md:p-12 rounded-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "size-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-8 text-white" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl md:text-4xl text-maroon",
				children: "We have the brief."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-ink/80 max-w-lg text-lg",
				children: [
					"Thank you, ",
					name.split(" ")[0],
					". A person at ATRO will follow up within 24 hours. If you want to talk now, WhatsApp is the fastest path in Kenya."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: COST_CAVEAT
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "primary",
					className: "rounded-2xl h-12 px-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: whatsappHref(defaultWhatsappText({
							zone,
							type
						})),
						children: ["Continue on WhatsApp", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					className: "rounded-2xl h-12 px-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/projects",
						children: "View our work"
					})
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-line/50 bg-cream rounded-2xl overflow-hidden shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1 bg-stone/50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500 ease-out",
					style: { width: `${(step + 1) / STEPS.length * 100}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-6 py-4 border-b border-line/50 bg-paper/50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-between",
					children: STEPS.map((s, i) => {
						const Icon = s.icon;
						const isActive = i === step;
						const isComplete = i < step;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => i < step && setStep(i),
								className: cn("flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300", isActive ? "bg-gradient-to-r from-maroon to-burgundy text-white shadow-soft" : isComplete ? "bg-gold/10 text-gold" : "text-muted hover:text-maroon"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] uppercase tracking-[0.14em] font-medium hidden sm:inline",
									children: s.label
								})]
							}), i < STEPS.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("w-8 h-0.5 mx-2 transition-colors duration-300", isComplete ? "bg-gold" : "bg-stone") })]
						}, s.id);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6 md:p-10",
				children: [
					step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "font-display text-2xl md:text-3xl text-maroon mb-2",
							children: "What are you building?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted mb-6",
							children: "Select the project type that best describes your build."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid sm:grid-cols-2 gap-4",
							children: PROJECT_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setType(t.id),
								className: cn("group text-left p-6 border rounded-2xl transition-all duration-300", type === t.id ? "border-burgundy bg-gradient-to-br from-maroon to-burgundy text-paper shadow-soft scale-[1.02]" : "border-line/50 bg-paper hover:border-burgundy/50 hover:shadow-card card-lift"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("size-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300", type === t.id ? "bg-white/20" : "bg-maroon/5 group-hover:bg-maroon/10"),
									children: t.id === "Residential" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-6" }) : t.id === "Commercial" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-6" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-xl",
									children: t.label
								})]
							}, t.id))
						})
					] }) : null,
					step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "font-display text-2xl md:text-3xl text-maroon mb-2",
							children: "Where is the site?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted mb-6",
							children: "Costs vary by location due to logistics and labour availability."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid sm:grid-cols-2 gap-4",
							children: ZONES.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => chooseZone(z.slug),
								className: cn("group text-left p-6 border rounded-2xl transition-all duration-300", zone === z.slug ? "border-burgundy bg-gradient-to-br from-maroon to-burgundy text-paper shadow-soft scale-[1.02]" : "border-line/50 bg-paper hover:border-burgundy/50 hover:shadow-card card-lift"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: cn("size-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300", zone === z.slug ? "bg-white/20" : "bg-maroon/5 group-hover:bg-maroon/10"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-6" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-xl block",
										children: z.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("block text-sm mt-1", zone === z.slug ? "text-paper/80" : "text-ink/60"),
										children: z.coverage
									})
								]
							}, z.slug))
						})
					] }) : null,
					step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl md:text-3xl text-maroon mb-2",
							children: "Scale and finish"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted mb-8",
							children: "A starting size. We will measure properly after we see the plot."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 bg-paper border border-line/50 rounded-2xl mb-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between mb-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "sqm",
										className: "text-base",
										children: "Approximate area"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-display text-2xl text-gradient-gold",
										children: [sqm, " m²"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "sqm",
									type: "range",
									min: 60,
									max: 800,
									step: 10,
									value: sqm,
									onChange: (e) => setSqm(Number(e.target.value)),
									className: "w-full accent-burgundy h-2",
									suppressHydrationWarning: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-xs text-muted mt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "60 m²" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "800 m²" })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid sm:grid-cols-2 gap-4",
							children: FINISHES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setFinish(f.id),
								className: cn("group text-left p-6 border rounded-2xl transition-all duration-300", finish === f.id ? "border-burgundy bg-gradient-to-br from-maroon to-burgundy text-paper shadow-soft scale-[1.02]" : "border-line/50 bg-paper hover:border-burgundy/50 hover:shadow-card card-lift"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: cn("size-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300", finish === f.id ? "bg-white/20" : "bg-maroon/5 group-hover:bg-maroon/10"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paintbrush, { className: "size-6" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-xl block",
										children: f.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("block text-sm mt-1", finish === f.id ? "text-paper/80" : "text-ink/60"),
										children: f.hint
									})
								]
							}, f.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 p-6 bg-gradient-to-br from-maroon via-burgundy to-maroon rounded-2xl relative overflow-hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 right-0 w-[200px] h-[200px] bg-gold/10 rounded-full blur-[80px] pointer-events-none" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "relative text-[11px] uppercase tracking-[0.18em] text-gold mb-2",
									children: ["Indicative range · ", estimate.zoneName]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "relative font-display text-4xl md:text-5xl",
									children: estimate.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "relative text-sm text-paper/70 mt-3",
									children: [
										"About ",
										formatKes(estimate.perSqm),
										" / m² as a midpoint. ",
										COST_CAVEAT
									]
								})
							]
						})
					] }) : null,
					step === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-6 max-w-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl md:text-3xl text-maroon mb-2",
								children: "How do we reach you?"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "The range stays on the record as indicative — a person will confirm nothing until they have seen the site."
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										htmlFor: "name",
										className: "flex items-center gap-2 mb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4 text-muted" }), "Name"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "name",
										value: name,
										onChange: (e) => setName(e.target.value),
										autoComplete: "name",
										required: true,
										className: "rounded-xl"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										htmlFor: "phone",
										className: "flex items-center gap-2 mb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4 text-muted" }), "Phone"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "phone",
										value: phone,
										onChange: (e) => setPhone(e.target.value),
										autoComplete: "tel",
										required: true,
										className: "rounded-xl"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										htmlFor: "email",
										className: "flex items-center gap-2 mb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4 text-muted" }), "Email"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "email",
										type: "email",
										value: email,
										onChange: (e) => setEmail(e.target.value),
										autoComplete: "email",
										required: true,
										className: "rounded-xl"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										htmlFor: "stage",
										className: "flex items-center gap-2 mb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 text-muted" }), "Stage"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
										id: "stage",
										value: stage,
										onChange: (e) => setStage(e.target.value),
										className: "rounded-xl",
										children: STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: s.label,
											children: s.label
										}, s.id))
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										htmlFor: "start",
										className: "flex items-center gap-2 mb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "size-4 text-muted" }), "Target start (optional)"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "start",
										type: "month",
										value: startDate,
										onChange: (e) => setStartDate(e.target.value),
										className: "rounded-xl"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										htmlFor: "desc",
										className: "flex items-center gap-2 mb-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 text-muted" }), "Project notes"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "desc",
										value: description,
										onChange: (e) => setDescription(e.target.value),
										placeholder: "Plot, drawings, who is abroad, anything we should not miss.",
										className: "rounded-xl"
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute -left-[9999px]",
								"aria-hidden": true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									tabIndex: -1,
									autoComplete: "off",
									value: hp,
									onChange: (e) => setHp(e.target.value)
								})
							}),
							diaspora ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-4 bg-gold/10 border border-gold/20 rounded-xl",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-burgundy",
									children: "Diaspora mode is on — we will schedule around EAT and lead with WhatsApp / video."
								})
							}) : null
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: step > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => setStep((s) => s - 1),
							className: "rounded-xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4 mr-2" }), "Back"]
						}) : null }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm text-muted",
								children: [
									"Step ",
									step + 1,
									" of ",
									STEPS.length
								]
							}), step < 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								onClick: () => setStep((s) => s + 1),
								className: "rounded-xl px-6",
								children: ["Continue", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								onClick: submit,
								className: "rounded-xl px-6 bg-gradient-to-r from-gold to-gold-light text-maroon hover:from-gold-light hover:to-gold",
								children: ["Send enquiry", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
							})]
						})]
					})
				]
			})
		]
	});
}
function StartPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "pt-32 pb-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-burgundy hover:text-maroon mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), "Home"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-12 gap-12 items-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-4 lg:sticky lg:top-24",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "gold",
							className: "mb-4",
							children: "Start a project"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl md:text-5xl text-maroon",
							children: "Four steps. Then a person."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 text-ink/70 text-lg",
							children: "Type, place, scale, and how to reach you. You will see an indicative range before you send anything. It is not a quotation."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-10 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "size-10 rounded-full bg-gradient-to-br from-maroon to-burgundy flex items-center justify-center text-white text-sm font-bold shrink-0",
										children: "1"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-maroon",
										children: "Project type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-ink/70",
										children: "Residential, commercial, or institutional."
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "size-10 rounded-full bg-gradient-to-br from-maroon to-burgundy flex items-center justify-center text-white text-sm font-bold shrink-0",
										children: "2"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-maroon",
										children: "Location"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-ink/70",
										children: "Zone-aware pricing for all 7 regions."
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "size-10 rounded-full bg-gradient-to-br from-maroon to-burgundy flex items-center justify-center text-white text-sm font-bold shrink-0",
										children: "3"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-maroon",
										children: "Scale & finish"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-ink/70",
										children: "Area in m² and finish level."
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "size-10 rounded-full bg-gradient-to-br from-maroon to-burgundy flex items-center justify-center text-white text-sm font-bold shrink-0",
										children: "4"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-maroon",
										children: "Contact details"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-ink/70",
										children: "Name, phone, email."
									})] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-10 p-6 bg-cream border border-line/50 rounded-2xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg text-maroon mb-3",
								children: "What happens next?"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "space-y-3 text-sm text-ink/70",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-gold mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "You see an indicative cost range instantly" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-gold mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "A person at ATRO follows up within 24 hours" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-gold mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "We schedule a site visit or video call" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-gold mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "No commitment until you approve the quote" })]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: whatsappHref(defaultWhatsappText()),
									className: "flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl hover:bg-green-100 transition-colors duration-300",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "size-10 rounded-full bg-whatsapp/10 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5 text-whatsapp" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] uppercase tracking-[0.14em] text-green-700",
										children: "WhatsApp"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-green-800",
										children: COMPANY.phoneDisplay
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: `mailto:${COMPANY.email}`,
									className: "flex items-center gap-3 p-4 bg-burgundy/5 border border-burgundy/10 rounded-2xl hover:bg-burgundy/10 transition-colors duration-300",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "size-10 rounded-full bg-burgundy/10 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-5 text-burgundy" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] uppercase tracking-[0.14em] text-burgundy/70",
										children: "Email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-burgundy",
										children: COMPANY.email
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 p-4 bg-stone/50 border border-line/50 rounded-2xl",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "size-10 rounded-full bg-maroon/10 flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-5 text-maroon" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] uppercase tracking-[0.14em] text-muted",
											children: "Studio"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-maroon",
											children: COMPANY.address
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-ink/70",
											children: COMPANY.hours
										})
									] })]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnquiryWizard, {})
				})]
			})]
		})
	});
}
//#endregion
export { StartPage as component };
