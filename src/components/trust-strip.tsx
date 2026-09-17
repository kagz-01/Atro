import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useRevealOnScroll } from "@/hooks/use-reveal";

type CounterProps = {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
};

export function AnimatedCounter({ end, suffix = "", prefix = "", duration = 2000, className }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}{count}{suffix}
    </span>
  );
}

const STATS = [
  { value: 85, suffix: "+", label: "Projects completed", description: "Residential, commercial and institutional" },
  { value: 8, suffix: "", label: "Years in operation", description: "Nairobi studio since 2018" },
  { value: 7, suffix: "", label: "Zones covered", description: "From Nairobi to the Coast" },
  { value: 95, suffix: "%", label: "Client satisfaction", description: "Based on post-project surveys" },
];

export function TrustStrip() {
  const { ref, revealed } = useRevealOnScroll();

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-maroon" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-burgundy/50 via-maroon to-maroon" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-burgundy/30 rounded-full blur-[100px]" />
      </div>

      <div ref={ref} className={cn("relative mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 lg:px-16 py-16 md:py-20 reveal-on-scroll", revealed && "revealed")}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {STATS.map((stat, i) => {
            const { ref: cardRef, revealed: cardRevealed } = useRevealOnScroll();
            return (
              <div
                key={stat.label}
                ref={cardRef}
                className={cn(
                  "reveal-on-scroll text-center md:text-left p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300",
                  cardRevealed && "revealed",
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  className="font-display text-4xl md:text-5xl text-gradient-gold"
                />
                <p className="mt-3 text-sm font-medium text-paper">{stat.label}</p>
                <p className="mt-1 text-xs text-paper/60">{stat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
