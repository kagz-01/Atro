import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

export function Accordion({ children, className = "" }: AccordionProps) {
  return (
    <div className={cn("border border-ink/10 rounded-2xl bg-white", className)}>
      {children}
    </div>
  );
}

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function AccordionItem({
  title,
  children,
  className = "",
  defaultOpen = false,
}: AccordionItemProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-t border-ink/10 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-3 p-5 text-left text-[13px] font-display text-maroon hover:bg-cream",
          className,
        )}
      >
        <span className="flex-1">{title}</span>
        <span className="size-5 shrink-0">
          <span className={cn(
            "block h-1.5 w-5 rounded transition-transform duration-200",
            open ? "rotate-180" : "",
          )} />
        </span>
      </button>
      {open && (
        <div className="border-t border-ink/10 bg-cream p-5">{children}</div>
      )}
    </div>
  );
}