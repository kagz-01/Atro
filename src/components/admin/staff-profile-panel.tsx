import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { PROFILE_TIME_ZONES } from "@/lib/profile";
import { getMyStaffProfile, saveMyStaffProfile, type MyStaffProfile } from "@/lib/staff-ops";

const ROLE_LABELS = {
  admin: "Owner / admin",
  office_manager: "Office manager",
  staff: "Staff",
} as const;

type StaffProfileDraft = Pick<MyStaffProfile, "displayName" | "workFocus" | "timezone">;

function toDraft(profile: MyStaffProfile): StaffProfileDraft {
  return {
    displayName: profile.displayName,
    workFocus: profile.workFocus,
    timezone: profile.timezone,
  };
}

export function StaffProfilePanel() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-staff-profile"],
    queryFn: () => getMyStaffProfile({ data: undefined }),
  });
  const [draft, setDraft] = useState<StaffProfileDraft | null>(null);
  const [discarding, setDiscarding] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty =
    Boolean(draft && data) &&
    (draft?.displayName !== data?.displayName ||
      draft?.workFocus !== data?.workFocus ||
      draft?.timezone !== data?.timezone);

  useEffect(() => {
    if (data && !draft) setDraft(toDraft(data));
  }, [data, draft]);

  useEffect(() => {
    if (!dirty) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

  const save = useMutation({
    mutationFn: saveMyStaffProfile,
    onSuccess: async (profile) => {
      queryClient.setQueryData(["my-staff-profile"], profile);
      setDraft(toDraft(profile));
      setDiscarding(false);
      setSaved(true);
      toast.success("Your staff profile is saved.");
      await queryClient.invalidateQueries({ queryKey: ["my-staff-profile"] });
    },
    onError: (cause) => {
      toast.error(cause instanceof Error ? cause.message : "Could not save your profile.");
    },
  });

  if (isLoading || !data || !draft) {
    return (
      <Panel title="Your staff profile">
        {error ? (
          <p role="alert" className="text-[13px] text-red-700">
            {error instanceof Error ? error.message : "Could not load your staff profile."}
          </p>
        ) : (
          <div className="h-32 animate-pulse rounded-xl bg-ink/6" aria-busy="true" />
        )}
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <Panel title="Your staff profile" subtitle="The name and work context shown in your console">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              Sign-in account
            </p>
            <p className="mt-1.5 break-all text-[13px] text-ink/75">{data.email}</p>
            <p className="mt-1 text-[11px] text-ink/50">
              Managed by your sign-in provider; this profile does not change your login.
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              Studio access
            </p>
            <div className="mt-1.5">
              <Badge tone="maroon">{ROLE_LABELS[data.role]}</Badge>
            </div>
            <p className="mt-1 text-[11px] text-ink/50">
              Only an authorized admin can change access or permissions.
            </p>
          </div>
        </div>
      </Panel>

      <Panel
        title="How the studio knows you"
        subtitle="These personal details do not grant permissions or change project records."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="staff-profile-name">Preferred name</Label>
            <Input
              id="staff-profile-name"
              autoComplete="name"
              maxLength={80}
              value={draft.displayName}
              onChange={(event) => {
                setSaved(false);
                setDraft((previous) =>
                  previous ? { ...previous, displayName: event.target.value } : previous,
                );
              }}
              placeholder="Name shown in the console"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="staff-profile-focus">What you work on (optional)</Label>
            <Input
              id="staff-profile-focus"
              maxLength={120}
              value={draft.workFocus}
              onChange={(event) => {
                setSaved(false);
                setDraft((previous) =>
                  previous ? { ...previous, workFocus: event.target.value } : previous,
                );
              }}
              placeholder="Project coordination"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="staff-profile-timezone">Your timezone</Label>
            <Input
              id="staff-profile-timezone"
              list="staff-profile-timezones"
              maxLength={60}
              value={draft.timezone}
              onChange={(event) => {
                setSaved(false);
                setDraft((previous) =>
                  previous ? { ...previous, timezone: event.target.value } : previous,
                );
              }}
              placeholder="Africa/Nairobi"
              className="mt-1"
            />
            <datalist id="staff-profile-timezones">
              {PROFILE_TIME_ZONES.map((timezone) => (
                <option key={timezone} value={timezone} />
              ))}
            </datalist>
            <p className="mt-1.5 text-[12px] text-muted">
              Use an IANA timezone such as Africa/Nairobi or Europe/London.
            </p>
          </div>
        </div>
        {dirty ? (
          <p className="mt-4 text-[12px] text-amber-800" role="status">
            You have unsaved profile changes.
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            disabled={!dirty || save.isPending || !draft.timezone.trim()}
            onClick={() => save.mutate({ data: draft })}
          >
            {save.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : saved ? (
              <Check className="size-4" />
            ) : null}
            {save.isPending ? "Saving…" : saved ? "Saved" : "Save profile"}
          </Button>
          {dirty && !discarding ? (
            <Button variant="ghost" onClick={() => setDiscarding(true)}>
              Cancel
            </Button>
          ) : null}
          {discarding ? (
            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Discard changes"
            >
              <span className="text-[12px] text-ink/65">Discard your unsaved changes?</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDraft(toDraft(data));
                  setDiscarding(false);
                  setSaved(false);
                }}
              >
                Discard changes
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDiscarding(false)}>
                Keep editing
              </Button>
            </div>
          ) : null}
          {saved && !dirty ? (
            <p className="text-[13px] text-emerald-700" role="status">
              Saved.
            </p>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}
