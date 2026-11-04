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
      <section className="py-8 md:py-20">
        <div className="container-wide">
          <div className="mb-5 max-w-2xl sm:mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy sm:text-xs">
              Explore our services
            </p>
            <h2 className="mt-2 font-display text-2xl leading-tight text-maroon sm:text-3xl">
              Find the right support for your project.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-base">
              Choose a project stage to see the services, their scope, and what to prepare.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {SERVICE_CATEGORIES.map((cat) => {
              const services = SERVICES.filter((s) => s.category === cat.id);
              const isExpanded = expandedCategory === cat.id;
              const panelId = `services-${cat.id}`;

              return (
                <div
                  key={cat.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-colors duration-300",
                    isExpanded ? "border-maroon/20 shadow-card" : "border-line/60 bg-cream",
                  )}
                >
                  <div className={cn("px-4 py-4 sm:px-6 sm:py-5", isExpanded && "bg-paper")}>
                    <h2 className="text-base leading-tight sm:text-xl">
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                        className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
                      >
                        <span className="font-display text-lg leading-tight tracking-[-0.03em] text-maroon sm:text-2xl">
                          {cat.title}
                        </span>
                        <span className="flex shrink-0 items-center gap-2 text-[10px] font-medium text-muted sm:text-xs">
                          {services.length} services
                          <ChevronDown
                            className={cn(
                              "size-4 transition-transform duration-300",
                              isExpanded && "rotate-180",
                            )}
                          />
                        </span>
                      </button>
                    </h2>
                    <p className="mt-1 pr-8 text-xs leading-relaxed text-ink/65 sm:mt-2 sm:text-sm">
                      {cat.description}
                    </p>
                  </div>

                  <div
                    id={panelId}
                    hidden={!isExpanded}
                    className="grid grid-cols-1 gap-3 border-t border-line/50 bg-paper p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-3"
                  >
                    {services.map((service) => (
                      <Link
                        key={service.slug}
                        to="/services/$slug"
                        params={{ slug: service.slug }}
                        className="group flex min-h-32 flex-col items-start rounded-xl border border-line/60 bg-cream p-4 transition-all duration-300 hover:border-burgundy/35 hover:shadow-card card-lift sm:min-h-44 sm:rounded-2xl sm:p-5"
                      >
                        <p className="line-clamp-2 text-[9px] font-semibold uppercase leading-snug tracking-[0.1em] text-burgundy sm:text-[10px] sm:tracking-[0.14em]">
                          {service.kicker}
                        </p>
                        <h3 className="mt-2 font-display text-lg leading-tight tracking-[-0.03em] text-maroon transition-colors duration-300 group-hover:text-burgundy sm:mt-3 sm:text-xl">
                          {service.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink/70 sm:mt-3 sm:text-sm">
                          {service.lede}
                        </p>
                        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-burgundy group-hover:text-maroon sm:text-[11px]">
                          View scope <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    ))}
                  </div>
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
