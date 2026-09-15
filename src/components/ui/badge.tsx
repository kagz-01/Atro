import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "stone",
  children,
}: {
  className?: string;
  tone?: "stone" | "gold" | "maroon" | "live" | "paper";
  children: ReactNode;
}) {
  const tones = {
    stone: "bg-stone text-ink",
    gold: "bg-gold/15 text-burgundy border border-gold/40",
    maroon: "bg-maroon text-paper",
    live: "bg-burgundy text-paper",
    paper: "bg-paper/15 text-paper border border-paper/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center h-7 px-2.5 text-[10px] uppercase tracking-[0.16em] font-medium rounded-xs",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
