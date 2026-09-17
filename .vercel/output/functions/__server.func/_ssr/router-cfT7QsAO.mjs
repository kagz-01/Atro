import { i as __toESM } from "../_runtime.mjs";
import { f as projectBySlug, h as zoneBySlug, l as ZONES, m as serviceBySlug, n as COMPANY, o as SERVICES, p as projectsInZone, r as NAV, u as articleBySlug } from "./site-CZI1B5CN.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { B as notFound, _ as createFileRoute, b as useRouter, d as HeadContent, f as useRouterState, g as lazyRouteComponent, h as Outlet, m as createRouter, u as Scripts, v as createRootRoute, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as QueryClientProvider, r as require_jsx_runtime, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-DgjzUpi5.mjs";
import { a as object, i as number, n as array, o as string, r as literal, s as union, t as _enum } from "../_libs/zod.mjs";
import { P as Briefcase, a as TriangleAlert, b as Info, c as Send, g as Map$1, h as Menu, m as MessageCircle, n as Wrench, p as MessageSquareText, t as X, u as Route, x as House } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-cfT7QsAO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-burgundy",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl text-maroon",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: errorMessage(error)
			})
		]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-sans font-medium tracking-wide uppercase transition-[background-color,color,border-color,transform,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold", {
	variants: {
		variant: {
			primary: "bg-burgundy text-paper hover:bg-maroon border border-burgundy",
			gold: "bg-gold text-maroon hover:bg-gold-light border border-gold",
			outline: "bg-transparent text-burgundy border border-burgundy hover:bg-burgundy hover:text-paper",
			inverse: "bg-paper text-maroon border border-paper hover:bg-gold-light",
			ghost: "bg-transparent text-ink border border-transparent hover:border-line hover:bg-stone/40",
			line: "bg-transparent text-paper border border-paper/40 hover:border-gold hover:text-gold"
		},
		size: {
			sm: "h-10 px-4 text-[11px] rounded-xs",
			md: "h-12 px-5 text-[12px] rounded-xs",
			lg: "h-14 px-7 text-[12px] rounded-xs"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function NotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-h-[70vh] flex flex-col items-center justify-center px-6 text-center pt-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "404"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 font-display text-5xl text-maroon",
				children: "This page is not on the drawings."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-md text-ink/70",
				children: "The URL does not match a project, service or zone. Start from the studio home, or tell us what you were looking for."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: "Home"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/start",
						children: "Start a project"
					})
				})]
			})
		]
	});
}
/**
* App-wide client provider mounted once near the top of `<body>` in `__root.tsx`.
* Query + toasts live here so route files stay free of provider boilerplate.
*/
function AuthProvider({ children }) {
	const [client] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		staleTime: 6e4,
		refetchOnWindowFocus: false
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			position: "top-center",
			toastOptions: { className: "font-sans" }
		})]
	});
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var Input = object({ messages: array(object({
	role: _enum(["user", "assistant"]),
	content: string().max(2e3)
})).max(12) });
var askConcierge = createServerFn({ method: "POST" }).validator(Input).handler(createSsrRpc("104ab998a74b2c68797d912e64133b8591b961b4d1026dcb4caaa6e711018f75"));
function whatsappHref(text) {
	return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(text)}`;
}
function defaultWhatsappText(opts) {
	const bits = ["Hello ATRO — I would like to start a project."];
	if (opts?.type) bits.push(`Type: ${opts.type}.`);
	if (opts?.zone) bits.push(`Location: ${opts.zone}.`);
	return bits.join(" ");
}
var STARTERS = [
	"Do you build in Kiambu?",
	"How does the cost range work?",
	"I am building from abroad — how do you run the site?"
];
function Concierge() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [input, setInput] = (0, import_react.useState)("");
	const [messages, setMessages] = (0, import_react.useState)([{
		role: "assistant",
		content: "I can point you to a service, a zone, or the next step. I will not quote a price or sign anything off — that is a person."
	}]);
	const listRef = (0, import_react.useRef)(null);
	const mutation = useMutation({
		mutationFn: async (next) => {
			return askConcierge({ data: { messages: next.filter((m, i) => !(i === 0 && m.role === "assistant")).slice(-10) } });
		},
		onSuccess: (res) => {
			if (res.ok) setMessages((m) => [...m, {
				role: "assistant",
				content: res.text
			}]);
			else setMessages((m) => [...m, {
				role: "assistant",
				content: res.error
			}]);
			queueMicrotask(() => {
				listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
			});
		}
	});
	function send(text) {
		const trimmed = text.trim();
		if (!trimmed || mutation.isPending || messages.length > 16) return;
		const next = [...messages, {
			role: "user",
			content: trimmed
		}];
		setMessages(next);
		setInput("");
		mutation.mutate(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => setOpen(true),
		className: "fixed z-30 left-4 bottom-4 md:left-6 md:bottom-6 h-12 px-4 rounded-xs bg-maroon text-paper text-[11px] uppercase tracking-[0.16em] inline-flex items-center gap-2 shadow-soft hover:bg-burgundy",
		"aria-haspopup": "dialog",
		"aria-expanded": open,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquareText, { className: "size-4" }), "Ask ATRO"]
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6",
		role: "dialog",
		"aria-label": "ATRO concierge",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-ink/50",
			"aria-label": "Close concierge",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full sm:max-w-md bg-paper text-ink rounded-t-md sm:rounded-md shadow-soft flex flex-col max-h-[85vh]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between px-5 h-14 border-b border-line",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] uppercase tracking-[0.16em] text-gold",
						children: "Concierge"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl text-maroon leading-none",
						children: "Ask ATRO"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setOpen(false),
						className: "size-11 inline-flex items-center justify-center",
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					ref: listRef,
					className: "flex-1 overflow-y-auto px-5 py-4 space-y-3",
					children: [messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("max-w-[90%] text-sm leading-relaxed px-3 py-2 rounded-sm", m.role === "assistant" ? "bg-stone text-ink" : "bg-burgundy text-paper ml-auto"),
						children: m.content
					}, `${m.role}-${i}`)), mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted uppercase tracking-[0.16em]",
						children: "Thinking"
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-5 pb-3 flex flex-wrap gap-2",
					children: STARTERS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-[11px] border border-line px-2.5 py-1.5 rounded-xs hover:border-burgundy",
						onClick: () => send(s),
						children: s
					}, s))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "px-5 pb-5 flex gap-2",
					onSubmit: (e) => {
						e.preventDefault();
						send(input);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: input,
						onChange: (e) => setInput(e.target.value),
						placeholder: "Ask about a zone, a service, the process",
						className: "flex-1 h-12 border border-line bg-cream px-3 rounded-sm outline-none focus:border-burgundy",
						maxLength: 500
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "size-12 bg-burgundy text-paper inline-flex items-center justify-center rounded-xs disabled:opacity-40",
						disabled: mutation.isPending,
						"aria-label": "Send",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 pb-5 flex gap-4 text-[11px] uppercase tracking-[0.14em] text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/start",
						className: "hover:text-burgundy",
						onClick: () => setOpen(false),
						children: "Start a project"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: whatsappHref(defaultWhatsappText()),
						target: "_blank",
						rel: "noreferrer",
						className: "hover:text-burgundy",
						children: "WhatsApp"
					})]
				})
			]
		})]
	}) : null] });
}
function LogoMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/logo/logo.png",
		alt: "ATRO Design & Construction",
		className: cn("block object-contain", className)
	});
}
function Logo({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/",
		className: cn("group shrink-0", className),
		"aria-label": "ATRO home",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "h-10 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105" })
	});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "relative overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-maroon" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/50 via-maroon to-maroon" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 overflow-hidden pointer-events-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16 py-16 md:py-20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-12 md:grid-cols-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "[&_img]:brightness-200" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-6 text-sm text-paper/70 max-w-sm",
									children: COMPANY.support
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-6 text-[11px] uppercase tracking-[0.18em] text-gold",
									children: [
										COMPANY.address,
										" · ",
										COMPANY.hours
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-[0.18em] text-gold mb-4",
								children: "Studio"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "space-y-3 text-sm text-paper/80",
								children: [NAV.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: n.to,
									className: "hover:text-gold transition-colors duration-300",
									children: n.label
								}) }, n.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/start",
									className: "hover:text-gold transition-colors duration-300",
									children: "Start a project"
								}) })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-[0.18em] text-gold mb-4",
								children: "Services"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-3 text-sm text-paper/80",
								children: SERVICES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/services/$slug",
									params: { slug: s.slug },
									className: "hover:text-gold transition-colors duration-300",
									children: s.title
								}) }, s.slug))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-[0.18em] text-gold mb-4",
								children: "Where we build"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-3 text-sm text-paper/80",
								children: ZONES.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/zones/$slug",
									params: { slug: z.slug },
									className: "hover:text-gold transition-colors duration-300",
									children: z.name
								}) }, z.slug))
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-16 pt-6 border-t border-paper/10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-[12px] text-paper/50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"© ",
						(/* @__PURE__ */ new Date()).getFullYear(),
						" ",
						COMPANY.name
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/privacy",
								className: "hover:text-gold transition-colors duration-300",
								children: "Privacy"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/terms",
								className: "hover:text-gold transition-colors duration-300",
								children: "Terms"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `mailto:${COMPANY.email}`,
								className: "hover:text-gold transition-colors duration-300",
								children: COMPANY.email
							})
						]
					})]
				})]
			})
		]
	});
}
var useSiteStore = create()(persist((set) => ({
	diasporaMode: false,
	setDiasporaMode: (v) => set({ diasporaMode: v }),
	selectedZone: null,
	setSelectedZone: (z) => set({ selectedZone: z })
}), {
	name: "atro.site",
	skipHydration: true
}));
var NAV_ICONS = {
	"/projects": Briefcase,
	"/services": Briefcase,
	"/tools": Wrench,
	"/zones": Map$1,
	"/process": Route,
	"/about": Info
};
function SiteHeader() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [open, setOpen] = (0, import_react.useState)(false);
	const [scrolled, setScrolled] = (0, import_react.useState)(false);
	const diaspora = useSiteStore((s) => s.diasporaMode);
	const setDiaspora = useSiteStore((s) => s.setDiasporaMode);
	(0, import_react.useEffect)(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	(0, import_react.useEffect)(() => {
		setOpen(false);
	}, [pathname]);
	(0, import_react.useEffect)(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);
	const onDarkHero = pathname === "/" && !scrolled && !open;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: cn("hidden md:block fixed top-0 inset-x-0 z-40 transition-all duration-500", onDarkHero ? "bg-transparent" : "glass border-b border-line/50"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16 h-[4.5rem] flex items-center gap-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "shrink-0" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex items-center gap-1 flex-1",
						"aria-label": "Primary",
						children: NAV.map((item) => {
							const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: cn("px-4 h-10 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] transition-all duration-300 rounded-full", onDarkHero ? active ? "text-gold bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5" : active ? "text-burgundy bg-burgundy/10 shadow-sm" : "text-ink/60 hover:text-maroon hover:bg-maroon/5"),
								children: [item.label, "badge" in item && item.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-gold to-gold-light text-maroon rounded-full leading-none",
									children: item.badge
								})]
							}, item.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setDiaspora(!diaspora),
							className: cn("h-10 px-4 items-center text-[10px] uppercase tracking-[0.16em] border rounded-full transition-all duration-300", diaspora ? "bg-gradient-to-r from-gold to-gold-light text-maroon border-gold shadow-glow-gold" : onDarkHero ? "text-white/70 border-white/20 hover:border-gold hover:text-gold" : "text-muted border-line hover:border-burgundy hover:text-burgundy"),
							"aria-pressed": diaspora,
							children: diaspora ? "Diaspora on" : "Building from abroad?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/start",
							className: "inline-flex h-10 px-6 items-center bg-gradient-to-r from-maroon to-burgundy text-white text-[11px] uppercase tracking-[0.14em] font-semibold rounded-full shadow-soft btn-lift hover:shadow-card-hover transition-all duration-300",
							children: "Start a project"
						})]
					})
				]
			}), scrolled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "md:hidden fixed top-0 inset-x-0 z-40 glass border-b border-line/50",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 h-14 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "size-10 inline-flex items-center justify-center rounded-full hover:bg-maroon/5 transition-colors",
					"aria-label": open ? "Close menu" : "Open menu",
					"aria-expanded": open,
					onClick: () => setOpen((v) => !v),
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5 text-maroon" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5 text-maroon" })
				})]
			})
		}),
		open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "md:hidden fixed inset-0 top-14 z-30 bg-paper/98 backdrop-blur-xl overflow-y-auto animate-[slide-up_300ms_var(--ease-out)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "px-6 py-8 flex flex-col gap-2",
				"aria-label": "Mobile",
				children: [
					NAV.map((item) => {
						const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
						const Icon = NAV_ICONS[item.to] || House;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex items-center gap-4 p-4 rounded-2xl transition-all duration-300", active ? "bg-maroon text-paper shadow-soft" : "text-ink hover:bg-maroon/5"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-lg",
									children: item.label
								}),
								"badge" in item && item.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-auto px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-gold to-gold-light text-maroon rounded-full",
									children: item.badge
								})
							]
						}, item.to);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 pt-4 border-t border-line",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/start",
							className: "flex items-center justify-center gap-2 w-full h-12 bg-gradient-to-r from-maroon to-burgundy text-white text-[12px] uppercase tracking-[0.14em] font-semibold rounded-2xl",
							children: "Start a project"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setDiaspora(!diaspora),
						className: cn("mt-4 h-12 flex items-center justify-center text-[11px] uppercase tracking-[0.16em] border rounded-2xl transition-all duration-300", diaspora ? "bg-gold text-maroon border-gold" : "text-muted border-line hover:border-burgundy hover:text-burgundy"),
						children: diaspora ? "Diaspora mode on" : "Building from abroad?"
					})
				]
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "md:hidden fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around px-2 py-2 glass rounded-full border border-line/50 shadow-card",
			children: NAV.slice(0, 5).map((item) => {
				const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
				const Icon = NAV_ICONS[item.to] || House;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: cn("flex flex-col items-center gap-1 px-3 py-2 rounded-full transition-all duration-300 min-w-[56px]", active ? "bg-maroon text-white shadow-ribbon scale-105" : "text-muted hover:text-maroon"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[9px] uppercase tracking-wider font-medium",
						children: item.label
					})]
				}, item.to);
			})
		})
	] });
}
function WhatsappFab() {
	const href = whatsappHref(defaultWhatsappText({ zone: useSiteStore((s) => s.selectedZone) }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href,
		target: "_blank",
		rel: "noreferrer",
		className: "fixed z-30 right-4 bottom-4 md:right-6 md:bottom-6 size-14 rounded-xs bg-whatsapp text-cream shadow-soft inline-flex items-center justify-center hover:brightness-95 active:scale-[0.96] transition-transform",
		"aria-label": "Chat on WhatsApp",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
			className: "size-7",
			strokeWidth: 1.75
		})
	});
}
function SiteShell({ children }) {
	(0, import_react.useEffect)(() => {
		useSiteStore.persist.rehydrate();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh flex flex-col bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#main",
				className: "skip-link",
				children: "Skip to content"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				id: "main",
				className: "flex-1",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsappFab, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Concierge, {})
		]
	});
}
var styles_default = "/assets/styles-CRVi1JfP.css";
var APP_NAME = "ATRO Design & Construction";
var Route$18 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "ATRO Design & Construction — integrated design, construction and consultancy in Kenya. Designing and building better structures."
			},
			{
				name: "theme-color",
				content: "#3C0508"
			},
			{
				name: "keywords",
				content: "construction company in Kenya, design and construction company Kenya, building contractors Nairobi, building contractors Kiambu, architectural design Kenya"
			}
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
				sizes: "32x32"
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon-32.png",
				sizes: "32x32"
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon-16.png",
				sizes: "16x16"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png"
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/icon-192.png",
				sizes: "192x192"
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/icon-512.png",
				sizes: "512x512"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Outfit:wght@300;400;500;600;700&display=swap"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-paper text-ink",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$16 = () => import("./routes-C5EXRfLS.mjs");
var Route$17 = createFileRoute("/")({
	component: lazyRouteComponent($$splitComponentImporter$16, "component"),
	head: () => ({ meta: [{ title: "ATRO Design & Construction — Designing & Building Better Structures" }, {
		name: "description",
		content: COMPANY.lede
	}] })
});
var $$splitComponentImporter$15 = () => import("./about-DUGQjMW7.mjs");
var Route$16 = createFileRoute("/about")({
	component: lazyRouteComponent($$splitComponentImporter$15, "component"),
	head: () => ({ meta: [{ title: "About ATRO — Design & Construction" }, {
		name: "description",
		content: "ATRO is a modern Kenyan design-and-construction company focused on well-designed, technically sound, efficiently delivered structures."
	}] })
});
var $$splitComponentImporter$14 = () => import("./privacy-DJ3lH_zE.mjs");
var Route$15 = createFileRoute("/privacy")({
	component: lazyRouteComponent($$splitComponentImporter$14, "component"),
	head: () => ({ meta: [{ title: "Privacy — ATRO" }] })
});
var $$splitComponentImporter$13 = () => import("./process-BGbYxuFy.mjs");
var Route$14 = createFileRoute("/process")({
	component: lazyRouteComponent($$splitComponentImporter$13, "component"),
	head: () => ({ meta: [{ title: "Our process — ATRO Design & Construction" }, {
		name: "description",
		content: "Eight steps from consultation to handover: assessment, design, cost planning, approvals, construction and communication."
	}] })
});
var $$splitComponentImporter$12 = () => import("./start-Br1RtTu_.mjs");
var Route$13 = createFileRoute("/start")({
	component: lazyRouteComponent($$splitComponentImporter$12, "component"),
	head: () => ({ meta: [{ title: "Start a project — ATRO Design & Construction" }, {
		name: "description",
		content: "Guided enquiry for ATRO: project type, zone, scale and an indicative cost range — then a person."
	}] })
});
var $$splitComponentImporter$11 = () => import("./terms-_IQDragX.mjs");
var Route$12 = createFileRoute("/terms")({
	component: lazyRouteComponent($$splitComponentImporter$11, "component"),
	head: () => ({ meta: [{ title: "Terms — ATRO" }] })
});
var $$splitComponentImporter$10 = () => import("./insights-A4r6YHIS.mjs");
var Route$11 = createFileRoute("/insights/")({
	component: lazyRouteComponent($$splitComponentImporter$10, "component"),
	head: () => ({ meta: [{ title: "Insights — ATRO Design & Construction" }, {
		name: "description",
		content: "Notes on BOQ-led costing, diaspora building, and what actually changes between Nairobi and Kiambu."
	}] })
});
var $$splitComponentImporter$9 = () => import("../_slug-C_Eagn4i.mjs");
var Route$10 = createFileRoute("/insights/$slug")({
	component: lazyRouteComponent($$splitComponentImporter$9, "component"),
	loader: ({ params }) => {
		const article = articleBySlug(params.slug);
		if (!article) throw notFound();
		return { article };
	},
	head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.article.title ?? "Insight"} — ATRO` }, {
		name: "description",
		content: loaderData?.article.excerpt ?? ""
	}] })
});
var $$splitComponentImporter$8 = () => import("./projects-pyIniU3K.mjs");
var Route$9 = createFileRoute("/projects/")({
	component: lazyRouteComponent($$splitComponentImporter$8, "component"),
	head: () => ({ meta: [{ title: "Work — ATRO Design & Construction" }, {
		name: "description",
		content: "Completed, ongoing and proposed projects by ATRO across Nairobi, Kiambu, the Coast and beyond."
	}] })
});
var $$splitComponentImporter$7 = () => import("../_slug-B7PkTqHI.mjs");
var Route$8 = createFileRoute("/projects/$slug")({
	component: lazyRouteComponent($$splitComponentImporter$7, "component"),
	loader: ({ params }) => {
		const project = projectBySlug(params.slug);
		if (!project) throw notFound();
		return { project };
	},
	head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.project.name ?? "Project"} — ATRO` }, {
		name: "description",
		content: loaderData?.project.excerpt ?? ""
	}] })
});
var $$splitComponentImporter$6 = () => import("./services-BvtQ9YHH.mjs");
var Route$7 = createFileRoute("/services/")({
	component: lazyRouteComponent($$splitComponentImporter$6, "component"),
	head: () => ({ meta: [{ title: "Services — ATRO Design & Construction" }, {
		name: "description",
		content: "Architectural design, construction, BOQ and cost planning, project management and interiors — delivered as one sequence."
	}] })
});
var $$splitComponentImporter$5 = () => import("../_slug-BiZ9r3l-.mjs");
var Route$6 = createFileRoute("/services/$slug")({
	component: lazyRouteComponent($$splitComponentImporter$5, "component"),
	loader: ({ params }) => {
		const service = serviceBySlug(params.slug);
		if (!service) throw notFound();
		return { service };
	},
	head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.service.title ?? "Service"} — ATRO` }, {
		name: "description",
		content: loaderData?.service.lede ?? ""
	}] })
});
var $$splitComponentImporter$4 = () => import("./tools-CwbaCRS5.mjs");
var Route$5 = createFileRoute("/tools/")({
	component: lazyRouteComponent($$splitComponentImporter$4, "component"),
	head: () => ({ meta: [{ title: `Tools | ${COMPANY.name}` }, {
		name: "description",
		content: "Interactive tools for construction planning — cost calculator, zone map, material prices and more."
	}] })
});
var $$splitComponentImporter$3 = () => import("./cost-calculator-CPHchKjA.mjs");
var Route$4 = createFileRoute("/tools/cost-calculator")({
	component: lazyRouteComponent($$splitComponentImporter$3, "component"),
	head: () => ({ meta: [{ title: `Cost Calculator | ${COMPANY.name}` }, {
		name: "description",
		content: "Get an instant indicative construction cost range for your project in Kenya. Select type, zone, area and finish level."
	}] })
});
var $$splitComponentImporter$2 = () => import("./zone-map-CjaKcrfL.mjs");
var Route$3 = createFileRoute("/tools/zone-map")({
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	head: () => ({ meta: [{ title: `Zone Map | ${COMPANY.name}` }, {
		name: "description",
		content: "Interactive map of ATRO's construction coverage across Kenya. See availability, logistics and FAQs for each county."
	}] })
});
var $$splitComponentImporter$1 = () => import("./zones-4sHqNK-W.mjs");
var Route$2 = createFileRoute("/zones/")({
	component: lazyRouteComponent($$splitComponentImporter$1, "component"),
	head: () => ({ meta: [{ title: "Where we build — Zone Intelligence | ATRO" }, {
		name: "description",
		content: "ATRO coverage across Nairobi, Kiambu, Machakos, Kajiado, the Coast, Nakuru and diaspora-managed Kenyan projects."
	}] })
});
var $$splitComponentImporter = () => import("../_slug-Bgku20sP.mjs");
var Route$1 = createFileRoute("/zones/$slug")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	loader: ({ params }) => {
		const zone = zoneBySlug(params.slug);
		if (!zone) throw notFound();
		return {
			zone,
			projects: projectsInZone(zone.slug)
		};
	},
	head: ({ loaderData }) => ({ meta: [{ title: loaderData?.zone.seoTitle ?? "Zone — ATRO" }, {
		name: "description",
		content: loaderData?.zone.seoDescription ?? ""
	}] })
});
var IndexRoute = Route$17.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$18
});
var AboutRoute = Route$16.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$18
});
var PrivacyRoute = Route$15.update({
	id: "/privacy",
	path: "/privacy",
	getParentRoute: () => Route$18
});
var ProcessRoute = Route$14.update({
	id: "/process",
	path: "/process",
	getParentRoute: () => Route$18
});
var StartRoute = Route$13.update({
	id: "/start",
	path: "/start",
	getParentRoute: () => Route$18
});
var TermsRoute = Route$12.update({
	id: "/terms",
	path: "/terms",
	getParentRoute: () => Route$18
});
var InsightsIndexRoute = Route$11.update({
	id: "/insights/",
	path: "/insights/",
	getParentRoute: () => Route$18
});
var InsightsSlugRoute = Route$10.update({
	id: "/insights/$slug",
	path: "/insights/$slug",
	getParentRoute: () => Route$18
});
var ProjectsIndexRoute = Route$9.update({
	id: "/projects/",
	path: "/projects/",
	getParentRoute: () => Route$18
});
var ProjectsSlugRoute = Route$8.update({
	id: "/projects/$slug",
	path: "/projects/$slug",
	getParentRoute: () => Route$18
});
var ServicesIndexRoute = Route$7.update({
	id: "/services/",
	path: "/services/",
	getParentRoute: () => Route$18
});
var ServicesSlugRoute = Route$6.update({
	id: "/services/$slug",
	path: "/services/$slug",
	getParentRoute: () => Route$18
});
var ToolsIndexRoute = Route$5.update({
	id: "/tools/",
	path: "/tools/",
	getParentRoute: () => Route$18
});
var ToolsCostCalculatorRoute = Route$4.update({
	id: "/tools/cost-calculator",
	path: "/tools/cost-calculator",
	getParentRoute: () => Route$18
});
var ToolsZoneMapRoute = Route$3.update({
	id: "/tools/zone-map",
	path: "/tools/zone-map",
	getParentRoute: () => Route$18
});
var ZonesIndexRoute = Route$2.update({
	id: "/zones/",
	path: "/zones/",
	getParentRoute: () => Route$18
});
var rootRouteChildren = {
	IndexRoute,
	AboutRoute,
	PrivacyRoute,
	ProcessRoute,
	StartRoute,
	TermsRoute,
	InsightsSlugRoute,
	ProjectsSlugRoute,
	ServicesSlugRoute,
	ToolsCostCalculatorRoute,
	ToolsZoneMapRoute,
	ZonesSlugRoute: Route$1.update({
		id: "/zones/$slug",
		path: "/zones/$slug",
		getParentRoute: () => Route$18
	}),
	InsightsIndexRoute,
	ProjectsIndexRoute,
	ServicesIndexRoute,
	ToolsIndexRoute,
	ZonesIndexRoute
};
var routeTree = Route$18._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent,
		defaultNotFoundComponent: NotFound,
		defaultPreload: "intent",
		scrollRestoration: true
	});
}
//#endregion
export { Route$10 as a, whatsappHref as c, Route$8 as i, Button as l, Route$1 as n, useSiteStore as o, Route$6 as r, defaultWhatsappText as s, router_exports as t };
