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
import { saveEnquiryToDb } from "@/lib/enquiry-server";
import { ZONES } from "@/lib/site";
import { useSiteStore } from "@/lib/store";
import { formatKes, cn } from "@/lib/utils";
import { whatsappHref } from "@/lib/whatsapp";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Home,
  Building2,
  Landmark,
  MapPin,
  Ruler,
  Paintbrush,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Globe,
  Clock,
  Users,
  Plane,
} from "lucide-react";

const STEPS_BASE = [
  { id: "type", label: "Type", icon: Building2 },
  { id: "place", label: "Place", icon: MapPin },
  { id: "scale", label: "Scale", icon: Ruler },
  { id: "you", label: "You", icon: User },
] as const;

const DIASPORA_STEPS = [
  { id: "type", label: "Type", icon: Building2 },
  { id: "place", label: "Place", icon: MapPin },
  { id: "scale", label: "Scale", icon: Ruler },
  { id: "you", label: "You", icon: User },
  { id: "abroad", label: "Abroad", icon: Globe },
] as const;

const DIASPORA_COUNTRIES = [
  "United Kingdom",
  "United States",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Canada",
  "Australia",
  "Germany",
  "South Africa",
  "Other",
];

const TIMEZONES = [
  { label: "GMT (UK, Ireland)", value: "Europe/London" },
  { label: "EST (US East Coast)", value: "America/New_York" },
  { label: "CST (US Central)", value: "America/Chicago" },
  { label: "PST (US West Coast)", value: "America/Los_Angeles" },
  { label: "GST (Dubai, Abu Dhabi)", value: "Asia/Dubai" },
  { label: "AST (Riyadh, Doha)", value: "Asia/Riyadh" },
  { label: "AEST (Sydney, Melbourne)", value: "Australia/Sydney" },
  { label: "CET (Germany, France)", value: "Europe/Berlin" },
  { label: "SAST (Johannesburg)", value: "Africa/Johannesburg" },
  { label: "Other", value: "other" },
];

function buildWhatsAppMessage(data: {
  name: string;
  type: string;
  zone: string;
  sqm: number;
  finish: string;
  estimate: { min: number; max: number; label: string };
  diaspora: boolean;
  diasporaCountry?: string;
  description?: string;
}) {
  const lines = [
    `Hello ATRO — I would like to start a project.`,
    ``,
    `Name: ${data.name}`,
    `Type: ${data.type}`,
    `Location: ${data.zone}`,
    `Size: ~${data.sqm} m²`,
    `Finish: ${data.finish}`,
    `Estimated range: ${data.estimate.label}`,
  ];
  if (data.diaspora) {
    lines.push(`I am based in ${data.diasporaCountry || "abroad"}.`);
  }
  if (data.description) {
    lines.push(``, `Notes: ${data.description}`);
  }
  return lines.join("\n");
}

export function EnquiryWizard({ forcedDiaspora = false }: { forcedDiaspora?: boolean }) {
  const storedZone = useSiteStore((s) => s.selectedZone);
  const storeDiaspora = useSiteStore((s) => s.diasporaMode);
  const setZone = useSiteStore((s) => s.setSelectedZone);

  const diaspora = forcedDiaspora || storeDiaspora;
  const steps = diaspora ? DIASPORA_STEPS : STEPS_BASE;
  const totalSteps = steps.length;

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
  const [diasporaCountry, setDiasporaCountry] = useState("");
  const [diasporaTimezone, setDiasporaTimezone] = useState("");
  const [diasporaKenyaContact, setDiasporaKenyaContact] = useState("");
  const [diasporaVisitPlans, setDiasporaVisitPlans] = useState("");
  const [hp, setHp] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const estimate = useMemo(
    () => estimateCost({ type, zone, sqm, finish }),
    [type, zone, sqm, finish],
  );

  function chooseZone(slug: string) {
    setLocalZone(slug);
    setZone(slug);
  }

  async function submit() {
    if (hp) return;
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast.error("Name, phone and email are required.");
      return;
    }
    setSubmitting(true);

    const payload = {
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
      diasporaCountry: diaspora ? diasporaCountry : "",
      diasporaTimezone: diaspora ? diasporaTimezone : "",
      diasporaKenyaContact: diaspora ? diasporaKenyaContact : "",
      diasporaVisitPlans: diaspora ? diasporaVisitPlans : "",
    };

    // Save to localStorage (backup)
    saveEnquiry(payload);

    // Save to database
    try {
      await saveEnquiryToDb({ data: payload });
    } catch {
      // DB save failed — localStorage backup is still there
    }

    setDone(true);
    setSubmitting(false);
    toast.success("Enquiry received.");
  }

  if (done) {
    const whatsAppMsg = buildWhatsAppMessage({
      name,
      type,
      zone,
      sqm,
      finish,
      estimate: { min: estimate.min, max: estimate.max, label: estimate.label },
      diaspora,
      diasporaCountry,
      description,
    });

    return (
      <div className="border border-line/50 bg-cream p-8 md:p-12 rounded-2xl">
        <div className="size-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6">
          <CheckCircle2 className="size-8 text-white" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-maroon">We have the brief.</h2>
        <p className="mt-4 text-ink/80 max-w-lg text-lg">
          Thank you, {name.split(" ")[0]}. Here is what happens next:
        </p>

        {/* Expectation setting */}
        <div className="mt-6 space-y-3 max-w-lg">
          {[
            { icon: CheckCircle2, text: "A named project manager will contact you within 24 hours (EAT)." },
            { icon: Phone, text: `Via ${phone} or ${email} — your choice.` },
            { icon: Clock, text: diaspora ? "We will schedule the first call at a time that works for your time zone." : "We will call during EAT working hours (8am-5pm)." },
            { icon: FileText, text: "You will receive an indicative cost range and a realistic programme before any commitment." },
            { icon: Mail, text: `When we open your project it waits for you in your portal — sign in with ${email}, no sign-up needed first.` },
            { icon: MapPin, text: "If you have a plot, we will arrange a site visit (or verify remotely if you are abroad)." },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <item.icon className="size-5 shrink-0 text-maroon mt-0.5" />
              <span className="text-sm text-ink/80">{item.text}</span>
            </div>
          ))}
        </div>

        {diaspora && (
          <div className="mt-6 p-4 bg-gold/10 border border-gold/20 rounded-xl max-w-lg">
            <p className="text-sm text-burgundy font-medium">Diaspora enquiry</p>
            <p className="text-sm text-ink/70 mt-1">
              We will contact you via email to schedule a video call. Your time zone ({diasporaTimezone || "not specified"}) and location ({diasporaCountry || "abroad"}) are on file.
            </p>
            <p className="text-sm text-ink/70 mt-2">
              When we open it, your portal starts on the Abroad view — the journey, the calls on your clock, the channels that can reach you.
            </p>
          </div>
        )}

        <p className="mt-4 text-sm text-muted">{COST_CAVEAT}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="primary" className="rounded-2xl h-12 px-6">
            <a href={whatsappHref(whatsAppMsg)}>
              Continue on WhatsApp
              <ArrowRight className="size-4 ml-2" />
            </a>
          </Button>
          <Button asChild variant="outline" className="rounded-2xl h-12 px-6">
            <Link to="/projects">View our work</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-line/50 bg-cream rounded-2xl overflow-hidden shadow-card">
      {/* Progress bar */}
      <div className="h-1 bg-stone/50">
        <div
          className="h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="px-6 py-4 border-b border-line/50 bg-paper/50">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-maroon to-burgundy text-white shadow-soft"
                      : isComplete
                        ? "bg-gold/10 text-gold"
                        : "text-muted hover:text-maroon",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="text-[11px] uppercase tracking-[0.14em] font-medium hidden sm:inline">
                    {s.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-2 transition-colors duration-300",
                    isComplete ? "bg-gold" : "bg-stone",
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 md:p-10">
        {/* Step 0: Type */}
        {step === 0 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-maroon mb-2">
              What are you building?
            </legend>
            <p className="text-sm text-muted mb-6">Select the project type that best describes your build.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={cn(
                    "group text-left p-6 border rounded-2xl transition-all duration-300",
                    type === t.id
                      ? "border-burgundy bg-gradient-to-br from-maroon to-burgundy text-paper shadow-soft scale-[1.02]"
                      : "border-line/50 bg-paper hover:border-burgundy/50 hover:shadow-card card-lift",
                  )}
                >
                  <div className={cn(
                    "size-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
                    type === t.id ? "bg-white/20" : "bg-maroon/5 group-hover:bg-maroon/10",
                  )}>
                    {t.id === "Residential" ? <Home className="size-6" /> :
                     t.id === "Commercial" ? <Building2 className="size-6" /> :
                     <Landmark className="size-6" />}
                  </div>
                  <span className="font-display text-xl">{t.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {/* Step 1: Place */}
        {step === 1 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-maroon mb-2">
              Where is the site?
            </legend>
            <p className="text-sm text-muted mb-6">Costs vary by location due to logistics and labour availability.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {ZONES.map((z) => (
                <button
                  key={z.slug}
                  type="button"
                  onClick={() => chooseZone(z.slug)}
                  className={cn(
                    "group text-left p-6 border rounded-2xl transition-all duration-300",
                    zone === z.slug
                      ? "border-burgundy bg-gradient-to-br from-maroon to-burgundy text-paper shadow-soft scale-[1.02]"
                      : "border-line/50 bg-paper hover:border-burgundy/50 hover:shadow-card card-lift",
                  )}
                >
                  <div className={cn(
                    "size-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
                    zone === z.slug ? "bg-white/20" : "bg-maroon/5 group-hover:bg-maroon/10",
                  )}>
                    <MapPin className="size-6" />
                  </div>
                  <span className="font-display text-xl block">{z.name}</span>
                  <span className={cn(
                    "block text-sm mt-1",
                    zone === z.slug ? "text-paper/80" : "text-ink/60",
                  )}>
                    {z.coverage}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {/* Step 2: Scale */}
        {step === 2 ? (
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-maroon mb-2">Scale and finish</h2>
            <p className="text-sm text-muted mb-8">
              A starting size. We will measure properly after we see the plot.
            </p>

            <div className="p-6 bg-paper border border-line/50 rounded-2xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="sqm" className="text-base">Approximate area</Label>
                <span className="font-display text-2xl text-gradient-gold">{sqm} m²</span>
              </div>
              <input
                id="sqm"
                type="range"
                min={60}
                max={800}
                step={10}
                value={sqm}
                onChange={(e) => setSqm(Number(e.target.value))}
                className="w-full accent-burgundy h-2"
                suppressHydrationWarning
              />
              <div className="flex justify-between text-xs text-muted mt-2">
                <span>60 m²</span>
                <span>800 m²</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {FINISHES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFinish(f.id)}
                  className={cn(
                    "group text-left p-6 border rounded-2xl transition-all duration-300",
                    finish === f.id
                      ? "border-burgundy bg-gradient-to-br from-maroon to-burgundy text-paper shadow-soft scale-[1.02]"
                      : "border-line/50 bg-paper hover:border-burgundy/50 hover:shadow-card card-lift",
                  )}
                >
                  <div className={cn(
                    "size-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
                    finish === f.id ? "bg-white/20" : "bg-maroon/5 group-hover:bg-maroon/10",
                  )}>
                    <Paintbrush className="size-6" />
                  </div>
                  <span className="font-display text-xl block">{f.label}</span>
                  <span className={cn(
                    "block text-sm mt-1",
                    finish === f.id ? "text-paper/80" : "text-ink/60",
                  )}>
                    {f.hint}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-maroon via-burgundy to-maroon rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
              <p className="relative text-[11px] uppercase tracking-[0.18em] text-gold mb-2">
                Indicative range · {estimate.zoneName}
              </p>
              <p className="relative font-display text-4xl md:text-5xl">{estimate.label}</p>
              <p className="relative text-sm text-paper/70 mt-3">
                About {formatKes(estimate.perSqm)} / m² as a midpoint. {COST_CAVEAT}
              </p>
            </div>
          </div>
        ) : null}

        {/* Step 3: You (contact info) */}
        {step === 3 ? (
          <div className="grid gap-6 max-w-xl">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-maroon mb-2">How do we reach you?</h2>
              <p className="text-sm text-muted">
                The range stays on the record as indicative — a person will confirm nothing until they have seen the site.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                  <User className="size-4 text-muted" />
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                  <Phone className="size-4 text-muted" />
                  Phone {diaspora && <span className="text-xs text-muted">(with country code)</span>}
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  required
                  placeholder={diaspora ? "+44 7XXX XXX XXX" : "+254 7XX XXX XXX"}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="size-4 text-muted" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="stage" className="flex items-center gap-2 mb-2">
                  <FileText className="size-4 text-muted" />
                  Stage
                </Label>
                <Select id="stage" value={stage} onChange={(e) => setStage(e.target.value)} className="rounded-xl">
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.label}>{s.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="start" className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-muted" />
                  Target start (optional)
                </Label>
                <Input id="start" type="month" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <Label htmlFor="desc" className="flex items-center gap-2 mb-2">
                  <FileText className="size-4 text-muted" />
                  Project notes
                </Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Plot, drawings, who is abroad, anything we should not miss."
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="absolute -left-[9999px]" aria-hidden>
              <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
            </div>
          </div>
        ) : null}

        {/* Step 4: Abroad (diaspora only) */}
        {step === 4 && diaspora ? (
          <div className="grid gap-6 max-w-xl">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-maroon mb-2">Building from abroad</h2>
              <p className="text-sm text-muted">
                These details help us schedule calls at the right time and plan site visits.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="country" className="flex items-center gap-2 mb-2">
                  <Globe className="size-4 text-muted" />
                  Where are you based?
                </Label>
                <Select id="country" value={diasporaCountry} onChange={(e) => setDiasporaCountry(e.target.value)} className="rounded-xl">
                  <option value="">Select country</option>
                  {DIASPORA_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="tz" className="flex items-center gap-2 mb-2">
                  <Clock className="size-4 text-muted" />
                  Your time zone
                </Label>
                <Select id="tz" value={diasporaTimezone} onChange={(e) => setDiasporaTimezone(e.target.value)} className="rounded-xl">
                  <option value="">Select time zone</option>
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="kenya-contact" className="flex items-center gap-2 mb-2">
                  <Users className="size-4 text-muted" />
                  Contact person in Kenya (optional)
                </Label>
                <Input
                  id="kenya-contact"
                  value={diasporaKenyaContact}
                  onChange={(e) => setDiasporaKenyaContact(e.target.value)}
                  placeholder="Name and phone of someone in Kenya who can visit the site"
                  className="rounded-xl"
                />
                <p className="text-xs text-muted mt-1">A family member or friend who can receive us on site if you are not in the country.</p>
              </div>
              <div>
                <Label htmlFor="visit" className="flex items-center gap-2 mb-2">
                  <Plane className="size-4 text-muted" />
                  Visit plans (optional)
                </Label>
                <Input
                  id="visit"
                  value={diasporaVisitPlans}
                  onChange={(e) => setDiasporaVisitPlans(e.target.value)}
                  placeholder="e.g. Visiting in December, or Not sure yet"
                  className="rounded-xl"
                />
                <p className="text-xs text-muted mt-1">We recommend at least one site visit at structural stage. It helps to plan around that.</p>
              </div>
            </div>

            <div className="absolute -left-[9999px]" aria-hidden>
              <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
            </div>

            <div className="p-4 bg-gold/10 border border-gold/20 rounded-xl">
              <p className="text-sm text-burgundy">
                We will schedule the first call at a time that works for your time zone. EAT is UTC+3.
              </p>
            </div>
          </div>
        ) : null}

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between">
          <div>
            {step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-xl"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Button>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              Step {step + 1} of {totalSteps}
            </span>
            {step < totalSteps - 1 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="rounded-xl px-6"
              >
                Continue
                <ArrowRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="rounded-xl px-6 bg-gradient-to-r from-gold to-gold-light text-maroon hover:from-gold-light hover:to-gold"
              >
                {submitting ? "Sending..." : "Send enquiry"}
                <ArrowRight className="size-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
