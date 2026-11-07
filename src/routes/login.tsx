import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { authAvailable, continueAsGuest } from "@/lib/auth/client";
import { PhoneSignInForm } from "@/components/auth/phone-sign-in-form";
import { EmailSignInForm } from "@/components/auth/email-sign-in-form";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyAccess, getMyStaffInvitation } from "@/lib/staff-access";
import { resolveDashboardRoute } from "@/lib/dashboard-routing";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { PREVIEW_PERSONAS, type PreviewPersonaKey } from "@/lib/preview-personas";
import { continueAsPreviewPersona } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
  }),
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

function Login() {
  const { returnTo } = Route.useSearch();
  const { user, isPending, sessionError } = useCurrentUserState();
  const hydrated = useIsHydrated();
  const queryClient = useQueryClient();
  const { data: access, isLoading: accessLoading } = useQuery({
    queryKey: ["my-access"],
    queryFn: () => getMyAccess({ data: undefined }),
    enabled: Boolean(user && !user.isDevFallback),
  });
  const { data: staffInvitation } = useQuery({
    queryKey: ["my-staff-invitation"],
    queryFn: () => getMyStaffInvitation({ data: undefined }),
    enabled: Boolean(user && !user.isDevFallback && returnTo === "/staff"),
  });
  let returnDestination: URL | null = null;
  if (returnTo) {
    try {
      returnDestination = new URL(returnTo, "https://atro.invalid");
    } catch {
      returnDestination = null;
    }
  }
  const preferredClientRoute: "/portal" | "/portal/diaspora" =
    returnDestination?.pathname === "/portal/diaspora" ||
    returnDestination?.searchParams.get("experience") === "diaspora"
      ? "/portal/diaspora"
      : "/portal";
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [accessError, setAccessError] = useState("");

  const resolvedDashboard = resolveDashboardRoute({
    user,
    accessRole: access?.role ?? null,
    preferredClientRoute,
  });
  const dashboardDestination =
    resolvedDashboard === "/portal" && returnTo === "/staff" && staffInvitation?.pending
      ? "/staff"
      : resolvedDashboard;

  /**
   * Signed-in users land in the workspace that matches their role instead of a
   * generic client portal toggle; admins, staff, and clients each keep their
   * role-appropriate workspace.
   */
  const goToPortal = async () => {
    if (typeof window === "undefined") return;
    setAccessError("");
    let accessRole = access?.role ?? null;
    if (!user?.isDevFallback && (accessLoading || !access)) {
      try {
        const resolvedAccess = await queryClient.fetchQuery({
          queryKey: ["my-access"],
          queryFn: () => getMyAccess({ data: undefined }),
          staleTime: 0,
        });
        accessRole = resolvedAccess?.role ?? null;
      } catch (cause) {
        setAccessError(
          cause instanceof Error
            ? `We could not confirm your account access: ${cause.message}`
            : "We could not confirm your account access. Please try again.",
        );
        return;
      }
    }

    let destination = resolveDashboardRoute({ user, accessRole, preferredClientRoute });
    if (destination === "/portal" && returnTo === "/staff") {
      try {
        const invitation = await queryClient.fetchQuery({
          queryKey: ["my-staff-invitation"],
          queryFn: () => getMyStaffInvitation({ data: undefined }),
          staleTime: 0,
        });
        if (invitation.pending) destination = "/staff";
      } catch (cause) {
        setAccessError(
          cause instanceof Error
            ? `We could not confirm your invitation: ${cause.message}`
            : "We could not confirm your invitation. Please try again.",
        );
        return;
      }
    }
    window.location.assign(
      destination === "/admin" || destination === "/staff" ? destination : getPortalDestination(),
    );
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
    if (!returnTo) return preferredClientRoute;
    if (returnTo === "/staff") return "/staff";
    if (returnTo.includes("\\")) return preferredClientRoute;

    let destination: URL;
    try {
      destination = new URL(returnTo, window.location.origin);
    } catch {
      return preferredClientRoute;
    }
    if (
      destination.origin === window.location.origin &&
      (destination.pathname === "/portal" || destination.pathname.startsWith("/portal/"))
    ) {
      return `${destination.pathname}${destination.search}${destination.hash}`;
    }
    return preferredClientRoute;
  }

  function continueToGuestPreview() {
    continueAsGuest(getPortalDestination());
  }

  return (
    <section className="min-h-screen bg-paper pt-24 pb-16 md:pt-28">
      <div className="mx-auto max-w-2xl px-4 sm:px-8">
        <Link
          to={preferredClientRoute === "/portal/diaspora" ? "/diaspora" : "/"}
          className="inline-flex min-h-12 items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-ink/70 transition-colors hover:text-maroon"
        >
          <ArrowLeft className="size-3.5" />
          {preferredClientRoute === "/portal/diaspora" ? "Back to Abroad" : "Back to ATRO"}
        </Link>

        <div className="mt-8">
          <section className="rounded-3xl border border-ink/10 bg-white p-5 shadow-card sm:p-8 md:p-10">
            <div className="flex items-center justify-between gap-4">
              <Logo />
              <span className="rounded-full bg-maroon/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-maroon">
                {preferredClientRoute === "/portal/diaspora" ? "Diaspora portal" : "Kenya portal"}
              </span>
            </div>

            {import.meta.env.DEV ? (
              <div className="mt-10">
                <h1 className="font-display text-[2.1rem] leading-none text-maroon">
                  Choose your workspace
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
                  Open the workspace you want to use.
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {PREVIEW_PERSONAS.map((persona) => {
                    const labels: Record<PreviewPersonaKey, string> = {
                      boss: "Owner dashboard",
                      office: "Office dashboard",
                      local: "Kenyan client portal",
                      abroad: "Diaspora client portal",
                    };
                    return (
                      <Button
                        key={persona.key}
                        type="button"
                        variant="outline"
                        className="min-h-12 justify-between normal-case tracking-normal"
                        onClick={() => continueAsPreviewPersona(persona.key)}
                      >
                        {labels[persona.key]}
                        <ArrowRight className="size-4" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : isPending || !hydrated ? (
              <div className="mt-10 space-y-4" aria-busy="true">
                <h1 className="font-display text-[2.1rem] leading-none text-maroon">
                  Sign in or create an account
                </h1>
                <div className="h-4 w-1/2 animate-pulse rounded-lg bg-ink/8" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-ink/8" />
                <div className="h-12 w-full animate-pulse rounded-xl bg-ink/8" />
              </div>
            ) : user && !user.isDevFallback && accessLoading ? (
              <p className="mt-10 text-[14px] text-ink/60" aria-busy="true">
                Checking your account access…
              </p>
            ) : user && !user.isDevFallback ? (
              <div className="mt-10">
                <h1 className="font-display text-[2.1rem] leading-none text-maroon">
                  You are signed in
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
                  {user.displayName ?? user.primaryEmail ?? "Your account"} — your projects,
                  milestones and documents are one click away.
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-ink/70">
                  ATRO staff use this same sign-in. Admins and staff are sent to their own
                  dashboards automatically.
                </p>
                {accessError ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-800"
                  >
                    {accessError}
                  </p>
                ) : null}

                <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-cream px-5 py-4">
                  <span className="text-[13px] text-ink/60">Account</span>
                  <UserButton />
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="mt-6 w-full"
                  onClick={() => void goToPortal()}
                >
                  {dashboardDestination === "/admin"
                    ? "Open the admin dashboard"
                    : dashboardDestination === "/staff"
                      ? "Open the staff dashboard"
                      : dashboardDestination === "/portal/diaspora"
                        ? "Open the diaspora portal"
                        : "Open the Kenya portal"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-10">
                <h1 className="font-display text-[2.1rem] leading-none text-maroon">
                  Sign in or create an account
                </h1>
                {sessionError ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-800"
                  >
                    We could not restore your sign-in session: {sessionError}. Refresh the page and
                    try again.
                  </p>
                ) : null}
                <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
                  Your account keeps your project updates, drawings, payment records and decisions
                  in one private place. Continue with Google or a one-time code by email or phone; a
                  new account is created if you are new to ATRO.
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink/75">
                  Use the email address or phone number you shared with ATRO so your project can be
                  matched to your account.
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-ink/70">
                  ATRO staff use this same sign-in. Approved staff accounts open the office
                  dashboard automatically.
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

                  <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-ink/65">
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
                        className={`min-h-12 rounded-lg px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
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
                    <p className="text-center text-[13px] text-ink/75">Just looking around?</p>
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
                    <p className="mt-2 text-center text-xs text-ink/70">
                      Preview the sample portal. Account actions are available after sign-in.
                    </p>
                  </div>
                </div>

                <div className="mt-7 border-t border-ink/10 pt-5">
                  <p className="text-[13px] text-ink/75">
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
    </section>
  );
}
