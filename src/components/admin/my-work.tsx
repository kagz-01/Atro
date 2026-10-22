// ATRO "My work" — the staff member's own queue, rendered.
//
// Three lists, one screen: enquiries I claimed and have not finished, approvals
// that have gone quiet, and the notes I left. Each list links back to the part
// of the console that can act on it, so this screen is a landing, not a second
// copy of the console.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ArrowRight, Clock, Mail, MessageSquare, Phone } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { chaseApproval } from "@/lib/approvals-server";
import { statusLabel } from "@/lib/enquiry-funnel";
import { getMyWork } from "@/lib/my-work";
import { formatPhone } from "@/lib/phone";

const STATUS_TONES: Record<string, "stone" | "gold" | "maroon" | "live"> = {
  new: "stone",
  contacted: "gold",
  quoted: "gold",
  won: "live",
  lost: "maroon",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-ink/15 px-4 py-5 text-center text-[13px] text-ink/55">
      {children}
    </p>
  );
}

export function MyWorkPanel({
  onGoEnquiries,
  onOpenProject,
}: {
  onGoEnquiries: () => void;
  onOpenProject: (projectId: string) => void;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-work"],
    queryFn: () => getMyWork({ data: undefined }),
  });

  const chase = useMutation({
    mutationFn: (approvalId: string) => chaseApproval({ data: { approvalId, note: "" } }),
    onSuccess: () => {
      // The row leaves the list — chased today, and the rule will not ask
      // again for a week — so refetching IS the feedback.
      void queryClient.invalidateQueries({ queryKey: ["my-work"] });
      toast.success("Marked as chased.");
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Could not record the chase."),
  });

  const enquiries = data?.enquiries ?? [];
  const chases = data?.chases ?? [];
  const notes = data?.notes ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel
        title="My enquiries"
        subtitle="Claimed by you, still open"
        actions={
          <Button size="sm" variant="ghost" onClick={onGoEnquiries}>
            Open the inbox <ArrowRight className="size-3.5" />
          </Button>
        }
      >
        {isLoading ? (
          <Empty>Loading…</Empty>
        ) : enquiries.length === 0 ? (
          <Empty>
            Nothing claimed yet. Claim an enquiry in the inbox and it waits for you here.
          </Empty>
        ) : (
          <ul className="space-y-2">
            {enquiries.map((e) => (
              <li
                key={e.id}
                className="rounded-xl border border-ink/10 bg-cream/60 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-medium text-maroon">{e.name}</p>
                  <Badge tone={STATUS_TONES[e.status] ?? "stone"} className="text-[9px]">
                    {statusLabel(e.status)}
                  </Badge>
                  <span className="text-[11px] text-muted">{timeAgo(e.createdAt)}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-ink/60">
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5" /> {formatPhone(e.phone ?? "")}
                  </span>
                  <span className="flex min-w-0 items-center gap-1">
                    <Mail className="size-3.5" /> <span className="truncate">{e.email}</span>
                  </span>
                  <span>{e.projectType}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Chases due" subtitle="Approvals that have gone quiet">
        {isLoading ? (
          <Empty>Loading…</Empty>
        ) : chases.length === 0 ? (
          <Empty>Nothing is waiting on a call right now.</Empty>
        ) : (
          <ul className="space-y-2">
            {chases.map((c) => (
              <li key={c.approvalId} className="rounded-xl border border-ink/10 bg-cream/60 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-medium text-maroon">{c.title}</p>
                  {c.blocking ? (
                    <Badge tone="maroon" className="text-[9px]">
                      Blocking
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-[12px] text-ink/60">
                  {c.authority} · {c.reference}
                  {c.chasedOn ? ` · chased ${c.chasedOn}` : " · never chased"}
                </p>
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenProject(c.projectId)}
                    className="flex min-w-0 items-center gap-1 text-[12px] text-burgundy underline decoration-gold decoration-2 underline-offset-4"
                  >
                    <span className="truncate">{c.projectTitle}</span>
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={chase.isPending}
                    onClick={() => chase.mutate(c.approvalId)}
                  >
                    Mark chased
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="My notes" subtitle="What you recorded on projects">
        {isLoading ? (
          <Empty>Loading…</Empty>
        ) : notes.length === 0 ? (
          <Empty>No notes yet — an update you post on a project lands here.</Empty>
        ) : (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => onOpenProject(n.projectId)}
                  className="w-full rounded-xl border border-ink/10 bg-cream/60 p-4 text-left hover:border-burgundy/30"
                >
                  <p className="line-clamp-3 text-[13px] leading-relaxed text-ink/75">{n.body}</p>
                  <span className="mt-2 flex items-center gap-2 text-[11px] text-muted">
                    <MessageSquare className="size-3.5" />
                    {n.reference} · {n.projectTitle}
                    <Clock className="ml-auto size-3.5" />
                    {timeAgo(n.createdAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
