import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Shield, Clock, MapPin, Eye } from "lucide-react";
import { CtaBand } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ARTICLES,
  COMPANY,
  featuredProjects,
  PROCESS_STEPS,
  SERVICES,
  WHY,
  ZONES,
} from "@/lib/site";
import { useSiteStore } from "@/lib/store";

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
      {diaspora ? <DiasporaBanner /> : null}
      <Problem />
      <Solution />
      <Proof projects={featured} />
      <Process />
      <Social />
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

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative h-[85svh] min-h-[600px] flex items-end text-paper">
      <img
        src="/images/hero.webp"
        alt="Contemporary Kenyan courtyard house at dusk"
        className="absolute inset-0 w-full h-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-maroon via-maroon/60 to-maroon/20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 w-full pb-16 md:pb-24 pt-32">
        <Badge tone="gold" className="mb-6">Nairobi · Design · Construction</Badge>
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-paper max-w-4xl leading-[0.95]">
          Designing & building{" "}
          <em className="italic font-medium">better structures.</em>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-paper/80">
          Integrated design, construction and consultancy for residential, commercial and institutional projects across Kenya.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild variant="gold" size="lg">
            <Link to="/start">
              Start a project
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="line" size="lg">
            <Link to="/projects">View our work</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─── Problem ─── */
function Problem() {
  const problems = [
    {
      icon: <Eye className="size-5" />,
      title: "No visibility",
      desc: "Clients cannot see what is happening on their site. Progress = WhatsApp photos with no context.",
    },
    {
      icon: <Shield className="size-5" />,
      title: "No accountability",
      desc: "Quotes are verbal. Changes are assumed. The final bill is a surprise nobody can argue with.",
    },
    {
      icon: <MapPin className="size-5" />,
      title: "No honest coverage",
      desc: "Firms claim nationwide delivery but only show up in Nairobi. Diaspora clients find out too late.",
    },
    {
      icon: <Clock className="size-5" />,
      title: "No timeline",
      desc: "Projects drift. Decisions evaporate. 'Almost finished' can mean six more months.",
    },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <Badge tone="maroon" className="mb-4">The problem</Badge>
          <h2 className="font-display text-4xl md:text-5xl text-maroon">
            Kenyan construction is built on trust that never gets tested.
          </h2>
          <p className="mt-5 text-ink/70 text-lg">
            Until it does. Then everyone discovers the drawings were suggestions, the quote was a wish, and the timeline was fiction.
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((p) => (
            <div key={p.title}>
              <div className="size-10 rounded-sm bg-burgundy/10 flex items-center justify-center text-burgundy">
                {p.icon}
              </div>
              <h3 className="mt-4 font-display text-xl text-maroon">{p.title}</h3>
              <p className="mt-2 text-sm text-ink/70">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Solution ─── */
function Solution() {
  const pillars = [
    {
      number: "01",
      title: "Design + Build, one team",
      desc: "The architect and the contractor are the same people. The drawing does not get thrown over a wall. A beautiful wall is also a buildable one.",
      link: "/services",
    },
    {
      number: "02",
      title: "Quantities before construction",
      desc: "Every project starts with a Bill of Quantities. You see the cost before you fall in love with a stair the budget cannot carry.",
      link: "/tools/cost-calculator",
    },
    {
      number: "03",
      title: "Visible project management",
      desc: "Photo timelines, written decisions, weekly updates. You know the status without chasing a voice note — especially if you are not in the country.",
      link: "/tools/live-tracker",
    },
  ];

  return (
    <section className="bg-maroon text-paper py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <Badge tone="gold" className="mb-4">How we work</Badge>
          <h2 className="font-display text-4xl md:text-5xl text-paper">
            Three principles. No slogans.
          </h2>
          <p className="mt-5 text-paper/70 text-lg">
            ATRO is not a directory of contractors. We design, we quantity, we build. One team, one responsibility.
          </p>
        </div>

        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          {pillars.map((p) => (
            <Link
              key={p.number}
              to={p.link}
              className="group p-8 border border-paper/15 rounded-sm hover:border-gold/50 transition-colors"
            >
              <span className="text-gold font-display text-3xl">{p.number}</span>
              <h3 className="mt-4 font-display text-2xl text-paper group-hover:text-gold transition-colors">
                {p.title}
              </h3>
              <p className="mt-3 text-sm text-paper/70">{p.desc}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-gold">
                Learn more <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Proof ─── */
function Proof({ projects }: { projects: ReturnType<typeof featuredProjects> }) {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <Badge tone="maroon" className="mb-4">Our work</Badge>
            <h2 className="font-display text-4xl md:text-5xl text-maroon">
              Evidence, not slogans.
            </h2>
          </div>
          <Link
            to="/projects"
            className="hidden sm:inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-burgundy hover:text-maroon"
          >
            All projects <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>

        <div className="mt-10 text-center sm:text-left">
          <Button asChild variant="outline">
            <Link to="/projects">
              View all projects
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─── Process (condensed) ─── */
function Process() {
  return (
    <section className="bg-stone/60 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4">
            <Badge tone="maroon" className="mb-4">Process</Badge>
            <h2 className="font-display text-4xl md:text-5xl text-maroon">
              Eight steps. None of them are "we will see."
            </h2>
            <p className="mt-5 text-ink/70">
              From first conversation to handover — a defined process that keeps decisions on paper and money in check.
            </p>
            <Button asChild className="mt-8">
              <Link to="/process">
                Full process
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="lg:col-span-8">
            <div className="grid sm:grid-cols-2 gap-6">
              {PROCESS_STEPS.slice(0, 4).map((s) => (
                <div key={s.n} className="p-5 bg-paper border border-line rounded-sm">
                  <span className="text-gold font-display text-2xl">{s.n}</span>
                  <h3 className="mt-2 font-display text-lg text-maroon">{s.title}</h3>
                  <p className="mt-1 text-sm text-ink/70 line-clamp-2">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Social Proof ─── */
function Social() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <Badge tone="maroon" className="mb-4">Why ATRO</Badge>
          <h2 className="font-display text-4xl md:text-5xl text-maroon">
            Integrated thinking. Then the unglamorous work of making it stand up.
          </h2>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
          {WHY.map((w) => (
            <article key={w.title} className="bg-paper p-8">
              <h3 className="font-display text-xl text-maroon">{w.title}</h3>
              <p className="mt-3 text-sm text-ink/70">{w.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Diaspora Banner ─── */
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
