// Two homes, one portal.
//
// A client who lives down the road and a client eight time zones away open
// the same dashboard, and for both the first screen has to answer "where is
// my building and what do I do next" — but not in the same words. The local
// home leads with the ground and the site's clock; the abroad home leads with
// the distance, both clocks, and changes since the client's visit.

import type { ReactNode } from "react";
import {
  ArrowRight,
  CreditCard,
  Globe,
  MapPin,
  MessageSquare,
  MessageSquareWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomeSection } from "@/lib/home-band";
import { nextCallLine } from "@/lib/home-band";
import { isHomeZone, zonedClock } from "@/lib/tz";
import type { ProjectRecord } from "@/lib/diaspora/server";
import type { Payment } from "@/lib/diaspora/portal";

const SITE_ZONE = "Africa/Nairobi";

function Caption({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
      {icon}
      {children}
    </p>
  );
}

function PaymentCallout({
  payable,
  onGoMoney,
  abroad,
  readOnly,
}: {
  payable: Payment | null;
  onGoMoney: () => void;
  abroad: boolean;
  readOnly: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-ink/10 bg-white p-4">
      <Caption icon={<CreditCard className="size-3.5" aria-hidden />}>
        {payable && !readOnly
          ? "Stage approved for payment"
          : payable
            ? "Approved payment stage"
            : "Project payments"}
      </Caption>
      {payable ? (
        <>
          <p className="mt-2 text-[13px] font-medium text-maroon">{payable.label}</p>
          <p className="mt-1 text-[13px] text-ink/70">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
              maximumFractionDigits: 0,
            }).format(payable.amount)}
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-ink/60">
            {readOnly
              ? "This stage is shown for reference. Payments cannot be started from a read-only preview."
              : "Review the stage and amount, then continue to secure Paystack checkout."}
          </p>
        </>
      ) : (
        <p className="mt-2 text-[13px] leading-relaxed text-ink/65">
          {abroad
            ? "Only stages approved by ATRO can be paid. When one is ready, review it and pay in KES through hosted Paystack checkout."
            : "Only stages approved by ATRO can be paid. When one is ready, review it and pay securely through Paystack checkout."}
        </p>
      )}
      {readOnly ? (
        <p className="mt-2 text-[12px] text-ink/55">
          Checkout is unavailable in this read-only preview.
        </p>
      ) : null}
      <Button size="sm" variant="ghost" className="mt-3" onClick={onGoMoney}>
        {payable && !readOnly ? "Review & pay" : "View payment ledger"}{" "}
        <ArrowRight className="size-3.5" />
      </Button>
    </div>
  );
}

/** The home a client in the country opens: the ground and the site's clock. */
export function LocalHomeBand({
  project,
  payablePayment,
  readOnly,
  onGoMoney,
  onGoMessages,
}: {
  project: ProjectRecord;
  payablePayment: Payment | null;
  readOnly: boolean;
  onGoMoney: () => void;
  onGoMessages: () => void;
}) {
  const call = nextCallLine(project.nextCall, false);

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
            : "No call scheduled yet. Message the studio to arrange one."}
        </p>
        {!call ? (
          <Button
            size="sm"
            variant="ghost"
            className="mt-2"
            onClick={onGoMessages}
          >
            Message the studio <ArrowRight className="size-3.5" />
          </Button>
        ) : null}
        <p className="mt-2 text-[12px] text-muted">
          {project.stage} · {project.area || project.plot}
        </p>
      </div>

      <PaymentCallout
        payable={payablePayment}
        onGoMoney={onGoMoney}
        abroad={false}
        readOnly={readOnly}
      />
    </section>
  );
}

/** The home a client opens from another country: both clocks and the distance. */
export function AbroadHomeBand({
  project,
  zone,
  payablePayment,
  readOnly,
  away: { activity, messages, decisions },
  onGo,
  onGoActivity,
  onGoMoney,
}: {
  project: ProjectRecord;
  zone: string;
  payablePayment: Payment | null;
  readOnly: boolean;
  away: { activity: number; messages: number; decisions: number };
  onGo: (section: HomeSection) => void;
  onGoActivity: () => void;
  onGoMoney: () => void;
}) {
  const call = nextCallLine(project.nextCall, true);

  const now = new Date().toISOString();
  const siteClock = zonedClock(now, SITE_ZONE);
  const yourClock = zone && !isHomeZone(zone) ? zonedClock(now, zone) : null;
  const allChips: { key: "activity" | "messages" | "decisions"; count: number; label: string }[] = [
    { key: "activity", count: activity, label: "new updates" },
    { key: "messages", count: messages, label: "unread messages" },
    { key: "decisions", count: decisions, label: "decisions open" },
  ];
  const chips = allChips.filter((chip) => chip.count > 0);

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
            : "No call scheduled yet. Message the studio to arrange one in your time."}
        </p>
        {!call ? (
          <Button
            size="sm"
            variant="ghost"
            className="mt-2"
            onClick={() => onGo("messages")}
          >
            Message the studio <ArrowRight className="size-3.5" />
          </Button>
        ) : null}
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
                onClick={() => {
                  if (chip.key === "activity") onGoActivity();
                  else onGo(chip.key);
                }}
                className="flex items-center gap-1.5 rounded-full border border-gold/50 bg-white px-3 py-1.5 text-[12px] text-maroon transition-colors hover:border-burgundy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon focus-visible:ring-offset-2"
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

      <PaymentCallout
        payable={payablePayment}
        onGoMoney={onGoMoney}
        abroad
        readOnly={readOnly}
      />
    </section>
  );
}
