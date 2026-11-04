import { Link } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Download,
  Share2,
  RotateCcw,
  Sparkles,
  MapPin,
  Building2,
  Ruler,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PROJECT_TYPES,
  FINISHES,
  estimateCost,
  COST_CAVEAT,
  type CostProjectType,
  type FinishId,
} from "@/lib/cost";
import { ZONES } from "@/lib/site";
import { KENYA_COUNTIES } from "@/lib/counties";
import { useSiteStore } from "@/lib/store";
import { formatKes } from "@/lib/utils";

const STEPS = ["type", "zone", "size", "finish", "result"] as const;
type Step = (typeof STEPS)[number];

const SIZE_PRESETS = [90, 160, 260, 420];

const COST_LOCATIONS = [
  ...KENYA_COUNTIES.map((county) => ({
    slug: county.slug,
    name: county.name,
    note: county.serviceZoneSlug
      ? ZONES.find((zone) => zone.slug === county.serviceZoneSlug)?.coverage ??
        "Existing area factor"
      : "National baseline only",
  })),
  { slug: "coast", name: "Coast (regional)", note: "Limited · regional factor" },
];

export function CostCalculator({
  initialValues,
}: {
  initialValues?: {
    type?: CostProjectType;
    zone?: string;
    sqm?: number;
    finish?: FinishId;
  };
}) {
  const storeZone = useSiteStore((s) => s.selectedZone) ?? "nairobi";
  const defaultZone = COST_LOCATIONS.some(
    (location) => location.slug === initialValues?.zone,
  )
    ? initialValues?.zone ?? "nairobi"
    : COST_LOCATIONS.some((location) => location.slug === storeZone)
      ? storeZone
      : "nairobi";
  const hasSharedEstimate =
    !!initialValues?.type &&
    !!initialValues.zone &&
    initialValues.sqm !== undefined &&
    !!initialValues.finish;
  const [step, setStep] = useState<Step>(hasSharedEstimate ? "result" : "type");
  const [type, setType] = useState<CostProjectType>(
    initialValues?.type ?? "Residential",
  );
  const [zone, setZone] = useState(defaultZone);
  const [locationSearch, setLocationSearch] = useState("");
  const [sqm, setSqm] = useState(initialValues?.sqm ?? 220);
  const [finish, setFinish] = useState<FinishId>(
    initialValues?.finish ?? "standard",
  );
  const [sqmInput, setSqmInput] = useState(String(initialValues?.sqm ?? 220));

  const stepIdx = STEPS.indexOf(step);
  const result = estimateCost({ type, zone, sqm, finish });
  const activeType = PROJECT_TYPES.find((project) => project.id === type) ?? PROJECT_TYPES[0];
  const activeFinish = FINISHES.find((option) => option.id === finish) ?? FINISHES[1];
  const visibleLocations = COST_LOCATIONS.filter((location) =>
    location.name.toLocaleLowerCase().includes(locationSearch.trim().toLocaleLowerCase()),
  );

  useEffect(() => {
    if (initialValues?.type) setType(initialValues.type);
    if (initialValues?.zone && COST_LOCATIONS.some((item) => item.slug === initialValues.zone)) {
      setZone(initialValues.zone);
    }
    if (initialValues?.sqm !== undefined) {
      setSqm(initialValues.sqm);
      setSqmInput(String(initialValues.sqm));
    }
    if (initialValues?.finish) setFinish(initialValues.finish);
    if (hasSharedEstimate) setStep("result");
    else if (initialValues?.zone) setStep("type");
  }, [
    hasSharedEstimate,
    initialValues?.finish,
    initialValues?.sqm,
    initialValues?.type,
    initialValues?.zone,
  ]);

  const next = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };
  const prev = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const handleSqmSlider = (val: number) => {
    setSqm(val);
    setSqmInput(String(val));
  };

  const handleSqmInput = (val: string) => {
    setSqmInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 40 && num <= 800) setSqm(num);
  };

  const handleDownloadPdf = useCallback(() => {
    const finishLabel = FINISHES.find((f) => f.id === finish)?.label ?? finish;
    const content = [
      "ATRO DESIGN & CONSTRUCTION — COST ESTIMATE",
      "",
      `Project Type: ${type}`,
      `Location: ${result.zoneName}`,
      `Floor Area: ${sqm} m²`,
      `Finish Level: ${finishLabel}`,
      "",
      "INDICATIVE RANGE",
      `Low end: ${formatKes(result.min)}`,
      `High end: ${formatKes(result.max)}`,
      `Midpoint: ${formatKes(result.perSqm)} / m²`,
      `Timeline: ${result.timeline}`,
      "",
      "COST BREAKDOWN",
      `Structure & frame: ${formatKes(result.breakdown.structure)}`,
      `Finishes & fixtures: ${formatKes(result.breakdown.finishes)}`,
      `MEP services: ${formatKes(result.breakdown.services)}`,
      `External works: ${formatKes(result.breakdown.external)}`,
      `Professional fees: ${formatKes(result.breakdown.professional)}`,
      `Contingency: ${formatKes(result.breakdown.contingency)}`,
      "",
      result.locationNote,
      "",
      result.caveat,
      "",
      `Generated: ${new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atro-cost-estimate-${type.toLowerCase()}-${sqm}sqm.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [type, sqm, finish, result]);

  const handleShare = useCallback(async () => {
    const finishLabel = FINISHES.find((f) => f.id === finish)?.label ?? finish;
    const text = `ATRO Cost Estimate\n${type} · ${result.zoneName} · ${sqm}m² · ${finishLabel}\nRange: ${result.label}\nTimeline: ${result.timeline}`;
    const url = `https://atro.co.ke/tools/cost-calculator?type=${type}&zone=${zone}&sqm=${sqm}&finish=${finish}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "ATRO Cost Estimate", text, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    }
  }, [type, zone, sqm, finish, result]);

  const nextLabel =
    step === "type"
      ? "Next: location"
      : step === "zone"
        ? "Next: size"
        : step === "size"
          ? "Next: finish"
          : "View estimate";

  return (
    <div className="bg-cream border border-line rounded-2xl overflow-hidden shadow-card">
      {/* Progress bar */}
      <div className="h-1.5 bg-line">
        <div
          className="h-full bg-gradient-to-r from-maroon to-burgundy transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="px-6 py-4 border-b border-line/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Step {stepIdx + 1} of {STEPS.length}
          </span>
          <Badge tone={step === "result" ? "gold" : "maroon"}>
            {step === "result" ? "Your Estimate" : getStepLabel(step)}
          </Badge>
        </div>
        {step !== "result" && (
          <span className="text-[11px] text-muted">{getStepHint(step)}</span>
        )}
      </div>

      {/* Step content */}
      <div className="p-6 md:p-8 min-h-[340px]">
        {step === "type" && (
          <div>
            <div className="mb-6 flex items-center gap-3 text-maroon">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-maroon/10">
                <Building2 className="size-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Project type</p>
                <h3 className="font-display text-2xl text-maroon">What are you building?</h3>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {PROJECT_TYPES.map((project) => {
                const isSelected = type === project.id;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      setType(project.id);
                      next();
                    }}
                    className={cn(
                      "rounded-[1.35rem] border p-4 text-left transition-all duration-200",
                      isSelected
                        ? "border-maroon bg-maroon/5 shadow-soft"
                        : "border-line/60 bg-paper hover:border-burgundy/50 hover:shadow-card",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-2xl">{project.icon}</span>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-muted">{project.id}</span>
                    </div>
                    <p className="mt-4 font-display text-xl text-maroon">{project.label}</p>
                    <p className="mt-2 text-sm text-ink/60">{project.desc}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-burgundy">
                      Choose type
                      <ArrowRight className="size-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "zone" && (
          <div>
            <div className="mb-6 flex items-center gap-3 text-maroon">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-maroon/10">
                <MapPin className="size-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Location factor</p>
                <h3 className="font-display text-2xl text-maroon">Where are you building?</h3>
              </div>
            </div>

            <label htmlFor="calculator-location-search" className="sr-only">
              Search counties
            </label>
            <input
              id="calculator-location-search"
              type="search"
              value={locationSearch}
              onChange={(event) => setLocationSearch(event.target.value)}
              placeholder="Search counties or counties of origin"
              className="h-11 w-full rounded-2xl border border-line/60 bg-paper px-4 text-sm text-ink outline-none transition focus:border-burgundy"
            />

            <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {visibleLocations.map((location) => {
                const isSelected = zone === location.slug;
                return (
                  <button
                    key={location.slug}
                    type="button"
                    onClick={() => {
                      setZone(location.slug);
                      next();
                    }}
                    className={cn(
                      "rounded-[1.2rem] border p-4 text-left transition-all duration-200",
                      isSelected
                        ? "border-maroon bg-maroon/5 shadow-soft"
                        : "border-line/60 bg-paper hover:border-burgundy/50 hover:shadow-card",
                    )}
                  >
                    <p className="font-medium text-maroon">{location.name}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted">{location.note}</p>
                  </button>
                );
              })}
              {visibleLocations.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-line bg-paper p-4 text-sm text-muted">
                  No county matches that search. Try Nairobi, Kiambu, Mombasa or Kisumu.
                </div>
              ) : null}
            </div>
          </div>
        )}

        {step === "size" && (
          <div>
            <div className="mb-6 flex items-center gap-3 text-maroon">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-maroon/10">
                <Ruler className="size-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Area</p>
                <h3 className="font-display text-2xl text-maroon">How big is the project?</h3>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.5rem] bg-maroon p-5 text-paper">
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold">Budget pulse</p>
                <p className="mt-3 font-display text-[2rem] leading-none tabular-nums">{result.label}</p>
                <p className="mt-2 text-sm text-paper/70">
                  {activeType.label} · {result.zoneName} · {sqm} m² · {activeFinish.label}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-line/60 bg-paper p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Quick size presets</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSqmSlider(preset)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs transition",
                        sqm === preset
                          ? "border-maroon bg-maroon/10 text-maroon"
                          : "border-line/60 text-ink/70 hover:border-burgundy/50",
                      )}
                    >
                      {preset} m²
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-ink/60">Typical homes range from 90 m² to 420 m².</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-line/60 bg-paper p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted">Floor area</span>
                <div className="relative">
                  <input
                    type="number"
                    value={sqmInput}
                    onChange={(event) => handleSqmInput(event.target.value)}
                    onBlur={() => {
                      const num = parseInt(sqmInput, 10);
                      if (Number.isNaN(num) || num < 40) {
                        setSqm(40);
                        setSqmInput("40");
                      } else if (num > 800) {
                        setSqm(800);
                        setSqmInput("800");
                      }
                    }}
                    min={40}
                    max={800}
                    className="h-10 w-24 rounded-xl border border-line bg-cream px-3 pr-9 text-right font-display text-xl text-maroon tabular-nums outline-none focus:border-burgundy"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                    m²
                  </span>
                </div>
              </div>

              <input
                type="range"
                min={40}
                max={800}
                step={10}
                value={sqm}
                onChange={(event) => handleSqmSlider(Number(event.target.value))}
                className="mt-5 h-2 w-full accent-burgundy"
              />

              <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.12em] text-muted">
                <span>40</span>
                <span>200</span>
                <span>400</span>
                <span>800</span>
              </div>
            </div>
          </div>
        )}

        {step === "finish" && (
          <div>
            <div className="mb-6 flex items-center gap-3 text-maroon">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-maroon/10">
                <SlidersHorizontal className="size-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Finish level</p>
                <h3 className="font-display text-2xl text-maroon">What finish do you want?</h3>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {FINISHES.map((option) => {
                const isSelected = finish === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setFinish(option.id);
                      next();
                    }}
                    className={cn(
                      "rounded-[1.5rem] border p-4 text-left transition-all duration-200",
                      isSelected
                        ? "border-maroon bg-maroon/5 shadow-soft"
                        : "border-line/60 bg-paper hover:border-burgundy/50 hover:shadow-card",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className={cn(
                        "flex size-11 items-center justify-center rounded-2xl",
                        option.id === "essential" && "bg-stone/15 text-stone",
                        option.id === "standard" && "bg-gold/20 text-gold",
                        option.id === "premium" && "bg-burgundy/15 text-burgundy",
                        option.id === "signature" && "bg-maroon/15 text-maroon",
                      )}>
                        <Check className="size-5" />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.12em] text-muted">{option.hint}</span>
                    </div>
                    <p className="mt-4 font-display text-xl text-maroon">{option.label}</p>
                    <p className="mt-2 text-sm text-ink/60">{option.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="space-y-6">
            <div className="rounded-[1.75rem] bg-gradient-to-br from-maroon via-[#581a27] to-[#2d1217] p-5 text-paper sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Indicative planning range</p>
                  <h3 className="mt-3 font-display text-[2.1rem] leading-none tabular-nums sm:text-[2.8rem]">{result.label}</h3>
                </div>
                <div className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-paper/80">
                  {result.zoneName}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MetricCard label="Low end" value={formatKes(result.min)} />
                <MetricCard label="Midpoint" value={formatKes(result.perSqm)} helper="per m²" />
                <MetricCard label="Timeline" value={result.timeline} />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[1.5rem] border border-line/60 bg-paper p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Cost breakdown</p>
                  <Sparkles className="size-4 text-maroon" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {getBreakdownItems(result.breakdown).map((item) => (
                    <BreakdownCard key={item.label} label={item.label} value={item.value} pct={item.pct} />
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-line/60 bg-paper p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Assumptions</p>
                <ul className="mt-4 space-y-3 text-sm text-ink/70">
                  <li className="flex gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-maroon" />
                    <span>{activeType.label} project profile</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-maroon" />
                    <span>{activeFinish.label} finish level</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-maroon" />
                    <span>{sqm} m² total floor area</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-maroon" />
                    <span>{result.locationNote}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-line/60 bg-paper p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">What it does not include</p>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{COST_CAVEAT}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/start">
                  Request a call
                </Link>
              </Button>
              <Button variant="outline" onClick={handleDownloadPdf}>
                <Download className="mr-2 size-4" />
                Download .txt
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 size-4" />
                Share
              </Button>
              <Button variant="ghost" onClick={() => setStep("type")}>
                <RotateCcw className="mr-2 size-4" />
                Start over
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step !== "result" && (
        <div className="flex items-center justify-between border-t border-line/60 px-5 py-4 sm:px-6">
          <Button variant="ghost" size="sm" onClick={prev} disabled={stepIdx === 0}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
          <Button size="sm" onClick={next}>
            {nextLabel}
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-paper/70">{label}</p>
      <p className="mt-2 font-display text-2xl tabular-nums text-paper">{value}</p>
      {helper ? <p className="text-[10px] uppercase tracking-[0.14em] text-paper/60">{helper}</p> : null}
    </div>
  );
}

function getBreakdownItems(breakdown: {
  structure: number;
  finishes: number;
  services: number;
  external: number;
  professional: number;
  contingency: number;
}): { label: string; value: number; pct: number }[] {
  const total = Object.values(breakdown).reduce((s, v) => s + v, 0);
  return [
    { label: "Structure & frame", value: breakdown.structure, pct: Math.round((breakdown.structure / total) * 100) },
    { label: "Finishes & fixtures", value: breakdown.finishes, pct: Math.round((breakdown.finishes / total) * 100) },
    { label: "MEP services", value: breakdown.services, pct: Math.round((breakdown.services / total) * 100) },
    { label: "External works", value: breakdown.external, pct: Math.round((breakdown.external / total) * 100) },
    { label: "Professional fees", value: breakdown.professional, pct: Math.round((breakdown.professional / total) * 100) },
    { label: "Contingency", value: breakdown.contingency, pct: Math.round((breakdown.contingency / total) * 100) },
  ];
}

function BreakdownCard({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div className="p-4 bg-paper border border-line/50 rounded-2xl hover:shadow-card transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink/60">{label}</p>
        <span className="text-[10px] text-muted">{pct}%</span>
      </div>
      <p className="mt-1.5 font-display text-lg text-maroon tabular-nums">{formatKes(value)}</p>
      <div className="mt-2 h-1.5 bg-line rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-maroon/50 to-maroon/30 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function getStepLabel(step: Step): string {
  const labels: Record<Step, string> = {
    type: "Project Type",
    zone: "Location",
    size: "Area",
    finish: "Finish",
    result: "Result",
  };
  return labels[step];
}

function getStepHint(step: Step): string {
  const hints: Record<Step, string> = {
    type: "Select one",
    zone: "Tap your county",
    size: "Drag the slider",
    finish: "Pick a quality level",
    result: "",
  };
  return hints[step];
}
