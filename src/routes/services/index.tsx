import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { CtaBand } from "@/components/page-hero";
import { SERVICES, SERVICE_CATEGORIES, type ServiceCategory } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services/")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Services — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Architectural design, construction, BOQ and cost planning, project management and interiors — delivered as one sequence.",
      },
    ],
  }),
});

function ServicesPage() {
  const [expandedCategory, setExpandedCategory] = useState<ServiceCategory | null>("design");

  function toggleCategory(id: ServiceCategory) {
    setExpandedCategory(expandedCategory === id ? null : id);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pb-12 pt-28 text-paper md:pb-16 md:pt-36">
        <img
          src="/catalog/images/detail.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,8,10,0.88)_0%,rgba(38,10,13,0.78)_40%,rgba(38,10,13,0.62)_100%)]" />

        <div className="relative container-wide">
          <div className="reveal mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
            <div className="size-1.5 rounded-full bg-gold" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/80">Services</p>
          </div>
          <h1 className="reveal reveal-delay-1 max-w-5xl font-display text-[2.2rem] leading-[0.92] tracking-[-0.05em] text-white sm:text-[2.8rem] md:text-[3.2rem] lg:text-[3.8rem]">
            Design, cost planning and construction—clearly scoped.
          </h1>
          <p className="reveal reveal-delay-2 mt-5 max-w-3xl text-base leading-relaxed text-paper/75 sm:text-lg">
            See what each service covers, what your project needs, and how the work can move from drawings and quantities to construction.
          </p>
        </div>
      </section>

      {/* Services section */}
      <section className="py-10 md:py-24">
        <div className="container-wide">
          {/* Summary stats */}
          <div className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
            {SERVICE_CATEGORIES.map((cat) => {
              const count = SERVICES.filter((s) => s.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all duration-300 md:p-5",
                    expandedCategory === cat.id
                      ? "border-maroon bg-maroon text-paper shadow-soft"
                      : "border-line/60 bg-cream hover:border-burgundy/35 hover:shadow-card card-lift",
                  )}
                >
                  <span className={cn(
                    "font-display text-[2.2rem] font-bold leading-none",
                    expandedCategory === cat.id ? "text-gold" : "text-maroon",
                  )}>
                    {count}
                  </span>
                  <p className={cn(
                    "mt-2 text-sm font-medium",
                    expandedCategory === cat.id ? "text-paper/90" : "text-maroon",
                  )}>
                    {cat.title}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Categories */}
          <div className="space-y-4 sm:space-y-6">
            {SERVICE_CATEGORIES.map((cat) => {
              const services = SERVICES.filter((s) => s.category === cat.id);
              const isExpanded = expandedCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  className={cn(
                    "border rounded-2xl overflow-hidden transition-all duration-300",
                    isExpanded ? "border-maroon/20 shadow-card" : "border-line/50",
                  )}
                >
                  {/* Category header */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className=                    "flex w-full items-center justify-between bg-paper p-3 transition-colors duration-300 hover:bg-stone/20 sm:p-5 md:p-7"
                  >
                    <div className="text-left">
                      <h2 className="font-display text-[1.4rem] leading-tight tracking-[-0.04em] text-maroon sm:text-[2rem] sm:leading-none md:text-[2.5rem]">
                        {cat.title}
                      </h2>
                      <p className="mt-1 text-xs text-ink/60 sm:mt-2 sm:text-sm md:text-base">{cat.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="hidden text-xs font-medium uppercase tracking-[0.14em] text-muted sm:inline">
                        {services.length} service{services.length !== 1 ? "s" : ""}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-5 text-muted transition-transform duration-300",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </div>
                  </button>

                  {/* Services grid - full width */}
                  {isExpanded && (
                    <div className="grid grid-cols-2 gap-3 p-3 sm:gap-4 sm:p-5 md:p-7 lg:grid-cols-3">
                      {services.map((service) => (
                        <Link
                          key={service.slug}
                          to="/services/$slug"
                          params={{ slug: service.slug }}
                          className="group rounded-xl border border-line/60 bg-cream p-3 transition-all duration-300 hover:border-burgundy/35 hover:shadow-card card-lift sm:rounded-2xl sm:p-5"
                        >
                          <p className="line-clamp-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-gold sm:text-[10px] sm:tracking-[0.14em]">
                            {service.kicker}
                          </p>
                          <h3 className="mt-2 font-display text-sm leading-tight tracking-[-0.04em] text-maroon transition-colors duration-300 group-hover:text-burgundy sm:mt-3 sm:text-[1.7rem] sm:leading-none">
                            {service.title}
                          </h3>
                          <p className="mt-2 line-clamp-3 text-[10px] leading-snug text-ink/70 sm:mt-3 sm:text-sm sm:leading-relaxed">
                            {service.lede}
                          </p>
                          <span className="mt-3 inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-burgundy group-hover:text-maroon sm:mt-5 sm:text-[10px] sm:tracking-[0.14em]">
                            View scope <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-line/50 bg-[#f7f0e2] py-12 md:py-16">
        <div className="container-wide">
          <div className="flex flex-col gap-5 rounded-[2rem] border border-[#d9cab4] bg-[#f3ead9] p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy">Materials support</p>
              <h2 className="mt-2 font-display text-[2rem] leading-none text-maroon md:text-[2.6rem]">
                Need product and supplier support?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/70 md:text-base">
                MyHardware is available as a complementary sourcing platform for product comparison, materials checks and supplier support while ATRO manages design, planning and project delivery.
              </p>
            </div>
            <a
              href="https://myhardware.co.ke"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-maroon px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-[#5b1c26]"
            >
              Visit MyHardware
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <CtaBand title="Request a consultation" />
    </>
  );
}
