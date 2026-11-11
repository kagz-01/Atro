import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import {
  coordinationDateKey,
  coordinationMonthGrid,
  coordinationToday,
  formatCoordinationDay,
  formatCoordinationMonth,
  moveCoordinationMonth,
} from "@/lib/coordination-calendar";
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
import { calendarRequestLabel } from "@/lib/project-calendar";
import { respondToProjectCalendarRequest } from "@/lib/project-calendar-server";

type CoordinationEvent = {
  id: string;
  projectId: string;
  reference: string;
  title: string;
  clientLabel: string;
  day: string;
  kind: "call" | "visit" | "walkthrough";
  time: string | null;
  status: "scheduled" | "requested";
  eventTitle?: string;
};

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
  const [selectedDay, setSelectedDay] = useState(() => coordinationToday());
  const [editingCallId, setEditingCallId] = useState<string | null>(null);
  const [dateByProject, setDateByProject] = useState<Record<string, string>>({});
  const [agendaByProject, setAgendaByProject] = useState<Record<string, string>>({});
  const [followUpTitle, setFollowUpTitle] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpProject, setFollowUpProject] = useState("");
  const [eventTimeById, setEventTimeById] = useState<Record<string, string>>({});
  const [eventNoteById, setEventNoteById] = useState<Record<string, string>>({});
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
      setEditingCallId(null);
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
  const respondEvent = useMutation({
    mutationFn: respondToProjectCalendarRequest,
    onSuccess: async () => {
      toast.success("Calendar request answered. The client has been notified.");
      await queryClient.invalidateQueries({ queryKey: ["staff-calendar"] });
    },
    onError: (cause) =>
      toast.error(
        cause instanceof Error ? cause.message : "Could not answer the calendar request.",
      ),
  });

  const calls = useMemo(
    () => (data?.calls ?? []).filter((call) => matchesSearch(call, search)),
    [data?.calls, search],
  );
  const presence = useMemo(
    () => (data?.presence ?? []).filter((item) => matchesSearch(item, search)),
    [data?.presence, search],
  );
  const calendarRequests = useMemo(
    () =>
      (data?.calendarRequests ?? []).filter((item) =>
        matchesSearch(
          {
            title: `${item.title} ${item.projectTitle}`,
            reference: item.reference,
            clientLabel: item.clientLabel,
          },
          search,
        ),
      ),
    [data?.calendarRequests, search],
  );
  const calendarDays = useMemo(() => coordinationMonthGrid(selectedDay), [selectedDay]);
  const calendarEvents = useMemo<CoordinationEvent[]>(() => {
    const callEvents = calls.flatMap((call) => {
      if (!call.scheduledAt) return [];
      const day = coordinationDateKey(call.scheduledAt);
      return day
        ? [
            {
              id: `call-${call.projectId}`,
              projectId: call.projectId,
              reference: call.reference,
              title: call.title,
              clientLabel: call.clientLabel,
              day,
              kind: "call" as const,
              time: call.scheduledAt,
              status: "scheduled" as const,
            },
          ]
        : [];
    });
    const presenceEvents = presence.flatMap((item) => {
      if (item.status !== "scheduled" || !item.scheduledAt) return [];
      const day = coordinationDateKey(item.scheduledAt);
      return day
        ? [
            {
              id: item.id,
              projectId: item.projectId,
              reference: item.reference,
              title: item.title,
              clientLabel: item.clientLabel,
              day,
              kind: item.kind,
              time: item.scheduledAt,
              status: item.status,
            },
          ]
        : [];
    });
    const requestEvents = calendarRequests.flatMap((item) => {
      const time = item.scheduledAt ?? item.proposedAt;
      if (!time) return [];
      const day = coordinationDateKey(time);
      return day
        ? [
            {
              id: `event-${item.id}`,
              projectId: item.projectId,
              reference: item.reference,
              title: item.projectTitle,
              clientLabel: item.clientLabel,
              day,
              kind: "call" as const,
              time,
              status: item.status === "requested" ? ("requested" as const) : ("scheduled" as const),
              eventTitle: item.title,
            },
          ]
        : [];
    });
    return [...callEvents, ...presenceEvents, ...requestEvents];
  }, [calls, presence, calendarRequests]);
  const eventsByDay = useMemo(
    () =>
      calendarEvents.reduce<Record<string, CoordinationEvent[]>>((grouped, event) => {
        (grouped[event.day] ??= []).push(event);
        return grouped;
      }, {}),
    [calendarEvents],
  );
  const selectedDayEvents = eventsByDay[selectedDay] ?? [];
  const editingCall = calls.find((call) => call.projectId === editingCallId) ?? null;
  const unscheduledCalls = calls.filter((call) => !call.scheduledAt);

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
        subtitle="Calls, approved events, and visit or walkthrough requests by Nairobi date. Select a day to see its agenda."
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
        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                aria-label="Previous month"
                onClick={() => setSelectedDay((day) => moveCoordinationMonth(day, -1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <h2 className="min-w-40 text-center text-base font-semibold text-maroon">
                {formatCoordinationMonth(selectedDay)}
              </h2>
              <Button
                size="sm"
                variant="outline"
                aria-label="Next month"
                onClick={() => setSelectedDay((day) => moveCoordinationMonth(day, 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setSelectedDay(coordinationToday())}>
              <CalendarDays className="size-4" />
              Today
            </Button>
          </div>
          <div className="grid grid-cols-7 border-b border-ink/10 pb-2 text-center text-[11px] font-medium text-ink/55">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dayEvents = eventsByDay[day] ?? [];
              const inCurrentMonth = day.slice(0, 7) === selectedDay.slice(0, 7);
              const isToday = day === coordinationToday();
              const isSelected = day === selectedDay;
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${formatCoordinationDay(day)}${dayEvents.length ? `, ${dayEvents.length} items` : ""}`}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[76px] border-b border-r border-ink/10 p-1.5 text-left transition-colors sm:min-h-[96px] sm:p-2 ${
                    isSelected
                      ? "bg-maroon/5 ring-1 ring-inset ring-maroon/40"
                      : "hover:bg-cream/70"
                  } ${inCurrentMonth ? "text-ink" : "text-ink/35"}`}
                >
                  <span
                    className={`inline-flex size-6 items-center justify-center rounded-full text-[12px] ${
                      isToday ? "bg-gold font-semibold text-ink" : ""
                    }`}
                  >
                    {Number(day.slice(-2))}
                  </span>
                  <span className="mt-1 block space-y-0.5">
                    {dayEvents.slice(0, 2).map((item) => (
                      <span
                        key={item.id}
                        className={`block truncate rounded px-1 py-0.5 text-[9px] sm:text-[10px] ${
                          item.status === "requested"
                            ? "bg-amber-50 text-amber-800"
                            : item.kind === "call"
                              ? "bg-blue-50 text-blue-800"
                              : "bg-maroon/10 text-maroon"
                        }`}
                      >
                        {item.kind === "call"
                          ? item.eventTitle
                            ? "Event"
                            : "Call"
                          : item.kind === "visit"
                            ? "Visit"
                            : "Walkthrough"}
                        {item.time
                          ? ` · ${formatInstant(item.time, "Africa/Nairobi")?.split(",").at(-1)?.trim() ?? ""}`
                          : ""}
                      </span>
                    ))}
                    {dayEvents.length > 2 ? (
                      <span className="block px-1 text-[9px] text-ink/55">
                        +{dayEvents.length - 2} more
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-ink/10 bg-cream/40 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[14px] font-semibold text-maroon">
              {formatCoordinationDay(selectedDay)}
            </h3>
            <span className="text-[11px] text-ink/55">
              {selectedDayEvents.length} calendar item{selectedDayEvents.length === 1 ? "" : "s"}
            </span>
          </div>
          {selectedDayEvents.length === 0 ? (
            <p className="text-[13px] text-ink/55">
              Nothing scheduled on this date. Unscheduled calls and requests awaiting a response are
              listed below.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedDayEvents.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={item.status === "requested" ? "gold" : "maroon"}>
                        {item.kind === "call"
                          ? item.eventTitle
                            ? item.status === "requested"
                              ? "Event requested"
                              : "Project event"
                            : "Project call"
                          : item.status === "requested"
                            ? "Needs response"
                            : item.kind === "visit"
                              ? "Site visit"
                              : "Walkthrough"}
                      </Badge>
                      {item.time ? (
                        <span className="text-[11px] text-ink/55">
                          {formatInstant(item.time, "Africa/Nairobi") ?? "Nairobi time"}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[13px] font-medium text-maroon">
                      {item.reference} · {item.eventTitle ?? item.title}
                    </p>
                    {item.eventTitle ? (
                      <p className="text-[11px] text-ink/60">{item.title}</p>
                    ) : null}
                    <p className="text-[11px] text-ink/55">{item.clientLabel}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.kind === "call" && !item.eventTitle && canSchedule ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCallId(item.projectId)}
                      >
                        Edit call
                      </Button>
                    ) : null}
                    <Button size="sm" variant="ghost" onClick={() => onOpenProject(item.projectId)}>
                      {item.eventTitle && item.status === "requested"
                        ? "Review request"
                        : item.kind !== "call" && item.status === "requested"
                          ? "Respond in project"
                          : "Open project"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
              const today = coordinationToday();
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
        title={canSchedule ? "Calls to schedule" : "Calls without a time"}
        subtitle="Search all live projects above to quickly find a call. Scheduled calls appear on the calendar."
      >
        {unscheduledCalls.length === 0 ? (
          <p className="text-[13px] text-ink/55">
            {calls.length === 0
              ? "No matching live projects."
              : "All matching calls are scheduled."}
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {unscheduledCalls.map((call) => (
              <div
                key={call.projectId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-maroon">
                    {call.reference} · {call.title}
                  </p>
                  <p className="truncate text-[11px] text-ink/55">{call.clientLabel}</p>
                </div>
                <div className="flex gap-2">
                  {canSchedule ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCallId(call.projectId)}
                    >
                      <CalendarClock className="size-4" />
                      Schedule
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" onClick={() => onOpenProject(call.projectId)}>
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {canSchedule && editingCall ? (
        <Panel
          title={`${editingCall.scheduledAt ? "Update" : "Schedule"} call · ${editingCall.reference}`}
          subtitle={`${editingCall.title} · ${editingCall.clientLabel}`}
        >
          {(() => {
            const call = editingCall;
            const value = dateByProject[call.projectId] ?? nairobiInput(call.scheduledAt);
            const agenda = agendaByProject[call.projectId] ?? call.agenda.join(", ");
            return (
              <>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr_auto] sm:items-end">
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
                <p className="mt-2 text-[11px] text-ink/50">
                  Times use Nairobi time. Scheduling or changing a call notifies the client and
                  records the change in project activity.
                </p>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setEditingCallId(null)}>
                    Cancel
                  </Button>
                </div>
              </>
            );
          })()}
        </Panel>
      ) : null}

      <Panel
        title="Client event requests"
        subtitle="Approve the proposed time or confirm a different time. Declines must include a reason."
      >
        {calendarRequests.filter((item) => item.status === "requested").length === 0 ? (
          <p className="text-[13px] text-ink/55">No project event requests need approval.</p>
        ) : (
          <ul className="space-y-3">
            {calendarRequests
              .filter((item) => item.status === "requested")
              .map((item) => {
                const proposed = item.proposedAt;
                const when = eventTimeById[item.id] ?? nairobiInput(proposed);
                return (
                  <li key={item.id} className="rounded-xl border border-ink/10 bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="gold">Needs approval</Badge>
                      <span className="text-[12px] text-ink/55">
                        {calendarRequestLabel(item.kind)}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] font-medium text-maroon">{item.title}</p>
                    <p className="mt-1 text-[12px] text-ink/60">
                      {item.reference} · {item.projectTitle} · {item.clientLabel}
                    </p>
                    <p className="mt-2 text-[12px] text-ink/55">
                      Client proposed {formatInstant(proposed, "Africa/Nairobi") ?? "a time"} EAT
                    </p>
                    {item.note ? (
                      <p className="mt-1 whitespace-pre-wrap text-[12px] text-ink/60">
                        {item.note}
                      </p>
                    ) : null}
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`client-event-time-${item.id}`}>
                          Confirmed time (Nairobi)
                        </Label>
                        <Input
                          id={`client-event-time-${item.id}`}
                          type="datetime-local"
                          value={when}
                          onChange={(event) =>
                            setEventTimeById((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`client-event-note-${item.id}`}>
                          Note or decline reason
                        </Label>
                        <Textarea
                          id={`client-event-note-${item.id}`}
                          className="min-h-12"
                          maxLength={500}
                          value={eventNoteById[item.id] ?? ""}
                          onChange={(event) =>
                            setEventNoteById((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))
                          }
                          placeholder="Add a note the client will see"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={respondEvent.isPending || !when}
                        onClick={() => {
                          const scheduledAt = eatInstant(when);
                          if (!scheduledAt) {
                            toast.error("Enter a valid Nairobi date and time.");
                            return;
                          }
                          respondEvent.mutate({
                            data: {
                              requestId: item.id,
                              status: "confirmed",
                              scheduledAt,
                              note: eventNoteById[item.id]?.trim() || undefined,
                            },
                          });
                        }}
                      >
                        Confirm event
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={respondEvent.isPending || !eventNoteById[item.id]?.trim()}
                        onClick={() =>
                          respondEvent.mutate({
                            data: {
                              requestId: item.id,
                              status: "declined",
                              note: eventNoteById[item.id]?.trim(),
                            },
                          })
                        }
                      >
                        Decline with reason
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenProject(item.projectId)}
                      >
                        Open project
                      </Button>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </Panel>

      <Panel
        title="Presence requests needing a response"
        subtitle="Respond to client visit or walkthrough requests from the project, where the existing approval flow applies."
      >
        {presence.filter((item) => item.status === "requested").length === 0 ? (
          <p className="text-[13px] text-ink/55">No matching requests need a response.</p>
        ) : (
          <ul className="space-y-3">
            {presence
              .filter((item) => item.status === "requested")
              .map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="gold">Needs response</Badge>
                      <span className="text-[12px] text-ink/55">
                        {item.kind === "visit" ? "Site visit" : "Walkthrough"}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] text-maroon">
                      {item.reference} · {item.title} · {item.clientLabel}
                    </p>
                    <p className="mt-1 text-[12px] text-ink/60">
                      {item.proposedOn ? `Client proposed ${item.proposedOn}` : "Client request"}
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
