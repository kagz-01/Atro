import { l as ZONES } from "./site-CZI1B5CN.mjs";
import { r as formatKesRange } from "./utils-DgjzUpi5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cost-CUElgdAu.js
var PROJECT_TYPES = [
	{
		id: "Residential",
		label: "Residential",
		icon: "🏠",
		desc: "Family homes, apartments, villas"
	},
	{
		id: "Commercial",
		label: "Commercial",
		icon: "🏢",
		desc: "Offices, retail, mixed-use"
	},
	{
		id: "Institutional",
		label: "Institutional",
		icon: "🏛️",
		desc: "Schools, hospitals, community"
	},
	{
		id: "Church",
		label: "Church",
		icon: "⛪",
		desc: "Worship spaces, parish halls"
	},
	{
		id: "School",
		label: "School",
		icon: "🎓",
		desc: "Classrooms, labs, libraries"
	},
	{
		id: "Renovation",
		label: "Renovation",
		icon: "🔧",
		desc: "Extensions, remodels, upgrades"
	}
];
var FINISHES = [
	{
		id: "essential",
		label: "Essential",
		hint: "Sound, simple, no waste",
		icon: "basic",
		color: "stone"
	},
	{
		id: "standard",
		label: "Standard",
		hint: "The honest mid-range house",
		icon: "standard",
		color: "gold"
	},
	{
		id: "premium",
		label: "Premium",
		hint: "Specified materials, quieter detailing",
		icon: "premium",
		color: "burgundy"
	},
	{
		id: "signature",
		label: "Signature",
		hint: "High-touch finishes, tight tolerances",
		icon: "signature",
		color: "maroon"
	}
];
var STAGES = [
	{
		id: "exploring",
		label: "Just exploring",
		icon: "🔍"
	},
	{
		id: "plot",
		label: "Have a plot",
		icon: "📐"
	},
	{
		id: "drawings",
		label: "Have drawings",
		icon: "📝"
	},
	{
		id: "ready",
		label: "Ready to build",
		icon: "🔨"
	},
	{
		id: "onsite",
		label: "Already on site",
		icon: "🏗️"
	}
];
var BASE = {
	Residential: {
		essential: 42e3,
		standard: 62e3,
		premium: 95e3,
		signature: 14e4
	},
	Commercial: {
		essential: 48e3,
		standard: 72e3,
		premium: 11e4,
		signature: 16e4
	},
	Institutional: {
		essential: 4e4,
		standard: 58e3,
		premium: 88e3,
		signature: 12e4
	},
	Church: {
		essential: 38e3,
		standard: 55e3,
		premium: 82e3,
		signature: 115e3
	},
	School: {
		essential: 4e4,
		standard: 56e3,
		premium: 8e4,
		signature: 11e4
	},
	Renovation: {
		essential: 28e3,
		standard: 45e3,
		premium: 7e4,
		signature: 1e5
	}
};
var ZONE_MULT = {
	nairobi: 1.08,
	kiambu: 1,
	machakos: .96,
	kajiado: 1.02,
	coast: 1.14,
	nakuru: .94,
	kisumu: .95,
	diaspora: 1.06
};
var COST_CAVEAT = "Indicative construction range only — not a quotation. Excludes land, statutory fees, professional sign-off where separately appointed, furniture and extraordinary ground conditions. A site visit and a BOQ come before any figure you should trust.";
function getTimeline(type, sqm) {
	if (type === "Renovation") {
		if (sqm < 100) return "3–5 months";
		if (sqm < 200) return "5–8 months";
		return "8–12 months";
	}
	if (sqm < 150) return "6–9 months";
	if (sqm < 300) return "9–14 months";
	if (sqm < 500) return "12–18 months";
	return "16–24 months";
}
function getBreakdown(type, finish, sqm) {
	const total = BASE[type][finish] * sqm;
	const isHighEnd = finish === "premium" || finish === "signature";
	return {
		structure: Math.round(total * .35),
		finishes: Math.round(total * (isHighEnd ? .32 : .28)),
		services: Math.round(total * .18),
		external: Math.round(total * .1),
		professional: Math.round(total * .08),
		contingency: Math.round(total * .07)
	};
}
function estimateCost(input) {
	const per = BASE[input.type][input.finish];
	const mult = ZONE_MULT[input.zone] ?? 1;
	const mid = per * mult * Math.max(40, input.sqm);
	const min = mid * .82;
	const max = mid * 1.22;
	const zoneName = ZONES.find((z) => z.slug === input.zone)?.name ?? input.zone;
	return {
		min,
		max,
		perSqm: per * mult,
		label: formatKesRange(min, max),
		zoneName,
		caveat: COST_CAVEAT,
		breakdown: getBreakdown(input.type, input.finish, input.sqm),
		timeline: getTimeline(input.type, input.sqm)
	};
}
//#endregion
export { estimateCost as a, STAGES as i, FINISHES as n, PROJECT_TYPES as r, COST_CAVEAT as t };
