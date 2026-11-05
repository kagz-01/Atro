import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import { ClientDashboard } from "@/components/dashboard/client-dashboard";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { listMyDocuments } from "@/lib/invoice-server";
import { getMyNudges } from "@/lib/attention";
import { TRACK_LIST, trackById, type TrackId } from "@/lib/diaspora/tracks";
import { SERVICES } from "@/lib/site";
import { ZONES } from "@/lib/site";
import {
  createPortalProject,
  deletePortalProject,
  getPortal,
  recordDecision,
  approveMilestone,
  type PortalPayload,
} from "@/lib/diaspora/server";
import { startPaystackCheckout } from "@/lib/paystack-server";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { getMyProjectCircle } from "@/lib/project-circle-server";
import { getMyAccess } from "@/lib/staff-access";
import { resolveDashboardRoute } from "@/lib/dashboard-routing";

export const Route = createFileRoute("/portal")({
  component: LocalPortalPage,
  head: () => ({
    meta: [
      { title: "Project portal — ATRO Design & Construction" },
      {
        name: "description",
        content:
          "Your ATRO project: live milestone progress with photographic evidence, the payment ledger with retention, every approval and certificate, and the decision log. Sign in to see your own project.",
      },
    ],
  }),
});

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

function SignInWall({ experience }: { experience: "local" | "diaspora" }) {
  const { isPending } = useCurrentUserState();
  if (isPending) return <LoadingBlock label="Checking your session" />;
  const isDiaspora = experience === "diaspora";

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
                {isDiaspora ? "Diaspora project portal" : "Kenya project portal"}
              </p>
            </div>
            <h1 className="mt-6 font-display text-[2.3rem] leading-[0.95] text-paper sm:text-5xl md:text-6xl">
              {isDiaspora ? "Your build, from anywhere" : "Your project, clearly in view"}
            </h1>
            <p className="mt-6 text-lg text-paper/75">
              {isDiaspora
                ? "Milestones with photographic evidence, the payment ledger with retention, every certificate, and every decision — private to your sign-in."
                : "See project progress, approvals, payments and documents in one private place — linked to your sign-in."}
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
                  [CreditCard, "Pay a certified instalment", "Only certified amounts can be paid online, and the ledger updates only after Paystack verifies the transaction."],
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
                  <Link
                    to="/login"
                    search={{ returnTo: isDiaspora ? "/portal/diaspora" : undefined }}
                  >
                    Sign in
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  {isDiaspora ? (
                    <Link to="/diaspora">About ATRO's diaspora service</Link>
                  ) : (
                    <Link to="/projects">Explore our projects</Link>
                  )}
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
  const [contractValue, setContractValue] = useState("");
  const [city, setCity] = useState("");
  const [tz, setTz] = useState("");
  const [months, setMonths] = useState("12");
  const [track, setTrack] = useState<TrackId>("construction");
  const [serviceSlug, setServiceSlug] = useState("");
  const [zone, setZone] = useState("nairobi");
  const [phone, setPhone] = useState("");
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
          serviceSlug,
          zone,
          clientPhone: phone.trim(),
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
          <Label htmlFor="np-value">Agreed contract value (KES)</Label>
          <Input
            id="np-value"
            type="number"
            min="500000"
            step="1"
            value={contractValue}
            onChange={(e) => setContractValue(e.target.value)}
            inputMode="numeric"
            required
          />
          <p className="mt-1 text-xs text-muted">
            Enter the amount agreed in writing. It determines this project's payment stages.
          </p>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="np-service">Service</Label>
          <Select
            id="np-service"
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
          >
            <option value="">Not sure yet</option>
            {trackById(track).services.map((slug) => {
              const service = SERVICES.find((x) => x.slug === slug);
              return (
                <option key={slug} value={slug}>
                  {service?.title ?? slug}
                </option>
              );
            })}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="np-phone">Mobile number (optional)</Label>
          <Input
            id="np-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254 7XX XXX XXX"
            inputMode="tel"
          />
          <p className="mt-2 text-[12px] leading-relaxed text-ink/55">
            Used only to tell you when ATRO posts an update, or when something needs
            your decision. Add the country code.
          </p>
        </div>
        <div>
          <Label htmlFor="np-zone">County</Label>
          <Select id="np-zone" value={zone} onChange={(e) => setZone(e.target.value)}>
            {ZONES.filter((z) => z.status !== "diaspora").map((z) => (
              <option key={z.slug} value={z.slug}>
                {z.name} — {z.status === "active" ? "building here now" : z.coverage.toLowerCase()}
              </option>
            ))}
          </Select>
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
              "Asia/Dubai",
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

/* ── invoices & receipts ── */

/* ── the portal ── */

function LocalPortalPage() {
  return <PortalExperience experience="local" />;
}

export function PortalExperience({ experience }: { experience: "local" | "diaspora" }) {
  const portalRoute = experience === "diaspora" ? "/portal/diaspora" : "/portal";
  const isNestedPortalRoute = useRouterState({
    select: (state) => state.location.pathname.replace(/\/+$/, "") !== portalRoute,
  });
  const { isPending: sessionPending, sessionError } = useCurrentUserState();
  const hydrated = useIsHydrated();
  const user = useCurrentUser();
  const { data: access, isLoading: accessLoading } = useQuery({
    queryKey: ["my-access"],
    queryFn: () => getMyAccess({ data: undefined }),
    enabled: Boolean(user),
  });
  const dashboardRoute = resolveDashboardRoute({
    user,
    accessRole: access?.role ?? null,
    preferredClientRoute: portalRoute,
  });
  const { data: nudges } = useQuery({
    queryKey: ["my-nudges"],
    queryFn: () => getMyNudges({ data: undefined }),
    enabled: Boolean(user && !isNestedPortalRoute && dashboardRoute === portalRoute),
  });
  const { data: sharedProjects } = useQuery({
    queryKey: ["my-project-circle"],
    queryFn: () => getMyProjectCircle(),
    enabled: Boolean(user && !isNestedPortalRoute),
  });
  const [data, setData] = useState<PortalPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const { data: documents } = useQuery({
    queryKey: ["my-documents"],
    queryFn: () => listMyDocuments({ data: undefined }),
    enabled: Boolean(user && !isNestedPortalRoute && dashboardRoute === portalRoute),
  });
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
          : message === "Open your project circle to see the project shared with you."
            ? message
            : "We could not reach your project just now.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      isNestedPortalRoute ||
      sessionPending ||
      !user ||
      accessLoading ||
      dashboardRoute !== portalRoute
    )
      return;
    void load();
    // Re-check when the account changes (sign-in, sign-out).
  }, [user, isNestedPortalRoute, sessionPending, accessLoading, dashboardRoute, portalRoute]);

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

  if (isNestedPortalRoute) return <Outlet />;

  // Signed-out visitors get the sign-in wall, never the payload — and never a flash
  // of it: `useCurrentUserState().isPending` holds back until the session resolves.
  // The server always renders "pending", so the first client paint must too —
  // otherwise the two trees differ and React throws the page away.
  if (sessionPending || !hydrated) return <LoadingBlock label="Restoring your account" />;
  if (sessionError) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p role="alert" className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-800">
          We could not restore your sign-in session: {sessionError}.
        </p>
        <Button className="mt-5" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }
  if (!user) {
    return (
      <>
        <SignInWall experience={experience} />
        <CtaBand
          title={
            experience === "diaspora"
              ? "Building in Kenya from abroad?"
              : "Planning a project in Kenya?"
          }
          body={
            experience === "diaspora"
              ? "See how ATRO coordinates design and construction for clients overseas."
              : "Explore our work, services and project process before you get in touch."
          }
          ctaTo={experience === "diaspora" ? "/diaspora" : "/projects"}
          ctaLabel={experience === "diaspora" ? "See the Abroad service" : "Explore our work"}
        />
      </>
    );
  }

  if (user && !accessLoading && (dashboardRoute === "/admin" || dashboardRoute === "/staff")) {
    return <Navigate to={dashboardRoute} replace />;
  }
  if (loading && !data) return <LoadingBlock label="Loading your project record" />;
  if (!data) {
    return (
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <AlertTriangle className="mx-auto size-8 text-burgundy" aria-hidden />
          <h1 className="mt-5 font-display text-3xl text-maroon">Portal unavailable</h1>
          <p className="mt-4 text-ink/70">{error}</p>
          <div className="mt-8 flex justify-center gap-3">
            {error === "Open your project circle to see the project shared with you." ? (
              <Button asChild>
                <Link
                  to="/portal/circle"
                  search={{ projectId: undefined, experience }}
                >
                  Open shared project
                </Link>
              </Button>
            ) : (
              <Button onClick={() => void load()}>Try again</Button>
            )}
            <Button asChild variant="outline">
              <Link
                to="/login"
                search={{ returnTo: experience === "diaspora" ? portalRoute : undefined }}
              >
                Sign in
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const p = data.project;
  const isSample = p.isSample;
  const isGuestPreview = user.isGuestPreview;

  return (
    <>
      {isGuestPreview ? (
        <div className="border-b border-gold/30 bg-gold/10 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-maroon">
              <strong>Guest preview.</strong> You are viewing sample project information. Sign in to
              start a project, message ATRO, approve work, request visits, submit decisions, or
              change account details.
            </p>
            <Button asChild size="sm">
              <Link
                to="/login"
                search={{ returnTo: experience === "diaspora" ? portalRoute : undefined }}
              >
                Create or sign in to an account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
      <ClientDashboard
        data={data}
        experience={experience}
        readOnly={isGuestPreview}
        documents={documents ?? []}
        nudges={nudges ?? []}
        firstVisit={firstVisit.current}
        pending={pending}
        onPay={async (paymentId: string) => {
          const key = `pay-${paymentId}`;
          setPending(key);
          try {
            const checkout = await startPaystackCheckout({
              data: { projectId: p.id, paymentId, experience },
            });
            window.location.assign(checkout.authorizationUrl);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not open Paystack checkout.");
            setPending("");
          }
        }}
        onApprove={(milestoneId: string) =>
          void run(
            `ms-${milestoneId}`,
            () => approveMilestone({ data: { projectId: p.id, milestoneId } }),
            "Milestone approved.",
          )
        }
        onReloaded={() => void load()}
        onDecide={(decisionId: string, chosen: string) =>
          void run(
            `dec-${decisionId}`,
            () => recordDecision({ data: { projectId: p.id, decisionId, choice: chosen } }),
            "Decision recorded.",
          )
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {sharedProjects?.length ? (
            <Button asChild size="sm" variant="outline">
              <Link
                to="/portal/circle"
                search={{ projectId: undefined, experience }}
              >
                Shared projects ({sharedProjects.length})
              </Link>
            </Button>
          ) : null}
          {data.projects.length > 1 ? (
            <span className="rounded-full border border-ink/12 px-3 py-1 text-[11px] text-ink/55">
              {data.projects.length} projects
            </span>
          ) : null}
          {!isGuestPreview ? (
            <Button size="sm" onClick={() => setCreating((v) => !v)}>
              <Plus className="size-4" />
              {creating ? "Close" : isSample ? "Open a project" : "Add a project"}
            </Button>
          ) : null}
          {isGuestPreview || isSample ? null : (
            <Button
              size="sm"
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
              Remove
            </Button>
          )}
        </div>
      </ClientDashboard>

      {creating ? (
        <section className="border-t border-ink/10 bg-cream px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <NewProjectForm
              onDone={() => {
                setCreating(false);
                void load();
              }}
              onCancel={() => setCreating(false)}
            />
          </div>
        </section>
      ) : null}
    </>
  );
}
