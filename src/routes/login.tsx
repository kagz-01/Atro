import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, Lock, Shield } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { authAvailable, continueAsGuest } from "@/lib/auth/client";
import { PhoneSignInForm } from "@/components/auth/phone-sign-in-form";
import { EmailSignInForm } from "@/components/auth/email-sign-in-form";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyAccess } from "@/lib/staff-access";
import { resolveDashboardRoute } from "@/lib/dashboard-routing";
import { useIsHydrated } from "@/lib/use-is-hydrated";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Sign in — ATRO project portal" },
      {
        name: "description",
        content:
          "Sign in to your ATRO project portal: live milestone progress, photographic evidence, the payment ledger, the document vault and every decision — from anywhere in the world.",
      },
    ],
  }),
});

const PERKS = [
  {
    icon: CheckCircle2,
    title: "Live progress on your build",
    body: "Every stage, with the photographs taken before the work disappeared into the structure.",
  },
  {
    icon: Lock,
    title: "Money you can audit",
    body: "Certificates, retention and the paid-to-date ledger — nothing released without a certificate.",
  },
  {
    icon: Shield,
    title: "Decisions in writing",
    body: "Options, cost impact and what you chose, timestamped. Month nine never argues about month three.",
  },
];

function Login() {
  const { user, isPending, sessionError } = useCurrentUserState();
  const hydrated = useIsHydrated();
  const { data: access } = useQuery({
    queryKey: ["my-access"],
    queryFn: () => getMyAccess({ data: undefined }),
    enabled: Boolean(user && !user.isDevFallback),
  });
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const dashboardDestination = resolveDashboardRoute({
    user,
    accessRole: access?.role ?? null,
  });

  /**
   * Signed-in users land in the workspace that matches their role instead of a
   * generic client portal toggle; staff keep the office dashboard while clients
   * keep their project portal.
   */
  const goToDashboard = () => {
    if (typeof window === "undefined") return;
    window.location.assign(dashboardDestination);
  };

  const goToPortal = () => {
    if (typeof window === "undefined") return;
    window.location.assign(getPortalDestination());
  };

  async function continueWithGoogle() {
    if (!authAvailable()) {
      continueAsGuest(getPortalDestination());
      return;
    }
    setGoogleBusy(true);
    setGoogleError("");
    const callback = new URL("/login", window.location.origin);
    const destination = getPortalDestination();
    if (destination !== "/portal") callback.searchParams.set("returnTo", destination);
    try {
      const { signInWithGoogle } = await import("@/lib/auth/client");
      const result = await signInWithGoogle(callback.toString());
      if (result.error) {
        setGoogleError(result.error);
        setGoogleBusy(false);
      }
    } catch (cause) {
      setGoogleError(cause instanceof Error ? cause.message : "Could not start Google sign-in.");
      setGoogleBusy(false);
    }
  }

  function getPortalDestination(): string {
    const returnTo = new URLSearchParams(window.location.search).get("returnTo");
    const safeReturnTo =
      returnTo &&
      (returnTo.startsWith("/portal") || returnTo.startsWith("/admin")) &&
      !returnTo.startsWith("//") &&
      !returnTo.includes("\\")
        ? returnTo
        : null;
    return safeReturnTo ?? dashboardDestination;
  }

  function continueToGuestPreview() {
    continueAsGuest(getPortalDestination());
  }

  return (
    <main className="min-h-screen bg-paper pt-24 pb-16 md:pt-28">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16">
        <Link
          to="/diaspora"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-maroon"
        >
          <ArrowLeft className="size-3.5" />
          Back to Abroad
        </Link>

        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Value panel */}
          <section className="relative overflow-hidden rounded-3xl bg-maroon p-8 text-paper md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-burgundy/60 via-maroon to-maroon" />
            <div className="pointer-events-none absolute -top-24 -right-16 size-[360px] rounded-full bg-gold/10 blur-[130px]" />

            <div className="relative">
              <Badge />
              <h1 className="mt-6 font-display text-[2.4rem] leading-[0.92] tracking-[-0.05em] text-paper sm:text-[3.2rem]">
                Your build,
                <br />
                <span className="text-gold">wherever you are.</span>
              </h1>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-paper/70">
                The portal is the same record your project manager works from — not a summary sent
                to you later.
              </p>

              <ul className="mt-9 space-y-5">
                {PERKS.map((perk) => (
                  <li key={perk.title} className="flex gap-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                      <perk.icon className="size-4.5" />
                    </span>
                    <span>
                      <span className="block font-display text-lg text-paper">{perk.title}</span>
                      <span className="mt-1 block text-[14px] leading-relaxed text-paper/60">
                        {perk.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-9 flex items-center gap-2 border-t border-paper/15 pt-6 text-[12px] uppercase tracking-[0.16em] text-paper/45">
                <Globe className="size-3.5 text-gold" />
                Built for Kenyans in the UK, Gulf, US and beyond
              </p>
            </div>
          </section>

          {/* Sign-in card */}
          <section className="rounded-3xl border border-ink/10 bg-white p-8 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <Logo />
              <span className="rounded-full bg-maroon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-maroon">
                Project portal
              </span>
            </div>

            {isPending || !hydrated ? (
              <div className="mt-10 space-y-4" aria-busy="true">
                <div className="h-8 w-2/3 animate-pulse rounded-lg bg-ink/8" />
                <div className="h-4 w-1/2 animate-pulse rounded-lg bg-ink/8" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-ink/8" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-ink/8" />
              </div>
            ) : user && !user.isDevFallback ? (
              <div className="mt-10">
                <h2 className="font-display text-[2.1rem] leading-none text-maroon">You are signed in</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/65">
                  {user.displayName ?? user.primaryEmail ?? "Your account"} — your projects,
                  milestones and documents are one click away.
                </p>

                <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-cream px-5 py-4">
                  <span className="text-[13px] text-ink/60">Account</span>
                  <UserButton />
                </div>

                <Button variant="primary" size="lg" className="mt-6 w-full" onClick={goToDashboard}>
                  {dashboardDestination === "/admin" ? "Open the office dashboard" : "Open the portal"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-10">
                <h2 className="font-display text-[2.1rem] leading-none text-maroon">Sign in</h2>
                {sessionError ? (
                  <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-800">
                    We could not restore your sign-in session: {sessionError}. Refresh the page and
                    try again.
                  </p>
                ) : null}
                <p className="mt-3 text-[15px] leading-relaxed text-ink/65">
                  Use the account you already have. Your portal stays private to you — projects,
                  evidence, payments and documents are scoped to your sign-in.
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink/55">
                  Use the email address or phone number you shared with ATRO so your project can be
                  matched to your account.
                </p>

                <div className="mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full normal-case tracking-normal"
                    onClick={() => void continueWithGoogle()}
                    disabled={googleBusy}
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-5 place-items-center rounded-full bg-white font-semibold text-[#4285f4]"
                    >
                      G
                    </span>
                    {googleBusy ? "Connecting to Google..." : "Continue with Google"}
                  </Button>

                  {googleError ? (
                    <p
                      role="alert"
                      className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-800"
                    >
                      {googleError}
                    </p>
                  ) : null}

                  <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-ink/40">
                    <span className="h-px flex-1 bg-ink/10" />
                    Or use a one-time code
                    <span className="h-px flex-1 bg-ink/10" />
                  </div>

                  <div
                    role="group"
                    aria-label="Choose sign-in method"
                    className="grid grid-cols-2 gap-2 rounded-xl bg-cream p-1"
                  >
                    {(["phone", "email"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={method === option}
                        onClick={() => setMethod(option)}
                        className={`rounded-lg px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                          method === option
                            ? "bg-white text-maroon shadow-sm"
                            : "text-ink/60 hover:text-maroon"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {method === "phone" ? (
                    <PhoneSignInForm onDone={goToPortal} onGuestPreview={continueToGuestPreview} />
                  ) : (
                    <EmailSignInForm onDone={goToPortal} onGuestPreview={continueToGuestPreview} />
                  )}

                  <div className="mt-6 border-t border-ink/10 pt-5">
                    <p className="text-center text-[13px] text-ink/55">
                      Just looking around?
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      className="mt-3 w-full"
                      onClick={continueToGuestPreview}
                    >
                      Continue as guest
                      <ArrowRight className="size-4" />
                    </Button>
                    <p className="mt-2 text-center text-xs text-ink/45">
                      Preview the sample portal. Account actions are available after sign-in.
                    </p>
                  </div>
                </div>

                <div className="mt-7 border-t border-ink/10 pt-5">
                  <p className="text-[13px] text-ink/60">
                    New to ATRO?{" "}
                    <Link
                      to="/start"
                      search={{ from: "diaspora" }}
                      className="font-medium text-burgundy underline decoration-gold decoration-2 underline-offset-4 hover:text-maroon"
                    >
                      Start a project
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Badge() {
  return (
    <span className="inline-flex h-7 items-center rounded-xs bg-gold/15 px-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-gold-light border border-gold/40">
      Accounts
    </span>
  );
}
