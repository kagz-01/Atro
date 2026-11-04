import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHero({
  kicker,
  title,
  lede,
  image,
  children,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className={cn(
      "relative pt-20 pb-10 overflow-hidden sm:pt-28 md:pt-36 md:pb-16",
      image && "min-h-[48vh] text-paper sm:min-h-[52vh]"
    )}>
      {image ? (
        <>
          <img
            src={image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon via-maroon/70 to-maroon/40" />
          {/* Decorative glow */}
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-gold/10 rounded-full blur-[150px] pointer-events-none" />
        </>
      ) : null}
      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        {kicker ? (
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-maroon/10 mb-6">
            <div className="size-1.5 rounded-full bg-gold" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-burgundy">
              {kicker}
            </p>
          </div>
        ) : null}
        <h1 className={cn(
          "reveal reveal-delay-1 max-w-4xl font-display text-[2.4rem] leading-[0.95] sm:text-5xl md:text-6xl lg:text-7xl",
          image ? "text-paper" : "text-maroon"
        )}>
          {title}
        </h1>
        {lede ? (
          <p className={cn(
            "reveal reveal-delay-2 mt-6 max-w-2xl text-lg",
            image ? "text-paper/80" : "text-ink/75"
          )}>
            {lede}
          </p>
        ) : null}
        <div className="reveal reveal-delay-3">
          {children}
        </div>
      </div>
    </section>
  );
}

export function CtaBand({
  title = "Have a project in mind?",
  body = "Tell us the plot, the building, and the budget band. We will tell you whether we are the right studio — and where we actually build.",
  ctaTo = "/start" as string | { to: string; search: Record<string, string> },
  ctaLabel = "Start a project",
}: {
  title?: string;
  body?: string;
  ctaTo?: string | { to: string; search: Record<string, string> };
  ctaLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-maroon" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-burgundy/50 via-maroon to-maroon" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-burgundy/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative mx-auto flex max-w-[1400px] flex-col justify-between gap-8 px-6 py-16 sm:px-8 md:flex-row md:items-end md:px-12 md:py-20 lg:px-16">
        <div className="max-w-2xl">
          <h2 className="font-display text-[1.8rem] text-paper sm:text-3xl md:text-4xl lg:text-5xl">{title}</h2>
          <p className="mt-4 text-sm text-paper/75 sm:text-base">{body}</p>
        </div>
        <Link
          to={typeof ctaTo === "string" ? ctaTo : ctaTo.to}
          search={typeof ctaTo === "object" ? ctaTo.search : undefined}
          className="group inline-flex h-12 items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-gold to-gold-light px-5 text-[11px] font-bold uppercase tracking-[0.16em] text-maroon shadow-glow-gold btn-lift sm:h-14 sm:px-8 sm:text-[12px]"
        >
          <span className="relative z-10">{ctaLabel}</span>
          <ArrowRight className="size-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Link>
      </div>
    </section>
  );
}
