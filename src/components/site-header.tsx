import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Home, Briefcase, Wrench, Info, Phone, Globe, ArrowRight, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
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

/**
 * Desktop account slot. While the session resolves it holds a same-sized
 * placeholder, so a hard reload on /portal never flashes a signed-out button.
 */
function AuthSlot({ className }: { className?: string }) {
  const { user, isPending } = useCurrentUserState();
  const hydrated = useIsHydrated();
  if (isPending || !hydrated) {
    return (
      <span
        aria-hidden
        className={cn("size-9 shrink-0 animate-pulse rounded-full", className === "on-dark" ? "bg-white/15" : "bg-ink/10")}
      />
    );
  }
  if (user) return <UserButton />;
  return (
    <Link
      to="/login"
      aria-label="Sign in to the client portal"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
        className === "on-dark"
          ? "border-white/20 text-white/70 hover:border-gold hover:text-gold"
          : "border-line text-muted hover:border-burgundy hover:text-burgundy",
      )}
    >
      <LogIn className="size-3.5" />
    </Link>
  );
}

/** Mobile menu account row — the same states, laid out for the sheet. */
function MobileAccountRow() {
  const user = useCurrentUser();
  const { isPending } = useCurrentUserState();
  const hydrated = useIsHydrated();
  if (isPending || !hydrated) {
    return <div className="mt-3 h-12 animate-pulse rounded-2xl bg-ink/6" aria-hidden />;
  }
  if (user) {
    return (
      <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-line p-4">
        <span className="min-w-0">
          <span className="block font-display text-base text-ink truncate">
            {user.displayName ?? user.primaryEmail ?? "Your account"}
          </span>
          <span className="text-sm text-muted">Signed in to the client portal</span>
        </span>
        <UserButton />
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
        <span className="text-sm text-muted">Track your project, payments and approvals</span>
      </span>
      <ArrowRight className="size-5 text-gold shrink-0" />
    </Link>
  );
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onDarkHero = pathname === "/" && !scrolled && !open;

  return (
    <>
      {/* ── Desktop header ── */}
      <header
        className={cn(
          "hidden md:block fixed top-0 inset-x-0 z-40 transition-all duration-500",
          onDarkHero
            ? "bg-transparent"
            : "glass border-b border-line/50",
        )}
      >
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 h-[4.5rem] flex items-center gap-6">
          <Logo className="shrink-0" />

          {/* Primary nav */}
          <nav className="flex items-center gap-1 flex-1" aria-label="Primary">
            {NAV.map((item) => {
              const active =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "px-3.5 h-9 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] transition-all duration-300 rounded-full whitespace-nowrap",
                    onDarkHero
                      ? active
                        ? "text-gold bg-white/10"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                      : active
                        ? "text-burgundy bg-burgundy/10 shadow-sm"
                        : "text-ink/60 hover:text-maroon hover:bg-maroon/5",
                  )}
                >
                  {item.label}
                  {"badge" in item && item.badge && (
                    <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-gold to-gold-light text-maroon rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            <AuthSlot className={onDarkHero ? "on-dark" : undefined} />
            <Link
              to={DIASPORA_LINK.to}
              className={cn(
                "h-9 px-3.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] border rounded-full transition-all duration-300 whitespace-nowrap",
                pathname === "/diaspora"
                  ? "bg-gradient-to-r from-gold to-gold-light text-maroon border-gold shadow-glow-gold"
                  : onDarkHero
                    ? "text-white/70 border-white/20 hover:border-gold hover:text-gold"
                    : "text-muted border-line hover:border-burgundy hover:text-burgundy",
              )}
            >
              <Globe className="size-3" />
              Abroad
              <span className="px-1.5 py-0.5 text-[7px] font-bold bg-gradient-to-r from-gold to-gold-light text-maroon rounded-full leading-none">
                New
              </span>
            </Link>
            <Link
              to="/start"
              className="inline-flex h-9 px-5 items-center gap-2 bg-gradient-to-r from-maroon to-burgundy text-white text-[11px] uppercase tracking-[0.14em] font-semibold rounded-full shadow-soft btn-lift hover:shadow-card-hover transition-all duration-300"
            >
              Start a project
            </Link>
          </div>
        </div>
        {/* Gradient line */}
        {scrolled && (
          <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        )}
      </header>

      {/* ── Mobile header ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 glass border-b border-line/50">
        <div className="px-5 h-14 flex items-center justify-between">
          <Logo className="shrink-0" />
          <button
            type="button"
            className="size-10 inline-flex items-center justify-center rounded-full hover:bg-maroon/5 transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5 text-maroon" /> : <Menu className="size-5 text-maroon" />}
          </button>
        </div>
      </header>

      {/* ── Mobile slide-down menu ── */}
      {open ? (
        <div className="md:hidden fixed inset-0 top-14 z-30 bg-paper/98 backdrop-blur-xl overflow-y-auto animate-[slide-up_300ms_var(--ease-out)]">
          <nav className="px-6 py-6 flex flex-col gap-1" aria-label="Mobile">
            {/* Main pages */}
            {NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              const Icon = NAV_ICONS[item.to] || Home;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
                    active
                      ? "bg-maroon text-paper shadow-soft"
                      : "text-ink hover:bg-maroon/5",
                  )}
                >
                  <Icon className="size-5" />
                  <span className="font-display text-lg">{item.label}</span>
                  {"badge" in item && item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-gold to-gold-light text-maroon rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Diaspora card */}
            <Link
              to={DIASPORA_LINK.to}
              className={cn(
                "mt-3 flex items-center gap-4 p-4 border rounded-2xl transition-all duration-300",
                pathname === "/diaspora"
                  ? "bg-gold/10 border-gold/30 text-maroon"
                  : "border-gold/20 text-ink hover:bg-gold/5",
              )}
            >
              <div className="size-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                <Globe className="size-5" />
              </div>
              <div className="flex-1">
                <span className="font-display text-lg block">Building from abroad?</span>
                <span className="text-sm text-muted">How ATRO manages projects for Kenyans overseas</span>
              </div>
              <ArrowRight className="size-5 text-gold shrink-0" />
            </Link>

            {/* Account */}
            <MobileAccountRow />

            {/* Start CTA */}
            <div className="mt-4 pt-4 border-t border-line">
              <Link
                to="/start"
                className="flex items-center justify-center gap-2 w-full h-12 bg-gradient-to-r from-maroon to-burgundy text-white text-[12px] uppercase tracking-[0.14em] font-semibold rounded-2xl"
              >
                Start a project
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </nav>
        </div>
      ) : null}

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around px-2 py-2 glass rounded-full border border-line/50 shadow-card">
        {[
          { to: "/", icon: Home, label: "Home" },
          { to: "/projects", icon: Briefcase, label: "Work" },
          { to: "/services", icon: Briefcase, label: "Services" },
          { to: "/tools", icon: Wrench, label: "Tools" },
          { to: "/start", icon: ArrowRight, label: "Start", accent: true },
        ].map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-full transition-all duration-300 min-w-[56px]",
                item.accent
                  ? "bg-gradient-to-br from-maroon to-burgundy text-white shadow-soft scale-105"
                  : active
                    ? "bg-maroon text-white shadow-ribbon scale-105"
                    : "text-muted hover:text-maroon",
              )}
            >
              <item.icon className="size-4" />
              <span className="text-[9px] uppercase tracking-wider font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
