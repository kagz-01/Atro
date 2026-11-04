import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { LEGAL_PAGES } from "@/components/legal-page";
import { Mail, Phone } from "lucide-react";
import { COMPANY } from "@/lib/site";

const FOOTER_COLUMNS = [
  {
    label: "Explore",
    links: [
      { to: "/about", label: "About us" },
      { to: "/process", label: "How we work" },
      { to: "/zones", label: "Where we build" },
    ],
  },
  {
    label: "Next step",
    links: [
      { to: "/services", label: "Services" },
      { to: "/projects", label: "Projects" },
      { to: "/start", label: "Start a project" },
      { to: "/contact", label: "Contact" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer data-site-footer className="relative overflow-hidden">
      <div className="absolute inset-0 bg-maroon" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/40 via-maroon to-maroon" />

      <div className="relative mx-auto max-w-[1400px] px-5 pt-8 pb-8 sm:px-8 sm:pt-10 md:px-12 md:pb-12 lg:px-16">
        <div className="flex flex-col gap-5 border-b border-paper/10 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="space-y-1.5">
            <Logo className="[&_img]:brightness-200" />
            <p className="text-[10px] uppercase tracking-[0.14em] text-paper/55 sm:text-[11px]">
              {COMPANY.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:flex sm:flex-wrap sm:justify-end sm:gap-x-5 sm:gap-y-2">
            <a
              href={`mailto:${COMPANY.email}`}
              className="flex min-h-8 items-center gap-2 text-xs text-paper/70 transition-colors hover:text-gold"
            >
              <Mail size={14} className="shrink-0 opacity-70" />
              {COMPANY.email}
            </a>
            <a
              href={`tel:${COMPANY.phoneTel}`}
              className="flex min-h-8 items-center gap-2 text-xs text-paper/70 transition-colors hover:text-gold"
            >
              <Phone size={14} className="shrink-0 opacity-70" />
              {COMPANY.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 py-5 sm:grid-cols-2 sm:gap-10">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.label}>
              <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-paper/45 sm:text-[10px]">
                {col.label}
              </p>
              <ul className="mt-1 space-y-0.5 sm:flex sm:flex-wrap sm:gap-x-5 sm:gap-y-1">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="inline-flex min-h-7 items-center text-xs text-paper/65 transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-paper/10 pt-4 text-[10px] text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {COMPANY.name}</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-3 gap-y-1">
            {LEGAL_PAGES.filter((page) => ["/privacy", "/terms", "/accessibility"].includes(page.to)).map((page) => (
              <Link key={page.to} to={page.to} className="transition-colors hover:text-gold">
                {page.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
