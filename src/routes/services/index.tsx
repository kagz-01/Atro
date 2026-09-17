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
      <section className="relative pt-28 md:pt-36 pb-12 md:pb-16 min-h-[52vh] text-paper overflow-hidden">
        <img
          src="/images/detail.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-maroon via-maroon/70 to-maroon/40" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-gold/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative container-wide">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-maroon/10 mb-6">
            <div className="size-1.5 rounded-full bg-gold" />
            <p className="text-[11px] uppercase tracking-[0.2em] text-burgundy">Services</p>
          </div>
          <h1 className="reveal reveal-delay-1 font-display text-5xl sm:text-6xl md:text-7xl max-w-5xl">
            What is included. What we need from you. What happens next.
          </h1>
          <p className="reveal reveal-delay-2 mt-6 max-w-3xl text-lg text-paper/80">
            Not a list of virtues. Each service is a scope: drawings, quantities, a site, a conversation.
          </p>
        </div>
      </section>

      {/* Services section */}
      <section className="py-16 md:py-24">
        <div className="container-wide">
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {SERVICE_CATEGORIES.map((cat) => {
              const count = SERVICES.filter((s) => s.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "p-5 rounded-2xl border text-left transition-all duration-300",
                    expandedCategory === cat.id
                      ? "bg-maroon text-paper border-maroon shadow-soft"
                      : "bg-cream border-line/50 hover:border-burgundy/30 hover:shadow-card card-lift",
                  )}
                >
                  <span className={cn(
                    "text-3xl font-display font-bold",
                    expandedCategory === cat.id ? "text-gradient-gold" : "text-maroon",
                  )}>
                    {count}
                  </span>
                  <p className={cn(
                    "mt-2 text-sm font-medium",
                    expandedCategory === cat.id ? "text-paper" : "text-maroon",
                  )}>
                    {cat.title}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Categories */}
          <div className="space-y-6">
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
                    className="w-full flex items-center justify-between p-6 md:p-8 bg-paper hover:bg-stone/30 transition-colors duration-300"
                  >
                    <div className="text-left">
                      <h2 className="font-display text-2xl md:text-3xl text-maroon">
                        {cat.title}
                      </h2>
                      <p className="mt-1 text-sm text-ink/60">{cat.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted hidden sm:inline">
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
                    <div className="p-6 md:p-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {services.map((service) => (
                        <Link
                          key={service.slug}
                          to="/services/$slug"
                          params={{ slug: service.slug }}
                          className="group p-6 bg-cream border border-line/50 rounded-xl hover:border-burgundy/30 hover:shadow-card card-lift transition-all duration-300"
                        >
                          <p className="text-[11px] uppercase tracking-[0.14em] text-gold">
                            {service.kicker}
                          </p>
                          <h3 className="mt-3 font-display text-xl text-maroon group-hover:text-burgundy transition-colors duration-300">
                            {service.title}
                          </h3>
                          <p className="mt-3 text-sm text-ink/70 line-clamp-3">
                            {service.lede}
                          </p>
                          <span className="mt-5 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-burgundy group-hover:text-maroon">
                            View scope <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
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

      <CtaBand title="Request a consultation" />
    </>
  );
}
