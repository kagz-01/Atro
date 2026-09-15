import { r as formatKesRange } from "./utils-DgjzUpi5.mjs";
import { v as ZONES } from "./router-BjG7hAyI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cost-Vx5HAJni.js
var PROJECT_TYPES = [
	"Residential",
	"Commercial",
	"Institutional",
	"Church",
	"School",
	"Renovation"
];
var FINISHES = [
	{
		id: "essential",
		label: "Essential",
		hint: "Sound, simple, no waste"
	},
	{
		id: "standard",
		label: "Standard",
		hint: "The honest mid-range house"
	},
	{
		id: "premium",
		label: "Premium",
		hint: "Specified materials, quieter detailing"
	},
	{
		id: "signature",
		label: "Signature",
		hint: "High-touch finishes, tight tolerances"
	}
];
var STAGES = [
	"Just exploring",
	"Have a plot",
	"Have drawings",
	"Ready to build",
	"Already on site"
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
		caveat: COST_CAVEAT
	};
}
//#endregion
export { estimateCost as a, STAGES as i, FINISHES as n, PROJECT_TYPES as r, COST_CAVEAT as t };
