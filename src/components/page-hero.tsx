import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
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
    <section className={cn("relative pt-28 md:pt-36 pb-12 md:pb-16", image && "min-h-[52vh] text-paper")}>
      {image ? (
        <>
          <img
            src={image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon via-maroon/70 to-maroon/40" />
        </>
      ) : null}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {kicker ? (
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold mb-4">
            {kicker}
          </p>
        ) : null}
        <h1 className={cn("font-display text-5xl sm:text-6xl md:text-7xl max-w-4xl", image ? "text-paper" : "text-maroon")}>
          {title}
        </h1>
        {lede ? (
          <p className={cn("mt-6 max-w-2xl text-lg", image ? "text-paper/80" : "text-ink/75")}>{lede}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function CtaBand({
  title = "Have a project in mind?",
  body = "Tell us the plot, the building, and the budget band. We will tell you whether we are the right studio — and where we actually build.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="bg-burgundy text-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-20 flex flex-col md:flex-row md:items-end gap-8 justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl md:text-5xl text-paper">{title}</h2>
          <p className="mt-4 text-paper/75">{body}</p>
        </div>
        <Link
          to="/start"
          className="inline-flex h-14 px-7 items-center bg-gold text-maroon text-[12px] uppercase tracking-[0.16em] font-medium rounded-xs hover:bg-gold-light"
        >
          Start a project
        </Link>
      </div>
    </section>
  );
}
