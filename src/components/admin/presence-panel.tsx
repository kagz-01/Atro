import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Loader2, Video } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { listPresenceForStaff, respondPresence } from "@/lib/presence-server";
import {
  formatDay,
  formatInstant,
  isOpen,
  sortForQueue,
  statusLabel,
  statusTone,
  SITE_ZONE,
  type PresenceRequest,
} from "@/lib/presence";

/**
 * The studio's side of presence: the queue of clients asking to be there, in
 * one of the two ways a client can be.
 *
 * A visit is answered with a slot — a date and time the studio keeps, typed in
 * Nairobi time because that is the clock the gate runs on. A walkthrough is
 * answered with a link to the recording. A decline is answered with words,
 * which the server refuses to skip: a status without a reason is how a client
 * starts reading the portal as bad news they cannot question.
 *
 * Every answer is one-way. If a confirmed date has to move, that is a
 * conversation (the message thread), not a second write against the row the
 * client was given — the transition table in presence.ts is what makes the
 * promise on the row mean something.
 */
export function PresencePanel({
  projectId,
  onChanged,
}: {
  projectId: string;
  onChanged?: () => void;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [whenBy, setWhenBy] = useState<Record<string, string>>({});
  const [urlBy, setUrlBy] = useState<Record<string, string>>({});
  const [noteBy, setNoteBy] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["staff-presence", projectId],
    queryFn: () => listPresenceForStaff({ data: { projectId } }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["staff-presence", projectId] });
    onChanged?.();
  };

  const respond = useMutation({
    mutationFn: respondPresence,
    onSuccess: () => {
      toast.success("Answer recorded.");
      setError("");
      invalidate();
    },
    onError: (e) => setError(e instanceof Error ? e.message : "That answer was not saved."),
  });

  const answer = (
    p: PresenceRequest,
    status: "scheduled" | "delivered" | "declined",
  ) => {
    if (status === "declined" && !(noteBy[p.id] ?? "").trim()) {
      setError("A decline needs a reason the client can read.");
      return;
    }
    setError("");
    respond.mutate({
      data: {
        requestId: p.id,
        status,
        scheduledAt: status === "scheduled" ? whenBy[p.id] ?? "" : undefined,
        deliveryUrl: status === "delivered" ? urlBy[p.id] ?? "" : undefined,
        note: noteBy[p.id]?.trim() || undefined,
      },
    });
  };

  const requests = sortForQueue(data ?? []);
  const busy = respond.isPending;

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-ink/10 bg-cream p-5">
        <div className="h-20 animate-pulse rounded-xl bg-ink/6" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-cream p-5">
      <div>
        <h3 className="font-display text-lg text-maroon">Site presence</h3>
        <p className="mt-1 text-[12px] leading-relaxed text-ink/55">
          The two ways a client asks to be there: a local client asks to walk the building,
          an abroad client asks for it to be walked on camera. Answer with a slot in Nairobi
          time, a link to the recording, or a reason it cannot go ahead.
        </p>
      </div>

      {requests.length === 0 ? (
        <p className="mt-4 text-[13px] text-ink/55">
          No presence requests on this project yet. When the client asks from their portal,
          it waits here.
        </p>
      ) : null}

      {error ? <p className="mt-4 text-[13px] text-red-700">{error}</p> : null}

      <ul className="mt-4 space-y-3">
        {requests.map((p) => (
          <li key={p.id} className="rounded-2xl border border-ink/10 bg-white p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={statusTone(p.status)}>{statusLabel(p)}</Badge>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                {p.kind === "visit" ? (
                  <CalendarCheck className="size-3.5" />
                ) : (
                  <Video className="size-3.5" />
                )}
                Asked {formatDay(p.createdAt) ?? ""}
                {p.proposedOn ? ` · for ${formatDay(p.proposedOn)}` : ""}
              </span>
            </div>

            {p.clientNote ? (
              <p className="mt-2 text-[13px] leading-relaxed text-ink/75">“{p.clientNote}”</p>
            ) : null}

            {isOpen(p) ? (
              <div className="mt-3 space-y-3 border-t border-ink/8 pt-3">
                {p.kind === "visit" ? (
                  <div>
                    <Label htmlFor={`presence-when-${p.id}`}>
                      Confirmed for (Nairobi time)
                    </Label>
                    <Input
                      id={`presence-when-${p.id}`}
                      type="datetime-local"
                      value={whenBy[p.id] ?? ""}
                      onChange={(e) =>
                        setWhenBy((m) => ({ ...m, [p.id]: e.target.value }))
                      }
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor={`presence-url-${p.id}`}>
                      Link to the recording (the client opens it from their portal)
                    </Label>
                    <Input
                      id={`presence-url-${p.id}`}
                      type="url"
                      placeholder="https://…"
                      value={urlBy[p.id] ?? ""}
                      onChange={(e) => setUrlBy((m) => ({ ...m, [p.id]: e.target.value }))}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor={`presence-note-${p.id}`}>
                    What the client should know
                  </Label>
                  <Input
                    id={`presence-note-${p.id}`}
                    placeholder="Meet at the gate, or why it cannot go ahead"
                    maxLength={600}
                    value={noteBy[p.id] ?? ""}
                    onChange={(e) => setNoteBy((m) => ({ ...m, [p.id]: e.target.value }))}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => answer(p, p.kind === "visit" ? "scheduled" : "delivered")}
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                    {p.kind === "visit" ? "Confirm visit" : "Deliver walkthrough"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => answer(p, "declined")}
                  >
                    Decline with a reason
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-1.5 border-t border-ink/8 pt-3 text-[13px]">
                {p.status === "scheduled" && p.scheduledAt ? (
                  <p className="text-maroon">
                    {formatInstant(p.scheduledAt, SITE_ZONE) ?? "Scheduled"}
                  </p>
                ) : null}
                {p.status === "delivered" && p.deliveryUrl ? (
                  <a
                    href={p.deliveryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-maroon underline-offset-4 hover:underline"
                  >
                    {p.deliveryUrl}
                  </a>
                ) : null}
                {p.staffNote ? <p className="text-ink/70">{p.staffNote}</p> : null}
                <p className="text-[12px] text-ink/45">
                  Answered {formatDay(p.respondedAt) ?? ""} by {p.respondedBy || "the studio"}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
