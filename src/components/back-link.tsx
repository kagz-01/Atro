import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type BackLinkProps = {
  to:
    | "/projects"
    | "/services"
    | "/zones"
    | "/insights"
    | "/guides"
    | "/diaspora"
    | "/portal"
    | "/portal/diaspora";
  children: ReactNode;
  tone?: "light" | "dark";
};

export function BackLink({ to, children, tone = "dark" }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={`group mb-4 inline-flex min-h-12 items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:min-h-11 ${
        tone === "light"
          ? "border-white/20 text-paper/75 hover:border-gold hover:text-gold"
          : "border-maroon/15 text-burgundy hover:border-maroon/40 hover:text-maroon"
      }`}
    >
      <ArrowLeft
        className="size-4 transition-transform group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
      {children}
    </Link>
  );
}
