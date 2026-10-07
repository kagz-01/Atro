import { Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { ArrowRight, ArrowLeft, Check, Download, Share2, RotateCcw } from "lucide-react";
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
import { useSiteStore } from "@/lib/store";
import { formatKes } from "@/lib/utils";

const STEPS = ["type", "zone", "size", "finish", "result"] as const;
type Step = (typeof STEPS)[number];

export function CostCalculator() {
  const storeZone = useSiteStore((s) => s.selectedZone) ?? "nairobi";
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<CostProjectType>("Residential");
  const [zone, setZone] = useState(storeZone);
  const [sqm, setSqm] = useState(220);
  const [finish, setFinish] = useState<FinishId>("standard");
  const [sqmInput, setSqmInput] = useState("220");

  const stepIdx = STEPS.indexOf(step);
  const result = estimateCost({ type, zone, sqm, finish });

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
      result.caveat,
      "",
      `Generated: ${new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}`,
      "Source: KNBS CIPI Q4 2025, IQSK Cost Handbook, EAPI Housing Cost Analysis",
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
            <h3 className="font-display text-2xl text-maroon">What are you building?</h3>
            <p className="mt-2 text-sm text-ink/60">This sets the base construction rate for your project type.</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setType(t.id); next(); }}
                  className={cn(
                    "p-5 rounded-2xl border text-left transition-all duration-200 card-lift",
                    type === t.id
                      ? "border-maroon bg-maroon/5 shadow-soft"
                      : "border-line/50 bg-paper hover:border-burgundy/50 hover:shadow-card",
                  )}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <p className="mt-3 font-display text-lg text-maroon">{t.label}</p>
                  <p className="mt-1 text-xs text-ink/50">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "zone" && (
          <div>
            <h3 className="font-display text-2xl text-maroon">Where are you building?</h3>
            <p className="mt-2 text-sm text-ink/60">Location affects labour, materials and logistics costs.</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
              {ZONES.map((z) => {
                const isSelected = zone === z.slug;
                return (
                  <button
                    key={z.slug}
                    type="button"
                    onClick={() => { setZone(z.slug); next(); }}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all duration-200 card-lift",
                      isSelected
                        ? "border-maroon bg-maroon/5 shadow-soft"
                        : "border-line/50 bg-paper hover:border-burgundy/50 hover:shadow-card",
                    )}
                  >
                    <p className="font-medium text-maroon">{z.name}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                      {z.coverage}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "size" && (
          <div>
            <h3 className="font-display text-2xl text-maroon">How big is the project?</h3>
            <p className="mt-2 text-sm text-ink/60">Total floor area in square metres.</p>

            {/* Live preview — shows estimate range as user drags */}
            <div className="mt-6 bg-maroon text-paper rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold">Estimated range for this size</p>
              <p className="font-display text-3xl md:text-4xl mt-1 tabular-nums">{result.label}</p>
              <p className="text-sm text-paper/60 mt-1">
                ~{formatKes(result.perSqm)} / m² · {result.timeline}
              </p>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Floor area</span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      value={sqmInput}
                      onChange={(e) => handleSqmInput(e.target.value)}
                      onBlur={() => {
                        const num = parseInt(sqmInput, 10);
                        if (isNaN(num) || num < 40) { setSqm(40); setSqmInput("40"); }
                        else if (num > 800) { setSqm(800); setSqmInput("800"); }
                      }}
                      min={40}
                      max={800}
                      className="w-24 h-10 px-3 bg-paper border border-line rounded-xl text-right font-display text-xl text-maroon tabular-nums outline-none focus:border-burgundy"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">m²</span>
                  </div>
                </div>
              </div>
              <input
                type="range"
                min={40}
                max={800}
                step={10}
                value={sqm}
                onChange={(e) => handleSqmSlider(Number(e.target.value))}
                className="w-full accent-burgundy h-2"
                suppressHydrationWarning
              />
              <div className="mt-2 flex justify-between text-[10px] text-muted">
                <span>40 m²</span>
                <span>200 m² · 3-bed home</span>
                <span>400 m²</span>
                <span>800 m²</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-paper border border-line/50 rounded-2xl">
              <p className="text-xs text-ink/60">
                <span className="font-medium text-ink/80">Typical sizes:</span>{" "}
                2-bed apartment 70–100 m² · 3-bed house 150–250 m² · 4-bed house 200–350 m² · Commercial 300+ m²
              </p>
            </div>
          </div>
        )}

        {step === "finish" && (
          <div>
            <h3 className="font-display text-2xl text-maroon">What finish level?</h3>
            <p className="mt-2 text-sm text-ink/60">This sets the quality of materials and detailing.</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {FINISHES.map((f) => {
                const isSelected = finish === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => { setFinish(f.id); next(); }}
                    className={cn(
                      "p-5 rounded-2xl border text-left transition-all duration-200 card-lift",
                      isSelected
                        ? "border-maroon bg-maroon/5 shadow-soft"
                        : "border-line/50 bg-paper hover:border-burgundy/50 hover:shadow-card",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center",
                        f.id === "essential" && "bg-stone/20",
                        f.id === "standard" && "bg-gold/20",
                        f.id === "premium" && "bg-burgundy/20",
                        f.id === "signature" && "bg-maroon/20",
                      )}>
                        <Check className={cn(
                          "size-5",
                          f.id === "essential" && "text-stone",
                          f.id === "standard" && "text-gold",
                          f.id === "premium" && "text-burgundy",
                          f.id === "signature" && "text-maroon",
                        )} />
                      </div>
                      <div>
                        <p className="font-display text-lg text-maroon">{f.label}</p>
                        <p className="text-xs text-ink/50">{f.hint}</p>
                      </div>
                    </div>
                    {/* Show indicative rate */}
                    <div className="mt-3 pt-3 border-t border-line/30">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
                        ~{formatKes(estimateCost({ type, zone, sqm, finish: f.id }).perSqm)} / m²
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "result" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="size-11 rounded-xl bg-gold/20 flex items-center justify-center">
                <Check className="size-5 text-gold" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-maroon">Your Estimate</h3>
                <p className="text-sm text-muted">
                  {type} · {result.zoneName} · {sqm} m² · {FINISHES.find(f => f.id === finish)?.label}
                </p>
              </div>
            </div>

            {/* Main estimate */}
            <div className="bg-maroon text-paper p-6 rounded-2xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Indicative range</p>
              <p className="font-display text-4xl md:text-5xl mt-2 tabular-nums">{result.label}</p>
              <p className="text-sm text-paper/70 mt-2">
                Midpoint about {formatKes(result.perSqm)} / m²
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-paper/60">
                <span>⏱ {result.timeline}</span>
                <span>📍 {result.zoneName}</span>
              </div>
            </div>

            {/* Breakdown — dynamic percentages */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              {getBreakdownItems(result.breakdown).map((item) => (
                <BreakdownCard key={item.label} label={item.label} value={item.value} pct={item.pct} />
              ))}
            </div>

            {/* Caveat */}
            <p className="mt-6 text-[10px] text-muted leading-relaxed">{COST_CAVEAT}</p>

            {/* CTA */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/start">Get a real quote</Link>
              </Button>
              <Button variant="outline" onClick={handleDownloadPdf}>
                <Download className="size-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="size-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" onClick={() => setStep("type")}>
                <RotateCcw className="size-4 mr-2" />
                Start over
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step !== "result" && (
        <div className="px-6 py-4 border-t border-line/50 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={stepIdx === 0}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <Button
            size="sm"
            onClick={next}
          >
            Skip
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      )}
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
