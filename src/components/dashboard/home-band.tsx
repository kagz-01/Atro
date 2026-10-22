// Two homes, one portal.
//
// A client who lives down the road and a client eight time zones away open
// the same dashboard, and for both the first screen has to answer "where is
// my building and what do I do next" — but not in the same words. The local
// home leads with the ground: the site's city, the call on the site's clock,
// and the paybill you can send to from anywhere in the country. The abroad
// home leads with the distance: both clocks at once, what changed while they
// slept, and the wire details their bank asks for.
//
// Both halves read real data — the studio's own next-call wording, the
// payment sheets the console wrote (portal_payment_instructions), the visit
// flow and the activity feed. Nothing here is decorative copy about a
// lifestyle; the difference is which facts a distant client needs first.

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ArrowRight, Globe, MapPin, MessageSquare, MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomeSection } from "@/lib/home-band";
import { nextCallLine } from "@/lib/home-band";
import { pickInstructions } from "@/lib/how-to-pay";
import { getMyHowToPay } from "@/lib/how-to-pay-server";
import { isHomeZone, zonedClock } from "@/lib/tz";
import type { ProjectRecord } from "@/lib/diaspora/server";

const SITE_ZONE = "Africa/Nairobi";

function Caption({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
      {icon}
      {children}
    </p>
  );
}

function usePayLine(projectId: string, abroad: boolean): string {
  const { data } = useQuery({
    queryKey: ["how-to-pay", projectId],
    queryFn: () => getMyHowToPay({ data: { projectId } }),
  });
  const text = pickInstructions(data?.local ?? "", data?.international ?? "", abroad);
  // Two lines: enough for the paybill account at home and for bank + SWIFT
  // abroad — the parts someone reads out at a counter — with the full sheet
  // one button away in Money.
  return text.split("\n").slice(0, 2).join("\n");
}

/** The home a client in the country opens: the ground, the clock, the paybill. */
export function LocalHomeBand({
  project,
  onGoMoney,
}: {
  project: ProjectRecord;
  onGoMoney: () => void;
}) {
  const call = nextCallLine(project.nextCall, false);
  const payLine = usePayLine(project.id, false);

  return (
    <section className="grid gap-5 rounded-2xl border border-ink/10 bg-cream p-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="min-w-0">
        <Caption icon={<MapPin className="size-3.5" aria-hidden />}>At home</Caption>
        <h2 className="mt-2 font-display text-xl leading-tight text-maroon">
          Your site in {project.clientCity || "Kenya"}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-ink/65">
          {call
            ? `Next call — ${call}`
            : "No call scheduled yet — send the studio a message and it lands on this screen."}
        </p>
        <p className="mt-2 text-[12px] text-muted">
          {project.stage} · {project.area || project.plot}
        </p>
      </div>

      {payLine ? (
        <div className="min-w-0 rounded-xl border border-ink/10 bg-white p-4">
          <Caption icon={<MapPin className="size-3.5" aria-hidden />}>How you pay</Caption>
          <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink/70">
            {payLine}
          </p>
          <Button size="sm" variant="ghost" className="mt-3" onClick={onGoMoney}>
            See how to pay <ArrowRight className="size-3.5" />
          </Button>
        </div>
      ) : null}
    </section>
  );
}

/** The home a client opens from another country: both clocks, the distance, the wire. */
export function AbroadHomeBand({
  project,
  zone,
  away: { activity, messages, decisions },
  onGo,
  onGoMoney,
}: {
  project: ProjectRecord;
  zone: string;
  away: { activity: number; messages: number; decisions: number };
  onGo: (section: HomeSection) => void;
  onGoMoney: () => void;
}) {
  const call = nextCallLine(project.nextCall, true);
  const payLine = usePayLine(project.id, true);

  const now = new Date().toISOString();
  const siteClock = zonedClock(now, SITE_ZONE);
  const yourClock = zone && !isHomeZone(zone) ? zonedClock(now, zone) : null;
  const chips = [
    { key: "activity", count: activity, label: "new updates", section: null as HomeSection | null },
    { key: "messages", count: messages, label: "unread messages", section: "messages" as HomeSection },
    { key: "decisions", count: decisions, label: "decisions open", section: "decisions" as HomeSection },
  ].filter((c) => c.count > 0);

  return (
    <section className="grid gap-5 rounded-2xl border border-gold/40 bg-gold/10 p-5 xl:grid-cols-[1.2fr_1fr_1fr]">
      <div className="min-w-0">
        <Caption icon={<Globe className="size-3.5" aria-hidden />}>Building in Kenya, living abroad</Caption>
        <div className="mt-3 flex flex-wrap gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-maroon">Nairobi</p>
            <p className="font-display text-2xl text-maroon">{siteClock?.clock ?? "—"}</p>
          </div>
          {yourClock ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-maroon">
                {project.clientCity || yourClock.zone}
              </p>
              <p className="font-display text-2xl text-maroon">{yourClock.clock}</p>
            </div>
          ) : null}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-ink/65">
          {call
            ? `Next call — ${call}`
            : "No call scheduled yet — message the studio and it lands here, in your time."}
        </p>
      </div>

      <div className="min-w-0">
        <Caption icon={<MessageSquareWarning className="size-3.5" aria-hidden />}>
          While you were away
        </Caption>
        {chips.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => (chip.section ? onGo(chip.section) : undefined)}
                className={
                  chip.section
                    ? "flex items-center gap-1.5 rounded-full border border-gold/50 bg-white px-3 py-1.5 text-[12px] text-maroon transition-colors hover:border-burgundy/40"
                    : "flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/70 px-3 py-1.5 text-[12px] text-ink/70"
                }
              >
                <MessageSquare className="size-3.5" aria-hidden />
                <strong className="font-semibold">{chip.count}</strong> {chip.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-[13px] leading-relaxed text-ink/65">
            Nothing changed since your last visit. The site keeps running either way.
          </p>
        )}
        <button
          type="button"
          onClick={() => onGo("abroad")}
          className="mt-3 flex items-center gap-1 text-[12px] text-burgundy underline decoration-gold decoration-2 underline-offset-4"
        >
          Open the abroad checklist <ArrowRight className="size-3.5" />
        </button>
      </div>

      {payLine ? (
        <div className="min-w-0 rounded-xl border border-ink/10 bg-white p-4">
          <Caption icon={<Globe className="size-3.5" aria-hidden />}>How you pay</Caption>
          <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink/70">
            {payLine}
          </p>
          <Button size="sm" variant="ghost" className="mt-3" onClick={onGoMoney}>
            See the full instructions <ArrowRight className="size-3.5" />
          </Button>
        </div>
      ) : null}
    </section>
  );
}
