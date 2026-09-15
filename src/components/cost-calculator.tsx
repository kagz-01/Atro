import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PROJECT_TYPES,
  FINISHES,
  STAGES,
  estimateCost,
  COST_CAVEAT,
  type CostProjectType,
  type FinishId,
  type StageId,
} from "@/lib/cost";
import { ZONES } from "@/lib/site";
import { useSiteStore } from "@/lib/store";
import { formatKes } from "@/lib/utils";

const STEPS = ["type", "zone", "size", "finish", "stage", "result"] as const;
type Step = (typeof STEPS)[number];

export function CostCalculator() {
  const storeZone = useSiteStore((s) => s.selectedZone) ?? "nairobi";
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<CostProjectType>("Residential");
  const [zone, setZone] = useState(storeZone);
  const [sqm, setSqm] = useState(220);
  const [finish, setFinish] = useState<FinishId>("standard");
  const [stage, setStage] = useState<StageId>("exploring");

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

  return (
    <div className="bg-cream border border-line rounded-md overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-line">
        <div
          className="h-full bg-maroon transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="px-6 py-4 border-b border-line flex items-center justify-between">
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
      <div className="p-6 md:p-8 min-h-[320px]">
        {step === "type" && (
          <div>
            <h3 className="font-display text-2xl text-maroon">What are you building?</h3>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setType(t.id); next(); }}
                  className={cn(
                    "p-4 rounded-sm border text-left transition-all hover:border-burgundy",
                    type === t.id
                      ? "border-maroon bg-maroon/5"
                      : "border-line bg-paper",
                  )}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <p className="mt-2 font-display text-lg text-maroon">{t.label}</p>
                  <p className="mt-1 text-xs text-muted">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "zone" && (
          <div>
            <h3 className="font-display text-2xl text-maroon">Where are you building?</h3>
            <p className="mt-2 text-sm text-ink/70">Location affects labour, materials and logistics.</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
              {ZONES.map((z) => (
                <button
                  key={z.slug}
                  type="button"
                  onClick={() => { setZone(z.slug); next(); }}
                  className={cn(
                    "p-3 rounded-sm border text-left transition-all hover:border-burgundy",
                    zone === z.slug
                      ? "border-maroon bg-maroon/5"
                      : "border-line bg-paper",
                  )}
                >
                  <p className="font-medium text-maroon">{z.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                    {z.coverage}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "size" && (
          <div>
            <h3 className="font-display text-2xl text-maroon">How big is the project?</h3>
            <div className="mt-8">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted">
                  Floor area
                </span>
                <span className="font-display text-4xl text-maroon tabular-nums">
                  {sqm} <span className="text-lg text-muted">m²</span>
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={800}
                step={10}
                value={sqm}
                onChange={(e) => setSqm(Number(e.target.value))}
                className="mt-4 w-full accent-burgundy"
                suppressHydrationWarning
              />
              <div className="mt-2 flex justify-between text-[10px] text-muted">
                <span>40 m² (studio)</span>
                <span>400 m² (large home)</span>
                <span>800 m² (commercial)</span>
              </div>
            </div>
            <div className="mt-8 p-4 bg-paper border border-line rounded-sm">
              <p className="text-xs text-muted">
                <span className="font-medium text-ink">Tip:</span> A typical 3-bedroom family home in Kenya is 180–280 m². 
                Commercial projects are usually 300+ m².
              </p>
            </div>
          </div>
        )}

        {step === "finish" && (
          <div>
            <h3 className="font-display text-2xl text-maroon">What finish level?</h3>
            <p className="mt-2 text-sm text-ink/70">This sets the quality of materials and detailing.</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {FINISHES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { setFinish(f.id); next(); }}
                  className={cn(
                    "p-5 rounded-sm border text-left transition-all hover:border-burgundy",
                    finish === f.id
                      ? "border-maroon bg-maroon/5"
                      : "border-line bg-paper",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      f.id === "essential" && "bg-stone/50",
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
                      <p className="text-xs text-muted">{f.hint}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "stage" && (
          <div>
            <h3 className="font-display text-2xl text-maroon">Where are you in the process?</h3>
            <p className="mt-2 text-sm text-ink/70">This helps us understand what you need next.</p>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setStage(s.id); next(); }}
                  className={cn(
                    "p-4 rounded-sm border text-left transition-all hover:border-burgundy",
                    stage === s.id
                      ? "border-maroon bg-maroon/5"
                      : "border-line bg-paper",
                  )}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <p className="mt-2 font-medium text-maroon">{s.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "result" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-full bg-gold/20 flex items-center justify-center">
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
            <div className="bg-maroon text-paper p-6 rounded-sm">
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

            {/* Breakdown */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
              <BreakdownCard label="Structure & frame" value={result.breakdown.structure} pct={35} />
              <BreakdownCard label="Finishes & fixtures" value={result.breakdown.finishes} pct={28} />
              <BreakdownCard label="MEP services" value={result.breakdown.services} pct={18} />
              <BreakdownCard label="External works" value={result.breakdown.external} pct={10} />
              <BreakdownCard label="Professional fees" value={result.breakdown.professional} pct={8} />
              <BreakdownCard label="Contingency" value={result.breakdown.contingency} pct={7} />
            </div>

            {/* Caveat */}
            <p className="mt-6 text-[10px] text-muted leading-relaxed">{COST_CAVEAT}</p>

            {/* CTA */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/start">Get a real quote</Link>
              </Button>
              <Button variant="outline" onClick={() => setStep("type")}>
                Start over
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step !== "result" && (
        <div className="px-6 py-4 border-t border-line flex items-center justify-between">
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

function BreakdownCard({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div className="p-3 bg-paper border border-line rounded-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">{label}</p>
        <span className="text-[10px] text-muted">{pct}%</span>
      </div>
      <p className="mt-1 font-display text-lg text-maroon tabular-nums">{formatKes(value)}</p>
      <div className="mt-2 h-1 bg-line rounded-full overflow-hidden">
        <div className="h-full bg-maroon/40 rounded-full" style={{ width: `${pct}%` }} />
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
    stage: "Stage",
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
    stage: "Where are you now?",
    result: "",
  };
  return hints[step];
}
