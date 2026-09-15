import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
  return (
    <section className="bg-maroon text-paper border-t border-gold/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <AnimatedCounter
                end={stat.value}
                suffix={stat.suffix}
                className="font-display text-4xl md:text-5xl text-gold"
              />
              <p className="mt-2 text-sm font-medium text-paper">{stat.label}</p>
              <p className="mt-1 text-xs text-paper/60">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
