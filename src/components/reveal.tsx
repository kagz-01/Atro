import type { CSSProperties, ReactNode } from "react";
import { useRevealOnScroll } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

/**
 * Scroll-reveal wrapper. A hook cannot be called inside a `.map()` callback,
 * so per-item reveals go through this component instead.
 */
export function Reveal({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const { ref, revealed } = useRevealOnScroll();

  return (
    <div
      ref={ref}
      className={cn("reveal-on-scroll", revealed && "revealed", className)}
      style={style}
    >
      {children}
    </div>
  );
}
