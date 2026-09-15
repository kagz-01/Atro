import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { COMPANY, NAV } from "@/lib/site";
import { useSiteStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-[background-color,border-color,box-shadow] duration-300",
        onDarkHero
          ? "bg-maroon/35 border-b border-transparent backdrop-blur-[2px]"
          : "bg-paper/95 border-b border-line shadow-soft backdrop-blur-md",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-[4.25rem] md:h-[4.75rem] flex items-center gap-6 lg:gap-10">
        <Logo className="shrink-0" />

        <nav className="hidden lg:flex items-center gap-1 flex-1" aria-label="Primary">
          {NAV.map((item) => {
            const active =
              pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "px-3.5 h-11 inline-flex items-center text-[12px] uppercase tracking-[0.16em] transition-colors rounded-sm",
                  onDarkHero
                    ? active
                      ? "text-gold"
                      : "text-paper/80 hover:text-paper"
                    : active
                      ? "text-burgundy bg-burgundy/5"
                      : "text-ink/70 hover:text-maroon hover:bg-maroon/5",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDiaspora(!diaspora)}
            className={cn(
              "hidden md:inline-flex h-10 px-3.5 items-center text-[10px] uppercase tracking-[0.16em] border rounded-sm transition-colors",
              diaspora
                ? "bg-gold text-maroon border-gold"
                : onDarkHero
                  ? "text-paper/80 border-paper/30 hover:border-gold hover:text-gold"
                  : "text-muted border-line hover:border-burgundy hover:text-burgundy",
            )}
            aria-pressed={diaspora}
          >
            {diaspora ? "Diaspora on" : "Building from abroad?"}
          </button>
          <Button
            asChild
            size="sm"
            variant={onDarkHero ? "gold" : "primary"}
            className="hidden sm:inline-flex h-10 px-5 text-[11px] uppercase tracking-[0.14em]"
          >
            <Link to="/start">Start a project</Link>
          </Button>
          <button
            type="button"
            className={cn(
              "lg:hidden size-10 inline-flex items-center justify-center rounded-sm",
              onDarkHero ? "text-paper" : "text-maroon",
            )}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="lg:hidden fixed inset-0 top-[4.25rem] bg-maroon text-paper overflow-y-auto">
          <nav className="px-6 py-8 flex flex-col" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="font-display text-4xl py-3 border-b border-paper/10 tracking-tight"
              >
                {item.label}
              </Link>
            ))}
            <Link to="/start" className="font-display text-4xl py-3 text-gold">
              Start a project
            </Link>
            <button
              type="button"
              onClick={() => setDiaspora(!diaspora)}
              className="mt-8 self-start text-[11px] uppercase tracking-[0.16em] border border-paper/30 px-4 h-11"
            >
              {diaspora ? "Diaspora mode on" : "Building from abroad?"}
            </button>
            <p className="mt-10 text-sm text-paper/60">{COMPANY.phoneDisplay}</p>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
