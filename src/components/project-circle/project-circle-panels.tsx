import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clipboard, Loader2, MapPin, ShieldCheck, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import {
  getProjectCircleOverview,
  inviteProjectRepresentative,
  requestCircleVisit,
  revokeProjectRepresentative,
  reviewProjectDecisionSuggestion,
  suggestProjectDecision,
  type CircleProjectPayload,
} from "@/lib/project-circle-server";
import { siteDay } from "@/lib/presence";

const STATUS_TONE: Record<string, "stone" | "gold" | "maroon" | "live"> = {
  pending: "gold",
  active: "live",
  expired: "stone",
  revoked: "stone",
};

const AUDIT_LABEL: Record<string, string> = {
  invited: "Invitation created",
  resent: "Invitation renewed",
  accepted: "Access accepted",
  revoked: "Access revoked",
  expired: "Access expired",
  decision_suggested: "Decision input received",
  suggestion_confirmed: "Owner recorded a decision",
  suggestion_dismissed: "Suggestion dismissed",
  visit_requested: "Site visit requested",
};

function dateLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(date);
}

export function ProjectCircleOwnerPanel({
  projectId,
  experience,
  disabled = false,
}: {
  projectId: string;
  experience: "local" | "diaspora";
  disabled?: boolean;
}) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [choiceBySuggestion, setChoiceBySuggestion] = useState<Record<string, string>>({});
  const query = useQuery({
    queryKey: ["project-circle-overview", projectId],
    queryFn: () => getProjectCircleOverview({ data: { projectId } }),
    enabled: !disabled,
  });
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["project-circle-overview", projectId] });

  const invite = useMutation({
    mutationFn: inviteProjectRepresentative,
    onSuccess: async (result) => {
      setEmail("");
      setInviteLink(
        `${window.location.origin}/portal/invite?token=${encodeURIComponent(result.token)}&experience=${experience}`,
      );
      toast.success("Secure invitation link created. Share it only with the invited person.");
      await refresh();
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Could not create the invitation."),
  });
  const revoke = useMutation({
    mutationFn: revokeProjectRepresentative,
    onSuccess: async () => {
      toast.success("Project access revoked.");
      await refresh();
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Could not revoke project access."),
  });
  const review = useMutation({
    mutationFn: reviewProjectDecisionSuggestion,
    onSuccess: async (_result, variables) => {
      toast.success(
        variables.data.decision === "confirm"
          ? "Your final decision was recorded."
          : "Suggestion dismissed.",
      );
      await Promise.all([refresh(), queryClient.invalidateQueries({ queryKey: ["my-portal"] })]);
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Could not review the suggestion."),
  });

  if (disabled) {
    return (
      <Panel title="Project circle" subtitle="Representative access is available on live projects.">
        <p className="text-[13px] leading-relaxed text-ink/65">
          This is a demonstration project. Open a live project before inviting someone to coordinate
          on it.
        </p>
      </Panel>
    );
  }

  if (query.isLoading || !query.data) {
    return (
      <Panel title="Project circle">
        {query.error ? (
          <p role="alert" className="text-[13px] text-red-700">
            {query.error instanceof Error
              ? query.error.message
              : "Could not load project-circle access."}
          </p>
        ) : (
          <div className="h-28 animate-pulse rounded-xl bg-ink/6" aria-busy="true" />
        )}
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Project circle"
        subtitle="Give one trusted person limited access to this project. They never become the owner."
      >
        <div className="flex items-start gap-3 rounded-xl border border-gold/35 bg-gold/8 p-4">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-maroon" aria-hidden />
          <p className="text-[12px] leading-relaxed text-ink/70">
            A representative can read milestones and site updates, request a visit, and suggest an
            answer to an open decision. Only you can approve milestones, finalize decisions, release
            payments, change contracts, or grant access. Access expires after 90 days and can be
            revoked at any time.
          </p>
        </div>

        <form
          className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            setInviteLink("");
            invite.mutate({ data: { projectId, email } });
          }}
        >
          <div>
            <Label htmlFor="circle-invite-email">Representative’s email</Label>
            <Input
              id="circle-invite-email"
              type="email"
              autoComplete="email"
              maxLength={160}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="trusted.person@example.com"
              className="mt-1"
              required
            />
          </div>
          <Button type="submit" disabled={invite.isPending || !email.trim()}>
            {invite.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserRoundPlus className="size-4" />
            )}
            {invite.isPending ? "Creating link…" : "Create invitation"}
          </Button>
        </form>

        {inviteLink ? (
          <div className="mt-4 rounded-xl border border-emerald-700/20 bg-emerald-50 p-4">
            <p className="text-[12px] font-medium text-emerald-900">
              Send this one-time link to the invited person. It expires in 7 days and only works for
              their verified email address.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Input
                aria-label="One-time project invitation link"
                readOnly
                value={inviteLink}
                onFocus={(event) => event.currentTarget.select()}
                className="min-w-0 flex-1 bg-white"
              />
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    if (!navigator.clipboard) throw new Error("Clipboard access is unavailable.");
                    await navigator.clipboard.writeText(inviteLink);
                    toast.success("Invitation link copied.");
                  } catch (cause) {
                    toast.error(
                      cause instanceof Error
                        ? cause.message
                        : "Could not copy the invitation link.",
                    );
                  }
                }}
              >
                <Clipboard className="size-4" />
                Copy link
              </Button>
            </div>
          </div>
        ) : null}
      </Panel>

      <Panel title="Representatives" subtitle="Each person has access to this project only.">
        {query.data.representatives.length === 0 ? (
          <p className="text-[13px] text-ink/55">No representatives have been invited.</p>
        ) : (
          <ul className="space-y-3">
            {query.data.representatives.map((representative) => (
              <li
                key={representative.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 p-4"
              >
                <div className="min-w-0">
                  <p className="break-all text-[13px] text-maroon">{representative.email}</p>
                  <p className="mt-1 text-[11px] text-ink/55">
                    {representative.status === "pending"
                      ? `Invitation expires ${dateLabel(representative.expiresAt)}`
                      : representative.status === "active"
                        ? `Access expires ${dateLabel(representative.expiresAt)}`
                        : representative.status === "expired"
                          ? "Access has expired"
                          : "Access revoked"}
                  </p>
                </div>
                <span className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE[representative.status] ?? "stone"}>
                    {representative.status}
                  </Badge>
                  {representative.status === "pending" || representative.status === "active" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={revoke.isPending}
                      onClick={() =>
                        revoke.mutate({ data: { projectId, representativeId: representative.id } })
                      }
                    >
                      Revoke
                    </Button>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Decision input"
        subtitle="Suggestions are not binding until you record the final choice."
      >
        {query.data.suggestions.length === 0 ? (
          <p className="text-[13px] text-ink/55">No decision suggestions are waiting for you.</p>
        ) : (
          <ul className="space-y-4">
            {query.data.suggestions.map((suggestion) => (
              <li key={suggestion.id} className="rounded-xl border border-ink/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-medium text-maroon">
                      {suggestion.decisionTitle}
                    </p>
                    <p className="mt-1 text-[11px] text-ink/55">
                      Suggested by {suggestion.representativeEmail} ·{" "}
                      {dateLabel(suggestion.createdAt)}
                    </p>
                  </div>
                  <Badge tone="gold">Awaiting your review</Badge>
                </div>
                <p className="mt-3 text-[13px] text-ink/75">
                  Suggested: <strong>{suggestion.suggestedOption}</strong>
                </p>
                {suggestion.note ? (
                  <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-ink/60">
                    {suggestion.note}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap items-end gap-2">
                  <div className="min-w-48 flex-1">
                    <Label htmlFor={`circle-choice-${suggestion.id}`}>Your final decision</Label>
                    <Select
                      id={`circle-choice-${suggestion.id}`}
                      value={choiceBySuggestion[suggestion.id] ?? suggestion.suggestedOption}
                      onChange={(event) =>
                        setChoiceBySuggestion((previous) => ({
                          ...previous,
                          [suggestion.id]: event.target.value,
                        }))
                      }
                      className="mt-1"
                    >
                      {suggestion.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    disabled={review.isPending || suggestion.options.length === 0}
                    onClick={() => {
                      review.mutate({
                        data: {
                          projectId,
                          suggestionId: suggestion.id,
                          decision: "confirm",
                          chosenOption:
                            choiceBySuggestion[suggestion.id] ?? suggestion.suggestedOption,
                        },
                      });
                    }}
                  >
                    <Check className="size-4" />
                    Record my decision
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={review.isPending}
                    onClick={() =>
                      review.mutate({
                        data: { projectId, suggestionId: suggestion.id, decision: "dismiss" },
                      })
                    }
                  >
                    Dismiss
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Access history">
        {query.data.audit.length === 0 ? (
          <p className="text-[13px] text-ink/55">Project-circle changes will appear here.</p>
        ) : (
          <ul className="space-y-2">
            {query.data.audit.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-ink/8 pb-2 text-[12px]"
              >
                <span className="text-ink/70">
                  {AUDIT_LABEL[entry.event] ?? "Project-circle update"}
                  {entry.email ? ` · ${entry.email}` : ""}
                </span>
                <time className="text-ink/45">{dateLabel(entry.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function nextNairobiDay(): string {
  const today = siteDay(new Date().toISOString());
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function ProjectCircleRepresentativePanel({
  project,
  email,
}: {
  project: CircleProjectPayload;
  email: string;
}) {
  const queryClient = useQueryClient();
  const [visitDate, setVisitDate] = useState(nextNairobiDay);
  const [visitNote, setVisitNote] = useState("");
  const [optionByDecision, setOptionByDecision] = useState<Record<string, string>>({});
  const [noteByDecision, setNoteByDecision] = useState<Record<string, string>>({});
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["circle-project", project.projectId] });
  const visit = useMutation({
    mutationFn: requestCircleVisit,
    onSuccess: async () => {
      setVisitNote("");
      toast.success("Your site-visit request was sent to the studio.");
      await refresh();
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Could not request the visit."),
  });
  const suggest = useMutation({
    mutationFn: suggestProjectDecision,
    onSuccess: async () => {
      toast.success("Your suggestion was sent to the project owner for review.");
      await refresh();
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Could not send your suggestion."),
  });

  return (
    <div className="space-y-5">
      <Panel
        title={project.title}
        subtitle={`${project.reference} · Shared project · Access expires ${dateLabel(project.expiresAt)}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="maroon">Site representative</Badge>
          <span className="text-[12px] text-ink/55">Signed in as {email || "your account"}</span>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              Current stage
            </dt>
            <dd className="mt-1 text-[13px] text-ink/75">{project.stage || "Not set"}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              Progress
            </dt>
            <dd className="mt-1 text-[13px] text-ink/75">{project.progress}%</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              Project reference
            </dt>
            <dd className="mt-1 text-[13px] text-ink/75">{project.reference}</dd>
          </div>
        </dl>
        <p className="mt-5 rounded-xl border border-gold/35 bg-gold/8 p-4 text-[12px] leading-relaxed text-ink/70">
          You can coordinate a site visit and share recommendations on open decisions. Your
          suggestions do not approve work or become final decisions. You cannot view the owner’s
          financial records, make payments, approve milestones, change contracts, or invite other
          people.
        </p>
      </Panel>

      <Panel
        title="Site updates"
        subtitle="Milestone progress and evidence shared for coordination."
      >
        {project.milestones.length === 0 ? (
          <p className="text-[13px] text-ink/55">No milestone updates are available yet.</p>
        ) : (
          <ul className="space-y-4">
            {project.milestones.map((milestone) => (
              <li key={milestone.id} className="rounded-xl border border-ink/10 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                      {milestone.stage}
                    </p>
                    <h3 className="mt-1 text-[14px] font-medium text-maroon">{milestone.name}</h3>
                  </div>
                  <Badge tone={milestone.status === "complete" ? "live" : "gold"}>
                    {milestone.status}
                  </Badge>
                </div>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/8"
                  role="progressbar"
                  aria-label={`${milestone.name} progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={milestone.progress}
                >
                  <div
                    className="h-full rounded-full bg-maroon"
                    style={{ width: `${milestone.progress}%` }}
                  />
                </div>
                {milestone.summary ? (
                  <p className="mt-3 text-[12px] leading-relaxed text-ink/65">
                    {milestone.summary}
                  </p>
                ) : null}
                {milestone.evidence.length ? (
                  <ul className="mt-3 space-y-2 border-t border-ink/8 pt-3">
                    {milestone.evidence.map((evidence, index) => (
                      <li key={`${evidence.caption}-${index}`} className="text-[12px]">
                        <p className="font-medium text-ink/75">
                          {evidence.caption}
                          {evidence.date ? ` · ${evidence.date}` : ""}
                        </p>
                        {evidence.detail ? (
                          <p className="mt-1 leading-relaxed text-ink/55">{evidence.detail}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Recent site updates">
        {project.activity.length === 0 ? (
          <p className="text-[13px] text-ink/55">No recent site updates.</p>
        ) : (
          <ul className="space-y-3">
            {project.activity.map((item) => (
              <li key={item.id} className="border-b border-ink/8 pb-3">
                <p className="text-[13px] text-maroon">{item.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-ink/60">
                  {item.body}
                </p>
                <time className="mt-1 block text-[10px] text-ink/40">{dateLabel(item.at)}</time>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Request a site visit"
        subtitle="The office will confirm a suitable time or reply."
      >
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            visit.mutate({
              data: { projectId: project.projectId, proposedOn: visitDate, note: visitNote },
            });
          }}
        >
          <div>
            <Label htmlFor="circle-visit-date">Proposed day (Nairobi time)</Label>
            <Input
              id="circle-visit-date"
              type="date"
              min={nextNairobiDay()}
              value={visitDate}
              onChange={(event) => setVisitDate(event.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="circle-visit-note">Note for the office (optional)</Label>
            <Textarea
              id="circle-visit-note"
              maxLength={300}
              value={visitNote}
              onChange={(event) => setVisitNote(event.target.value)}
              placeholder="What would you like the team to know?"
              className="mt-1 min-h-20"
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={
                visit.isPending ||
                !visitDate ||
                project.presence.some((request) => request.status === "requested")
              }
            >
              {visit.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MapPin className="size-4" />
              )}
              {visit.isPending ? "Sending…" : "Request visit"}
            </Button>
          </div>
        </form>
        {project.presence.length ? (
          <ul className="mt-5 space-y-2 border-t border-ink/8 pt-4">
            {project.presence.map((request) => (
              <li key={request.id} className="rounded-xl bg-cream p-3 text-[12px]">
                <p className="font-medium text-maroon">
                  Site visit · {request.status}
                  {request.proposedOn ? ` · proposed ${request.proposedOn}` : ""}
                </p>
                {request.clientNote ? (
                  <p className="mt-1 text-ink/60">{request.clientNote}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>

      <Panel
        title="Suggest an answer"
        subtitle="The project owner reviews and records the final decision."
      >
        {project.decisions.length === 0 ? (
          <p className="text-[13px] text-ink/55">There are no open decisions to comment on.</p>
        ) : (
          <ul className="space-y-4">
            {project.decisions.map((decision) => {
              const option = optionByDecision[decision.id] ?? decision.options[0] ?? "";
              return (
                <li key={decision.id} className="rounded-xl border border-ink/10 p-4">
                  <h3 className="text-[14px] font-medium text-maroon">{decision.title}</h3>
                  {decision.detail ? (
                    <p className="mt-1 text-[12px] leading-relaxed text-ink/60">
                      {decision.detail}
                    </p>
                  ) : null}
                  {decision.dueDate ? (
                    <p className="mt-2 text-[11px] text-ink/50">
                      Reply requested by {decision.dueDate}
                    </p>
                  ) : null}
                  <div className="mt-4 space-y-3">
                    <div>
                      <Label htmlFor={`circle-option-${decision.id}`}>Your recommendation</Label>
                      <Select
                        id={`circle-option-${decision.id}`}
                        value={option}
                        onChange={(event) =>
                          setOptionByDecision((previous) => ({
                            ...previous,
                            [decision.id]: event.target.value,
                          }))
                        }
                        className="mt-1"
                      >
                        {decision.options.map((choice) => (
                          <option key={choice} value={choice}>
                            {choice}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`circle-note-${decision.id}`}>
                        Reason or context (optional)
                      </Label>
                      <Textarea
                        id={`circle-note-${decision.id}`}
                        maxLength={500}
                        value={noteByDecision[decision.id] ?? ""}
                        onChange={(event) =>
                          setNoteByDecision((previous) => ({
                            ...previous,
                            [decision.id]: event.target.value,
                          }))
                        }
                        className="mt-1 min-h-16"
                      />
                    </div>
                    <Button
                      disabled={suggest.isPending || !option}
                      onClick={() =>
                        suggest.mutate({
                          data: {
                            projectId: project.projectId,
                            decisionId: decision.id,
                            option,
                            note: noteByDecision[decision.id] ?? "",
                          },
                        })
                      }
                    >
                      {suggest.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                      Send suggestion to owner
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
