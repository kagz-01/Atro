import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/field";
import { ProjectCircleRepresentativePanel } from "@/components/project-circle/project-circle-panels";
import { getCircleProject, getMyProjectCircle } from "@/lib/project-circle-server";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useIsHydrated } from "@/lib/use-is-hydrated";

export const Route = createFileRoute("/portal/circle")({
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: typeof search.projectId === "string" ? search.projectId : undefined,
    experience: search.experience === "diaspora" ? "diaspora" : "local",
  }),
  component: ProjectCirclePage,
  head: () => ({
    meta: [
      { title: "Shared project — ATRO" },
      {
        name: "description",
        content: "Limited project updates shared with you by a project owner.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function ProjectCirclePage() {
  const { user, isPending } = useCurrentUserState();
  const hydrated = useIsHydrated();
  const { projectId: requestedProjectId, experience } = Route.useSearch();
  const portalRoute = experience === "diaspora" ? "/portal/diaspora" : "/portal";
  const circles = useQuery({
    queryKey: ["my-project-circle"],
    queryFn: () => getMyProjectCircle(),
    enabled: Boolean(user),
  });
  const selectedProjectId = circles.data?.some(
    (project) => project.projectId === requestedProjectId,
  )
    ? requestedProjectId
    : circles.data?.[0]?.projectId;
  const project = useQuery({
    queryKey: ["circle-project", selectedProjectId],
    queryFn: () => getCircleProject({ data: { projectId: selectedProjectId! } }),
    enabled: Boolean(user && selectedProjectId),
    retry: false,
  });

  if (isPending || !hydrated) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center pt-24">
        <Loader2 className="size-7 animate-spin text-gold" aria-label="Checking your account" />
      </main>
    );
  }

  if (!user) {
    const returnTo = `/portal/circle?experience=${experience}`;
    return (
      <main className="min-h-[70vh] bg-paper px-5 pt-32 pb-16">
        <section className="mx-auto max-w-xl rounded-3xl border border-ink/10 bg-white p-8 text-center">
          <UsersRound className="mx-auto size-8 text-maroon" aria-hidden />
          <h1 className="mt-4 font-display text-3xl text-maroon">Shared project access</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink/65">
            Sign in with the account the owner invited to view the project updates and coordinate a
            site visit.
          </p>
          <Button asChild className="mt-6">
            <a href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>Sign in</a>
          </Button>
        </section>
      </main>
    );
  }

  if (circles.isLoading || !circles.data) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center pt-24">
        {circles.error ? (
          <p role="alert" className="text-[13px] text-red-700">
            {circles.error instanceof Error
              ? circles.error.message
              : "Could not load shared project access."}
          </p>
        ) : (
          <Loader2 className="size-7 animate-spin text-gold" aria-label="Loading shared projects" />
        )}
      </main>
    );
  }

  if (circles.data.length === 0) {
    return (
      <main className="min-h-[70vh] bg-paper px-5 pt-32 pb-16">
        <section className="mx-auto max-w-xl rounded-3xl border border-ink/10 bg-white p-8 text-center">
          <Badge tone="stone">No active shared projects</Badge>
          <h1 className="mt-4 font-display text-3xl text-maroon">
            Nothing has been shared with you
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink/65">
            A project owner can invite you to a specific project. Invitations expire, and access can
            be revoked by the owner at any time.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to={portalRoute}>
              <ArrowLeft className="size-4" />
              Back to the portal
            </Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-4 pt-28 pb-16 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge tone="maroon">Project circle</Badge>
            <h1 className="mt-3 font-display text-3xl text-maroon">Shared project access</h1>
            <p className="mt-2 text-[13px] text-ink/60">
              Limited access to the project selected by its owner.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={portalRoute}>
              <ArrowLeft className="size-4" />
              Your portal
            </Link>
          </Button>
        </div>

        {circles.data.length > 1 ? (
          <div className="max-w-md">
            <Label htmlFor="circle-project-select">Shared projects</Label>
            <Select
              id="circle-project-select"
              value={selectedProjectId}
              onChange={(event) => {
                window.location.href = `/portal/circle?projectId=${encodeURIComponent(event.target.value)}&experience=${experience}`;
              }}
              className="mt-1"
            >
              {circles.data.map((item) => (
                <option key={item.projectId} value={item.projectId}>
                  {item.reference} · {item.title}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {project.isLoading || !project.data ? (
          project.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p role="alert" className="text-[13px] text-red-800">
                {project.error instanceof Error
                  ? project.error.message
                  : "This project is no longer available to your account."}
              </p>
            </div>
          ) : (
            <div className="h-40 animate-pulse rounded-2xl bg-ink/6" aria-busy="true" />
          )
        ) : (
          <ProjectCircleRepresentativePanel
            project={project.data}
            email={user.primaryEmail ?? ""}
          />
        )}
      </div>
    </main>
  );
}
