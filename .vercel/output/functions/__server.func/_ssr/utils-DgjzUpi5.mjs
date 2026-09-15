import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-DgjzUpi5.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatKes(n) {
	if (n >= 1e6) {
		const m = n / 1e6;
		return `KES ${Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)}M`;
	}
	return `KES ${new Intl.NumberFormat("en-KE").format(Math.round(n))}`;
}
function formatKesRange(min, max) {
	return `${formatKes(min)} – ${formatKes(max)}`;
}
//#endregion
export { formatKes as n, formatKesRange as r, cn as t };
