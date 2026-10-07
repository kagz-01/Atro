import { useEffect, useRef, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  Loader2,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { CtaBand } from "@/components/page-hero";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { CONTRACTOR, PROFESSIONALS } from "@/lib/diaspora/portal";
import { TRACK_LIST, type TrackId } from "@/lib/diaspora/tracks";
import {
  createPortalProject,
  deletePortalProject,
  getPortal,
  recordDecision,
  releasePayment,
  approveMilestone,
  type ActivityItem,
  type PortalPayload,
} from "@/lib/diaspora/server";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal")({
  component: PortalPage,
  head: () => ({
    meta: [
      { title: "Client project portal — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Your ATRO project: live milestone progress with photographic evidence, the payment ledger with retention, every approval and certificate, and the decision log. Sign in to see your own project.",
      },
    ],
  }),
});

const KES = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });
const kes = (n: number) => `KES ${KES.format(n)}`;

const STATUS: Record<string, { label: string; cls: string }> = {
  complete: { label: "Complete", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  active: { label: "In progress", cls: "bg-amber-50 text-amber-900 border-amber-300" },
  pending: { label: "Not started", cls: "bg-stone-100 text-stone-600 border-stone-200" },
  blocked: { label: "Blocked", cls: "bg-red-50 text-red-800 border-red-200" },
};

const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  certified: { label: "Certified — awaiting release", cls: "bg-amber-50 text-amber-900 border-amber-300" },
  due: { label: "Due on certification", cls: "bg-sky-50 text-sky-900 border-sky-300" },
  scheduled: { label: "Scheduled", cls: "bg-stone-100 text-stone-600 border-stone-200" },
  retained: { label: "Held in retention", cls: "bg-burgundy/10 text-burgundy border-burgundy/25" },
};

const ACTIVITY_ICON: Record<string, typeof FileText> = {
  milestone: ClipboardCheck,
  payment: CreditCard,
  decision: FileText,
  document: FileText,
  report: FileText,
  note: FileText,
};

function Pill({ children, cls }: { children: ReactNode; cls: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
        cls,
      )}
    >
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "good" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-2xl leading-tight",
          tone === "good" && "text-emerald-800",
          tone === "warn" && "text-amber-800",
          tone === "default" && "text-maroon",
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-1.5 text-[12px] leading-snug text-ink/55">{sub}</p> : null}
    </div>
  );
}

function when(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function relative(iso: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return when(iso);
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" aria-busy="true">
      <div className="text-center">
        <Loader2 className="mx-auto size-7 animate-spin text-gold" aria-hidden />
        <p className="mt-4 text-[12px] uppercase tracking-[0.16em] text-muted">{label}</p>
      </div>
    </div>
  );
}

/* ── the account wall ── */

function SignInWall() {
  const { isPending } = useCurrentUserState();
  if (isPending) return <LoadingBlock label="Checking your session" />;

  return (
    <>
      <section className="relative overflow-hidden bg-maroon pt-28 pb-16 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/60 via-maroon to-maroon" />
        <div className="pointer-events-none absolute -top-24 right-0 size-[460px] rounded-full bg-gold/10 blur-[150px]" />
        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2">
              <span className="size-1.5 rounded-full bg-gold" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold">
                Client project portal
              </p>
            </div>
            <h1 className="mt-6 font-display text-5xl leading-tight text-paper sm:text-6xl">
              Your build, from anywhere
            </h1>
            <p className="mt-6 text-lg text-paper/75">
              Milestones with photographic evidence, the payment ledger with retention,
              every certificate, and every decision — private to your sign-in.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
            <div>
              <h2 className="font-display text-3xl text-maroon md:text-4xl">
                Sign in to open your project
              </h2>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/70">
                The portal is private per account. Your milestones, evidence, payments
                and documents are visible only to you — and to nobody else, whatever
                link they are sent.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  [CheckCircle2, "Approve a milestone", "Mark a stage complete once the evidence is right. Progress, stage and the ledger all move."],
                  [CreditCard, "Release a certified payment", "Only certified amounts can be released, and only once. No double payment."],
                  [FileText, "Record a decision", "Choose from the listed options; the choice is written into the log with today's date."],
                ].map(([Icon, title, body]) => (
                  <li key={String(title)} className="flex gap-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-maroon/10 text-maroon">
                      <Icon className="size-4.5" />
                    </span>
                    <span>
                      <span className="block font-display text-lg text-maroon">{String(title)}</span>
                      <span className="mt-1 block text-[14px] leading-relaxed text-ink/60">
                        {String(body)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/login">
                    Sign in
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/diaspora">What ATRO offers diaspora clients</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-ink/10 bg-cream p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                No account yet?
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-ink/70">
                Signing in takes one click with the account you already have. When you
                are ready for a real project, open one from the portal and ATRO works
                to it — the nine stages, the payment schedule and the decision log are
                generated from your dates and contract value.
              </p>
              <div className="mt-6 space-y-3 border-t border-ink/10 pt-5">
                {[
                  [ClipboardCheck, "Live milestone progress"],
                  [CreditCard, "Payment ledger with retention"],
                  [Lock, "Document vault you keep"],
                  [Camera, "Photographic evidence"],
                ].map(([Icon, label]) => (
                  <p key={String(label)} className="flex items-center gap-3 text-[13px] text-ink/65">
                    <Icon className="size-4 shrink-0 text-maroon/60" />
                    {String(label)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── create your own project ── */

const MONTHS_AHEAD = [3, 6, 9, 12, 15, 18, 24];

function NewProjectForm({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel: () => void;
}) {
  const today = new Date();
  const [title, setTitle] = useState("");
  const [plot, setPlot] = useState("");
  const [area, setArea] = useState("");
  const [contractValue, setContractValue] = useState("25000000");
  const [city, setCity] = useState("");
  const [tz, setTz] = useState("");
  const [months, setMonths] = useState("12");
  const [track, setTrack] = useState<TrackId>("construction");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const startDate = today.toISOString().slice(0, 10);
  const targetDate = new Date(today);
  targetDate.setMonth(targetDate.getMonth() + Number(months));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await createPortalProject({
        data: {
          title: title.trim(),
          plot: plot.trim(),
          area: area.trim(),
          contractValue: Number(contractValue),
          startDate,
          targetDate: targetDate.toISOString().slice(0, 10),
          clientCity: city.trim(),
          clientTz: tz,
          track,
        },
      });
      toast.success("Project opened in your portal.");
      onDone();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        message.includes("target handover")
          ? message
          : "Check the details — a title of at least 3 characters and a contract value of at least KES 500,000 are required.",
      );
      toast.error("Could not open the project.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-gold/40 bg-white p-7 shadow-[0_12px_50px_rgb(60_5_8/0.12)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
            New project
          </p>
          <h2 className="mt-2 font-display text-2xl text-maroon">Open your own project</h2>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink/60">
            Nine stages dated across your programme, a payment schedule that sums to
            your contract value, and a decision log you control.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 text-[12px] uppercase tracking-[0.14em] text-muted hover:text-maroon"
        >
          Cancel
        </button>
      </div>

      <div className="mt-6">
        <Label htmlFor="np-track">What are we doing?</Label>
        <Select
          id="np-track"
          value={track}
          onChange={(e) => setTrack(e.target.value as TrackId)}
        >
          {TRACK_LIST.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </Select>
        <p className="mt-2 text-[12px] leading-relaxed text-ink/55">
          {TRACK_LIST.find((t) => t.id === track)?.summary}
        </p>
        <p className="mt-1 text-[12px] text-muted">
          {TRACK_LIST.find((t) => t.id === track)?.stages.length} stages ·{" "}
          {TRACK_LIST.find((t) => t.id === track)?.payments.length} payments
        </p>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="np-title">Project</Label>
          <Input
            id="np-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="4-bedroom maisonette, Karen"
            required
            minLength={3}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="np-plot">Plot reference</Label>
          <Input
            id="np-plot"
            value={plot}
            onChange={(e) => setPlot(e.target.value)}
            placeholder="Title No. LR 11842/201, Westlands"
          />
        </div>
        <div>
          <Label htmlFor="np-area">Built-up area</Label>
          <Input
            id="np-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="312 m²"
          />
        </div>
        <div>
          <Label htmlFor="np-value">Contract value (KES)</Label>
          <Input
            id="np-value"
            value={contractValue}
            onChange={(e) => setContractValue(e.target.value)}
            inputMode="numeric"
            required
          />
        </div>
        <div>
          <Label htmlFor="np-city">Your city</Label>
          <Input
            id="np-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="London"
          />
        </div>
        <div>
          <Label htmlFor="np-tz">Your timezone</Label>
          <Select id="np-tz" value={tz} onChange={(e) => setTz(e.target.value)}>
            <option value="">Not set</option>
            {[
              "Europe/London",
              "Europe/Stockholm",
              "Africa/Dubai",
              "Asia/Qatar",
              "America/New_York",
              "America/Chicago",
              "America/Los_Angeles",
              "Australia/Sydney",
              "Africa/Johannesburg",
            ].map((zone) => (
              <option key={zone} value={zone}>
                {zone.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="np-months">Programme</Label>
          <Select
            id="np-months"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          >
            {MONTHS_AHEAD.map((m) => (
              <option key={m} value={String(m)}>
                {m} months from today ({when(startDate)} → {when(targetDate.toISOString())})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error ? (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-800">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        {busy ? "Opening…" : "Open project"}
      </Button>
    </form>
  );
}

/* ── the portal ── */

function PortalPage() {
  const user = useCurrentUser();
  const [data, setData] = useState<PortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [pending, setPending] = useState("");
  const firstVisit = useRef<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const payload = await getPortal();
      firstVisit.current ??= payload.previousVisit;
      setData(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        message === "Unauthorized"
          ? "Your session has expired. Sign in again to open your project."
          : "We could not reach your project just now.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // Re-check when the account changes (sign-in, sign-out).
  }, [user?.id]);

  async function run(key: string, action: () => Promise<unknown>, done: string) {
    setPending(key);
    try {
      await action();
      await load();
      toast.success(done);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That action did not complete.");
    } finally {
      setPending("");
    }
  }

  // Signed-out visitors get the sign-in wall, never the payload — and never a flash
  // of it: `useCurrentUserState().isPending` holds back until the session resolves.
  const { isPending: sessionPending } = useCurrentUserState();
  const hydrated = useIsHydrated();
  // The server always renders "pending", so the first client paint must too —
  // otherwise the two trees differ and React throws the page away.
  if (sessionPending || !hydrated) return <LoadingBlock label="Checking your session" />;
  if (!user) {
    return (
      <>
        <SignInWall />
        <CtaBand
          title="Not sure whether this is for you?"
          body="The portal is one part of how ATRO works with clients overseas. Start with what the service actually is."
          ctaTo="/diaspora"
          ctaLabel="See the Abroad service"
        />
      </>
    );
  }

  if (loading && !data) return <LoadingBlock label="Opening your project" />;
  if (!data) {
    return (
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <AlertTriangle className="mx-auto size-8 text-burgundy" aria-hidden />
          <h1 className="mt-5 font-display text-3xl text-maroon">Portal unavailable</h1>
          <p className="mt-4 text-ink/70">{error}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Button onClick={() => void load()}>Try again</Button>
            <Button asChild variant="outline">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const p = data.project;
  const paid = data.payments.filter((x) => x.status === "paid");
  const certified = data.payments.filter((x) => x.status === "certified");
  const scheduled = data.payments.filter((x) => x.status === "scheduled");
  const openDecisions = data.decisions.filter((d) => d.state !== "decided");
  const newActivity = data.activity.filter(
    (a) => firstVisit.current && a.at > firstVisit.current,
  );
  const isSample = p.isSample;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-maroon pt-28 pb-16 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-burgundy/60 via-maroon to-maroon" />
        <div className="pointer-events-none absolute -top-24 right-0 size-[460px] rounded-full bg-gold/10 blur-[150px]" />

        <div className="relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2">
                <span className="size-1.5 rounded-full bg-gold" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold">
                  {isSample ? "Demonstration project" : "Your live project"}
                </p>
              </div>
              <h1 className="mt-6 font-display text-5xl leading-tight text-paper sm:text-6xl">
                {p.title}
              </h1>
              <p className="mt-6 text-lg text-paper/75">
                {isSample
                  ? "A sample record so you can see exactly what your portal holds — milestones with photographic evidence, the payment ledger with retention, the document vault, and the decision log. Open a project of your own below and the same structure fills with your data."
                  : "Everything on this page is your record: what was built, what is certified, what has been paid, and what you have decided. You approve from here."}
              </p>
              {newActivity.length > 0 ? (
                <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold/20 px-4 py-2 text-[12px] font-medium text-gold-light">
                  {newActivity.length} update{newActivity.length === 1 ? "" : "s"} since
                  you last opened this
                </p>
              ) : null}
            </div>

            <div className="shrink-0 rounded-2xl border border-paper/15 bg-paper/5 p-5 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.16em] text-gold">
                Project reference
              </p>
              <p className="mt-2 font-display text-2xl text-paper">{p.reference}</p>
              <p className="mt-3 text-[13px] text-paper/60">{p.clientLabel}</p>
              <p className="mt-1 text-[12px] text-paper/45">{p.contractType}</p>
              <div className="mt-4 border-t border-paper/15 pt-4">
                <UserButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project header strip */}
      <section className="border-b border-ink/10 bg-cream">
        <div className="mx-auto max-w-[1400px] px-6 py-6 sm:px-8 md:px-12 lg:px-16">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              ["Client", p.clientLabel],
              ["Engagement", p.contractType],
              ["Plot", p.plot],
              ["Area", p.area],
              ["Started", p.startedLabel],
              ["Target handover", p.targetLabel],
              ["Stage", p.stage],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  {k}
                </dt>
                <dd className="mt-1.5 text-[13px] leading-snug text-ink/75">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* New project */}
      <section className="bg-paper py-10">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          {data.projects.length > 1 ? (
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <p className="text-[12px] uppercase tracking-[0.16em] text-muted">
                Your projects
              </p>
              {data.projects.map((proj) => (
                <span
                  key={proj.id}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[12px]",
                    proj.id === p.id
                      ? "border-burgundy bg-burgundy/10 text-burgundy"
                      : "border-ink/12 text-ink/55",
                  )}
                >
                  {proj.reference} · {proj.title}
                </span>
              ))}
            </div>
          ) : null}

          {creating ? (
            <NewProjectForm
              onDone={() => {
                setCreating(false);
                void load();
              }}
              onCancel={() => setCreating(false)}
            />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-cream p-6">
              <div className="max-w-2xl">
                <p className="font-display text-lg text-maroon">
                  {isSample ? "This is the demonstration project" : "Add another project"}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink/65">
                  {isSample
                    ? "It uses a sample client and sample figures so you can look through a complete record. Open your own and the portal works to your dates, your contract value and your approvals."
                    : "Open a second project — a different plot, a different phase — each with its own milestones, ledger and decision log."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setCreating(true)}>
                  <Plus className="size-4" />
                  Open a project
                </Button>
                {isSample ? null : (
                  <Button
                    variant="outline"
                    onClick={() =>
                      void run(
                        `del-${p.id}`,
                        () => deletePortalProject({ data: { projectId: p.id } }),
                        "Project removed.",
                      )
                    }
                    disabled={pending === `del-${p.id}`}
                  >
                    <Trash2 className="size-4" />
                    Remove this project
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Progress + budget */}
      <section className="bg-stone/40 py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded-3xl border border-ink/10 bg-white p-7 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                    Current stage
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-maroon">{p.stage}</h2>
                </div>
                <Pill cls={STATUS.active.cls}>{STATUS.active.label}</Pill>
              </div>

              <div className="mt-8">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] text-ink/60">Overall completion</span>
                  <span className="font-display text-2xl text-maroon">{p.progress}%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-[12px] text-ink/50">
                  <span>Day {p.schedule.daysElapsed} of {p.schedule.daysTotal}</span>
                  <span>{p.schedule.daysRemaining} days remaining</span>
                </div>
              </div>

              <div
                className={cn(
                  "mt-8 rounded-2xl p-5",
                  p.schedule.onTrack ? "bg-emerald-50" : "bg-amber-50",
                )}
              >
                <p
                  className={cn(
                    "text-[12px] font-bold uppercase tracking-[0.14em]",
                    p.schedule.onTrack ? "text-emerald-800" : "text-amber-900",
                  )}
                >
                  Programme status
                </p>
                <p
                  className={cn(
                    "mt-2 text-[14px] leading-relaxed",
                    p.schedule.onTrack ? "text-emerald-900" : "text-amber-900",
                  )}
                >
                  {p.schedule.onTrack ? "On track. " : "Needs attention. "}
                  {p.schedule.note}
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-ink/10 bg-cream p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                      Next call
                    </p>
                    <p className="mt-1.5 text-[15px] text-maroon">{p.nextCall.when}</p>
                    {p.nextCall.localTimeForYou &&
                    p.nextCall.localTimeForYou !== "To be scheduled" ? (
                      <p className="text-[12px] text-ink/50">
                        {p.nextCall.localTimeForYou} for you — scheduled, not negotiated
                        weekly
                      </p>
                    ) : null}
                  </div>
                  <span className="hidden shrink-0 rounded-full bg-maroon px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-paper sm:inline-block">
                    Booked
                  </span>
                </div>
                {p.nextCall.agenda.length > 0 ? (
                  <ul className="mt-4 space-y-2 border-t border-ink/10 pt-4">
                    {p.nextCall.agenda.map((a) => (
                      <li key={a} className="flex gap-2.5 text-[13px] text-ink/70">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                        {a}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-ink/10 bg-white p-7 md:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                Open book cost tracking
              </p>
              <h2 className="mt-2 font-display text-3xl text-maroon">Budget</h2>

              <dl className="mt-7 space-y-4">
                {[
                  ["Contract value (BOQ priced)", kes(p.contractValue), false],
                  ["Certified to date", kes(p.budget.certifiedToDate), false],
                  ["Paid to date", kes(p.budget.paidToDate), false],
                  ["Currently certified, awaiting release", kes(p.budget.currentlyCertified), true],
                  [`Retention held (${p.budget.retentionPct}%)`, kes(p.budget.retentionHeld), true],
                ].map(([k, v, highlight]) => (
                  <div
                    key={String(k)}
                    className="flex items-baseline justify-between gap-4 border-b border-ink/8 pb-3"
                  >
                    <dt className="text-[13px] text-ink/60">{k}</dt>
                    <dd
                      className={cn("text-[15px]", highlight ? "text-burgundy" : "text-maroon")}
                    >
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 rounded-2xl bg-maroon p-5 text-paper">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  Projection at completion
                </p>
                <p className="mt-2 font-display text-2xl">
                  {kes(p.budget.projectedAtCompletion)}
                </p>
                {p.budget.projectedAtCompletion > 0 ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-paper/70">
                    A projected{" "}
                    {(
                      ((p.budget.projectedAtCompletion - p.boqValue) / p.boqValue) *
                      100
                    ).toFixed(1)}
                    % above contract. Every variation behind that figure is itemised in
                    the decision log below — there are no unapproved variations on this
                    project.
                  </p>
                ) : null}
              </div>

              <p className="mt-5 text-[12px] leading-relaxed text-ink/50">
                Every material price, labour rate and subcontractor quote behind these
                figures is available to you. Open-book costing means the numbers are
                inspectable, not hidden behind a margin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones + evidence */}
      <section className="bg-paper py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Milestones and evidence
              </p>
              <h2 className="mt-3 font-display text-4xl text-maroon md:text-5xl">
                Every stage, with proof
              </h2>
            </div>
            <p className="max-w-md text-[14px] text-ink/60">
              Photographs are captured at the moment before work becomes invisible. Once
              concrete is poured, nothing can be verified by any means — so the record
              has to exist first.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {data.milestones.map((m) => {
              const style = STATUS[m.status] ?? STATUS.pending;
              const evidence = m.evidence ?? [];
              const canApprove = m.status === "active" || m.status === "blocked";
              const key = `ms-${m.id}`;
              return (
                <details
                  key={m.id}
                  className={cn(
                    "group overflow-hidden rounded-3xl border bg-white transition-colors",
                    m.status === "active"
                      ? "border-amber-300 shadow-[0_8px_40px_rgb(201_146_79/0.18)]"
                      : "border-ink/10",
                  )}
                  open={m.status === "active"}
                >
                  <summary className="flex cursor-pointer list-none items-center gap-4 p-5 md:gap-6 md:p-6 [&::-webkit-details-marker]:hidden">
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-full font-display text-lg",
                        m.status === "complete" && "bg-emerald-600 text-white",
                        m.status === "active" && "bg-gold text-maroon",
                        m.status === "pending" && "bg-ink/8 text-ink/40",
                        m.status === "blocked" && "bg-red-600 text-white",
                      )}
                    >
                      {m.status === "complete" ? "✓" : m.order}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="font-display text-xl text-maroon md:text-2xl">
                          {m.name}
                        </span>
                        <Pill cls={style.cls}>{style.label}</Pill>
                      </span>
                      <span className="mt-1.5 block text-[12px] text-ink/45">
                        {m.stage} · {m.plannedStart} – {m.plannedEnd}
                        {m.actualEnd ? ` · completed ${m.actualEnd}` : ""}
                      </span>
                    </span>

                    <span className="hidden w-40 shrink-0 sm:block">
                      <span className="block text-right text-[12px] text-ink/50">
                        {m.progress}%
                      </span>
                      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-ink/10">
                        <span
                          className={cn(
                            "block h-full rounded-full",
                            m.status === "complete"
                              ? "bg-emerald-600"
                              : "bg-gradient-to-r from-gold to-gold-light",
                          )}
                          style={{ width: `${m.progress}%` }}
                        />
                      </span>
                    </span>

                    <span className="shrink-0 text-ink/30 transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>

                  <div className="border-t border-ink/8 px-5 pb-6 pt-5 md:px-6">
                    <p className="max-w-3xl text-[14px] leading-relaxed text-ink/75">
                      {m.summary}
                    </p>

                    {m.verifiedBy ? (
                      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[12px] font-medium text-emerald-900">
                        <span aria-hidden>✓</span>
                        Verified: {m.verifiedBy}
                      </p>
                    ) : null}

                    {evidence.length > 0 ? (
                      <div className="mt-7">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                          Photographic record — {evidence.length} items
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {evidence.map((e) => (
                            <div
                              key={`${m.id}-${e.date}-${e.caption}`}
                              className="rounded-2xl border border-ink/10 bg-cream p-4"
                            >
                              <div className="mb-3 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-burgundy/25 via-maroon/15 to-gold/15">
                                <span className="rounded-lg border border-paper/40 bg-maroon/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-paper">
                                  Site photo
                                </span>
                              </div>
                              <p className="text-[11px] uppercase tracking-[0.14em] text-gold">
                                {e.date}
                              </p>
                              <p className="mt-1.5 text-[14px] font-medium text-maroon">
                                {e.caption}
                              </p>
                              <p className="mt-2 text-[13px] leading-relaxed text-ink/60">
                                {e.detail}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {canApprove ? (
                      <div className="mt-7 flex flex-wrap items-center gap-4 rounded-2xl border border-gold/30 bg-gold/5 p-5">
                        <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-ink/70">
                          Checked the evidence above? Approving marks this stage
                          complete, moves the programme on and writes the approval into
                          the record with today's date.
                        </p>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            void run(
                              key,
                              () =>
                                approveMilestone({
                                  data: { projectId: p.id, milestoneId: m.id },
                                }),
                              `${m.name} approved.`,
                            );
                          }}
                          disabled={pending === key}
                        >
                          {pending === key ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-4" />
                          )}
                          Approve milestone
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      {/* Payment ledger */}
      <section className="bg-stone/40 py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
              Payment ledger
            </p>
            <h2 className="mt-3 font-display text-4xl text-maroon md:text-5xl">
              Pay for work, not promises
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-ink/70">
              Every payment is tied to a stage and released against a certificate from a
              registered quantity surveyor, referenced to that certificate in the bank
              transfer. {kes(p.budget.retentionHeld)} of retention is held against
              defects and is not payable until they close.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-3xl">
            <Stat
              label="Paid"
              value={kes(p.budget.paidToDate)}
              sub={`${paid.length} certificates settled`}
              tone="good"
            />
            <Stat
              label="Certified"
              value={kes(p.budget.currentlyCertified)}
              sub={`${certified.length} awaiting your release`}
              tone="warn"
            />
            <Stat
              label="Scheduled"
              value={kes(scheduled.reduce((s, x) => s + x.amount, 0))}
              sub="Later stages, not yet due"
            />
            <Stat
              label="Retention"
              value={kes(p.budget.retentionHeld)}
              sub={`${p.budget.retentionPct}% held for defects`}
            />
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-ink/10 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead className="border-b border-ink/10 bg-cream">
                  <tr className="text-[10px] uppercase tracking-[0.14em] text-ink/50">
                    <th scope="col" className="px-6 py-4 font-bold">Stage</th>
                    <th scope="col" className="px-6 py-4 font-bold">Amount</th>
                    <th scope="col" className="px-6 py-4 font-bold">Status</th>
                    <th scope="col" className="px-6 py-4 font-bold">Certificate</th>
                    <th scope="col" className="px-6 py-4 font-bold">Date</th>
                    <th scope="col" className="px-6 py-4 font-bold">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((pay) => {
                    const style = PAYMENT_STATUS[pay.status] ?? PAYMENT_STATUS.scheduled;
                    const key = `pay-${pay.id}`;
                    const releasable = pay.status === "certified";
                    return (
                      <tr key={pay.id} className="border-b border-ink/6 last:border-0 align-top">
                        <td className="px-6 py-4">
                          <p className="text-[14px] font-medium text-maroon">{pay.label}</p>
                          {pay.note ? (
                            <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-ink/50">
                              {pay.note}
                            </p>
                          ) : null}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[14px] text-maroon">
                          {kes(pay.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <Pill cls={style.cls}>{style.label}</Pill>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[13px] text-ink/60">
                          {pay.certificate ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[13px] text-ink/60">
                          {pay.paidDate ?? pay.dueDate}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {releasable ? (
                            <Button
                              size="sm"
                              variant="gold"
                              onClick={() =>
                                void run(
                                  key,
                                  () =>
                                    releasePayment({
                                      data: { projectId: p.id, paymentId: pay.id },
                                    }),
                                  `${pay.label} released.`,
                                )
                              }
                              disabled={pending === key}
                            >
                              {pending === key ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <CreditCard className="size-4" />
                              )}
                              Release
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Vault + decisions + activity */}
      <section className="bg-paper py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Document vault */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Document vault
              </p>
              <h2 className="mt-3 font-display text-3xl text-maroon md:text-4xl">
                Everything, in one place
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-ink/65">
                The contract, the approved plans, every certificate, every receipt and
                every weekly report. You own this record. If the relationship ends, it
                does not leave with us.
              </p>

              <ul className="mt-7 space-y-2.5">
                {data.documents.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-start gap-4 rounded-2xl border border-ink/10 bg-white p-4"
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-maroon text-[9px] font-bold uppercase tracking-wider text-paper">
                      {d.category.slice(0, 3)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-medium text-maroon">{d.name}</span>
                        {d.state === "verified" ? (
                          <Pill cls="bg-emerald-50 text-emerald-800 border-emerald-200">
                            Verified
                          </Pill>
                        ) : d.state === "signed" ? (
                          <Pill cls="bg-sky-50 text-sky-900 border-sky-300">Signed</Pill>
                        ) : (
                          <Pill cls="bg-amber-50 text-amber-900 border-amber-300">
                            Pending
                          </Pill>
                        )}
                      </span>
                      <span className="mt-1 block text-[12px] text-ink/50">
                        {d.category} · {d.reference} · {d.issued} · {d.size}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Decision log */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Decision log
              </p>
              <h2 className="mt-3 font-display text-3xl text-maroon md:text-4xl">
                Nothing agreed by memory
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-ink/65">
                Every decision with its date, the options considered, what was chosen and
                what it cost. {openDecisions.length} are currently open. This is the
                document that means month nine never becomes an argument about month
                three.
              </p>

              <ul className="mt-7 space-y-3">
                {data.decisions.map((d) => {
                  const key = `dec-${d.id}`;
                  const awaiting = d.state === "awaiting-client";
                  return (
                    <li
                      key={d.id}
                      className={cn(
                        "rounded-2xl border p-5",
                        awaiting ? "border-amber-300 bg-amber-50/50" : "border-ink/10 bg-white",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-gold">
                          {d.date}
                        </p>
                        {awaiting ? (
                          <Pill cls="bg-amber-100 text-amber-900 border-amber-300">
                            Your decision needed
                          </Pill>
                        ) : d.state === "open" ? (
                          <Pill cls="bg-stone-100 text-stone-600 border-stone-300">Open</Pill>
                        ) : (
                          <Pill cls="bg-emerald-50 text-emerald-800 border-emerald-200">
                            Decided
                          </Pill>
                        )}
                      </div>
                      <p className="mt-2 text-[15px] font-medium text-maroon">{d.title}</p>
                      <p className="mt-2 text-[13px] leading-relaxed text-ink/65">{d.detail}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {d.options.map((o) => (
                          <button
                            key={o}
                            type="button"
                            disabled={!awaiting || pending === key}
                            onClick={() =>
                              void run(
                                key,
                                () =>
                                  recordDecision({
                                    data: {
                                      projectId: p.id,
                                      decisionId: d.id,
                                      choice: o,
                                    },
                                  }),
                                `Recorded: ${o}`,
                              )
                            }
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-[11px] transition-colors",
                              o === d.chosen
                                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                : awaiting
                                  ? "cursor-pointer border-ink/15 text-ink/65 hover:border-burgundy hover:bg-burgundy/5 hover:text-burgundy"
                                  : "border-ink/12 text-ink/55",
                            )}
                          >
                            {o}
                            {o === d.chosen ? " ✓" : ""}
                          </button>
                        ))}
                      </div>

                      <p className="mt-3 border-t border-ink/8 pt-3 text-[12px] text-ink/50">
                        Cost impact:{" "}
                        <span className="font-medium text-burgundy">
                          {d.costImpact === 0
                            ? "No change"
                            : `${d.costImpact > 0 ? "+" : "−"}${kes(Math.abs(d.costImpact))}`}
                        </span>
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Activity */}
      <section className="bg-stone/40 py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                What has happened
              </p>
              <h2 className="mt-3 font-display text-3xl text-maroon md:text-4xl">
                Your project, in order
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-ink/65">
                Every approval, release and decision written as it happened. This is the
                answer to "what has actually been done since I last looked".
              </p>

              <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  Weekly report — {data.weeklyReport.week}, {data.weeklyReport.period}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
                  {data.weeklyReport.summary}
                </p>
                <p className="mt-3 text-[12px] text-ink/50">
                  Prepared by {data.weeklyReport.preparedBy} · {data.weeklyReport.photos}{" "}
                  photographs attached
                </p>
                <Link
                  to="/guides/$slug"
                  params={{ slug: "managing-a-build-remotely" }}
                  className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-bold text-burgundy transition-colors hover:text-maroon"
                >
                  How we report
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            <ul className="space-y-3">
              {data.activity.map((a: ActivityItem) => {
                const Icon = ACTIVITY_ICON[a.kind] ?? FileText;
                const isNew = Boolean(firstVisit.current && a.at > firstVisit.current);
                return (
                  <li
                    key={a.id}
                    className={cn(
                      "flex gap-4 rounded-2xl border bg-white p-5",
                      isNew ? "border-gold/50" : "border-ink/10",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
                        isNew ? "bg-gold/15 text-burgundy" : "bg-maroon/10 text-maroon",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-medium text-maroon">{a.title}</span>
                        {isNew ? (
                          <Pill cls="bg-gold/15 text-burgundy border-gold/40">New</Pill>
                        ) : null}
                      </span>
                      {a.body ? (
                        <span className="mt-1 block text-[13px] leading-relaxed text-ink/60">
                          {a.body}
                        </span>
                      ) : null}
                      <span className="mt-2 block text-[11px] uppercase tracking-[0.14em] text-muted">
                        {relative(a.at)}
                        {firstVisit.current && isNew ? " · since your last visit" : ""}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Professionals */}
      <section className="bg-paper py-14 md:py-16">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
                Who is responsible
              </p>
              <h2 className="mt-3 font-display text-4xl text-maroon">Named, and checkable</h2>
              <p className="mt-5 text-[15px] leading-relaxed text-ink/70">
                Every professional on your project, named, with the registration number
                that governs their work and the body that holds it. You do not need to
                take our word for any of it — search each number yourself.
              </p>

              <div className="mt-8 rounded-3xl border border-maroon/20 bg-maroon p-6 text-paper">
                <p className="text-[10px] uppercase tracking-[0.16em] text-gold">
                  Main contractor
                </p>
                <p className="mt-2 font-display text-2xl">{CONTRACTOR.name}</p>
                <dl className="mt-4 space-y-2 text-[13px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-paper/55">NCA registration</dt>
                    <dd className="text-gold">{CONTRACTOR.ncaNo}</dd>
                  </div>
                </dl>
                <p className="mt-4 border-t border-paper/15 pt-4 text-[12px] leading-relaxed text-paper/65">
                  {CONTRACTOR.ncaCategories.join(" · ")}
                </p>
                <p className="mt-3 text-[12px] leading-relaxed text-paper/55">
                  {CONTRACTOR.note}
                </p>
              </div>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {PROFESSIONALS.map((pro) => (
                <li key={pro.regNo} className="rounded-2xl border border-ink/10 bg-white p-5">
                  <p className="font-display text-xl text-maroon">{pro.name}</p>
                  <p className="mt-1 text-[13px] text-burgundy">{pro.role}</p>
                  <p className="mt-3 text-[12px] leading-relaxed text-ink/55">{pro.body}</p>
                  <p className="mt-3 rounded-lg bg-cream px-3 py-2 font-mono text-[12px] text-maroon">
                    {pro.regNo}
                  </p>
                  <a
                    href={pro.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-gold transition-colors hover:text-maroon"
                  >
                    Verify at {new URL(pro.verifyUrl).hostname.replace(/^www\./, "")} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready to open a real project?"
        body="Tell us about the plot and the programme. ATRO then works to it — nine stages, a measured bill of quantities, milestone payments and the record you have just looked through."
        ctaTo={{ to: "/start", search: { from: "diaspora" } }}
        ctaLabel="Start a project"
      />
    </>
  );
}

