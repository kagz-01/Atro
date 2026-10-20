import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, MapPin, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { journeyStageFor } from "@/lib/abroad";
import {
  formatDay,
  formatInstant,
  isOpen,
  siteDay,
  sortNewest,
  statusLabel,
  statusTone,
  visitHeadline,
  SITE_ZONE,
} from "@/lib/presence";
import { listMyPresence, requestVisit, requestWalkthrough } from "@/lib/presence-server";

/**
 * The two cards the presence split puts on the client's side.
 *
 * Both read the same list and paint only their own kind — the local card on
 * Overview asks to walk the building, the abroad panel asks for the building
 * to be walked on camera. Neither decides eligibility: the server refuses the
 * wrong track's question regardless of what any component believes, so a
 * stale panel can beg but cannot write.
 */
function usePresence(projectId: string) {
  const queryClient = useQueryClient();
  return {
    query: useQuery({
      queryKey: ["my-presence", projectId],
      queryFn: () => listMyPresence({ data: { projectId } }),
    }),
    invalidate: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-presence", projectId] });
    },
  };
}

/** The local client's card: your next walk of the building, or the form to ask. */
export function VisitPanel({
  projectId,
  activeMilestoneName,
}: {
  projectId: string;
  activeMilestoneName?: string | null;
}) {
  const { query, invalidate } = usePresence(projectId);
  const [day, setDay] = useState("");
  const [note, setNote] = useState("");

  const visits = (query.data ?? []).filter((p) => p.kind === "visit");
  const headline = visitHeadline(visits, new Date().toISOString());
  const waiting = visits.find(isOpen) ?? null;
  const confirmed = headline && headline.status === "scheduled" ? headline : null;
  const isUpcoming =
    confirmed?.scheduledAt != null && Date.parse(confirmed.scheduledAt) >= Date.now();

  const ask = useMutation({
    mutationFn: () => requestVisit({ data: { projectId, proposedOn: day, note: note.trim() || undefined } }),
    onSuccess: () => {
      setDay("");
      setNote("");
      invalidate();
    },
  });

  const stage = activeMilestoneName ? journeyStageFor(activeMilestoneName) : null;

  return (
    <Panel
      title="Your site visit"
      subtitle={
        confirmed
          ? isUpcoming
            ? "Confirmed — the site keeps EAT"
            : "The last time you walked it"
          : waiting
            ? "Waiting on the studio"
            : "Photographs record. Walking is the check."
      }
      actions={
        confirmed ? (
          <Badge tone={statusTone(confirmed.status)}>{statusLabel(confirmed)}</Badge>
        ) : waiting ? (
          <Badge tone={statusTone(waiting.status)}>{statusLabel(waiting)}</Badge>
        ) : null
      }
    >
      {confirmed ? (
        <div>
          <p className="text-[15px] text-maroon">
            {formatInstant(confirmed.scheduledAt, SITE_ZONE) ??
              "A time the studio will confirm."}
          </p>
          {confirmed.staffNote ? (
            <p className="mt-2 text-[14px] leading-relaxed text-ink/75">{confirmed.staffNote}</p>
          ) : null}
          <p className="mt-3 text-[13px] text-ink/55">
            You asked for {formatDay(confirmed.proposedOn) ?? "a day"}
            {confirmed.clientNote ? `: “${confirmed.clientNote}”` : "."}
          </p>
        </div>
      ) : null}

      {waiting ? (
        <div>
          <p className="text-[14px] leading-relaxed text-ink/75">
            Asked {formatDay(waiting.createdAt) ?? ""} — the studio answers with a confirmed
            time, Monday–Saturday, 08:30–17:30 EAT.
          </p>
          <p className="mt-2 text-[13px] text-ink/55">
            You asked for {formatDay(waiting.proposedOn) ?? "a day"}
            {waiting.clientNote ? `: “${waiting.clientNote}”` : "."}
          </p>
          <p className="mt-3 text-[13px] text-ink/45">
            One visit at a time — while this waits, another cannot be asked.
          </p>
        </div>
      ) : null}

      {!waiting ? (
        <form
          className="mt-4 border-t border-ink/8 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!day || ask.isPending) return;
            ask.mutate();
          }}
        >
          <p className="text-[14px] leading-relaxed text-ink/75">
            {stage?.id === "frame"
              ? "The frame is up — the guide this studio writes from calls superstructure the stage to walk, before the finishes hide the work."
              : confirmed
                ? "Planning another one — handover is worth walking too. The studio answers with a confirmed time."
                : "Ask for a slot: Monday–Saturday, 08:30–17:30 EAT. The studio answers with a confirmed time."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="visit-day">A day that suits you</Label>
              <Input
                id="visit-day"
                type="date"
                required
                min={siteDay(new Date().toISOString())}
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="visit-note">Anything the site should know</Label>
              <Input
                id="visit-note"
                placeholder="Optional — parking, who is coming, what you want to see"
                maxLength={300}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={ask.isPending || !day} className="h-10">
              {ask.isPending ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
              Request a visit
            </Button>
          </div>
          {ask.error ? (
            <p className="mt-3 text-[13px] text-red-700">
              {ask.error instanceof Error
                ? ask.error.message
                : "We could not send that. Try again."}
            </p>
          ) : null}
        </form>
      ) : null}
    </Panel>
  );
}

/** The abroad client's card: recordings the studio has walked through for them. */
export function WalkthroughPanel({ projectId }: { projectId: string }) {
  const { query, invalidate } = usePresence(projectId);
  const [note, setNote] = useState("");

  const walkthroughs = sortNewest(
    (query.data ?? []).filter((p) => p.kind === "walkthrough"),
  );
  const waiting = walkthroughs.find(isOpen) ?? null;

  const ask = useMutation({
    mutationFn: () => requestWalkthrough({ data: { projectId, note: note.trim() || undefined } }),
    onSuccess: () => {
      setNote("");
      invalidate();
    },
  });

  return (
    <Panel title="Walkthroughs" subtitle="The building walked on camera">
      <p className="text-[14px] leading-relaxed text-ink/75">
        Photographs show what was finished. A walkthrough shows what changed — the studio
        walks the building stage by stage and sends the recording here, to watch on your
        clock as often as you like.
      </p>

      {walkthroughs.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {walkthroughs.map((w) => (
            <li key={w.id} className="rounded-2xl border border-ink/10 bg-cream p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={statusTone(w.status)}>{statusLabel(w)}</Badge>
                {w.status === "delivered" && w.deliveryUrl ? (
                  <a
                    href={w.deliveryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-maroon underline-offset-4 hover:underline"
                  >
                    Open the recording
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </div>
              {w.clientNote ? (
                <p className="mt-2 text-[14px] leading-relaxed text-ink/75">“{w.clientNote}”</p>
              ) : null}
              {w.staffNote ? (
                <p className="mt-2 text-[13px] leading-relaxed text-ink/60">{w.staffNote}</p>
              ) : null}
              <p className="mt-2 text-[12px] text-ink/45">
                Asked {formatDay(w.createdAt) ?? ""}
                {w.respondedAt && w.status !== "requested"
                  ? ` · answered ${formatDay(w.respondedAt)}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[13px] leading-relaxed text-ink/55">
          Nothing recorded yet. Ask for one below — the studio films what the week changed
          and the recording appears here.
        </p>
      )}

      {!waiting ? (
        <form
          className="mt-4 border-t border-ink/8 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (ask.isPending) return;
            ask.mutate();
          }}
        >
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1">
              <Label htmlFor="walk-note">What should the studio cover?</Label>
              <Input
                id="walk-note"
                placeholder="Optional — the roof, the stair, everything since last month"
                maxLength={300}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={ask.isPending} className="h-10">
              {ask.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Video className="size-4" />
              )}
              Request a walkthrough
            </Button>
          </div>
          {ask.error ? (
            <p className="mt-3 text-[13px] text-red-700">
              {ask.error instanceof Error
                ? ask.error.message
                : "We could not send that. Try again."}
            </p>
          ) : null}
        </form>
      ) : (
        <p className="mt-4 text-[13px] text-ink/45">
          One at a time — while this waits, another cannot be asked.
        </p>
      )}
    </Panel>
  );
}
