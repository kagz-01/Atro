import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { CtaBand } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { estimateCost, FINISHES, PROJECT_TYPES, type CostProjectType, type FinishId } from "@/lib/cost";
import {
  ARTICLES,
  COMPANY,
  featuredProjects,
  PROCESS_STEPS,
  SERVICES,
  TRUST_POINTS,
  WHY,
  ZONES,
} from "@/lib/site";
import { useSiteStore } from "@/lib/store";
import { formatKes } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      {
        title: "ATRO Design & Construction — Designing & Building Better Structures",
      },
      {
        name: "description",
        content: COMPANY.lede,
      },
    ],
  }),
});

function Home() {
  const diaspora = useSiteStore((s) => s.diasporaMode);
  const featured = featuredProjects();

  return (
    <>
      <Hero />
      <TrustStrip />
      {diaspora ? <DiasporaBanner /> : null}
      <ProblemAndZone />
      <WorkPreview projects={featured} />
      <CostTeaser />
      <Why />
      <ProcessPreview />
      <ServicesPreview />
      <InsightsPreview />
      <CtaBand />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "GeneralContractor",
            name: COMPANY.name,
            url: "https://atro.ke",
            email: COMPANY.email,
            telephone: COMPANY.phoneTel,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Nairobi",
              addressCountry: "KE",
            },
            areaServed: ZONES.map((z) => z.name),
            description: COMPANY.lede,
          }),
        }}
      />
    </>
  );
}

function Hero() {
  return (
    <section className="relative h-[75svh] min-h-[500px] flex items-end text-paper">
      <img
        src="/images/hero.webp"
        alt="Contemporary Kenyan courtyard house at dusk"
        className="absolute inset-0 w-full h-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-maroon via-maroon/55 to-maroon/25" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 w-full pb-16 md:pb-24 pt-32">
        <p className="reveal text-[11px] uppercase tracking-[0.22em] text-gold">
          Kenya · Design · Construction · Consultancy
        </p>
        <h1 className="reveal reveal-delay-1 mt-5 font-display text-5xl sm:text-6xl md:text-8xl text-paper max-w-5xl">
          Designing & building{" "}
          <em className="italic font-medium">better structures.</em>
        </h1>
        <p className="reveal reveal-delay-2 mt-6 max-w-xl text-lg text-paper/80">
          {COMPANY.lede}
        </p>
        <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
          <Button asChild variant="gold" size="lg">
            <Link to="/start">Start a project</Link>
          </Button>
          <Button asChild variant="line" size="lg">
            <Link to="/projects">View our work</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="bg-maroon text-paper border-t border-gold/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-5 gap-6">
        {TRUST_POINTS.map((t) => (
          <div key={t.title}>
            <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{t.title}</p>
            <p className="mt-2 text-sm text-paper/75">{t.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DiasporaBanner() {
  return (
    <div className="bg-gold text-maroon">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 text-sm flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
        <p>
          Diaspora mode is on. Contact, timelines and proof of progress are set up for clients who are not on the site.
        </p>
        <Link to="/zones/$slug" params={{ slug: "diaspora" }} className="uppercase tracking-[0.14em] text-[11px] font-medium">
          How we run remote projects →
        </Link>
      </div>
    </div>
  );
}

function ProblemAndZone() {
  const setZone = useSiteStore((s) => s.setSelectedZone);
  const selected = useSiteStore((s) => s.selectedZone);
  const [query, setQuery] = useState("");

  const match = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && selected) return ZONES.find((z) => z.slug === selected);
    if (!q) return null;
    return ZONES.find(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        z.region.toLowerCase().includes(q) ||
        z.slug.includes(q),
    );
  }, [query, selected]);

  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">The gap</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Most Kenyan construction sites do not tell you where they actually build.
          </h2>
          <p className="mt-5 text-ink/75">
            Buyers — and especially diaspora clients — cannot tell if a firm will show up in Kiambu, or only keep a Nairobi phone number. ATRO publishes coverage, then routes the enquiry.
          </p>
        </div>
        <div className="lg:col-span-7 border border-line bg-cream p-6 md:p-8 rounded-md">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Zone intelligence</p>
          <h3 className="font-display text-3xl text-maroon mt-2">Do we build where you are?</h3>
          <label className="block mt-6">
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted">County, town, or “diaspora”</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kiambu, Nyali, Nakuru…"
              className="mt-2 w-full h-12 border border-line bg-paper px-3 rounded-sm outline-none focus:border-burgundy"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            {ZONES.map((z) => (
              <button
                key={z.slug}
                type="button"
                onClick={() => {
                  setQuery(z.name);
                  setZone(z.slug);
                }}
                className="h-9 px-3 text-[11px] uppercase tracking-[0.12em] border border-line rounded-xs hover:border-burgundy"
              >
                {z.name}
              </button>
            ))}
          </div>
          {match ? (
            <div className="mt-8 pt-6 border-t border-line">
              <div className="flex items-center gap-3">
                <Badge tone="gold">{match.coverage}</Badge>
                <span className="font-display text-2xl text-maroon">{match.name}</span>
              </div>
              <p className="mt-3 text-ink/75">{match.summary}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild size="sm">
                  <Link to="/zones/$slug" params={{ slug: match.slug }}>
                    Zone page
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/start">Start a project here</Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted">
              Type a place. If we are not there yet, the enquiry form will say so before you write a novel.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function WorkPreview({ projects }: { projects: ReturnType<typeof featuredProjects> }) {
  return (
    <section className="pb-20 md:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Work</p>
            <h2 className="mt-2 font-display text-4xl md:text-5xl">Evidence, not slogans.</h2>
          </div>
          <Link
            to="/projects"
            className="hidden sm:inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-burgundy"
          >
            All projects <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 6).map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CostTeaser() {
  const zone = useSiteStore((s) => s.selectedZone) ?? "nairobi";
  const [type, setType] = useState<CostProjectType>("Residential");
  const [finish, setFinish] = useState<FinishId>("standard");
  const [sqm, setSqm] = useState(220);
  const result = estimateCost({ type, zone, sqm, finish });

  return (
    <section className="bg-stone/70 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Cost range</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">A number you can argue with — not a quote.</h2>
          <p className="mt-5 text-ink/75">
            Three questions. An indicative band. Then a person. We would rather show you the arithmetic than hide it behind “it depends.”
          </p>
        </div>
        <div className="lg:col-span-7 bg-cream border border-line p-6 md:p-8 rounded-md">
          <div className="grid sm:grid-cols-2 gap-4">
            <label>
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Type</span>
              <select
                className="mt-2 w-full h-12 border border-line bg-paper px-3 rounded-sm"
                value={type}
                onChange={(e) => setType(e.target.value as CostProjectType)}
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Finish</span>
              <select
                className="mt-2 w-full h-12 border border-line bg-paper px-3 rounded-sm"
                value={finish}
                onChange={(e) => setFinish(e.target.value as FinishId)}
              >
                {FINISHES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block mt-6">
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
              Area · {sqm} m² · {ZONES.find((z) => z.slug === zone)?.name}
            </span>
            <input
              type="range"
              min={80}
              max={600}
              step={10}
              value={sqm}
              onChange={(e) => setSqm(Number(e.target.value))}
              className="mt-3 w-full accent-burgundy"
              suppressHydrationWarning
            />
          </label>
          <div className="mt-8 bg-maroon text-paper p-6 rounded-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Indicative</p>
            <p className="font-display text-4xl mt-2 tabular-nums">{result.label}</p>
            <p className="text-sm text-paper/70 mt-2">
              Midpoint about {formatKes(result.perSqm)} / m². Not a quotation.
            </p>
          </div>
          <Button asChild className="mt-6">
            <Link to="/start">Turn this into an enquiry</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Why ATRO</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl max-w-3xl">
          Integrated thinking. Then the unglamorous work of making it stand up.
        </h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
          {WHY.map((w) => (
            <article key={w.title} className="bg-paper p-8">
              <h3 className="font-display text-2xl text-maroon">{w.title}</h3>
              <p className="mt-3 text-ink/75">{w.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessPreview() {
  return (
    <section className="bg-maroon text-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Process</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-paper">Eight steps. None of them are “we will see.”</h2>
          </div>
          <Link to="/process" className="hidden sm:inline-flex text-[12px] uppercase tracking-[0.16em] text-gold">
            Full journey →
          </Link>
        </div>
        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PROCESS_STEPS.map((s) => (
            <li key={s.n}>
              <p className="text-gold font-display text-3xl">{s.n}</p>
              <h3 className="mt-2 font-display text-2xl text-paper">{s.title}</h3>
              <p className="mt-2 text-sm text-paper/70">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ServicesPreview() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Services</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">What we actually deliver.</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group border border-line p-6 rounded-sm hover:border-burgundy bg-cream"
            >
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{s.kicker}</p>
              <h3 className="mt-2 font-display text-2xl text-maroon group-hover:text-burgundy">{s.title}</h3>
              <p className="mt-3 text-sm text-ink/70 line-clamp-3">{s.lede}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function InsightsPreview() {
  return (
    <section className="pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Insights</p>
            <h2 className="mt-2 font-display text-4xl">Notes from the site, not from a brochure.</h2>
          </div>
          <Link to="/insights" className="hidden sm:inline-flex text-[12px] uppercase tracking-[0.16em] text-burgundy">
            All notes →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {ARTICLES.map((a) => (
            <Link key={a.slug} to="/insights/$slug" params={{ slug: a.slug }} className="group">
              <div className="aspect-[16/10] overflow-hidden bg-stone">
                <img src={a.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
              </div>
              <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted">
                {a.kicker} · {a.read}
              </p>
              <h3 className="mt-2 font-display text-2xl text-maroon group-hover:text-burgundy">{a.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
