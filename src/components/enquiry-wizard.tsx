import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import {
  COST_CAVEAT,
  estimateCost,
  FINISHES,
  PROJECT_TYPES,
  STAGES,
  type CostProjectType,
  type FinishId,
} from "@/lib/cost";
import { saveEnquiry } from "@/lib/enquiry";
import { ZONES } from "@/lib/site";
import { useSiteStore } from "@/lib/store";
import { formatKes } from "@/lib/utils";
import { defaultWhatsappText, whatsappHref } from "@/lib/whatsapp";

const STEPS = ["Type", "Place", "Scale", "You"] as const;

export function EnquiryWizard() {
  const storedZone = useSiteStore((s) => s.selectedZone);
  const diaspora = useSiteStore((s) => s.diasporaMode);
  const setZone = useSiteStore((s) => s.setSelectedZone);

  const [step, setStep] = useState(0);
  const [type, setType] = useState<CostProjectType>("Residential");
  const [zone, setLocalZone] = useState(storedZone ?? "nairobi");
  const [sqm, setSqm] = useState(220);
  const [finish, setFinish] = useState<FinishId>("standard");
  const [stage, setStage] = useState<string>("Have a plot");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [description, setDescription] = useState("");
  const [hp, setHp] = useState("");
  const [done, setDone] = useState(false);

  const estimate = useMemo(
    () => estimateCost({ type, zone, sqm, finish }),
    [type, zone, sqm, finish],
  );

  function chooseZone(slug: string) {
    setLocalZone(slug);
    setZone(slug);
  }

  function submit() {
    if (hp) return;
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast.error("Name, phone and email are required.");
      return;
    }
    saveEnquiry({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      projectType: type,
      zone,
      stage,
      startDate,
      description: description.trim(),
      sqm,
      finish,
      indicativeMin: Math.round(estimate.min),
      indicativeMax: Math.round(estimate.max),
      diaspora,
    });
    setDone(true);
    toast.success("Enquiry received. The studio has a copy on this device.");
  }

  if (done) {
    return (
      <div className="border border-line bg-cream p-8 md:p-12 rounded-md">
        <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Received</p>
        <h2 className="mt-3 font-display text-4xl text-maroon">We have the brief.</h2>
        <p className="mt-4 text-ink/80 max-w-lg">
          Thank you, {name.split(" ")[0]}. A person at ATRO will follow up. If you
          want to talk now, WhatsApp is the fastest path in Kenya.
        </p>
        <p className="mt-4 text-sm text-muted">{COST_CAVEAT}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <a href={whatsappHref(defaultWhatsappText({ zone, type }))}>
              Continue on WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/projects">View work</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-line bg-cream rounded-md overflow-hidden">
      <div className="grid grid-cols-4 border-b border-line">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={`h-12 text-[10px] sm:text-[11px] uppercase tracking-[0.14em] border-r border-line last:border-r-0 ${
              i === step ? "bg-burgundy text-paper" : i < step ? "bg-stone text-maroon" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-10">
        {step === 0 ? (
          <fieldset>
            <legend className="font-display text-3xl text-maroon mb-6">
              What are you building?
            </legend>
            <div className="grid sm:grid-cols-2 gap-3">
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`text-left px-4 py-4 border rounded-sm ${
                    type === t.id ? "border-burgundy bg-burgundy text-paper" : "border-line bg-paper hover:border-burgundy"
                  }`}
                >
                  <span className="font-display text-2xl">{t.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 1 ? (
          <fieldset>
            <legend className="font-display text-3xl text-maroon mb-6">
              Where is the site?
            </legend>
            <div className="grid sm:grid-cols-2 gap-3">
              {ZONES.map((z) => (
                <button
                  key={z.slug}
                  type="button"
                  onClick={() => chooseZone(z.slug)}
                  className={`text-left px-4 py-4 border rounded-sm ${
                    zone === z.slug
                      ? "border-burgundy bg-burgundy text-paper"
                      : "border-line bg-paper hover:border-burgundy"
                  }`}
                >
                  <span className="font-display text-2xl">{z.name}</span>
                  <span className="block text-sm mt-1 opacity-80">{z.coverage}</span>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 2 ? (
          <div>
            <h2 className="font-display text-3xl text-maroon mb-2">Scale and finish</h2>
            <p className="text-sm text-muted mb-8">
              A starting size. We will measure properly after we see the plot.
            </p>
            <Label htmlFor="sqm">Approximate area · {sqm} m²</Label>
            <input
              id="sqm"
              type="range"
              min={60}
              max={800}
              step={10}
              value={sqm}
              onChange={(e) => setSqm(Number(e.target.value))}
              className="w-full accent-burgundy"
              suppressHydrationWarning
            />
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {FINISHES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFinish(f.id)}
                  className={`text-left px-4 py-4 border rounded-sm ${
                    finish === f.id
                      ? "border-burgundy bg-burgundy text-paper"
                      : "border-line bg-paper hover:border-burgundy"
                  }`}
                >
                  <span className="font-display text-2xl">{f.label}</span>
                  <span className="block text-sm mt-1 opacity-80">{f.hint}</span>
                </button>
              ))}
            </div>
            <div className="mt-10 p-6 bg-maroon text-paper rounded-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold">
                Indicative range · {estimate.zoneName}
              </p>
              <p className="font-display text-4xl mt-2">{estimate.label}</p>
              <p className="text-sm text-paper/70 mt-2">
                About {formatKes(estimate.perSqm)} / m² as a midpoint. {COST_CAVEAT}
              </p>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-5 max-w-xl">
            <h2 className="font-display text-3xl text-maroon">How do we reach you?</h2>
            <p className="text-sm text-muted -mt-2">
              The range stays on the record as indicative — a person will confirm nothing until they have seen the site.
            </p>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </div>
            <div>
              <Label htmlFor="stage">Stage</Label>
              <Select id="stage" value={stage} onChange={(e) => setStage(e.target.value)}>
                {STAGES.map((s) => (
                  <option key={s.id} value={s.label}>{s.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="start">Target start (optional)</Label>
              <Input id="start" type="month" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="desc">Project notes</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Plot, drawings, who is abroad, anything we should not miss."
              />
            </div>
            <div className="absolute -left-[9999px]" aria-hidden>
              <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
            </div>
            {diaspora ? (
              <p className="text-sm text-burgundy">
                Diaspora mode is on — we will schedule around EAT and lead with WhatsApp / video.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : null}
          {step < 3 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={submit}>
              Send enquiry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
