import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "motion/react";
import {
  Menu,
  X,
  Home,
  Briefcase,
  Wrench,
  Info,
  Phone,
  Globe,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { useEffect, useState } from "react";
import { HeaderLogo } from "@/components/logo";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyAccess } from "@/lib/staff-access";
import { resolveDashboardRoute } from "@/lib/dashboard-routing";
import { NAV, DIASPORA_LINK } from "@/lib/site";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, typeof Home> = {
  "/": Home,
  "/projects": Briefcase,
  "/services": Briefcase,
  "/tools": Wrench,
  "/about": Info,
  "/contact": Phone,
};

const DESKTOP_NAV = [...NAV, DIASPORA_LINK];

/** Keep public-site account entry consistent; sign-in routes each role correctly. */
function AuthSlot() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const returnTo = useRouterState({ select: (s) => s.location.search.returnTo });
  const enquiryOrigin = useRouterState({ select: (s) => s.location.search.from });
  const preferredClientRoute =
    pathname.startsWith("/diaspora") ||
    (pathname === "/login" && returnTo === "/portal/diaspora") ||
    (pathname === "/start" && enquiryOrigin === "diaspora")
      ? "/portal/diaspora"
      : "/portal";
  const pill =
    "h-9 px-3.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] border rounded-full transition-all duration-300 whitespace-nowrap";
  return (
    <Link
      to="/login"
      search={{
        returnTo: preferredClientRoute === "/portal/diaspora" ? preferredClientRoute : undefined,
      }}
      aria-label="Sign in or create an account"
      className={cn(
        pill,
        pathname === "/login"
          ? "border-gold bg-gold text-maroon"
          : "border-white/35 text-paper hover:border-gold hover:bg-white/10 hover:text-gold",
      )}
    >
      <LogIn className="size-3.5" />
      Sign in / Sign up
    </Link>
  );
}

/** Mobile menu account row — the same states, laid out for the sheet. */
function MobileAccountRow() {
  const user = useCurrentUser();
  const { isPending } = useCurrentUserState();
  const hydrated = useIsHydrated();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const returnTo = useRouterState({ select: (s) => s.location.search.returnTo });
  const enquiryOrigin = useRouterState({ select: (s) => s.location.search.from });
  const preferredClientRoute =
    pathname.startsWith("/diaspora") ||
    (pathname === "/login" && returnTo === "/portal/diaspora") ||
    (pathname === "/start" && enquiryOrigin === "diaspora")
      ? "/portal/diaspora"
      : "/portal";
  const { data: access } = useQuery({
    queryKey: ["my-access"],
    queryFn: () => getMyAccess({ data: undefined }),
    enabled: Boolean(user),
  });
  if (isPending || !hydrated) {
    return <div className="mt-3 h-12 animate-pulse rounded-2xl bg-ink/6" aria-hidden />;
  }
  if (user) {
    if (pathname === "/start") {
      return (
        <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-line p-4">
          <span className="min-w-0 truncate font-display text-base text-ink">
            {user.displayName ?? user.primaryEmail ?? "Your account"}
          </span>
          <UserButton compact />
        </div>
      );
    }
    const dashboardTo = resolveDashboardRoute({
      user,
      accessRole: access?.role ?? null,
      preferredClientRoute,
    });
    const isAdminWorkspace = dashboardTo === "/admin";
    const isStaffWorkspace = dashboardTo === "/staff";
    const isDiasporaWorkspace = dashboardTo === "/portal/diaspora";
    return (
      <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-line p-4">
        <Link
          to={dashboardTo}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left transition-colors hover:text-maroon"
        >
          <span className="min-w-0">
            <span className="block font-display text-base text-ink truncate">
              {user.displayName ?? user.primaryEmail ?? "Your account"}
            </span>
            <span className="text-sm text-muted">
              {isAdminWorkspace
                ? "Open the admin dashboard"
                : isStaffWorkspace
                  ? "Open the staff dashboard"
                  : isDiasporaWorkspace
                    ? "Open your diaspora project portal"
                    : "Open your Kenya project portal"}
            </span>
          </span>
          <ArrowRight className="size-5 text-gold shrink-0" />
        </Link>
        <UserButton compact />
      </div>
    );
  }
  return (
    <Link
      to="/login"
      search={{
        returnTo: preferredClientRoute === "/portal/diaspora" ? preferredClientRoute : undefined,
      }}
      className="mt-3 flex items-center gap-4 rounded-2xl border border-line p-4 text-ink transition-colors hover:border-burgundy"
    >
      <span className="size-10 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon">
        <LogIn className="size-5" />
      </span>
      <span className="flex-1">
        <span className="block font-display text-lg">Sign in / Sign up</span>
        <span className="text-sm text-muted">Google, email or phone code</span>
      </span>
      <ArrowRight className="size-5 text-gold shrink-0" />
    </Link>
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const returnTo = useRouterState({ select: (s) => s.location.search.returnTo });
  const enquiryOrigin = useRouterState({ select: (s) => s.location.search.from });
  const [open, setOpen] = useState(false);
  const isDiasporaJourney =
    pathname.startsWith("/diaspora") ||
    (pathname === "/login" && returnTo === "/portal/diaspora") ||
    (pathname === "/start" && enquiryOrigin === "diaspora");
  const homeRoute = isDiasporaJourney ? "/diaspora" : "/";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── Desktop header ── */}
      <header className="pointer-events-none fixed inset-x-4 top-3 z-40 hidden md:block">
        <div className="pointer-events-auto mx-auto flex h-14 max-w-[1260px] items-center gap-3 rounded-full border border-gold/20 bg-[linear-gradient(110deg,#3d0406_0%,#4a090b_48%,#310305_100%)] px-2.5 text-paper shadow-[0_14px_44px_rgba(16,12,10,0.28)] backdrop-blur-xl sm:gap-4 sm:px-3">
          <HeaderLogo />

          <nav
            className="flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-1"
            aria-label="Primary"
          >
            {DESKTOP_NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "motion-link relative inline-flex h-8 items-center gap-1 rounded-full px-1.5 text-[9px] font-medium uppercase tracking-[0.12em] whitespace-nowrap sm:px-2 lg:px-2.5 xl:text-[10px]",
                    active ? "text-gold" : "text-paper/70 hover:bg-white/[0.07] hover:text-paper",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="site-nav-active"
                      className="absolute inset-0 rounded-full bg-white/10"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="relative z-10">{item.label}</span>
                  {"badge" in item && item.badge && (
                    <span className="relative z-10 rounded-full bg-gradient-to-r from-gold to-gold-light px-1 py-0.5 text-[7px] font-bold leading-none text-maroon">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <AuthSlot />
        </div>
      </header>

      {/* ── Mobile header ── */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <header className="md:hidden fixed inset-x-3 top-[calc(0.75rem+env(safe-area-inset-top))] z-40 rounded-full border border-gold/20 bg-[linear-gradient(110deg,#3d0406_0%,#4a090b_48%,#310305_100%)] shadow-[0_12px_36px_rgba(16,12,10,0.28)] backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between px-2.5">
            <HeaderLogo />
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="inline-flex size-12 items-center justify-center rounded-full text-paper transition-colors hover:bg-white/10"
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </Dialog.Trigger>
          </div>
        </header>

        <Dialog.Portal>
          <Dialog.Overlay className="motion-overlay fixed inset-0 z-30 bg-ink/15 backdrop-blur-[1px] md:hidden" />
          <Dialog.Content className="motion-sheet fixed inset-x-3 top-[calc(4.75rem+env(safe-area-inset-top))] bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 overflow-y-auto rounded-3xl border border-line bg-paper/98 shadow-card-hover backdrop-blur-xl focus:outline-none md:hidden">
            <Dialog.Title className="sr-only">Mobile navigation</Dialog.Title>
            <nav className="flex flex-col gap-3 p-4" aria-label="Mobile">
              <div className="rounded-2xl border border-line bg-cream/70 p-3">
                <MobileAccountRow />
              </div>

              {NAV.map((item) => {
                const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                const Icon = NAV_ICONS[item.to] || Home;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-300",
                      active ? "bg-maroon text-paper shadow-soft" : "text-ink hover:bg-maroon/5",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-xl",
                        active ? "bg-white/10" : "bg-ink/5",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="font-display text-[0.96rem] leading-none">{item.label}</span>
                    {"badge" in item && item.badge && (
                      <span className="ml-auto rounded-full bg-gradient-to-r from-gold to-gold-light px-2 py-1 text-[9px] font-bold text-maroon">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <Link
                to={DIASPORA_LINK.to}
                aria-current={pathname === "/diaspora" ? "page" : undefined}
                className={cn(
                  "mt-1 flex min-h-12 items-center gap-3 rounded-2xl border p-3 transition-all duration-300",
                  pathname === "/diaspora"
                    ? "border-gold/30 bg-gold/10 text-maroon"
                    : "border-gold/20 text-ink hover:bg-gold/5",
                )}
              >
                <div className="grid size-9 place-items-center rounded-xl bg-gold/10 text-gold">
                  <Globe className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-display text-[0.98rem] leading-none">
                    Building from abroad?
                  </span>
                  <span className="mt-1 block text-[11.5px] leading-snug text-muted">
                    How ATRO manages projects for Kenyans overseas
                  </span>
                </div>
                <ArrowRight className="size-4 text-gold shrink-0" />
              </Link>
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {!open && pathname !== "/start" ? (
        <nav
          aria-label="Primary mobile"
          className="md:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 flex items-center justify-around px-2 py-2 glass rounded-full border border-line/50 shadow-card"
        >
          {[
            { to: homeRoute, icon: Home, label: "Home" },
            { to: "/projects", icon: Briefcase, label: "Work" },
            { to: "/services", icon: Briefcase, label: "Services" },
            { to: "/tools", icon: Wrench, label: "Tools" },
          ].map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 min-w-[56px] flex-col items-center gap-1 rounded-full px-3 py-2 transition-all duration-300",
                  active ? "bg-maroon text-white shadow-ribbon" : "text-muted hover:text-maroon",
                )}
              >
                <item.icon className="size-4" />
                <span className="text-[9px] uppercase tracking-wider font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
