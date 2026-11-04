import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/back-link";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { acceptProjectCircleInvite, getProjectCircleInvite } from "@/lib/project-circle-server";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useIsHydrated } from "@/lib/use-is-hydrated";

export const Route = createFileRoute("/portal/invite")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ProjectCircleInvitePage,
  head: () => ({
    meta: [
      { title: "Project invitation — ATRO" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
});

function ProjectCircleInvitePage() {
  const { token } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const hydrated = useIsHydrated();
  const [acceptedProjectId, setAcceptedProjectId] = useState("");
  const invite = useQuery({
    queryKey: ["project-circle-invite", token],
    queryFn: () => getProjectCircleInvite({ data: { token } }),
    enabled: Boolean(user && token),
    retry: false,
  });
  const accept = useMutation({
    mutationFn: acceptProjectCircleInvite,
    onSuccess: (result) => {
      setAcceptedProjectId(result.projectId);
      toast.success("Project access accepted.");
      window.location.assign(`/portal/circle?projectId=${encodeURIComponent(result.projectId)}`);
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Could not accept the invitation."),
  });

  if (isPending || !hydrated) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center pt-24">
        <Loader2 className="size-7 animate-spin text-gold" aria-label="Checking your account" />
      </main>
    );
  }

  const returnTo = `/portal/invite?token=${encodeURIComponent(token)}`;
  return (
    <main className="min-h-[75vh] bg-paper px-5 pt-32 pb-16">
      <div className="mx-auto max-w-xl">
        <BackLink to="/portal">Back to your portal</BackLink>
        <Panel
          title="Project invitation"
          subtitle="A project owner has invited you to join a limited project circle."
        >
          {!token ? (
            <p role="alert" className="text-[13px] text-red-700">
              This invitation link is missing its secure code. Ask the project owner to create a
              fresh invitation.
            </p>
          ) : !user ? (
            <>
              <p className="text-[13px] leading-relaxed text-ink/65">
                Sign in using the account whose verified email address received this invitation. The
                link is single-use and expires after 7 days.
              </p>
              <Button asChild className="mt-5">
                <a href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
                  Sign in to review the invitation
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </>
          ) : invite.isLoading || (!invite.data && !invite.error) ? (
            <div className="flex items-center gap-3 py-4 text-[13px] text-ink/60" aria-busy="true">
              <Loader2 className="size-5 animate-spin text-gold" />
              Checking the invitation…
            </div>
          ) : invite.error ? (
            <div className="space-y-4">
              <p role="alert" className="text-[13px] leading-relaxed text-red-700">
                {invite.error instanceof Error
                  ? invite.error.message
                  : "This invitation is invalid or expired."}
              </p>
              <p className="text-[12px] leading-relaxed text-ink/55">
                Acceptance requires a verified sign-in email that matches the invitation. Ask the
                owner to send a new link if it has expired.
              </p>
              <Button asChild variant="outline">
                <Link to="/portal">Open your portal</Link>
              </Button>
            </div>
          ) : invite.data ? (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/8 p-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-maroon" aria-hidden />
                <div>
                  <Badge tone="gold">Limited role</Badge>
                  <p className="mt-3 text-[13px] leading-relaxed text-ink/70">
                    You are invited to help coordinate <strong>{invite.data.projectTitle}</strong> (
                    {invite.data.reference}) as a site representative.
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-2 text-[12px] leading-relaxed text-ink/65">
                <li>
                  • You can view milestones and site updates, request a visit, and suggest answers
                  to open decisions.
                </li>
                <li>• The owner must record every final decision and approval.</li>
                <li>
                  • You cannot access payment records, release money, change the contract, or invite
                  others.
                </li>
                <li>• Access lasts 90 days after acceptance and the owner may revoke it sooner.</li>
              </ul>
              <p className="mt-4 text-[11px] text-ink/50">Invitation for {invite.data.email}</p>
              {user.isGuestPreview ? (
                <div className="mt-6 rounded-xl border border-gold/30 bg-gold/8 p-4">
                  <p className="text-[13px] leading-relaxed text-ink/70">
                    Guest preview is read-only. Sign in or create an account to accept this
                    invitation.
                  </p>
                  <Button asChild className="mt-4">
                    <a href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
                      Sign in to accept
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    disabled={accept.isPending || Boolean(acceptedProjectId)}
                    onClick={() => accept.mutate({ data: { token } })}
                  >
                    {accept.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    {accept.isPending ? "Accepting…" : "Accept project access"}
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/portal">Not now</Link>
                  </Button>
                </div>
              )}
            </>
          ) : null}
        </Panel>
      </div>
    </main>
  );
}
