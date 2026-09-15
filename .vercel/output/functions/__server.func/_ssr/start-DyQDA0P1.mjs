import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as formatKes, t as cn } from "./utils-DgjzUpi5.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as whatsappHref, d as COMPANY, l as Button, o as useSiteStore, s as defaultWhatsappText, v as ZONES } from "./router-BjG7hAyI.mjs";
import { a as estimateCost, i as STAGES, n as FINISHES, r as PROJECT_TYPES, t as COST_CAVEAT } from "./cost-Vx5HAJni.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/start-DyQDA0P1.js
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
	"Type",
	"Place",
	"Scale",
	"You"
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
		className: "border border-line bg-cream p-8 md:p-12 rounded-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.18em] text-gold",
				children: "Received"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-4xl text-maroon",
				children: "We have the brief."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-ink/80 max-w-lg",
				children: [
					"Thank you, ",
					name.split(" ")[0],
					". A person at ATRO will follow up. If you want to talk now, WhatsApp is the fastest path in Kenya."
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
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: whatsappHref(defaultWhatsappText({
							zone,
							type
						})),
						children: "Continue on WhatsApp"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/projects",
						children: "View work"
					})
				})]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-line bg-cream rounded-md overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-4 border-b border-line",
			children: STEPS.map((label, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => i < step && setStep(i),
				className: `h-12 text-[10px] sm:text-[11px] uppercase tracking-[0.14em] border-r border-line last:border-r-0 ${i === step ? "bg-burgundy text-paper" : i < step ? "bg-stone text-maroon" : "text-muted"}`,
				children: label
			}, label))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-6 md:p-10",
			children: [
				step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "font-display text-3xl text-maroon mb-6",
					children: "What are you building?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid sm:grid-cols-2 gap-3",
					children: PROJECT_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setType(t),
						className: `text-left px-4 py-4 border rounded-sm ${type === t ? "border-burgundy bg-burgundy text-paper" : "border-line bg-paper hover:border-burgundy"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-2xl",
							children: t
						})
					}, t))
				})] }) : null,
				step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "font-display text-3xl text-maroon mb-6",
					children: "Where is the site?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid sm:grid-cols-2 gap-3",
					children: ZONES.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => chooseZone(z.slug),
						className: `text-left px-4 py-4 border rounded-sm ${zone === z.slug ? "border-burgundy bg-burgundy text-paper" : "border-line bg-paper hover:border-burgundy"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-2xl",
							children: z.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm mt-1 opacity-80",
							children: z.coverage
						})]
					}, z.slug))
				})] }) : null,
				step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl text-maroon mb-2",
						children: "Scale and finish"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted mb-8",
						children: "A starting size. We will measure properly after we see the plot."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "sqm",
						children: [
							"Approximate area · ",
							sqm,
							" m²"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "sqm",
						type: "range",
						min: 60,
						max: 800,
						step: 10,
						value: sqm,
						onChange: (e) => setSqm(Number(e.target.value)),
						className: "w-full accent-burgundy",
						suppressHydrationWarning: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid sm:grid-cols-2 gap-3",
						children: FINISHES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setFinish(f.id),
							className: `text-left px-4 py-4 border rounded-sm ${finish === f.id ? "border-burgundy bg-burgundy text-paper" : "border-line bg-paper hover:border-burgundy"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-2xl",
								children: f.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm mt-1 opacity-80",
								children: f.hint
							})]
						}, f.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 p-6 bg-maroon text-paper rounded-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] uppercase tracking-[0.18em] text-gold",
								children: ["Indicative range · ", estimate.zoneName]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-4xl mt-2",
								children: estimate.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-paper/70 mt-2",
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
					className: "grid gap-5 max-w-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl text-maroon",
							children: "How do we reach you?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted -mt-2",
							children: "The range stays on the record as indicative — a person will confirm nothing until they have seen the site."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "name",
							value: name,
							onChange: (e) => setName(e.target.value),
							autoComplete: "name",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "phone",
							children: "Phone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "phone",
							value: phone,
							onChange: (e) => setPhone(e.target.value),
							autoComplete: "tel",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "email",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "email",
							type: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							autoComplete: "email",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "stage",
							children: "Stage"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							id: "stage",
							value: stage,
							onChange: (e) => setStage(e.target.value),
							children: STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "start",
							children: "Target start (optional)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "start",
							type: "month",
							value: startDate,
							onChange: (e) => setStartDate(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "desc",
							children: "Project notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "desc",
							value: description,
							onChange: (e) => setDescription(e.target.value),
							placeholder: "Plot, drawings, who is abroad, anything we should not miss."
						})] }),
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
						diaspora ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-burgundy",
							children: "Diaspora mode is on — we will schedule around EAT and lead with WhatsApp / video."
						}) : null
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 flex flex-wrap gap-3",
					children: [step > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => setStep((s) => s - 1),
						children: "Back"
					}) : null, step < 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: () => setStep((s) => s + 1),
						children: "Continue"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: submit,
						children: "Send enquiry"
					})]
				})
			]
		})]
	});
}
function StartPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "pt-28 md:pt-36 pb-20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-12 gap-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.2em] text-gold",
						children: "Start a project"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-4xl md:text-5xl",
						children: "Four steps. Then a person."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-ink/75",
						children: "Type, place, scale, and how to reach you. You will see an indicative range before you send anything. It is not a quotation."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 space-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted uppercase tracking-[0.14em] text-[11px] block",
								children: "WhatsApp"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "text-burgundy",
								href: whatsappHref(defaultWhatsappText()),
								children: COMPANY.phoneDisplay
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted uppercase tracking-[0.14em] text-[11px] block",
								children: "Email"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "text-burgundy",
								href: `mailto:${COMPANY.email}`,
								children: COMPANY.email
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted uppercase tracking-[0.14em] text-[11px] block",
									children: "Studio"
								}),
								COMPANY.address,
								" · ",
								COMPANY.hours
							] })
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:col-span-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnquiryWizard, {})
			})]
		})
	});
}
//#endregion
export { StartPage as component };
