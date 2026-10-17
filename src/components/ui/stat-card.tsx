import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/dashboard/charts";

/**
 * A single headline number with its trend.
 *
 * The icon is decorative — the label carries the meaning — so it is hidden from
 * assistive tech rather than read out as a stray word before every figure.
 */
export function StatCard({
  label,
  value,
  exact,
  sub,
  icon: Icon,
  trend,
  tone = "default",
  className,
}: {
  label: string;
  value: string;
  /** The unabbreviated figure, kept for the tooltip and for screen readers. */
  exact?: string;
  sub?: string;
  icon?: LucideIcon;
  /** Series for the sparkline; omit for a flat card. */
  trend?: { data: number[] };
  tone?: "default" | "good" | "warn" | "bad";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink/10 bg-white p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {label}
          </p>
          <p
            title={exact}
            className={cn(
              "mt-2 font-display text-2xl leading-tight tracking-tight",
              tone === "good" && "text-emerald-700",
              tone === "warn" && "text-amber-700",
              tone === "bad" && "text-burgundy",
              tone === "default" && "text-maroon",
            )}
          >
            {value}
          </p>
        </div>
        {Icon ? (
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-maroon/8 text-maroon">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
      </div>

      {sub ? <p className="mt-2 text-[12px] leading-snug text-ink/55">{sub}</p> : null}

      {trend && trend.data.length > 1 ? (
        <div className="-mx-1 mt-3">
          <Sparkline data={trend.data} />
        </div>
      ) : null}
    </div>
  );
}
