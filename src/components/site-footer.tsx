import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { LEGAL_PAGES } from "@/components/legal-page";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { COMPANY } from "@/lib/site";

// Three short columns, not a sitemap. A footer that lists all 26 pages stops
// being scannable, so each link here has to earn its place: who we are, how to
// start work with us, and the two things a visitor most likely came back for.
const FOOTER_COLUMNS = [
  {
    label: "Studio",
    links: [
      { to: "/about", label: "About us" },
      { to: "/process", label: "How we work" },
      { to: "/zones", label: "Where we build" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    label: "Start a project",
    links: [
      { to: "/start", label: "Get a quote" },
      { to: "/services", label: "Services" },
      { to: "/projects", label: "Projects" },
      { to: "/fees", label: "Fees & payment" },
    ],
  },
  {
    label: "Tools & clients",
    links: [
      { to: "/tools/cost-calculator", label: "Cost calculator" },
      { to: "/tools/boq-generator", label: "BOQ generator" },
      { to: "/portal", label: "Client portal" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden">
      <div className="absolute inset-0 bg-maroon" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/40 via-maroon to-maroon" />

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 pt-14 md:pt-16 pb-36 md:pb-24">
        {/* Top row: Logo + tagline + contact */}
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="space-y-3">
            <Logo className="[&_img]:brightness-200" />
            <p className="text-[12px] uppercase tracking-[0.16em] text-paper/50">
              {COMPANY.tagline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href={`mailto:${COMPANY.email}`}
              className="flex items-center gap-1.5 text-[13px] text-paper/60 transition-colors hover:text-gold"
            >
              <Mail size={13} className="opacity-60" />
              {COMPANY.email}
            </a>
            <a
              href={`tel:${COMPANY.phoneTel}`}
              className="flex items-center gap-1.5 text-[13px] text-paper/60 transition-colors hover:text-gold"
            >
              <Phone size={13} className="opacity-60" />
              {COMPANY.phoneDisplay}
            </a>
            <a
              href={COMPANY.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13px] text-paper/60 transition-colors hover:text-gold"
            >
              <Globe size={13} className="opacity-60" />
              atroconstruction.co.ke
            </a>
            <span className="flex items-center gap-1.5 text-[13px] text-paper/40">
              <MapPin size={13} className="opacity-60" />
              {COMPANY.address}
            </span>
          </div>
        </div>

        {/* Sitemap */}
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-paper/10 pt-6 sm:grid-cols-3">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.label}>
              <p className="text-[11px] uppercase tracking-[0.18em] text-paper/30">
                {col.label}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[13px] text-paper/55 transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright + legal, on one quiet line */}
        <div className="mt-8 flex flex-col gap-3 border-t border-paper/10 pt-6 text-[11px] text-paper/40 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {LEGAL_PAGES.filter((p) => p.to !== "/fees").map((p, i) => (
              <span key={p.to} className="flex items-center gap-x-4">
                {i > 0 && <span aria-hidden="true" className="text-paper/20">·</span>}
                <Link to={p.to} className="transition-colors hover:text-gold">
                  {p.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
