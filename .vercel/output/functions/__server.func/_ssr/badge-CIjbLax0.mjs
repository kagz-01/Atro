import { r as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-DgjzUpi5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-CIjbLax0.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "stone", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center h-7 px-2.5 text-[10px] uppercase tracking-[0.16em] font-medium rounded-xs", {
			stone: "bg-stone text-ink",
			gold: "bg-gold/15 text-burgundy border border-gold/40",
			maroon: "bg-maroon text-paper",
			live: "bg-burgundy text-paper",
			paper: "bg-paper/15 text-paper border border-paper/30"
		}[tone], className),
		children
	});
}
//#endregion
export { Badge as t };
