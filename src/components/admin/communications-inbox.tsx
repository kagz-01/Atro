import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { StudioMessagesPanel } from "@/components/admin/messages-panel";
import { needsStudioReply } from "@/lib/messages";
import type { StaffMessageThreadSummary } from "@/lib/messages-server";
import { cn } from "@/lib/utils";

type InboxFilter = "waiting" | "conversations" | "all";

const PAGE_SIZE = 10;

function formatActivity(value: string | null): string {
  if (!value) return "No messages yet";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recent activity"
    : date.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}

export function CommunicationsInbox({
  threads,
  isLoading,
  error,
  selectedProjectId,
  onSelectProject,
  onBack,
  onRetry,
}: {
  threads: StaffMessageThreadSummary[];
  isLoading: boolean;
  error: Error | null;
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onBack: () => void;
  onRetry: () => void;
}) {
  const [filter, setFilter] = useState<InboxFilter>("waiting");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const selected = threads.find((thread) => thread.projectId === selectedProjectId) ?? null;
  const waitingCount = threads.filter((thread) => needsStudioReply(thread.latestAuthorRole)).length;
  const conversationCount = threads.filter((thread) => thread.messageCount > 0).length;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return threads
      .filter((thread) => {
        if (filter === "waiting" && !needsStudioReply(thread.latestAuthorRole)) return false;
        if (filter === "conversations" && thread.messageCount === 0) return false;
        return (
          !query ||
          [thread.clientLabel, thread.reference, thread.title]
            .join(" ")
            .toLowerCase()
            .includes(query)
        );
      })
      .sort((a, b) => {
        const waitingOrder =
          Number(needsStudioReply(b.latestAuthorRole)) -
          Number(needsStudioReply(a.latestAuthorRole));
        if (waitingOrder !== 0) return waitingOrder;
        const unreadOrder = b.unreadCount - a.unreadCount;
        if (unreadOrder !== 0) return unreadOrder;
        return (b.lastActivityAt ?? "").localeCompare(a.lastActivityAt ?? "");
      });
  }, [filter, search, threads]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(0, pageCount - 1));
  const pageThreads = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function changeFilter(next: InboxFilter) {
    setFilter(next);
    setPage(0);
  }

  return (
    <div className="space-y-4">
      <Panel
        title="Client communications"
        subtitle="One conversation per project. Messages stay on the job record and appear in the client's portal."
      >
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["waiting", "Reply needed", waitingCount],
              ["conversations", "Conversations", conversationCount],
              ["all", "All active jobs", threads.length],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => changeFilter(id)}
              aria-pressed={filter === id}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-colors",
                filter === id
                  ? "border-maroon bg-maroon text-paper"
                  : "border-ink/12 text-ink/60 hover:border-burgundy hover:text-burgundy",
              )}
            >
              {label} <span className="ml-1 opacity-70">{count}</span>
            </button>
          ))}
        </div>
        <label className="relative mt-4 block max-w-lg">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/40" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Find by client, project name, or reference"
            aria-label="Search communications by client or project"
            className="pl-9"
          />
        </label>
      </Panel>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.5fr)]">
        <Panel
          title="Clients & jobs"
          subtitle="Each job has its own private conversation."
          className={cn(selectedProjectId && "hidden lg:block")}
          bodyClassName="p-0"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-[13px] text-ink/55">
              <Loader2 className="size-4 animate-spin" />
              Loading active projects…
            </div>
          ) : error ? (
            <div className="px-5 py-8 text-center">
              <p role="alert" className="text-[13px] text-red-700">
                {error.message || "Could not load client conversations."}
              </p>
              <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="size-3.5" />
                Try again
              </Button>
            </div>
          ) : pageThreads.length === 0 ? (
            <div className="px-5 py-9 text-center">
              <Inbox className="mx-auto size-7 text-ink/25" aria-hidden />
              <p className="mt-3 text-[13px] font-medium text-maroon">
                {search.trim()
                  ? "No client or job matches that search."
                  : filter === "waiting"
                    ? "No client is waiting for a reply."
                    : filter === "conversations"
                      ? "No active project conversations yet."
                      : "No active projects to show."}
              </p>
              {filter === "waiting" && !search.trim() ? (
                <Button
                  className="mt-3"
                  size="sm"
                  variant="outline"
                  onClick={() => changeFilter("all")}
                >
                  Choose an active project
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <ul className="divide-y divide-ink/8">
                {pageThreads.map((thread) => {
                  const waiting = needsStudioReply(thread.latestAuthorRole);
                  const active = thread.projectId === selectedProjectId;
                  return (
                    <li key={thread.projectId}>
                      <button
                        type="button"
                        aria-current={active ? "true" : undefined}
                        onClick={() => onSelectProject(thread.projectId)}
                        className={cn(
                          "w-full px-4 py-3 text-left transition-colors hover:bg-cream/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-maroon",
                          active && "bg-cream",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium text-maroon">
                              {thread.clientLabel || "Client"}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-ink/55">
                              {thread.reference} · {thread.title}
                            </span>
                          </span>
                          {waiting ? (
                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-900">
                              Reply needed
                            </span>
                          ) : null}
                        </div>
                        <span className="mt-2 flex items-center justify-between gap-2">
                          <span className="line-clamp-2 text-[11px] leading-relaxed text-ink/60">
                            {thread.latestMessage || "No messages yet — start the conversation."}
                          </span>
                          {thread.unreadCount > 0 ? (
                            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-maroon text-[10px] font-bold text-white">
                              {thread.unreadCount}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-[10px] text-ink/40">
                          {formatActivity(thread.lastActivityAt)}
                          {thread.messageCount ? ` · ${thread.messageCount} messages` : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {pageCount > 1 ? (
                <div className="flex items-center justify-between border-t border-ink/8 px-4 py-3">
                  <span className="text-[11px] text-ink/50">
                    {safePage * PAGE_SIZE + 1}–
                    {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </span>
                  <span className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Previous page"
                      disabled={safePage === 0}
                      onClick={() => setPage((current) => Math.max(0, current - 1))}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Next page"
                      disabled={safePage >= pageCount - 1}
                      onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </span>
                </div>
              ) : null}
            </>
          )}
        </Panel>

        <Panel
          title={
            selected
              ? `${selected.clientLabel || "Client"} · ${selected.reference}`
              : "Project conversation"
          }
          subtitle={
            selected
              ? selected.title
              : "Select a client and job to open its conversation, or choose an active job to start one."
          }
          className={cn(!selectedProjectId && "hidden lg:block")}
          bodyClassName="p-4 sm:p-5"
        >
          {selected ? (
            <>
              <Button className="mb-4 lg:hidden" size="sm" variant="ghost" onClick={onBack}>
                <ArrowLeft className="size-4" />
                Clients and jobs
              </Button>
              <p className="mb-4 rounded-lg bg-cream px-3 py-2 text-[11px] leading-relaxed text-ink/60">
                This is the in-app project thread. The client sees your replies in their portal;
                external channels such as WhatsApp are not part of this conversation record.
              </p>
              <StudioMessagesPanel key={selected.projectId} projectId={selected.projectId} />
            </>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center text-center">
              <MessageSquare className="size-8 text-ink/20" aria-hidden />
              <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-ink/55">
                Start from the client’s project, not a person-wide inbox. If a client has multiple
                jobs, each job keeps a separate conversation and history.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
