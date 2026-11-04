import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, Home, Briefcase, Wrench, Info, Phone, Globe, ArrowRight, LogIn, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
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

/**
 * Desktop account slot. While the session resolves it holds a same-sized
 * placeholder, so a hard reload on /portal never flashes a signed-out button.
 * The homepage keeps its client-portal action in the hero; other public pages
 * retain a compact sign-in or portal link here.
 */
function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  const hydrated = useIsHydrated();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: access } = useQuery({
    queryKey: ["my-access"],
    queryFn: () => getMyAccess({ data: undefined }),
    enabled: Boolean(user),
  });
  const dashboardTo = resolveDashboardRoute({ user, accessRole: access?.role ?? null });

  if (isPending || !hydrated) {
    return (
      <span
        aria-hidden
        className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-ink/10"
      />
    );
  }
  const pill =
    "h-9 px-3.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] border rounded-full transition-all duration-300 whitespace-nowrap";
  if (user) {
    // The dashboard routes are app screens with their own shell, so signed-in visitors land in the
    // role-specific workspace rather than a shared generic portal toggle.
    const isAdminWorkspace = dashboardTo === "/admin";
    return (
      <div className="flex items-center gap-2.5">
        <Link
          to={dashboardTo}
          aria-label={isAdminWorkspace ? "Open the office dashboard" : "Open the project portal"}
          className={cn(pill, "text-muted border-line hover:border-burgundy hover:text-burgundy")}
        >
          <LayoutDashboard className="size-3.5" />
          {isAdminWorkspace ? "Office dashboard" : "Project portal"}
        </Link>
        <UserButton compact />
      </div>
    );
  }
  return (
    <Link
      to="/login"
      aria-label="Sign in to the project portal"
      className={cn(
        pill,
        pathname === "/login"
          ? "bg-gold/15 text-maroon border-gold/50"
          : "text-muted border-line hover:border-burgundy hover:text-burgundy",
      )}
    >
      <LogIn className="size-3.5" />
      Sign in
    </Link>
  );
}

/** Mobile menu account row — the same states, laid out for the sheet. */
function MobileAccountRow() {
  const user = useCurrentUser();
  const { isPending } = useCurrentUserState();
  const hydrated = useIsHydrated();
  const { data: access } = useQuery({
    queryKey: ["my-access"],
    queryFn: () => getMyAccess({ data: undefined }),
    enabled: Boolean(user),
  });
  if (isPending || !hydrated) {
    return <div className="mt-3 h-12 animate-pulse rounded-2xl bg-ink/6" aria-hidden />;
  }
  if (user) {
    const dashboardTo = resolveDashboardRoute({ user, accessRole: access?.role ?? null });
    const isAdminWorkspace = dashboardTo === "/admin";
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
              {isAdminWorkspace ? "Open the office dashboard" : "Open your project portal"}
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
      className="mt-3 flex items-center gap-4 rounded-2xl border border-line p-4 text-ink transition-colors hover:border-burgundy"
    >
      <span className="size-10 rounded-xl bg-maroon/10 flex items-center justify-center text-maroon">
        <LogIn className="size-5" />
      </span>
      <span className="flex-1">
        <span className="block font-display text-lg">Sign in</span>
        <span className="text-sm text-muted">Track your project, payments and next steps</span>
      </span>
      <ArrowRight className="size-5 text-gold shrink-0" />
    </Link>
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const showDesktopAccount = pathname !== "/";

  return (
    <>
      {/* ── Desktop header ── */}
      <header
        className="pointer-events-none fixed inset-x-4 top-3 z-40 hidden md:block"
      >
        <div className="pointer-events-auto mx-auto flex h-14 max-w-[1260px] items-center gap-3 rounded-full border border-white/10 bg-[#171615]/95 px-2.5 text-paper shadow-[0_14px_44px_rgba(16,12,10,0.28)] backdrop-blur-xl sm:gap-4 sm:px-3">
          <Logo className="shrink-0 [&_img]:h-10 [&_img]:w-10 [&_img]:rounded-full [&_img]:border [&_img]:border-white/10" />
          <span className="hidden shrink-0 leading-tight lg:block">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-paper">
              ATRO
            </span>
            <span className="mt-0.5 block text-[8px] uppercase tracking-[0.16em] text-paper/45">
              Design &amp; Construction
            </span>
          </span>

          <nav
            className="flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded-full border border-white/10 bg-white/[0.03] p-1"
            aria-label="Primary"
          >
            {DESKTOP_NAV.map((item) => {
              const active =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-8 items-center gap-1 rounded-full px-1.5 text-[9px] font-medium uppercase tracking-[0.12em] whitespace-nowrap transition-colors sm:px-2 lg:px-2.5 xl:text-[10px]",
                    active
                      ? "bg-white/10 text-gold"
                      : "text-paper/70 hover:bg-white/[0.07] hover:text-paper",
                  )}
                >
                  {item.label}
                  {"badge" in item && item.badge && (
                    <span className="rounded-full bg-gradient-to-r from-gold to-gold-light px-1 py-0.5 text-[7px] font-bold leading-none text-maroon">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/start"
            className="hidden xl:inline-flex h-8 items-center gap-1.5 rounded-full bg-gold px-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-maroon transition-colors hover:bg-gold-light"
          >
            Start a project
            <ArrowRight className="size-3.5" />
          </Link>

          {showDesktopAccount ? <AuthSlot /> : null}
        </div>
      </header>

      {/* ── Mobile header ── */}
      <header className="md:hidden fixed inset-x-3 top-3 z-40 rounded-full border border-white/10 bg-[#171615]/95 shadow-[0_12px_36px_rgba(16,12,10,0.28)] backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-3">
          <Logo className="shrink-0" />
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full text-paper transition-colors hover:bg-white/10"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile slide-down menu ── */}
      {open ? (
        <div className="md:hidden fixed inset-x-3 top-[4.75rem] bottom-4 z-30 overflow-y-auto rounded-3xl border border-line bg-paper/98 shadow-card-hover backdrop-blur-xl animate-[slide-up_300ms_var(--ease-out)]">
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
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-300",
                    active
                      ? "bg-maroon text-paper shadow-soft"
                      : "text-ink hover:bg-maroon/5",
                  )}
                >
                  <span className={cn(
                    "grid size-9 place-items-center rounded-xl",
                    active ? "bg-white/10" : "bg-ink/5",
                  )}>
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
              className={cn(
                "mt-1 flex items-center gap-3 rounded-2xl border p-3 transition-all duration-300",
                pathname === "/diaspora"
                  ? "border-gold/30 bg-gold/10 text-maroon"
                  : "border-gold/20 text-ink hover:bg-gold/5",
              )}
            >
              <div className="grid size-9 place-items-center rounded-xl bg-gold/10 text-gold">
                <Globe className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block font-display text-[0.98rem] leading-none">Building from abroad?</span>
                <span className="mt-1 block text-[11.5px] leading-snug text-muted">
                  How ATRO manages projects for Kenyans overseas
                </span>
              </div>
              <ArrowRight className="size-4 text-gold shrink-0" />
            </Link>
          </nav>
        </div>
      ) : null}

      {!open ? (
        <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around px-2 py-2 glass rounded-full border border-line/50 shadow-card">
          {[
            { to: "/", icon: Home, label: "Home" },
            { to: "/projects", icon: Briefcase, label: "Work" },
            { to: "/services", icon: Briefcase, label: "Services" },
            { to: "/tools", icon: Wrench, label: "Tools" },
          ].map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-w-[56px] flex-col items-center gap-1 rounded-full px-3 py-2 transition-all duration-300",
                  active ? "bg-maroon text-white shadow-ribbon" : "text-muted hover:text-maroon",
                )}
              >
                <item.icon className="size-4" />
                <span className="text-[9px] uppercase tracking-wider font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
