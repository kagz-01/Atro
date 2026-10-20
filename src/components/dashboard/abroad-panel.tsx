import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { channelsFor, journeyStageFor, reachLine } from "@/lib/abroad";
import { WalkthroughPanel } from "@/components/dashboard/presence-panel";
import { formatPhone } from "@/lib/phone";
import { getMyProfile } from "@/lib/profile-server";
import { clientZone, isHomeZone, zonedClock } from "@/lib/tz";
import type { PortalPayload } from "@/lib/diaspora/server";

/**
 * The section that only exists for a client who lives abroad.
 *
 * The record itself is identical to any other client's — same milestones, same
 * ledger, same approvals — and it should be: distance does not change what
 * happened on site. What distance changes is everything around the record, and
 * that is what this panel carries: the journey stage written for checking from
 * a distance, the next call quoted on their clock as well as EAT, and an honest
 * line about which channels can actually reach them, since their consent
 * switches — not the studio's convenience — decide that. It also carries the
 * track's half of presence: walkthroughs the studio filmed, which is the
 * attendance this section exists to replace.
 *
 * A card is omitted rather than fudged when its answer is unknown: no journey
 * match means no "here is where you are", and no zone means an invitation to
 * set one, never a guessed conversion.
 */
export function AbroadPanel({
  project,
  milestones,
  onOpenProfile,
}: {
  project: PortalPayload["project"];
  milestones: PortalPayload["milestones"];
  onOpenProfile: () => void;
}) {
  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile({ data: undefined }),
  });

  const zone = clientZone(profile?.timezone ?? "", project.clientTz);
  const clock =
    project.nextCall.at && zone && !isHomeZone(zone)
      ? zonedClock(project.nextCall.at, zone)
      : null;

  const active =
    milestones.find((m) => m.status === "active") ??
    [...milestones].reverse().find((m) => m.status === "complete") ??
    null;
  const stage = active ? journeyStageFor(active.name) : null;

  const channels = channelsFor({
    email: profile?.notifyEmail ?? true,
    whatsapp: profile?.notifyWhatsapp ?? true,
    sms: profile?.notifySms ?? false,
  });

  return (
    <div className="space-y-5">
      <Panel title="From abroad" subtitle="What changes when you are not in the country">
        <p className="text-[14px] leading-relaxed text-ink/75">
          Your record is the same one the studio works from — nothing about the build is
          softened for distance. What this page adds is the part that normally depends on
          being there: the stage you are at written for checking from a distance, calls
          quoted on your clock as well as the site's, and the channels that can actually
          reach you. Every switch here is yours, in your profile.
        </p>
      </Panel>

      {/* The abroad track's half of the presence split: the building walked
          on camera, delivered to the same record. */}
      <WalkthroughPanel projectId={project.id} />

      {stage ? (
        <Panel
          title="Where you are in the journey"
          subtitle={`${stage.phase} · ${stage.duration} · ${stage.costShare} of the build`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-[17px] text-maroon">{stage.name}</h3>
            {active ? <Badge tone="gold">{active.name}</Badge> : null}
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-ink/75">{stage.summary}</p>

          <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-maroon">
              From a distance
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink/80">
              {stage.fromAbroad}
            </p>
          </div>

          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/guides/journey">The whole journey, stage by stage</Link>
            </Button>
          </div>
        </Panel>
      ) : null}

      <Panel title="Your calls, in your time" subtitle="The site keeps EAT — you do not have to">
        <p className="text-[15px] text-maroon">{project.nextCall.when}</p>
        {clock ? (
          <p className="mt-1.5 text-[13px] text-ink/65">
            {clock.clock} {clock.zone} — your time, not a time you have to convert
          </p>
        ) : !zone ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-[13px] text-ink/60">
              Your timezone is not set, so this call cannot be quoted on your clock yet.
            </p>
            <Button variant="outline" size="sm" onClick={onOpenProfile}>
              Set your timezone
            </Button>
          </div>
        ) : isHomeZone(zone) ? (
          <p className="mt-1.5 text-[13px] text-ink/65">
            You and the site are both on EAT — there is no conversion to make.
          </p>
        ) : null}
      </Panel>

      <Panel title="How we reach you" subtitle="Consent, not settings — only what is switched on">
        <p className="text-[14px] leading-relaxed text-ink/75">{reachLine(channels)}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          <li className="rounded-xl border border-ink/10 bg-cream p-3">
            <Badge tone="maroon">On</Badge>{" "}
            <span className="text-[13px] font-medium text-ink">The portal</span>
            <p className="mt-1 text-[12px] text-muted">Everything also lands here.</p>
          </li>
          <li className="rounded-xl border border-ink/10 bg-cream p-3">
            <Badge tone={channels.includes("email") ? "maroon" : "stone"}>
              {channels.includes("email") ? "On" : "Off"}
            </Badge>{" "}
            <span className="text-[13px] font-medium text-ink">Email</span>
            <p className="mt-1 text-[12px] text-muted">
              {profile?.email || "No address on file"}
            </p>
          </li>
          <li className="rounded-xl border border-ink/10 bg-cream p-3">
            <Badge tone={channels.includes("whatsapp") ? "maroon" : "stone"}>
              {channels.includes("whatsapp") ? "On" : "Off"}
            </Badge>{" "}
            <span className="text-[13px] font-medium text-ink">WhatsApp</span>
            <p className="mt-1 text-[12px] text-muted">
              {profile?.phone ? formatPhone(profile.phone) : "No number on file"}
            </p>
          </li>
        </ul>
        <div className="mt-4">
          <Button variant="ghost" size="sm" onClick={onOpenProfile}>
            Switch them in your profile
          </Button>
        </div>
      </Panel>
    </div>
  );
}
