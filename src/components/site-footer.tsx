import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { COMPANY, NAV, SERVICES, ZONES } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-maroon" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/50 via-maroon to-maroon" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 md:px-12 lg:px-16 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo className="[&_img]:brightness-200" />
            <p className="mt-6 text-sm text-paper/70 max-w-sm">
              {COMPANY.support}
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-gold">
              {COMPANY.address} · {COMPANY.hours}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold mb-4">
              Studio
            </p>
            <ul className="space-y-3 text-sm text-paper/80">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="hover:text-gold transition-colors duration-300">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/start" className="hover:text-gold transition-colors duration-300">
                  Start a project
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold mb-4">
              Services
            </p>
            <ul className="space-y-3 text-sm text-paper/80">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    className="hover:text-gold transition-colors duration-300"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold mb-4">
              Where we build
            </p>
            <ul className="space-y-3 text-sm text-paper/80">
              {ZONES.map((z) => (
                <li key={z.slug}>
                  <Link
                    to="/zones/$slug"
                    params={{ slug: z.slug }}
                    className="hover:text-gold transition-colors duration-300"
                  >
                    {z.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-paper/10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-[12px] text-paper/50">
          <p>© {new Date().getFullYear()} {COMPANY.name}</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-gold transition-colors duration-300">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-gold transition-colors duration-300">
              Terms
            </Link>
            <a href={`mailto:${COMPANY.email}`} className="hover:text-gold transition-colors duration-300">
              {COMPANY.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
