import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Home, Briefcase, Wrench, Map, Route, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { COMPANY, NAV } from "@/lib/site";
import { useSiteStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, typeof Home> = {
  "/projects": Briefcase,
  "/services": Briefcase,
  "/tools": Wrench,
  "/zones": Map,
  "/process": Route,
  "/about": Info,
};

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const diaspora = useSiteStore((s) => s.diasporaMode);
  const setDiaspora = useSiteStore((s) => s.setDiasporaMode);

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
      {/* Desktop header */}
      <header
        className={cn(
          "hidden md:block fixed top-0 inset-x-0 z-40 transition-all duration-500",
          onDarkHero
            ? "bg-transparent"
            : "glass border-b border-line/50",
        )}
      >
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 h-[4.5rem] flex items-center gap-8">
          <Logo className="shrink-0" />

          <nav className="flex items-center gap-1 flex-1" aria-label="Primary">
            {NAV.map((item) => {
              const active =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "px-4 h-10 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] transition-all duration-300 rounded-full",
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDiaspora(!diaspora)}
              className={cn(
                "h-10 px-4 items-center text-[10px] uppercase tracking-[0.16em] border rounded-full transition-all duration-300",
                diaspora
                  ? "bg-gradient-to-r from-gold to-gold-light text-maroon border-gold shadow-glow-gold"
                  : onDarkHero
                    ? "text-white/70 border-white/20 hover:border-gold hover:text-gold"
                    : "text-muted border-line hover:border-burgundy hover:text-burgundy",
              )}
              aria-pressed={diaspora}
            >
              {diaspora ? "Diaspora on" : "Building from abroad?"}
            </button>
            <Link
              to="/start"
              className="inline-flex h-10 px-6 items-center bg-gradient-to-r from-maroon to-burgundy text-white text-[11px] uppercase tracking-[0.14em] font-semibold rounded-full shadow-soft btn-lift hover:shadow-card-hover transition-all duration-300"
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

      {/* Mobile header */}
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

      {/* Mobile slide-down menu */}
      {open ? (
        <div className="md:hidden fixed inset-0 top-14 z-30 bg-paper/98 backdrop-blur-xl overflow-y-auto animate-[slide-up_300ms_var(--ease-out)]">
          <nav className="px-6 py-8 flex flex-col gap-2" aria-label="Mobile">
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
            <div className="mt-4 pt-4 border-t border-line">
              <Link
                to="/start"
                className="flex items-center justify-center gap-2 w-full h-12 bg-gradient-to-r from-maroon to-burgundy text-white text-[12px] uppercase tracking-[0.14em] font-semibold rounded-2xl"
              >
                Start a project
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setDiaspora(!diaspora)}
              className={cn(
                "mt-4 h-12 flex items-center justify-center text-[11px] uppercase tracking-[0.16em] border rounded-2xl transition-all duration-300",
                diaspora
                  ? "bg-gold text-maroon border-gold"
                  : "text-muted border-line hover:border-burgundy hover:text-burgundy",
              )}
            >
              {diaspora ? "Diaspora mode on" : "Building from abroad?"}
            </button>
          </nav>
        </div>
      ) : null}

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around px-2 py-2 glass rounded-full border border-line/50 shadow-card">
        {NAV.slice(0, 5).map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = NAV_ICONS[item.to] || Home;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-full transition-all duration-300 min-w-[56px]",
                active
                  ? "bg-maroon text-white shadow-ribbon scale-105"
                  : "text-muted hover:text-maroon",
              )}
            >
              <Icon className="size-4" />
              <span className="text-[9px] uppercase tracking-wider font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
