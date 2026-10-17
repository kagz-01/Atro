import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Collapsible sections for the studio console.
 *
 * The console and the enquiries inbox both present more detail than anyone wants
 * open at once, and on a phone that scroll is the whole page. Collapsing costs
 * almost nothing and puts the first screen back where it belongs.
 *
 * The header is a real <button> with aria-expanded/aria-controls, so the state is
 * announced rather than only drawn.
 */
export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export function AccordionItem({
  title,
  hint,
  children,
  className,
  headerClassName,
  contentClassName,
  defaultOpen = false,
}: {
  title: string;
  /** Optional count or status shown on the right of the header. */
  hint?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-ink/10 bg-white",
        open && "border-burgundy/25",
        className,
      )}
    >
      <h3>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn(
            "flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-cream",
            headerClassName,
          )}
        >
          <span className="flex-1 font-display text-[15px] leading-snug text-maroon">
            {title}
          </span>
          {hint ? (
            <span className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-muted">
              {hint}
            </span>
          ) : null}
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-ink/35 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      </h3>
      <div
        id={panelId}
        hidden={!open}
        className={cn("border-t border-ink/10 bg-cream px-5 py-5", contentClassName)}
      >
        {open ? children : null}
      </div>
    </section>
  );
}
