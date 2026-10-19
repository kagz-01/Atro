import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, LogOut, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import {
  getMyProfile,
  saveMyProfile,
  type ClientProfile,
} from "@/lib/profile-server";
import { CLIENT_TYPES } from "@/lib/profile";
import { formatPhone } from "@/lib/phone";
import { listMyDeliveries } from "@/lib/notify";
import { CHANNEL_NAMES, clientStatusLine, type Channel } from "@/lib/delivery";

/**
 * The client's own record, in their own words.
 *
 * The questions here are the ones the studio actually asks on a call: what to
 * call you, what number reaches you, where you are in the world (which decides
 * the timezone every call is quoted in), and whether we may text you. The
 * notification switches are a record of consent, not preferences — the studio
 * may only use a channel the client has switched on.
 */
export function ProfilePanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile({ data: undefined }),
  });

  // Stamped on success so the form can show "Saved" and then let it go — the
  // mutation result alone does not say "nothing changed since you last looked".
  const [savedAt, setSavedAt] = useState(0);
  const save = useMutation({
    mutationFn: saveMyProfile,
    onSuccess: (profile: ClientProfile) => {
      queryClient.setQueryData(["my-profile"], profile);
      void queryClient.invalidateQueries({ queryKey: ["my-portal"] });
      setSavedAt(Date.now());
    },
  });

  if (isLoading || !data) {
    return (
      <Panel title="Your profile">
        <div className="h-32 animate-pulse rounded-xl bg-ink/6" />
      </Panel>
    );
  }

  return (
    <ProfileForm
      profile={data}
      busy={save.isPending}
      error={save.error instanceof Error ? save.error.message : null}
      savedAt={savedAt}
      onSave={(next) => save.mutate({ data: next })}
      onAvatarChanged={() => void queryClient.invalidateQueries({ queryKey: ["my-profile"] })}
    />
  );
}

type Draft = {
  displayName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  timezone: string;
  clientType: string;
  company: string;
  about: string;
  language: string;
  notifyEmail: boolean;
  notifySms: boolean;
  notifyWhatsapp: boolean;
  sitePhotoConsent: boolean;
  referralSource: string;
};

const toDraft = (p: ClientProfile): Draft => ({
  displayName: p.displayName,
  phone: p.phone,
  email: p.email,
  city: p.city,
  country: p.country,
  timezone: p.timezone,
  clientType: p.clientType,
  company: p.company,
  about: p.about,
  language: p.language,
  notifyEmail: p.notifyEmail,
  notifySms: p.notifySms,
  notifyWhatsapp: p.notifyWhatsapp,
  sitePhotoConsent: p.sitePhotoConsent,
  referralSource: p.referralSource,
});

function ProfileForm({
  profile,
  busy,
  error,
  savedAt,
  onSave,
  onAvatarChanged,
}: {
  profile: ClientProfile;
  busy: boolean;
  error: string | null;
  /** Changes only when a save actually lands. */
  savedAt: number;
  onSave: (draft: Draft) => void;
  onAvatarChanged: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(profile));
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(!profile.displayName);

  // The profile can change under us after a save elsewhere; adopt it then.
  useEffect(() => {
    setDraft(toDraft(profile));
  }, [profile]);

  // Confirm the save, then stop claiming it: a "Saved" badge that never clears
  // stops meaning anything.
  useEffect(() => {
    if (!savedAt) return;
    setSaved(true);
    const timer = setTimeout(() => setSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [savedAt]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setSaved(false);
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const phonePreview = draft.phone.trim() ? formatPhone(draft.phone) : null;

  if (!editing) {
    return (
      <div className="space-y-5">
        <Panel
          title="Your profile"
          subtitle="How the studio reaches you"
          actions={
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
          }
        >
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Name", profile.displayName || "—"],
              ["Mobile", profile.phone ? formatPhone(profile.phone) : "Not added"],
              ["Email", profile.email || "Not added"],
              [
                "Where you are",
                [profile.city, profile.country].filter(Boolean).join(", ") || "—",
              ],
              ["Your timezone", profile.timezone || "Not set"],
              [
                "You are",
                CLIENT_TYPES.find((t) => t.value === profile.clientType)?.label ??
                  profile.clientType,
              ],
              ["Company", profile.company || "—"],
              ["Language", profile.language || "en"],
              ["How you found us", profile.referralSource || "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  {k}
                </dt>
                <dd className="mt-1.5 text-[13px] leading-snug text-ink/75">{v}</dd>
              </div>
            ))}
          </dl>

          {profile.about ? (
            <p className="mt-5 border-t border-ink/8 pt-5 text-[13px] leading-relaxed text-ink/65">
              {profile.about}
            </p>
          ) : null}
        </Panel>

        <Panel title="How we may contact you" subtitle="We only use what is switched on">
          <ul className="grid gap-3 sm:grid-cols-3">
            <Channel
              on={profile.notifyEmail}
              label="Email"
              detail={profile.email || "No address on file"}
            />
            <Channel
              on={profile.notifyWhatsapp}
              label="WhatsApp"
              detail={profile.phone ? formatPhone(profile.phone) : "No number on file"}
            />
            <Channel
              on={profile.notifySms}
              label="SMS"
              detail={profile.phone ? formatPhone(profile.phone) : "No number on file"}
            />
          </ul>
          <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-ink/55">
            <Badge tone="gold">{profile.sitePhotoConsent ? "Agreed" : "Not agreed"}</Badge>
            <span>
              {profile.sitePhotoConsent
                ? "You are happy for your project to be photographed for the record."
                : "You have asked us not to publish photographs of your project."}
            </span>
          </p>
        </Panel>

        <DeliveryLog />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Panel title="Your profile" subtitle="The studio calls you by this name">
        <AvatarUploader displayName={draft.displayName} onChanged={onAvatarChanged} />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="pf-name">Name</Label>
            <Input
              id="pf-name"
              value={draft.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              placeholder="Wanjiku Njeri"
              maxLength={80}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pf-phone">Mobile number</Label>
            <Input
              id="pf-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={draft.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+254 799 034 712"
              className="mt-1"
            />
            {phonePreview ? (
              <p className="mt-1.5 text-[12px] text-muted">Sends as {phonePreview}</p>
            ) : (
              <p className="mt-1.5 text-[12px] text-muted">
                Include the country code if you are outside Kenya.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="pf-email">Email</Label>
            <Input
              id="pf-email"
              type="email"
              autoComplete="email"
              value={draft.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pf-city">City</Label>
            <Input
              id="pf-city"
              value={draft.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="London"
              maxLength={60}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pf-country">Country</Label>
            <Input
              id="pf-country"
              value={draft.country}
              onChange={(e) => set("country", e.target.value)}
              placeholder="United Kingdom"
              maxLength={60}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pf-tz">Your timezone</Label>
            <Select
              id="pf-tz"
              value={draft.timezone}
              onChange={(e) => set("timezone", e.target.value)}
              className="mt-1"
            >
              <option value="">Not set</option>
              {[
                "Africa/Nairobi",
                "Africa/Lagos",
                "Africa/Johannesburg",
                "Europe/London",
                "Europe/Stockholm",
                "Asia/Dubai",
                "Asia/Qatar",
                "America/New_York",
                "America/Chicago",
                "America/Los_Angeles",
                "Australia/Sydney",
              ].map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-[12px] text-muted">
              Every call is quoted in your time, not ours.
            </p>
          </div>

          <div>
            <Label htmlFor="pf-type">You are</Label>
            <Select
              id="pf-type"
              value={draft.clientType}
              onChange={(e) => set("clientType", e.target.value)}
              className="mt-1"
            >
              {CLIENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="pf-company">Company (optional)</Label>
            <Input
              id="pf-company"
              value={draft.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Njeri Holdings Ltd"
              maxLength={120}
              className="mt-1"
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="pf-about">What you are building</Label>
            <Textarea
              id="pf-about"
              value={draft.about}
              onChange={(e) => set("about", e.target.value)}
              placeholder="Four bedrooms in Karen for my parents. I am in Dubai and will visit twice a year."
              maxLength={1000}
              className="mt-1 min-h-24"
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="pf-referral">How did you find us?</Label>
            <Input
              id="pf-referral"
              value={draft.referralSource}
              onChange={(e) => set("referralSource", e.target.value)}
              placeholder="A client, Instagram, a friend"
              maxLength={120}
              className="mt-1"
            />
          </div>
        </div>
      </Panel>

      <Panel
        title="How we may contact you"
        subtitle="We only use the channels you switch on"
      >
        <ul className="space-y-3">
          <Toggle
            id="pf-email-ok"
            label="Email"
            detail="Statements, certificates and receipts"
            on={draft.notifyEmail}
            onChange={(v) => set("notifyEmail", v)}
          />
          <Toggle
            id="pf-wa-ok"
            label="WhatsApp"
            detail="Quick updates and photographs from site"
            on={draft.notifyWhatsapp}
            onChange={(v) => set("notifyWhatsapp", v)}
          />
          <Toggle
            id="pf-sms-ok"
            label="SMS"
            detail="Only for things that need you today — a decision, a payment due"
            on={draft.notifySms}
            onChange={(v) => set("notifySms", v)}
            disabled={!draft.phone.trim()}
            disabledReason="Add a mobile number first"
          />
          <Toggle
            id="pf-photo-ok"
            label="Photographs of my project"
            detail="Site photographs are the record, and they are what let you approve a stage"
            on={draft.sitePhotoConsent}
            onChange={(v) => set("sitePhotoConsent", v)}
          />
        </ul>
      </Panel>

      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={busy || draft.displayName.trim().length < 2}
          onClick={() => onSave(draft)}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : null}
          {busy ? "Saving…" : saved ? "Saved" : "Save profile"}
        </Button>
        <Button variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
        {saved && !busy ? (
          <p className="text-[13px] text-emerald-700">
            Saved. We will use this when we call you.
          </p>
        ) : null}
      </div>
    </div>
  );
}

const DELIVERY_TONE: Record<string, "stone" | "gold" | "maroon" | "live" | "paper"> = {
  sent: "live",
  pending: "gold",
  skipped: "gold",
  suppressed: "stone",
  failed: "maroon",
};

/**
 * The switches above are a promise; this is the receipt.
 *
 * Every message aimed at the client lands here after the fact, including the
 * ones consent forbade — "switched off in your profile" is a sentence about
 * their own decision, which is exactly what makes the promise checkable. Raw
 * outbox detail (provider names, missing keys) is translated by
 * clientStatusLine before it reaches this page.
 */
function DeliveryLog() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-deliveries"],
    queryFn: () => listMyDeliveries({ data: undefined }),
  });

  if (isLoading || !data) {
    return (
      <Panel title="What we have sent you" subtitle="And what we were not allowed to">
        <div className="h-24 animate-pulse rounded-xl bg-ink/6" />
      </Panel>
    );
  }

  return (
    <Panel title="What we have sent you" subtitle="And what we were not allowed to">
      {data.length === 0 ? (
        <p className="text-[13px] text-ink/55">Nothing has been sent yet.</p>
      ) : (
        <ul className="space-y-2">
          {data.map((n) => (
            <li key={n.id} className="rounded-xl border border-ink/10 bg-cream p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <Badge tone={DELIVERY_TONE[n.status] ?? "stone"}>
                    {CHANNEL_NAMES[n.channel as Channel]}
                  </Badge>
                  <span className="text-[13px] text-maroon">{n.title}</span>
                </span>
                <span className="shrink-0 text-[11px] text-muted">
                  {n.createdAt
                    ? new Date(n.createdAt).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })
                    : ""}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] text-ink/55">
                {clientStatusLine(n.status, n.detail, n.channel)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Channel({ on, label, detail }: { on: boolean; label: string; detail: string }) {
  return (
    <li className="rounded-xl border border-ink/10 p-4">
      <p className="flex items-center gap-2 text-[13px] text-maroon">
        {on ? (
          <Check className="size-4 text-emerald-600" />
        ) : (
          <LogOut className="size-4 text-ink/30" />
        )}
        {label}
      </p>
      <p className="mt-1 text-[12px] text-ink/55">{detail}</p>
      <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-muted">
        {on ? "Switched on" : "Not used"}
      </p>
    </li>
  );
}

function Toggle({
  id,
  label,
  detail,
  on,
  onChange,
  disabled,
  disabledReason,
}: {
  id: string;
  label: string;
  detail: string;
  on: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-xl border border-ink/10 p-4">
      <label htmlFor={id} className="min-w-0">
        <span className="flex items-center gap-2 text-[13px] text-maroon">
          <UserRound className="size-3.5 text-gold" />
          {label}
        </span>
        <span className="mt-1 block text-[12px] leading-snug text-ink/55">
          {disabled ? disabledReason : detail}
        </span>
      </label>
      <label className="relative inline-block shrink-0 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          checked={on}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="block h-6 w-11 rounded-full bg-ink/15 transition-colors peer-checked:bg-emerald-600 peer-disabled:opacity-40 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
        />
      </label>
    </li>
  );
}
