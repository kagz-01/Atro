import { useQuery } from "@tanstack/react-query";
import { Loader2, MessageSquare, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { getClientProjectTeam } from "@/lib/project-team-server";

export function ClientProjectTeamPanel({
  projectId,
  disabled = false,
  onOpenMessages,
}: {
  projectId: string;
  disabled?: boolean;
  onOpenMessages: () => void;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["client-project-team", projectId],
    queryFn: () => getClientProjectTeam({ data: { projectId } }),
    enabled: !disabled,
  });

  return (
    <div className="space-y-5">
      <Panel
        title="Your ATRO project team"
        subtitle="These are the people responsible for delivering your project."
      >
        {disabled ? (
          <p className="text-[13px] leading-relaxed text-ink/65">
            Named ATRO contacts will appear here once the project team is assigned.
          </p>
        ) : isLoading || !data ? (
          error ? (
            <p role="alert" className="text-[13px] text-red-700">
              {error instanceof Error ? error.message : "Could not load your project team."}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-[13px] text-ink/55" aria-busy="true">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading your project contacts…
            </div>
          )
        ) : data.length === 0 ? (
          <div className="rounded-xl border border-ink/10 bg-cream p-4">
            <div className="flex items-start gap-3">
              <UsersRound className="mt-0.5 size-4 shrink-0 text-maroon" aria-hidden />
              <p className="text-[13px] leading-relaxed text-ink/70">
                Your named ATRO contacts have not been added yet. You can still send a message to
                the project team, and the office will help route it.
              </p>
            </div>
            <Button className="mt-4" variant="outline" onClick={onOpenMessages}>
              <MessageSquare className="size-4" aria-hidden />
              Message the project team
            </Button>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-ink/8">
              {data.map((member) => (
                <li
                  key={member.staffUserId}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold/20 font-medium text-maroon"
                    aria-hidden
                  >
                    {member.displayName
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-maroon">
                      {member.displayName}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-ink/55">{member.roleTitle}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-ink/8 pt-4">
              <p className="text-[12px] text-ink/55">
                Contact your team securely through your project message thread.
              </p>
              <Button className="mt-3" variant="outline" onClick={onOpenMessages}>
                <MessageSquare className="size-4" aria-hidden />
                Message the project team
              </Button>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
