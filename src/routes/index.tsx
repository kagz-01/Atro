import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Shield, Clock, Eye, AlertTriangle } from "lucide-react";
import { CtaBand } from "@/components/page-hero";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { useRevealOnScroll } from "@/hooks/use-reveal";
import { useParallax } from "@/hooks/use-effects";
import { TestimonialMarquee, LogoMarquee } from "@/components/marquee";
import { ScrollRevealText, SplitText, FloatingElement } from "@/components/scroll-effects";
import { COMPANY, featuredProjects, SERVICES, WHY, ZONES } from "@/lib/site";
import { useSiteStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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
      <Services />
      <Tools />
      <Social />
      <Testimonials />
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

/* ─── Hero with Parallax ─── */
function Hero() {
  const { ref: parallaxRef, offset } = useParallax(0.3);

  return (
    <section ref={parallaxRef} className="relative min-h-[80svh] md:min-h-[85svh] flex items-center overflow-hidden bg-maroon">
      {/* Parallax background layers */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-burgundy via-maroon to-[#1a0204]"
        style={{ transform: `translateY(${offset * 0.5}px)` }}
      />

      {/* Animated glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingElement speed={3} range={30}>
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[140px] animate-[pulse-soft_4s_ease-in-out_infinite]" />
        </FloatingElement>
        <FloatingElement speed={4} range={20}>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-burgundy/30 rounded-full blur-[120px] animate-[pulse-soft_4s_ease-in-out_infinite_1s]" />
        </FloatingElement>
        <FloatingElement speed={5} range={15}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[100px] animate-[pulse-soft_4s_ease-in-out_infinite_2s]" />
        </FloatingElement>
      </div>

      {/* Parallax image */}
      <img
        src="/images/hero.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
        style={{ transform: `translateY(${offset * 0.8}px) scale(1.1)` }}
        fetchPriority="high"
      />
      {/* Bottom vignette to eliminate any image bleed at trust row */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#1a0204] via-[#1a0204]/60 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 md:py-20 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="reveal inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 mb-8">
            <div className="size-2 rounded-full bg-gold animate-[pulse-soft_2s_ease-in-out_infinite]" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/80">
              Nairobi · Design · Construction · Consultancy
            </span>
          </div>

          {/* Headline with word reveal */}
          <SplitText
            text="Designing & building better structures."
            tag="h1"
            className="font-display font-bold text-white text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight"
            delay={200}
            staggerDelay={50}
          />

          {/* Subtitle */}
          <ScrollRevealText delay={800}>
            <p className="mt-8 max-w-xl text-lg text-white/70 leading-relaxed">
              {COMPANY.lede}
            </p>
          </ScrollRevealText>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4 reveal reveal-delay-3">
            <Link
              to="/start"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold to-gold-light text-maroon font-bold text-lg rounded-2xl shadow-glow-gold btn-lift overflow-hidden"
            >
              <span className="relative z-10">Start a project</span>
              <ArrowRight className="size-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl text-lg hover:bg-white/15 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] btn-lift transition-all duration-300"
            >
              View our work
            </Link>
          </div>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-white/60 reveal reveal-delay-4">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-gold" />
              <span>85+ projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-gold" />
              <span>7 zones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-gold" />
              <span>Since 2018</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Problem ─── */
function Problem() {
  const { ref, revealed } = useRevealOnScroll();

  const problems = [
    {
      icon: <AlertTriangle className="size-5" />,
      title: "Trust without evidence",
      desc: "You're asked to trust a contractor with your life savings based on a handshake and a WhatsApp photo.",
      stat: "73%",
      statLabel: "of projects exceed budget",
    },
    {
      icon: <Eye className="size-5" />,
      title: "No visibility",
      desc: "Clients cannot see what is happening on their site. Progress equals WhatsApp photos with no context.",
      stat: "2-3x",
      statLabel: "more follow-ups needed",
    },
    {
      icon: <Shield className="size-5" />,
      title: "No accountability",
      desc: "Quotes are verbal. Changes are assumed. The final bill is a surprise nobody can argue with.",
      stat: "40%",
      statLabel: "of projects face disputes",
    },
    {
      icon: <Clock className="size-5" />,
      title: "No timeline",
      desc: "Projects drift. Decisions evaporate. Almost finished can mean six more months.",
      stat: "6+ months",
      statLabel: "average delay",
    },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div ref={ref} className={cn("reveal-on-scroll", revealed && "revealed")}>
          <SplitText
            text="Kenyan construction is built on trust that never gets tested."
            tag="h2"
            className="font-display text-4xl md:text-5xl text-maroon max-w-4xl"
            delay={100}
          />
          <p className="mt-5 text-ink/70 text-lg max-w-2xl">
            Until it does. Then everyone discovers the drawings were suggestions, the quote was a wish, and the timeline was fiction.
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
          {problems.map((p, i) => (
            <Reveal
              key={p.title}
              className="p-6 bg-cream border border-line rounded-2xl card-lift hover:shadow-card-hover transition-all duration-300"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="size-12 rounded-xl bg-maroon/10 flex items-center justify-center text-burgundy mb-4">
                {p.icon}
              </div>
              <h3 className="font-display text-xl text-maroon">{p.title}</h3>
              <p className="mt-2 text-sm text-ink/70">{p.desc}</p>
              <div className="mt-4 pt-4 border-t border-line/50">
                <span className="font-display text-2xl text-gradient-gold">{p.stat}</span>
                <p className="text-xs text-muted mt-1">{p.statLabel}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Solution ─── */
function Solution() {
  const { ref, revealed } = useRevealOnScroll();
  const { ref: parallaxRef, offset } = useParallax(0.1);

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
      desc: "Photo timelines, written decisions, weekly updates. You know the status without chasing a voice note.",
      link: "/portal",
    },
  ];

  return (
    <section ref={parallaxRef} className="relative py-24 md:py-32 overflow-hidden">
      {/* Parallax background */}
      <div
        className="absolute inset-0 bg-maroon"
        style={{ transform: `translateY(${offset * 0.3}px)` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-burgundy/50 via-maroon to-maroon" />

      {/* Decorative blob */}
      <FloatingElement speed={4} range={25}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[200px] pointer-events-none" />
      </FloatingElement>

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div ref={ref} className={cn("reveal-on-scroll", revealed && "revealed")}>
          <SplitText
            text="Three principles. No slogans."
            tag="h2"
            className="font-display text-4xl md:text-5xl text-paper max-w-4xl"
            delay={100}
          />
          <p className="mt-5 text-paper/70 text-lg max-w-2xl">
            ATRO is not a directory of contractors. We design, we quantity, we build. One team, one responsibility.
          </p>
        </div>

        <div className="mt-16 grid lg:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <Reveal key={p.number} style={{ transitionDelay: `${i * 100}ms` }}>
              <Link
                to={p.link}
                className="group block p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-gold/30 hover:bg-white/10 hover:shadow-[0_20px_60px_rgba(201,146,79,0.12)] card-lift transition-all duration-300 h-full"
              >
                <span className="text-gradient-gold font-display text-3xl font-bold">{p.number}</span>
                <h3 className="mt-4 font-display text-2xl text-paper group-hover:text-gold transition-colors duration-300">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm text-paper/70 leading-relaxed">{p.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-gold">
                  Learn more <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Proof ─── */
function Proof({ projects }: { projects: ReturnType<typeof featuredProjects> }) {
  const { ref, revealed } = useRevealOnScroll();

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div ref={ref} className={cn("reveal-on-scroll flex items-end justify-between gap-6 mb-12", revealed && "revealed")}>
          <div>
            <SplitText
              text="Evidence, not slogans."
              tag="h2"
              className="font-display text-4xl md:text-5xl text-maroon"
              delay={100}
            />
          </div>
          <Link
            to="/projects"
            className="hidden sm:inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-burgundy hover:text-maroon underline-animate"
          >
            All projects <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {projects.slice(0, 3).map((p, i) => (
            <Reveal key={p.slug} style={{ transitionDelay: `${i * 100}ms` }}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center sm:text-left">
          <Button asChild variant="outline" className="rounded-2xl">
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

/* ─── Services ─── */
function Services() {
  const { ref, revealed } = useRevealOnScroll();

  const featuredServices = SERVICES.slice(0, 6);

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-stone/60 to-paper">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div ref={ref} className={cn("reveal-on-scroll flex items-end justify-between gap-6 mb-12", revealed && "revealed")}>
          <div>
            <SplitText
              text="What we do, and how we do it."
              tag="h2"
              className="font-display text-4xl md:text-5xl text-maroon"
              delay={100}
            />
          </div>
          <Link
            to="/services"
            className="hidden sm:inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-burgundy hover:text-maroon underline-animate"
          >
            All services <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {featuredServices.map((s, i) => (
            <Reveal key={s.slug} style={{ transitionDelay: `${i * 80}ms` }}>
              <Link
                to="/services/$slug"
                params={{ slug: s.slug }}
                className="group block p-6 bg-cream border border-line/50 rounded-2xl hover:shadow-card hover:border-gold/30 card-lift transition-all duration-300 h-full"
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-gold">
                  {s.kicker}
                </p>
                <h3 className="mt-3 font-display text-xl text-maroon group-hover:text-burgundy transition-colors duration-300">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-ink/70 line-clamp-2">
                  {s.lede}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-burgundy group-hover:text-maroon">
                  View scope <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Tools ─── */
function Tools() {
  const { ref, revealed } = useRevealOnScroll();

  const tools = [
    {
      title: "Cost Calculator",
      desc: "Get an instant indicative cost range for your project. Six questions, one answer.",
      link: "/tools/cost-calculator",
      icon: "📊",
    },
    {
      title: "Zone Map",
      desc: "See where we build and what it costs in each region of Kenya.",
      link: "/tools/zone-map",
      icon: "📍",
    },
    {
      title: "BOQ Generator",
      desc: "Build a SMM2 bill of quantities line by line, then export it.",
      link: "/tools/boq-generator",
      icon: "🧾",
    },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div ref={ref} className={cn("reveal-on-scroll text-center max-w-3xl mx-auto mb-12", revealed && "revealed")}>
          <h2 className="font-display text-4xl md:text-5xl text-maroon">
            Decide with data, not guesses.
          </h2>
          <p className="mt-5 text-ink/70 text-lg">
            Free tools to help you understand costs, timelines and what's possible.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 stagger">
          {tools.map((t, i) => (
            <Reveal key={t.title} style={{ transitionDelay: `${i * 100}ms` }}>
              <Link
                to={t.link}
                className="group block p-8 bg-maroon rounded-2xl text-center hover:shadow-card-hover hover:bg-burgundy card-lift transition-all duration-300 h-full"
              >
                <span className="text-4xl">{t.icon}</span>
                <h3 className="mt-4 font-display text-xl text-paper group-hover:text-gold transition-colors duration-300">
                  {t.title}
                </h3>
                <p className="mt-2 text-sm text-paper/70">
                  {t.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-gold group-hover:text-gold-light">
                  Try it <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Social Proof ─── */
function Social() {
  const { ref, revealed } = useRevealOnScroll();

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-stone/60 to-paper">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <div ref={ref} className={cn("reveal-on-scroll text-center max-w-4xl mx-auto", revealed && "revealed")}>
          <SplitText
            text="Integrated thinking. Then the unglamorous work of making it stand up."
            tag="h2"
            className="font-display text-4xl md:text-5xl text-maroon"
            delay={100}
          />
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {WHY.map((w, i) => (
            <ScrollRevealText key={w.title} delay={i * 100}>
              <article className="p-8 bg-cream border border-line rounded-2xl card-lift hover:shadow-card transition-all duration-300 h-full">
                <h3 className="font-display text-xl text-maroon">{w.title}</h3>
                <p className="mt-3 text-sm text-ink/70">{w.body}</p>
              </article>
            </ScrollRevealText>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  return (
    <section className="py-16 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 mb-8">
        <h2 className="font-display text-3xl md:text-4xl text-maroon">
          Trusted by homeowners across Kenya
        </h2>
      </div>
      <TestimonialMarquee />
      <div className="mt-8">
        <LogoMarquee />
      </div>
    </section>
  );
}

/* ─── Diaspora Banner ─── */
function DiasporaBanner() {
  return (
    <div className="bg-gradient-to-r from-gold to-gold-light text-maroon">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-3 text-sm flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
        <p>
          Diaspora mode is on. Contact, timelines and proof of progress are set up for clients who are not on the site.
        </p>
        <Link to="/contact" className="uppercase tracking-[0.14em] text-[11px] font-medium underline-animate">
          How we run remote projects →
        </Link>
      </div>
    </div>
  );
}
