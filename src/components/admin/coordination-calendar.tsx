import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import {
  completeMyFollowUp,
  createMyFollowUp,
  getMyFollowUps,
  getStaffCalendar,
  scheduleProjectCall,
  type StaffCalendarData,
  type StaffFollowUp,
} from "@/lib/staff-ops";
import { eatInstant, formatInstant } from "@/lib/presence";

function nairobiInput(instant: string | null): string {
  if (!instant) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(instant));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function matchesSearch(
  item: { title: string; reference: string; clientLabel: string },
  search: string,
) {
  return `${item.title} ${item.reference} ${item.clientLabel}`
    .toLowerCase()
    .includes(search.trim().toLowerCase());
}

export function CoordinationCalendar({
  canSchedule,
  onOpenProject,
}: {
  canSchedule: boolean;
  onOpenProject: (projectId: string) => void;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dateByProject, setDateByProject] = useState<Record<string, string>>({});
  const [agendaByProject, setAgendaByProject] = useState<Record<string, string>>({});
  const [followUpTitle, setFollowUpTitle] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpProject, setFollowUpProject] = useState("");
  const { data, isLoading, error } = useQuery<StaffCalendarData>({
    queryKey: ["staff-calendar"],
    queryFn: () => getStaffCalendar({ data: undefined }),
  });
  const followUpsQuery = useQuery<StaffFollowUp[]>({
    queryKey: ["my-follow-ups"],
    queryFn: () => getMyFollowUps({ data: undefined }),
  });
  const refreshFollowUps = () => queryClient.invalidateQueries({ queryKey: ["my-follow-ups"] });
  const addFollowUp = useMutation({
    mutationFn: createMyFollowUp,
    onSuccess: async () => {
      setFollowUpTitle("");
      setFollowUpDate("");
      setFollowUpProject("");
      toast.success("Follow-up reminder added.");
      await refreshFollowUps();
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Could not add the follow-up."),
  });
  const finishFollowUp = useMutation({
    mutationFn: completeMyFollowUp,
    onSuccess: async () => {
      toast.success("Follow-up completed.");
      await refreshFollowUps();
    },
    onError: (cause) =>
      toast.error(cause instanceof Error ? cause.message : "Could not complete the follow-up."),
  });
  const schedule = useMutation({
    mutationFn: scheduleProjectCall,
    onSuccess: async (result) => {
      if (result.unchanged) {
        toast.message("No changes to the scheduled call.");
        return;
      }
      toast.success("Call scheduled. The client can see the updated time in their portal.");
      setDateByProject({});
      setAgendaByProject({});
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["staff-calendar"] }),
        queryClient.invalidateQueries({ queryKey: ["staff-projects"] }),
      ]);
    },
    onError: (cause) => {
      toast.error(cause instanceof Error ? cause.message : "Could not schedule the call.");
    },
  });

  const calls = useMemo(
    () => (data?.calls ?? []).filter((call) => matchesSearch(call, search)),
    [data?.calls, search],
  );
  const presence = useMemo(
    () => (data?.presence ?? []).filter((item) => matchesSearch(item, search)),
    [data?.presence, search],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center" aria-busy="true">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <Panel title="Coordination calendar">
        <p role="alert" className="text-[13px] text-red-700">
          {error instanceof Error ? error.message : "Could not load the coordination calendar."}
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Coordination calendar"
        subtitle="Upcoming client calls, confirmed visits, and presence requests awaiting an answer"
      >
        <div className="max-w-md">
          <Label htmlFor="calendar-search">Find a project</Label>
          <Input
            id="calendar-search"
            className="mt-1"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Project, reference, or client"
          />
        </div>
      </Panel>

      <Panel title="My follow-ups" subtitle="Overdue and upcoming reminders assigned to you">
        {followUpsQuery.error ? (
          <p role="alert" className="mb-3 text-[13px] text-red-700">
            {followUpsQuery.error instanceof Error
              ? followUpsQuery.error.message
              : "Could not load follow-up reminders."}
          </p>
        ) : null}
        <form
          className="grid gap-3 rounded-xl border border-ink/10 bg-cream/60 p-4 sm:grid-cols-[1fr_170px_1fr_auto] sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            if (!followUpTitle.trim() || !followUpDate) return;
            addFollowUp.mutate({
              data: {
                title: followUpTitle.trim(),
                dueDate: followUpDate,
                projectId: followUpProject || null,
              },
            });
          }}
        >
          <div>
            <Label htmlFor="follow-up-title">Follow-up</Label>
            <Input
              id="follow-up-title"
              className="mt-1"
              value={followUpTitle}
              onChange={(event) => setFollowUpTitle(event.target.value)}
              placeholder="Call client about the revised plan"
              maxLength={160}
              required
            />
          </div>
          <div>
            <Label htmlFor="follow-up-date">Due date</Label>
            <Input
              id="follow-up-date"
              className="mt-1"
              type="date"
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="follow-up-project">Project (optional)</Label>
            <select
              id="follow-up-project"
              className="mt-1 h-10 w-full rounded-lg border border-ink/15 bg-white px-3 text-[13px] text-ink"
              value={followUpProject}
              onChange={(event) => setFollowUpProject(event.target.value)}
            >
              <option value="">No project link</option>
              {(data?.calls ?? []).map((call) => (
                <option key={call.projectId} value={call.projectId}>
                  {call.reference} · {call.title}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={addFollowUp.isPending || !followUpDate}>
            Add reminder
          </Button>
        </form>
        {followUpsQuery.isLoading ? (
          <p className="mt-4 text-[13px] text-ink/55">Loading reminders…</p>
        ) : (followUpsQuery.data ?? []).length === 0 ? (
          <p className="mt-4 text-[13px] text-ink/55">No open reminders assigned to you.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {(followUpsQuery.data ?? []).map((item) => {
              const today = new Date().toLocaleDateString("en-CA");
              const overdue = item.dueDate < today;
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white p-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-medium text-maroon">{item.title}</p>
                      <Badge tone={overdue ? "maroon" : item.dueDate === today ? "gold" : "stone"}>
                        {overdue ? "Overdue" : item.dueDate === today ? "Due today" : "Upcoming"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-ink/55">
                      Due {item.dueDate}
                      {item.reference ? ` · ${item.reference} · ${item.projectTitle}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.projectId ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (item.projectId) onOpenProject(item.projectId);
                        }}
                      >
                        Open project
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={finishFollowUp.isPending}
                      onClick={() => finishFollowUp.mutate({ data: { followUpId: item.id } })}
                    >
                      Complete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel
        title="Calls"
        subtitle={
          canSchedule
            ? "Schedule or update the next project call in Nairobi time"
            : "Upcoming project calls and their agendas"
        }
      >
        {calls.length === 0 ? (
          <p className="text-[13px] text-ink/55">No matching live projects.</p>
        ) : (
          <ul className="space-y-3">
            {calls.map((call) => {
              const value = dateByProject[call.projectId] ?? nairobiInput(call.scheduledAt);
              const agenda = agendaByProject[call.projectId] ?? call.agenda.join(", ");
              return (
                <li key={call.projectId} className="rounded-xl border border-ink/10 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-maroon">
                        {call.reference} · {call.title}
                      </p>
                      <p className="mt-1 text-[12px] text-ink/55">{call.clientLabel}</p>
                      <p className="mt-2 text-[12px] text-ink/65">
                        {call.scheduledAt
                          ? (formatInstant(call.scheduledAt, "Africa/Nairobi") ?? "Call scheduled")
                          : "No next call scheduled"}
                      </p>
                      {call.agenda.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {call.agenda.map((item) => (
                            <li key={item} className="text-[11px] text-ink/55">
                              · {item}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenProject(call.projectId)}
                    >
                      Open project
                    </Button>
                  </div>
                  {canSchedule ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr_auto] sm:items-end">
                      <div>
                        <Label htmlFor={`call-time-${call.projectId}`}>Call time (Nairobi)</Label>
                        <Input
                          id={`call-time-${call.projectId}`}
                          className="mt-1"
                          type="datetime-local"
                          value={value}
                          onChange={(event) =>
                            setDateByProject((previous) => ({
                              ...previous,
                              [call.projectId]: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`call-agenda-${call.projectId}`}>Agenda (optional)</Label>
                        <Input
                          id={`call-agenda-${call.projectId}`}
                          className="mt-1"
                          value={agenda}
                          onChange={(event) =>
                            setAgendaByProject((previous) => ({
                              ...previous,
                              [call.projectId]: event.target.value,
                            }))
                          }
                          placeholder="Progress, decisions, next steps"
                          maxLength={960}
                        />
                      </div>
                      <Button
                        disabled={schedule.isPending || !value}
                        onClick={() => {
                          const scheduledAt = eatInstant(value);
                          if (!scheduledAt) {
                            toast.error("Enter a valid Nairobi date and time.");
                            return;
                          }
                          const agendaItems = agenda
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean);
                          if (agendaItems.length > 8) {
                            toast.error("Use no more than eight agenda items.");
                            return;
                          }
                          schedule.mutate({
                            data: {
                              projectId: call.projectId,
                              scheduledAt,
                              expectedScheduledAt: call.scheduledAt,
                              agenda: agendaItems,
                            },
                          });
                        }}
                      >
                        {schedule.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CalendarClock className="size-4" />
                        )}
                        {call.scheduledAt ? "Update call" : "Schedule call"}
                      </Button>
                    </div>
                  ) : null}
                  {canSchedule ? (
                    <p className="mt-2 text-[11px] text-ink/50">
                      Times use Nairobi time. Scheduling or changing a call notifies the client and
                      records the change in project activity.
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel
        title="Visits and walkthroughs"
        subtitle="Open requests need a response; confirmed visits are listed by time"
      >
        {presence.length === 0 ? (
          <p className="text-[13px] text-ink/55">No matching requests or upcoming visits.</p>
        ) : (
          <ul className="space-y-3">
            {presence.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={item.status === "requested" ? "gold" : "maroon"}>
                      {item.status === "requested" ? "Needs response" : "Confirmed"}
                    </Badge>
                    <span className="text-[12px] text-ink/55">
                      {item.kind === "visit" ? "Site visit" : "Walkthrough"}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-maroon">
                    {item.reference} · {item.title} · {item.clientLabel}
                  </p>
                  <p className="mt-1 text-[12px] text-ink/60">
                    {item.scheduledAt
                      ? (formatInstant(item.scheduledAt, "Africa/Nairobi") ?? "Confirmed")
                      : item.proposedOn
                        ? `Client proposed ${item.proposedOn}`
                        : "Client request"}
                  </p>
                  {item.clientNote ? (
                    <p className="mt-1 text-[12px] text-ink/55">{item.clientNote}</p>
                  ) : null}
                </div>
                <Button size="sm" variant="outline" onClick={() => onOpenProject(item.projectId)}>
                  Respond in project
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
