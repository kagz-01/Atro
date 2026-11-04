import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { uploadEnquiryFile } from "@/lib/enquiry-upload";
import { ZONES } from "@/lib/site";
import { KENYA_COUNTIES } from "@/lib/counties";
import {
  ENQUIRY_ATTACHMENT_ACCEPT,
  formatMessageFileSize,
  MAX_ENQUIRY_ATTACHMENTS,
  validateMessageAttachmentMetadata,
} from "@/lib/enquiry-attachments";
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
  Paperclip,
} from "lucide-react";

const STEPS_BASE = [
  { id: "type", label: "Type", icon: Building2 },
  { id: "place", label: "Place", icon: MapPin },
  { id: "scale", label: "Scale", icon: Ruler },
  { id: "you", label: "You", icon: User },
  { id: "review", label: "Review", icon: CheckCircle2 },
] as const;

const DIASPORA_STEPS = [
  { id: "type", label: "Type", icon: Building2 },
  { id: "place", label: "Place", icon: MapPin },
  { id: "scale", label: "Scale", icon: Ruler },
  { id: "you", label: "You", icon: User },
  { id: "abroad", label: "Abroad", icon: Globe },
  { id: "review", label: "Review", icon: CheckCircle2 },
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

const COUNTY_CHOICES = KENYA_COUNTIES.map((county) => ({
  slug: county.slug,
  name: county.name,
  coverage:
    ZONES.find((zone) => zone.slug === county.serviceZoneSlug)?.coverage ??
    "Enquiry first · availability unconfirmed",
}));

const COAST_ZONE = ZONES.find((zone) => zone.slug === "coast");
const PLACE_CHOICES = [
  ...COUNTY_CHOICES,
  ...(COAST_ZONE
    ? [{ slug: COAST_ZONE.slug, name: "Coast (regional)", coverage: COAST_ZONE.coverage }]
    : []),
];

const PROJECT_CHOICES = [
  ...PROJECT_TYPES,
  { id: "Other", label: "Custom project", desc: "Tell us what you need, even if it is not listed" },
] as const;

type ProjectSelection = CostProjectType | "Other";

function buildWhatsAppMessage(data: {
  name: string;
  type: string;
  zone: string;
  sqm?: number;
  finish?: string;
  estimateLabel?: string;
  diaspora: boolean;
  diasporaCountry?: string;
  serviceOfInterest?: string;
  customBrief?: string;
  description?: string;
}) {
  const lines = [
    `Hello ATRO — I would like to discuss a project.`,
    ``,
    `Name: ${data.name}`,
    `Type: ${data.type}`,
    ...(data.serviceOfInterest ? [`Service of interest: ${data.serviceOfInterest}`] : []),
    `Location: ${data.zone}`,
    ...(data.sqm ? [`Approximate area: ~${data.sqm} m²`] : []),
    ...(data.finish ? [`Finish: ${data.finish}`] : []),
    ...(data.estimateLabel
      ? [`Indicative planning range (not a quotation): ${data.estimateLabel}`]
      : []),
    ...(data.customBrief ? [``, `Project brief: ${data.customBrief}`] : []),
  ];
  if (data.diaspora) {
    lines.push(`I am based in ${data.diasporaCountry || "abroad"}.`);
  }
  if (data.description) {
    lines.push(``, `Notes: ${data.description}`);
  }
  return lines.join("\n");
}

export function EnquiryWizard({
  forcedDiaspora = false,
  serviceOfInterest,
  initialZone,
}: {
  forcedDiaspora?: boolean;
  serviceOfInterest?: string;
  initialZone?: string;
}) {
  const storedZone = useSiteStore((s) => s.selectedZone);
  const storeDiaspora = useSiteStore((s) => s.diasporaMode);
  const setZone = useSiteStore((s) => s.setSelectedZone);

  const diaspora = forcedDiaspora || storeDiaspora;
  const steps = diaspora ? DIASPORA_STEPS : STEPS_BASE;
  const totalSteps = steps.length;
  const defaultZone = PLACE_CHOICES.some((place) => place.slug === storedZone)
    ? (storedZone ?? "nairobi")
    : "nairobi";

  const [step, setStep] = useState(0);
  const [type, setType] = useState<ProjectSelection>("Residential");
  const [customProjectName, setCustomProjectName] = useState("");
  const [customBrief, setCustomBrief] = useState("");
  const [zone, setLocalZone] = useState(
    initialZone && PLACE_CHOICES.some((place) => place.slug === initialZone)
      ? initialZone
      : defaultZone,
  );
  const [placeSearch, setPlaceSearch] = useState("");
  const [sqm, setSqm] = useState(220);
  const [finish, setFinish] = useState<FinishId>("standard");
  const [stage, setStage] = useState<string>("Have a plot");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFileIndexes, setUploadedFileIndexes] = useState<number[]>([]);
  const [enquiryId, setEnquiryId] = useState("");
  const [uploadToken, setUploadToken] = useState("");
  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentsSkipped, setAttachmentsSkipped] = useState(false);
  const [diasporaCountry, setDiasporaCountry] = useState("");
  const [diasporaTimezone, setDiasporaTimezone] = useState("");
  const [diasporaKenyaContact, setDiasporaKenyaContact] = useState("");
  const [diasporaVisitPlans, setDiasporaVisitPlans] = useState("");
  const [hp, setHp] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const estimateType: CostProjectType = type === "Other" ? "Residential" : type;
  const estimate = useMemo(
    () => estimateCost({ type: estimateType, zone, sqm, finish }),
    [estimateType, zone, sqm, finish],
  );
  const visiblePlaces = useMemo(() => {
    const query = placeSearch.trim().toLocaleLowerCase();
    return query
      ? PLACE_CHOICES.filter((place) => place.name.toLocaleLowerCase().includes(query))
      : PLACE_CHOICES;
  }, [placeSearch]);

  useEffect(() => {
    if (initialZone) {
      setLocalZone(initialZone);
      setZone(initialZone);
    }
  }, [initialZone, setZone]);

  function chooseZone(slug: string) {
    setLocalZone(slug);
    setZone(slug);
  }

  function continueToNextStep() {
    if (step === 0 && type === "Other" && !customProjectName.trim()) {
      toast.error("Add a short name for your project first.");
      return;
    }
    if (step === 2 && type === "Other" && !customBrief.trim()) {
      toast.error("Tell us a little about the project so we can review the scope.");
      return;
    }
    if (step === 3) {
      if (!name.trim() || !phone.trim() || !email.trim()) {
        toast.error("Add your name, phone and email before reviewing the enquiry.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        toast.error("Enter a valid email address so we can reply to you.");
        return;
      }
    }
    setStep((current) => current + 1);
  }

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const remaining = MAX_ENQUIRY_ATTACHMENTS - selectedFiles.length;
    if (files.length > remaining) {
      toast.error(`You can attach up to ${MAX_ENQUIRY_ATTACHMENTS} files.`);
    }

    const accepted: File[] = [];
    for (const file of Array.from(files).slice(0, Math.max(remaining, 0))) {
      const metadata = validateMessageAttachmentMetadata(file.name, file.type, file.size);
      if (!metadata.ok) {
        toast.error(`${file.name}: ${metadata.reason}`);
        continue;
      }
      if (
        selectedFiles.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified,
        )
      ) {
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length) setSelectedFiles((current) => [...current, ...accepted]);
  }

  function removeFile(index: number) {
    setSelectedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setUploadedFileIndexes((current) =>
      current
        .filter((fileIndex) => fileIndex !== index)
        .map((fileIndex) => (fileIndex > index ? fileIndex - 1 : fileIndex)),
    );
  }

  async function uploadSelectedFiles(targetEnquiryId: string, token: string): Promise<boolean> {
    setAttachmentError("");
    const uploaded = new Set(uploadedFileIndexes);
    for (let index = 0; index < selectedFiles.length; index += 1) {
      if (uploaded.has(index)) continue;
      try {
        await uploadEnquiryFile(targetEnquiryId, token, selectedFiles[index]);
        uploaded.add(index);
        setUploadedFileIndexes([...uploaded]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "The file upload could not be completed.";
        setAttachmentError(message);
        toast.error(`Your enquiry is saved, but ${selectedFiles[index].name} did not upload.`);
        return false;
      }
    }
    return true;
  }

  async function submit() {
    if (hp) return;
    if (type === "Other" && (!customProjectName.trim() || !customBrief.trim())) {
      toast.error("Add a project name and brief before sending your enquiry.");
      setStep(!customProjectName.trim() ? 0 : 2);
      return;
    }
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast.error("Name, phone and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Enter a valid email address so we can reply to you.");
      return;
    }
    setSubmitting(true);

    let targetEnquiryId = enquiryId;
    let targetUploadToken = uploadToken;
    if (!enquiryId) {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        projectType: type === "Other" ? `Other — ${customProjectName.trim()}` : type,
        zone,
        stage,
        startDate,
        description: [
          serviceOfInterest ? `Service of interest: ${serviceOfInterest}` : "",
          type === "Other" ? `Project brief: ${customBrief.trim()}` : "",
          description.trim() ? `Additional notes: ${description.trim()}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        ...(type === "Other"
          ? {}
          : {
              sqm,
              finish,
              indicativeMin: Math.round(estimate.min),
              indicativeMax: Math.round(estimate.max),
            }),
        diaspora,
        diasporaCountry: diaspora ? diasporaCountry : "",
        diasporaTimezone: diaspora ? diasporaTimezone : "",
        diasporaKenyaContact: diaspora ? diasporaKenyaContact : "",
        diasporaVisitPlans: diaspora ? diasporaVisitPlans : "",
      };

      try {
        const saved = await saveEnquiryToDb({ data: payload });
        if (!saved.id || !saved.uploadToken) {
          throw new Error("ATRO did not return an upload grant for the enquiry.");
        }
        targetEnquiryId = saved.id;
        targetUploadToken = saved.uploadToken;
        setEnquiryId(saved.id);
        setUploadToken(saved.uploadToken);
        try {
          saveEnquiry(payload);
        } catch (error) {
          console.error("Could not save the local enquiry copy.", error);
          toast.warning("Your enquiry reached ATRO, but this browser could not save a local copy.");
        }
      } catch (error) {
        console.error("Enquiry submission failed.", error);
        setSubmitting(false);
        toast.error("We couldn't send your enquiry. Please retry, or contact ATRO on WhatsApp.");
        return;
      }
    }

    const filesUploaded =
      selectedFiles.length === 0 ||
      (await uploadSelectedFiles(targetEnquiryId, targetUploadToken));
    if (!filesUploaded) {
      setSubmitting(false);
      return;
    }
    setDone(true);
    setSubmitting(false);
    toast.success("Enquiry received.");
  }

  if (done) {
    const whatsAppMsg = buildWhatsAppMessage({
      name,
      type: type === "Other" ? `Other — ${customProjectName.trim()}` : type,
      zone: estimate.zoneName,
      ...(type === "Other" ? {} : { sqm, finish, estimateLabel: estimate.label }),
      diaspora,
      diasporaCountry,
      serviceOfInterest,
      customBrief: type === "Other" ? customBrief.trim() : "",
      description,
    });

    return (
      <div className="border border-line/50 bg-cream p-8 md:p-12 rounded-2xl">
        <div className="size-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6">
          <CheckCircle2 className="size-8 text-white" />
        </div>
        <h2 className="font-display text-[2rem] leading-none text-maroon md:text-[2.6rem]">We have the brief.</h2>
        <p className="mt-4 text-ink/80 max-w-lg text-lg">
          Thank you, {name.split(" ")[0]}. Here is what happens next:
        </p>

        {/* Expectation setting */}
        <div className="mt-6 space-y-3 max-w-lg">
          {[
            {
              icon: CheckCircle2,
              text: "A named project manager will contact you within 24 hours (EAT) to review your brief and confirm whether the work and location can be supported.",
            },
            { icon: Phone, text: `Via ${phone} or ${email} — your choice.` },
            {
              icon: Clock,
              text: diaspora
                ? "We will schedule the first call at a time that works for your time zone."
                : "We will call during EAT working hours (8am-5pm).",
            },
            {
              icon: MapPin,
              text: diaspora
                ? "If the brief is a fit, we will agree how to verify the site, in person or remotely."
                : "If the brief is a fit, we will arrange a site visit or video call to clarify scope and conditions.",
            },
            {
              icon: FileText,
              text:
                type === "Other"
                  ? "After reviewing the scope, we will confirm what is needed for a tailored estimate and proposal."
                  : "After reviewing the scope and site conditions, we will prepare a proposal and project programme.",
            },
            {
              icon: CheckCircle2,
              text: "An enquiry is not a project commitment. Work starts only after you agree to the scope and terms.",
            },
            {
              icon: Mail,
              text: `Once a project is opened, it waits for you in your portal — sign in with ${email}, no sign-up needed first.`,
            },
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
              We will contact you via email to schedule a video call. Your time zone (
              {diasporaTimezone || "not specified"}) and location ({diasporaCountry || "abroad"})
              are on file.
            </p>
            <p className="text-sm text-ink/70 mt-2">
              When we open it, your portal starts on the Abroad view — the journey, the calls on
              your clock, the channels that can reach you.
            </p>
          </div>
        )}

        <p className="mt-4 text-sm text-muted">
          {type === "Other"
            ? "No automatic price or delivery estimate is made for a custom scope. ATRO will review the brief and confirm the next steps before any commitment."
            : COST_CAVEAT}
        </p>

        {selectedFiles.length > 0 ? (
          <div
            role={attachmentsSkipped ? "alert" : "status"}
            className={cn(
              "mt-4 max-w-lg rounded-xl border p-4 text-sm",
              attachmentsSkipped
                ? "border-amber-300 bg-amber-50 text-amber-900"
                : "border-green-200 bg-green-50 text-green-900",
            )}
          >
            {attachmentsSkipped
              ? "Your enquiry was received, but the selected files were not attached. Please contact ATRO to share them."
              : `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} attached securely to your enquiry.`}
          </div>
        ) : null}

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
                  onClick={() => i < step && !enquiryId && setStep(i)}
                  disabled={Boolean(enquiryId)}
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
                    {type === "Other" && s.id === "scale" ? "Brief" : s.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 mx-2 transition-colors duration-300",
                      isComplete ? "bg-gold" : "bg-stone",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 md:p-10">
        {serviceOfInterest ? (
          <div className="mb-8 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-burgundy">
              Service selected
            </p>
            <p className="mt-1 font-medium text-maroon">{serviceOfInterest}</p>
          </div>
        ) : null}

        {/* Step 0: Type */}
        {step === 0 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-maroon mb-2">
              What kind of project or work do you have in mind?
            </legend>
            <p className="text-sm text-muted mb-6">
              Choose the closest match, or tell us about a project that is not listed.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {PROJECT_CHOICES.map((t) => (
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
                  <div
                    className={cn(
                      "size-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
                      type === t.id ? "bg-white/20" : "bg-maroon/5 group-hover:bg-maroon/10",
                    )}
                  >
                    {t.id === "Residential" ? (
                      <Home className="size-6" />
                    ) : t.id === "Commercial" ? (
                      <Building2 className="size-6" />
                    ) : t.id === "Other" ? (
                      <FileText className="size-6" />
                    ) : (
                      <Landmark className="size-6" />
                    )}
                  </div>
                  <span className="font-display text-xl">{t.label}</span>
                  {"desc" in t ? (
                    <span
                      className={cn(
                        "block text-sm mt-1",
                        type === t.id ? "text-paper/80" : "text-ink/60",
                      )}
                    >
                      {t.desc}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            {type === "Other" ? (
              <div className="mt-6 max-w-xl">
                <Label htmlFor="custom-project-name" className="mb-2 block">
                  What kind of project do you have in mind?
                </Label>
                <Input
                  id="custom-project-name"
                  value={customProjectName}
                  onChange={(event) => setCustomProjectName(event.target.value)}
                  placeholder="e.g. Swimming pool, boundary wall, or design-only"
                  maxLength={80}
                  required
                  className="rounded-xl"
                />
              </div>
            ) : null}
          </fieldset>
        ) : null}

        {/* Step 1: Place */}
        {step === 1 ? (
          <fieldset>
            <legend className="font-display text-2xl md:text-3xl text-maroon mb-2">
              Where is the site?
            </legend>
            <p className="text-sm text-muted mb-4">
              Choose a county. An enquiry is not acceptance of a project; our team will discuss
              capacity, timing and site conditions with you first.
            </p>
            <label htmlFor="enquiry-county-search" className="sr-only">
              Search counties
            </label>
            <input
              id="enquiry-county-search"
              type="search"
              value={placeSearch}
              onChange={(event) => setPlaceSearch(event.target.value)}
              placeholder="Search counties"
              className="mb-4 h-11 w-full rounded-xl border border-line bg-paper px-4 text-sm text-ink outline-none focus:border-burgundy"
            />
            <div className="grid sm:grid-cols-2 gap-4">
              {visiblePlaces.map((z) => (
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
                  <div
                    className={cn(
                      "size-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
                      zone === z.slug ? "bg-white/20" : "bg-maroon/5 group-hover:bg-maroon/10",
                    )}
                  >
                    <MapPin className="size-6" />
                  </div>
                  <span className="font-display text-xl block">{z.name}</span>
                  <span
                    className={cn(
                      "block text-sm mt-1",
                      zone === z.slug ? "text-paper/80" : "text-ink/60",
                    )}
                  >
                    {z.coverage}
                  </span>
                </button>
              ))}
              {visiblePlaces.length === 0 ? (
                <p className="rounded-xl border border-line bg-paper p-5 text-sm text-muted sm:col-span-2">
                  No county matches that search.
                </p>
              ) : null}
            </div>
          </fieldset>
        ) : null}

        {/* Step 2: Custom brief */}
        {step === 2 && type === "Other" ? (
          <div className="grid gap-6 max-w-xl">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-maroon mb-2">
                Tell us about the scope
              </h2>
              <p className="text-sm text-muted">
                No standard size or finish assumptions for a custom project. Describe what you need,
                and we will review it before suggesting the right next step.
              </p>
            </div>
            <div>
              <Label htmlFor="custom-brief" className="mb-2 block">
                What would you like ATRO to help with?
              </Label>
              <Textarea
                id="custom-brief"
                value={customBrief}
                onChange={(event) => setCustomBrief(event.target.value)}
                placeholder="Tell us what you want done, what exists on site, any known measurements, and whether you have drawings or photos."
                maxLength={2000}
                required
                className="min-h-36 rounded-xl"
              />
              <p className="mt-2 text-xs text-muted">
                A few sentences are enough to start. You can share drawings or photos with the team
                later.
              </p>
            </div>
          </div>
        ) : null}

        {/* Step 2: Scale */}
        {step === 2 && type !== "Other" ? (
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-maroon mb-2">Scale and finish</h2>
            <p className="text-sm text-muted mb-8">
              A starting size. We will measure properly after we see the plot.
            </p>

            <div className="p-6 bg-paper border border-line/50 rounded-2xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="sqm" className="text-base">
                  Approximate area
                </Label>
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
                  <div
                    className={cn(
                      "size-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300",
                      finish === f.id ? "bg-white/20" : "bg-maroon/5 group-hover:bg-maroon/10",
                    )}
                  >
                    <Paintbrush className="size-6" />
                  </div>
                  <span className="font-display text-xl block">{f.label}</span>
                  <span
                    className={cn(
                      "block text-sm mt-1",
                      finish === f.id ? "text-paper/80" : "text-ink/60",
                    )}
                  >
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
                About {formatKes(estimate.perSqm)} / m² as a midpoint. {estimate.locationNote}{" "}
                {COST_CAVEAT}
              </p>
            </div>
          </div>
        ) : null}

        {/* Step 3: You (contact info) */}
        {step === 3 ? (
          <div className="grid gap-6 max-w-xl">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-maroon mb-2">
                How do we reach you?
              </h2>
              <p className="text-sm text-muted">
                {type === "Other"
                  ? "Your brief will be reviewed by a person before we suggest a scope, estimate, or next step."
                  : "The range stays on the record as indicative — a person will confirm nothing until they have seen the site."}
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
                  Phone{" "}
                  {diaspora && <span className="text-xs text-muted">(with country code)</span>}
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
                <Select
                  id="stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="rounded-xl"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.label}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="start" className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-muted" />
                  Target start (optional)
                </Label>
                <Input
                  id="start"
                  type="month"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="desc" className="flex items-center gap-2 mb-2">
                  <FileText className="size-4 text-muted" />
                  {type === "Other" ? "Anything else to add? (optional)" : "Project notes"}
                </Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    type === "Other"
                      ? "Anything else we should know, such as access constraints or timing."
                      : "Plot, drawings, who is abroad, anything we should not miss."
                  }
                  maxLength={1000}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="enquiry-files" className="flex items-center gap-2 mb-2">
                  <Paperclip className="size-4 text-muted" />
                  Photos or drawings (optional)
                </Label>
                <Input
                  id="enquiry-files"
                  type="file"
                  multiple
                  accept={ENQUIRY_ATTACHMENT_ACCEPT}
                  disabled={Boolean(enquiryId)}
                  onChange={(event) => {
                    addFiles(event.currentTarget.files);
                    event.currentTarget.value = "";
                  }}
                  className="h-auto rounded-xl py-3 file:mr-3 file:rounded-md file:border-0 file:bg-maroon/5 file:px-3 file:py-2 file:text-xs file:font-medium file:text-maroon"
                />
                <p className="mt-2 text-xs text-muted">
                  Up to {MAX_ENQUIRY_ATTACHMENTS} files, 10 MB each. JPG, PNG, WebP, PDF, DOCX,
                  XLSX, MP4 or WebM. Files are private and available to ATRO staff handling your
                  enquiry.
                </p>
                {selectedFiles.length > 0 ? (
                  <ul className="mt-3 space-y-2" aria-label="Selected enquiry files">
                    {selectedFiles.map((file, index) => (
                      <li
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-line/60 bg-paper px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 truncate text-ink">
                          {file.name}
                          <span className="ml-2 text-xs text-muted">
                            {formatMessageFileSize(file.size)}
                          </span>
                        </span>
                        <button
                          type="button"
                          disabled={Boolean(enquiryId)}
                          onClick={() => removeFile(index)}
                          className="shrink-0 text-xs text-burgundy underline disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

            <div className="absolute -left-[9999px]" aria-hidden>
              <input
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
              />
            </div>
          </div>
        ) : null}

        {/* Step 4: Abroad (diaspora only) */}
        {step === 4 && diaspora ? (
          <div className="grid gap-6 max-w-xl">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-maroon mb-2">
                Building from abroad
              </h2>
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
                <Select
                  id="country"
                  value={diasporaCountry}
                  onChange={(e) => setDiasporaCountry(e.target.value)}
                  className="rounded-xl"
                >
                  <option value="">Select country</option>
                  {DIASPORA_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="tz" className="flex items-center gap-2 mb-2">
                  <Clock className="size-4 text-muted" />
                  Your time zone
                </Label>
                <Select
                  id="tz"
                  value={diasporaTimezone}
                  onChange={(e) => setDiasporaTimezone(e.target.value)}
                  className="rounded-xl"
                >
                  <option value="">Select time zone</option>
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
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
                <p className="text-xs text-muted mt-1">
                  A family member or friend who can receive us on site if you are not in the
                  country.
                </p>
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
                <p className="text-xs text-muted mt-1">
                  We recommend at least one site visit at structural stage. It helps to plan around
                  that.
                </p>
              </div>
            </div>

            <div className="absolute -left-[9999px]" aria-hidden>
              <input
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
              />
            </div>

            <div className="p-4 bg-gold/10 border border-gold/20 rounded-xl">
              <p className="text-sm text-burgundy">
                We will schedule the first call at a time that works for your time zone. EAT is
                UTC+3.
              </p>
            </div>
          </div>
        ) : null}

        {step === totalSteps - 1 ? (
          <div className="grid gap-6 max-w-2xl">
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-maroon mb-2">
                Review your enquiry
              </h2>
              <p className="text-sm text-muted">
                Check these details before sending. Use Edit to change any section.
              </p>
            </div>

            <div className="rounded-2xl border border-line/60 bg-paper divide-y divide-line/50">
              <section className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Project</p>
                    <p className="mt-1 font-medium text-maroon">
                      {type === "Other" ? customProjectName.trim() : type}
                    </p>
                    {serviceOfInterest ? (
                      <p className="mt-1 text-sm text-ink/70">Service: {serviceOfInterest}</p>
                    ) : null}
                    {type === "Other" ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">
                        {customBrief.trim()}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-ink/70">
                        Approximately {sqm} m² ·{" "}
                        {FINISHES.find((item) => item.id === finish)?.label}
                      </p>
                    )}
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => setStep(0)}>
                    Edit
                  </Button>
                </div>
              </section>

              <section className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Site & timing</p>
                    <p className="mt-1 font-medium text-maroon">{estimate.zoneName}</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => setStep(1)}>
                    Edit
                  </Button>
                </div>
              </section>

              {type !== "Other" ? (
                <section className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">
                        Indicative planning range
                      </p>
                      <p className="mt-1 font-medium text-maroon">{estimate.label}</p>
                      <p className="mt-1 text-xs text-muted">
                        Not a quotation. {estimate.locationNote}
                      </p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => setStep(2)}>
                      Edit
                    </Button>
                  </div>
                </section>
              ) : null}

              {selectedFiles.length > 0 ? (
                <section className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">Files</p>
                      <ul className="mt-2 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <li
                            key={`${file.name}-${file.lastModified}-${index}`}
                            className="flex items-center gap-2 text-sm text-ink/80"
                          >
                            <Paperclip className="size-4 shrink-0 text-muted" />
                            <span className="truncate">{file.name}</span>
                            <span className="shrink-0 text-xs text-muted">
                              {formatMessageFileSize(file.size)}
                              {uploadedFileIndexes.includes(index) ? " · attached" : ""}
                            </span>
                            {!enquiryId ? (
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="ml-auto shrink-0 text-xs text-burgundy underline"
                              >
                                Remove
                              </button>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {!enquiryId ? (
                      <Button type="button" size="sm" variant="outline" onClick={() => setStep(3)}>
                        Edit
                      </Button>
                    ) : null}
                  </div>
                </section>
              ) : null}

              <section className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Contact</p>
                    <p className="mt-1 font-medium text-maroon">{name.trim()}</p>
                    <p className="mt-1 text-sm text-ink/70">{phone.trim()}</p>
                    <p className="text-sm text-ink/70">{email.trim()}</p>
                    <p className="mt-2 text-sm text-ink/70">Project stage: {stage}</p>
                    {startDate ? (
                      <p className="text-sm text-ink/70">Target start: {startDate}</p>
                    ) : null}
                    {description.trim() ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-ink/70">
                        Additional notes: {description.trim()}
                      </p>
                    ) : null}
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => setStep(3)}>
                    Edit
                  </Button>
                </div>
              </section>

              {diaspora ? (
                <section className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">
                        Building from abroad
                      </p>
                      <p className="mt-1 font-medium text-maroon">
                        {diasporaCountry || "Country not specified"}
                      </p>
                      <p className="mt-1 text-sm text-ink/70">
                        {TIMEZONES.find((item) => item.value === diasporaTimezone)?.label ??
                          "Time zone not specified"}
                      </p>
                      {diasporaKenyaContact ? (
                        <p className="mt-1 text-sm text-ink/70">
                          Kenya contact: {diasporaKenyaContact}
                        </p>
                      ) : null}
                      {diasporaVisitPlans ? (
                        <p className="mt-1 text-sm text-ink/70">
                          Visit plans: {diasporaVisitPlans}
                        </p>
                      ) : null}
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => setStep(4)}>
                      Edit
                    </Button>
                  </div>
                </section>
              ) : null}
            </div>

            {attachmentError ? (
              <div
                role="alert"
                className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
              >
                <p className="font-medium">Your enquiry is saved, but one or more files are not attached.</p>
                <p className="mt-1">{attachmentError}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void submit()}
                    disabled={submitting}
                  >
                    {submitting ? "Retrying..." : "Retry file uploads"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAttachmentsSkipped(true);
                      setDone(true);
                    }}
                  >
                    Continue without files
                  </Button>
                </div>
              </div>
            ) : null}

            <p className="text-xs leading-relaxed text-muted">
              Sending this enquiry asks ATRO to review your brief. It does not confirm availability,
              create a contract, or commit you to proceed.
            </p>
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
                disabled={Boolean(enquiryId)}
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
              <Button type="button" onClick={continueToNextStep} className="rounded-xl px-6">
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
                {submitting
                  ? enquiryId
                    ? "Uploading files..."
                    : "Sending..."
                  : enquiryId
                    ? "Retry file uploads"
                    : "Send project enquiry"}
                <ArrowRight className="size-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
