import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A dashboard panel: a titled card with an optional actions slot.
 *
 * Every panel in the console and the portal uses this so headers line up, the
 * padding never drifts between screens, and the action slot always lands in the
 * same place.
 */
export function Panel({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl border border-ink/10 bg-white shadow-card",
        className,
      )}
    >
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-[15px] leading-snug text-maroon">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 text-[12px] leading-snug text-muted">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn("flex-1 p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
