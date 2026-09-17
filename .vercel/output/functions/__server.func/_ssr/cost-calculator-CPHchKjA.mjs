import { i as __toESM } from "../_runtime.mjs";
import { l as ZONES } from "./site-CZI1B5CN.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as formatKes, t as cn } from "./utils-DgjzUpi5.mjs";
import { A as Check, I as ArrowRight, L as ArrowLeft } from "../_libs/lucide-react.mjs";
import { l as Button, o as useSiteStore } from "./router-cfT7QsAO.mjs";
import { t as Badge } from "./badge-CIjbLax0.mjs";
import { a as estimateCost, i as STAGES, n as FINISHES, r as PROJECT_TYPES } from "./cost-CUElgdAu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cost-calculator-CPHchKjA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	"type",
	"zone",
	"size",
	"finish",
	"stage",
	"result"
];
function CostCalculator() {
	const storeZone = useSiteStore((s) => s.selectedZone) ?? "nairobi";
	const [step, setStep] = (0, import_react.useState)("type");
	const [type, setType] = (0, import_react.useState)("Residential");
	const [zone, setZone] = (0, import_react.useState)(storeZone);
	const [sqm, setSqm] = (0, import_react.useState)(220);
	const [finish, setFinish] = (0, import_react.useState)("standard");
	const [stage, setStage] = (0, import_react.useState)("exploring");
	const stepIdx = STEPS.indexOf(step);
	const result = estimateCost({
		type,
		zone,
		sqm,
		finish
	});
	const next = () => {
		const idx = STEPS.indexOf(step);
		if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
	};
	const prev = () => {
		const idx = STEPS.indexOf(step);
		if (idx > 0) setStep(STEPS[idx - 1]);
	};
	const progress = (stepIdx + 1) / STEPS.length * 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-cream border border-line rounded-md overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1 bg-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-maroon transition-all duration-500 ease-out",
					style: { width: `${progress}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-6 py-4 border-b border-line flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11px] uppercase tracking-[0.16em] text-muted",
						children: [
							"Step ",
							stepIdx + 1,
							" of ",
							STEPS.length
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: step === "result" ? "gold" : "maroon",
						children: step === "result" ? "Your Estimate" : getStepLabel(step)
					})]
				}), step !== "result" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] text-muted",
					children: getStepHint(step)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-6 md:p-8 min-h-[320px]",
				children: [
					step === "type" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-2xl text-maroon",
						children: "What are you building?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 grid grid-cols-2 md:grid-cols-3 gap-3",
						children: PROJECT_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setType(t.id);
								next();
							},
							className: cn("p-4 rounded-sm border text-left transition-all hover:border-burgundy", type === t.id ? "border-maroon bg-maroon/5" : "border-line bg-paper"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl",
									children: t.icon
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-display text-lg text-maroon",
									children: t.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: t.desc
								})
							]
						}, t.id))
					})] }),
					step === "zone" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-2xl text-maroon",
							children: "Where are you building?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-ink/70",
							children: "Location affects labour, materials and logistics."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 grid grid-cols-2 md:grid-cols-4 gap-2",
							children: ZONES.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setZone(z.slug);
									next();
								},
								className: cn("p-3 rounded-sm border text-left transition-all hover:border-burgundy", zone === z.slug ? "border-maroon bg-maroon/5" : "border-line bg-paper"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-maroon",
									children: z.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[10px] uppercase tracking-[0.12em] text-muted",
									children: z.coverage
								})]
							}, z.slug))
						})
					] }),
					step === "size" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-2xl text-maroon",
							children: "How big is the project?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] uppercase tracking-[0.16em] text-muted",
										children: "Floor area"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-display text-4xl text-maroon tabular-nums",
										children: [
											sqm,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-lg text-muted",
												children: "m²"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 40,
									max: 800,
									step: 10,
									value: sqm,
									onChange: (e) => setSqm(Number(e.target.value)),
									className: "mt-4 w-full accent-burgundy",
									suppressHydrationWarning: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex justify-between text-[10px] text-muted",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "40 m² (studio)" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "400 m² (large home)" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "800 m² (commercial)" })
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8 p-4 bg-paper border border-line rounded-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-ink",
									children: "Tip:"
								}), " A typical 3-bedroom family home in Kenya is 180–280 m². Commercial projects are usually 300+ m²."]
							})
						})
					] }),
					step === "finish" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-2xl text-maroon",
							children: "What finish level?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-ink/70",
							children: "This sets the quality of materials and detailing."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 grid sm:grid-cols-2 gap-3",
							children: FINISHES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setFinish(f.id);
									next();
								},
								className: cn("p-5 rounded-sm border text-left transition-all hover:border-burgundy", finish === f.id ? "border-maroon bg-maroon/5" : "border-line bg-paper"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: cn("w-10 h-10 rounded-full flex items-center justify-center", f.id === "essential" && "bg-stone/50", f.id === "standard" && "bg-gold/20", f.id === "premium" && "bg-burgundy/20", f.id === "signature" && "bg-maroon/20"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("size-5", f.id === "essential" && "text-stone", f.id === "standard" && "text-gold", f.id === "premium" && "text-burgundy", f.id === "signature" && "text-maroon") })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-lg text-maroon",
										children: f.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: f.hint
									})] })]
								})
							}, f.id))
						})
					] }),
					step === "stage" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-2xl text-maroon",
							children: "Where are you in the process?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-ink/70",
							children: "This helps us understand what you need next."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 grid grid-cols-2 md:grid-cols-3 gap-3",
							children: STAGES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setStage(s.id);
									next();
								},
								className: cn("p-4 rounded-sm border text-left transition-all hover:border-burgundy", stage === s.id ? "border-maroon bg-maroon/5" : "border-line bg-paper"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xl",
									children: s.icon
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-medium text-maroon",
									children: s.label
								})]
							}, s.id))
						})
					] }),
					step === "result" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 mb-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-10 rounded-full bg-gold/20 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-5 text-gold" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-2xl text-maroon",
								children: "Your Estimate"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									type,
									" · ",
									result.zoneName,
									" · ",
									sqm,
									" m² · ",
									FINISHES.find((f) => f.id === finish)?.label
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-maroon text-paper p-6 rounded-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] uppercase tracking-[0.18em] text-gold",
									children: "Indicative range"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-4xl md:text-5xl mt-2 tabular-nums",
									children: result.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-paper/70 mt-2",
									children: [
										"Midpoint about ",
										formatKes(result.perSqm),
										" / m²"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex items-center gap-4 text-xs text-paper/60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["⏱ ", result.timeline] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["📍 ", result.zoneName] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid grid-cols-2 md:grid-cols-3 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakdownCard, {
									label: "Structure & frame",
									value: result.breakdown.structure,
									pct: 35
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakdownCard, {
									label: "Finishes & fixtures",
									value: result.breakdown.finishes,
									pct: 28
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakdownCard, {
									label: "MEP services",
									value: result.breakdown.services,
									pct: 18
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakdownCard, {
									label: "External works",
									value: result.breakdown.external,
									pct: 10
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakdownCard, {
									label: "Professional fees",
									value: result.breakdown.professional,
									pct: 8
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakdownCard, {
									label: "Contingency",
									value: result.breakdown.contingency,
									pct: 7
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 text-[10px] text-muted leading-relaxed",
							children: "Indicative construction range only — not a quotation. Excludes land, statutory fees, professional sign-off where separately appointed, furniture and extraordinary ground conditions. A site visit and a BOQ come before any figure you should trust."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/start",
									children: "Get a real quote"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setStep("type"),
								children: "Start over"
							})]
						})
					] })
				]
			}),
			step !== "result" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-6 py-4 border-t border-line flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: prev,
					disabled: stepIdx === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4 mr-2" }), "Back"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: next,
					children: ["Skip", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 ml-2" })]
				})]
			})
		]
	});
}
function BreakdownCard({ label, value, pct }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 bg-paper border border-line rounded-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[10px] text-muted",
					children: [pct, "%"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-display text-lg text-maroon tabular-nums",
				children: formatKes(value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 h-1 bg-line rounded-full overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-maroon/40 rounded-full",
					style: { width: `${pct}%` }
				})
			})
		]
	});
}
function getStepLabel(step) {
	return {
		type: "Project Type",
		zone: "Location",
		size: "Area",
		finish: "Finish",
		stage: "Stage",
		result: "Result"
	}[step];
}
function getStepHint(step) {
	return {
		type: "Select one",
		zone: "Tap your county",
		size: "Drag the slider",
		finish: "Pick a quality level",
		stage: "Where are you now?",
		result: ""
	}[step];
}
function CostCalculatorPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "pt-32 pb-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-7xl px-4 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/tools",
				className: "inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-burgundy hover:text-maroon mb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), "All tools"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-12 gap-12 items-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:col-span-4 lg:sticky lg:top-24",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "maroon",
							className: "mb-4",
							children: "Cost Calculator"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-4xl md:text-5xl text-maroon",
							children: "What will it cost?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 text-ink/70",
							children: "Six questions. An indicative band. Then a person. We show you the arithmetic instead of hiding behind \"it depends.\""
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-lg",
										children: "📊"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-maroon",
										children: "Instant breakdown"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-ink/70",
										children: "Structure, finishes, services, professional fees."
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-lg",
										children: "⏱"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-maroon",
										children: "Timeline estimate"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-ink/70",
										children: "How long your project will realistically take."
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-lg",
										children: "📍"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium text-maroon",
										children: "Zone-aware"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-ink/70",
										children: "Costs adjusted for your location in Kenya."
									})] })]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CostCalculator, {})
				})]
			})]
		})
	});
}
//#endregion
export { CostCalculatorPage as component };
