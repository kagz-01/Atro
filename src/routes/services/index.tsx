import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type KeyboardEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  DraftingCompass,
  Hammer,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { CtaBand } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import {
  MYHARDWARE_URL,
  PROJECTS,
  SERVICES,
  SERVICE_CATEGORIES,
  serviceBySlug,
  type Service,
  type ServiceCategory,
} from "@/lib/site";

export const Route = createFileRoute("/services/")({
  validateSearch: (search: Record<string, unknown>): { service?: string } => ({
    service:
      typeof search.service === "string" && serviceBySlug(search.service)
        ? search.service
        : undefined,
  }),
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
  const { service: selectedServiceSlug } = Route.useSearch();
  const navigate = Route.useNavigate();
  const stageOrder: ServiceCategory[] = [
    "advisory",
    "design",
    "construction",
    "specialist",
    "post-construction",
  ];
  const stages = stageOrder.flatMap((id) => {
    const category = SERVICE_CATEGORIES.find((item) => item.id === id);
    if (!category) return [];
    const services = SERVICES.filter((service) => service.category === id);
    const featureService = services[0];
    const relatedProject = featureService?.projectSlugs
      ?.map((slug) => PROJECTS.find((project) => project.slug === slug))
      .find((project) => project !== undefined);
    const image = relatedProject?.image ?? featureService?.image;
    const imageAlt = relatedProject
      ? `${relatedProject.name} — ${relatedProject.type.toLowerCase()} project in ${relatedProject.location}`
      : (featureService?.title ?? category.title);

    return [
      {
        ...category,
        services,
        image,
        imageAlt,
        relatedProject,
      },
    ];
  });
  const selectedService = selectedServiceSlug ? serviceBySlug(selectedServiceSlug) : undefined;
  const [activeStage, setActiveStage] = useState<ServiceCategory>(
    selectedService?.category ?? "advisory",
  );
  const selectedStage =
    stages.find((stage) => stage.id === (selectedService?.category ?? activeStage)) ?? stages[0];
  const selectedIndex = stages.findIndex((stage) => stage.id === selectedStage.id);
  const StageIcon = {
    advisory: Compass,
    design: DraftingCompass,
    construction: Hammer,
    specialist: Sparkles,
    "post-construction": Wrench,
  }[selectedStage.id];

  function handleStageKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % stages.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + stages.length) % stages.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = stages.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      const next = stages[nextIndex];
      setActiveStage(next.id);
      void navigate({ search: {} });
      document.getElementById(`service-stage-tab-${next.id}`)?.focus();
    }
  }

  function selectService(service: Service) {
    setActiveStage(service.category);
    void navigate({ search: { service: service.slug } });
  }

  function selectStage(stage: ServiceCategory) {
    setActiveStage(stage);
    void navigate({ search: {} });
  }

  function clearSelectedService() {
    if (selectedService) setActiveStage(selectedService.category);
    void navigate({ search: {} });
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/80">
              Services
            </p>
          </div>
          <h1 className="reveal reveal-delay-1 max-w-5xl font-display text-[2.2rem] leading-[0.92] tracking-[-0.05em] text-white sm:text-[2.8rem] md:text-[3.2rem] lg:text-[3.8rem]">
            Design, cost planning and construction—clearly scoped.
          </h1>
          <p className="reveal reveal-delay-2 mt-5 max-w-3xl text-base leading-relaxed text-paper/75 sm:text-lg">
            See what each service covers, what your project needs, and how the work can move from
            drawings and quantities to construction.
          </p>
        </div>
      </section>

      {/* Services section */}
      <section className="py-8 md:py-20">
        <div className="container-wide">
          <div className="mb-5 max-w-2xl sm:mb-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy sm:text-xs">
              A project, in sequence
            </p>
            <h2 className="mt-2 font-display text-2xl leading-tight text-maroon sm:text-3xl">
              See what support looks like at each stage.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-base">
              Select a stage to explore the related services, an example and what to prepare.
            </p>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-line/60 bg-paper shadow-card">
            <div
              role="tablist"
              aria-label="Project service stages"
              className="grid grid-cols-2 gap-1 border-b border-line/60 p-2 sm:grid-cols-3 lg:grid-cols-5"
            >
              {stages.map((stage, index) => {
                const Icon = {
                  advisory: Compass,
                  design: DraftingCompass,
                  construction: Hammer,
                  specialist: Sparkles,
                  "post-construction": Wrench,
                }[stage.id];
                const selected = stage.id === activeStage;
                return (
                  <button
                    key={stage.id}
                    id={`service-stage-tab-${stage.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="service-stage-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectStage(stage.id)}
                    onKeyDown={(event) => handleStageKeyDown(event, index)}
                    className={`flex min-h-12 items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-medium transition-colors sm:min-h-14 sm:px-4 sm:text-xs ${
                      selected
                        ? "bg-maroon text-paper"
                        : "text-ink/60 hover:bg-cream hover:text-maroon"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span className="min-w-0">
                      <span className="block leading-tight">{stage.title}</span>
                      <span
                        className={`mt-0.5 block text-[9px] ${selected ? "text-paper/65" : "text-ink/45"}`}
                      >
                        Stage {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              id="service-stage-panel"
              role="tabpanel"
              aria-labelledby={`service-stage-tab-${selectedStage.id}`}
              tabIndex={0}
            >
              <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                <div className="relative min-h-56 bg-stone sm:min-h-72 lg:min-h-full">
                  {selectedStage.image ? (
                    <img
                      key={selectedStage.image}
                      src={selectedStage.image}
                      alt={selectedStage.imageAlt}
                      className="absolute inset-0 size-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon/80 via-maroon/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-paper sm:p-6">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold-light">
                        {selectedStage.relatedProject ? "Project example" : "Stage focus"}
                      </p>
                      <p className="mt-1 font-display text-lg sm:text-2xl">
                        {selectedStage.relatedProject?.name ?? selectedStage.title}
                      </p>
                    </div>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10">
                      <StageIcon className="size-5" aria-hidden />
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-2xl">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-burgundy">
                        {selectedStage.services.length} related services
                      </p>
                      <h3 className="mt-2 font-display text-xl text-maroon sm:text-2xl">
                        {selectedStage.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/65">
                        {selectedStage.description}
                      </p>
                    </div>
                    {selectedStage.relatedProject ? (
                      <Link
                        to="/projects/$slug"
                        params={{ slug: selectedStage.relatedProject.slug }}
                        className="inline-flex min-h-12 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-burgundy underline decoration-gold underline-offset-4"
                      >
                        See example <ArrowRight className="size-3.5" aria-hidden />
                      </Link>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {selectedStage.services.map((service) => (
                      <button
                        key={service.slug}
                        type="button"
                        aria-pressed={selectedService?.slug === service.slug}
                        aria-expanded={selectedService?.slug === service.slug}
                        aria-controls={
                          selectedService?.slug === service.slug
                            ? "selected-service-details"
                            : undefined
                        }
                        onClick={() => selectService(service)}
                        className={`group rounded-xl border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy sm:p-4 ${
                          selectedService?.slug === service.slug
                            ? "border-burgundy bg-cream"
                            : "border-line/60 bg-white hover:border-burgundy/35"
                        }`}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="font-medium leading-tight text-maroon group-hover:text-burgundy">
                            {service.title}
                          </span>
                          <ArrowRight
                            className={`size-4 shrink-0 text-burgundy transition-transform group-hover:translate-x-1 ${
                              selectedService?.slug === service.slug ? "rotate-90" : ""
                            }`}
                            aria-hidden
                          />
                        </span>
                        <span className="mt-1.5 block line-clamp-2 text-xs leading-relaxed text-ink/60">
                          {service.kicker}
                        </span>
                      </button>
                    ))}
                  </div>

                  {selectedService?.category === selectedStage.id ? (
                    <ServiceDetails service={selectedService} onClose={clearSelectedService} />
                  ) : null}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/50 pt-4">
                    <p className="inline-flex items-center gap-2 text-xs text-ink/55">
                      <CheckCircle2 className="size-4 text-gold" aria-hidden />
                      {selectedStage.services[0]?.inputs.slice(0, 2).join(" · ")}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          selectStage(
                            stages[(selectedIndex - 1 + stages.length) % stages.length].id,
                          )
                        }
                        aria-label="Previous service stage"
                        className="grid size-12 place-items-center rounded-full border border-line text-maroon hover:bg-cream"
                      >
                        <ChevronLeft className="size-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => selectStage(stages[(selectedIndex + 1) % stages.length].id)}
                        aria-label="Next service stage"
                        className="grid size-12 place-items-center rounded-full border border-line text-maroon hover:bg-cream"
                      >
                        <ChevronRight className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line/50 bg-[#f7f0e2] py-12 md:py-16">
        <div className="container-wide">
          <div className="flex flex-col gap-5 rounded-[2rem] border border-[#d9cab4] bg-[#f3ead9] p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy">
                MyHardware by ATRO
              </p>
              <h2 className="mt-2 font-display text-[2rem] leading-none text-maroon md:text-[2.6rem]">
                Looking for materials alongside your project?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/70 md:text-base">
                Explore product comparisons and sourcing options through MyHardware. ATRO remains
                your point of contact for design, planning and project delivery.
              </p>
            </div>
            <a
              href={MYHARDWARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-maroon px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-[#5b1c26]"
            >
              Explore MyHardware
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <CtaBand title="Request a consultation" />
    </>
  );
}

function ServiceDetails({ service, onClose }: { service: Service; onClose: () => void }) {
  const projectExamples = PROJECTS.filter((project) =>
    service.projectSlugs?.includes(project.slug),
  ).slice(0, 2);

  return (
    <section
      id="selected-service-details"
      aria-labelledby="selected-service-title"
      className="mt-4 rounded-2xl border border-gold/35 bg-[#f7f1e8] p-4 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-burgundy sm:text-[10px]">
          Service details
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-full border border-line px-3 text-[10px] font-semibold text-ink/70 transition-colors hover:border-burgundy hover:text-burgundy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy sm:min-h-9"
        >
          <X className="size-3.5" aria-hidden />
          Close
        </button>
      </div>

      <h4
        id="selected-service-title"
        className="mt-2 font-display text-xl leading-tight text-maroon sm:text-2xl"
      >
        {service.title}
      </h4>
      <p className="mt-1 text-xs font-medium text-burgundy sm:text-sm">{service.kicker}</p>
      <p className="mt-3 max-w-4xl text-sm leading-relaxed text-ink/75 sm:text-base">
        {service.lede}
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <DetailList title="A good fit for" items={service.types} />
        <DetailList title="What this scope can include" items={service.included} />
        <DetailList title="Useful to have ready" items={service.inputs} />
      </div>

      {service.note ? (
        <p className="mt-4 border-l-2 border-gold pl-3 text-xs leading-relaxed text-ink/70 sm:text-sm">
          {service.note}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 border-t border-line/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-relaxed text-ink/60">
          Your enquiry will include this service, so you can continue without repeating what brought
          you here.
        </p>
        <Button asChild className="min-h-12 shrink-0 px-4 text-[10px] sm:min-h-11 sm:text-[11px]">
          <Link to="/start" search={{ service: service.slug }}>
            Discuss {service.title}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>

      {projectExamples.length > 0 ? (
        <div className="mt-5 border-t border-line/60 pt-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-burgundy">
            Related project examples
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {projectExamples.map((project) => (
              <Link
                key={project.slug}
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className="group flex min-w-0 items-center gap-3 rounded-xl border border-line/70 bg-white p-2 transition-colors hover:border-burgundy/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
              >
                <img
                  src={project.image}
                  alt=""
                  className="size-14 shrink-0 rounded-lg object-cover sm:size-16"
                  loading="lazy"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-maroon group-hover:text-burgundy">
                    {project.name}
                  </span>
                  <span className="mt-1 block text-[10px] text-muted">
                    {project.type} · {project.location}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-burgundy" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-line/70 bg-white/80 p-3 sm:p-4">
      <h5 className="text-[9px] font-semibold uppercase tracking-[0.14em] text-burgundy">
        {title}
      </h5>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-ink/70">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
