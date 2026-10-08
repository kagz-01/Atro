import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { LEGAL_PAGES } from "@/components/legal-page";
import { Mail, Phone, MapPin, Globe, ClipboardCheck } from "lucide-react";
import { COMPANY } from "@/lib/site";

const FOOTER_COLUMNS = [
  {
    label: "Studio",
    links: [
      { to: "/about", label: "About us" },
      { to: "/process", label: "How we work" },
      { to: "/zones", label: "Where we build" },
      { to: "/insights", label: "Insights" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    label: "Work",
    links: [
      { to: "/projects", label: "Projects" },
      { to: "/services", label: "Services" },
      { to: "/start", label: "Start a project" },
    ],
  },
  {
    label: "Tools",
    links: [
      { to: "/tools", label: "All tools" },
      { to: "/tools/cost-calculator", label: "Cost calculator" },
      { to: "/tools/boq-generator", label: "BOQ generator" },
      { to: "/tools/material-prices", label: "Material prices" },
      { to: "/tools/zone-map", label: "Zone map" },
    ],
  },
  {
    label: "Build from abroad",
    links: [
      { to: "/diaspora", label: "The Abroad service" },
      { to: "/portal", label: "Client portal" },
      { to: "/guides/journey", label: "Build journey" },
      { to: "/guides", label: "Guides" },
      { to: "/verify", label: "Verify anyone" },
      { to: "/scam-check", label: "Red flag checker" },
      { to: "/fees", label: "Fees & payment" },
      { to: "/login", label: "Sign in" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden">
      <div className="absolute inset-0 bg-maroon" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/40 via-maroon to-maroon" />

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-14 md:py-16">
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
        <div className="mt-8 grid gap-8 border-t border-paper/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Policies */}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-paper/10 pt-6 text-[12px]">
          <span className="text-[11px] uppercase tracking-[0.18em] text-paper/30">
            Policies
          </span>
          {LEGAL_PAGES.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="text-paper/55 transition-colors hover:text-gold"
            >
              {p.label}
            </Link>
          ))}
        </div>

        {/* Bottom: Copyright + socials */}
        <div className="mt-8 flex flex-col items-center gap-4 border-t border-paper/10 pt-6 md:flex-row md:justify-between">
          <p className="text-[11px] uppercase tracking-[0.18em] text-paper/40">
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link
              to="/portal"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-maroon"
            >
              <ClipboardCheck className="size-3.5" />
              Client portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
