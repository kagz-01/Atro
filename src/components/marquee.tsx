import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
};

export function Marquee({
  children,
  speed = 40,
  className,
  pauseOnHover = true,
  direction = "left",
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(() => {
      if (contentRef.current) {
        setContentWidth(contentRef.current.offsetWidth / 2);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  const duration = contentWidth / speed;
  const dir = direction === "left" ? "normal" : "reverse";

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        ref={contentRef}
        className="flex w-max"
        style={{
          animationName: "marquee",
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: dir,
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

export function TestimonialMarquee() {
  const testimonials = [
    {
      quote: "ATRO turned our half-finished house into a home we are proud of. The quantities saved us from overspending.",
      author: "Wanjiku M.",
      role: "Homeowner, Kiambu",
    },
    {
      quote: "Working with them from London was seamless. Weekly photo updates, honest timelines, no surprises.",
      author: "David K.",
      role: "Diaspora Client, UK",
    },
    {
      quote: "The design studio understood our budget constraints and still delivered something beautiful.",
      author: "Sarah N.",
      role: "Architect, Nairobi",
    },
    {
      quote: "Professional, transparent, and they actually finish on time. Rare in this industry.",
      author: "James O.",
      role: "Developer, Mombasa",
    },
    {
      quote: "From concept to handover, every step was documented. No hidden costs, no drama.",
      author: "Grace W.",
      role: "Homeowner, Karen",
    },
    {
      quote: "They redesigned our office space and the team productivity actually improved. Form meeting function.",
      author: "Peter M.",
      role: "CEO, Tech Startup",
    },
  ];

  return (
    <div className="relative py-12">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-paper to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-paper to-transparent z-10 pointer-events-none" />

      <Marquee speed={30} pauseOnHover>
        <div className="flex gap-6 px-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="w-[350px] shrink-0 p-6 bg-cream border border-line/50 rounded-2xl hover:shadow-card transition-all duration-300"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="size-4 text-gold fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-ink/80 italic leading-relaxed">"{t.quote}"</p>
              <div className="mt-4 pt-4 border-t border-line/50">
                <p className="font-medium text-maroon text-sm">{t.author}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Marquee>
    </div>
  );
}

export function LogoMarquee() {
  const logos = [
    { name: "Nairobi County", icon: "🏛️" },
    { name: "KEBS Certified", icon: "✅" },
    { name: "Architects Assoc.", icon: "📐" },
    { name: "Green Building", icon: "🌿" },
    { name: "Quality Assured", icon: "⭐" },
    { name: "Safety First", icon: "🛡️" },
  ];

  return (
    <Marquee speed={20} pauseOnHover={false} className="py-8">
      <div className="flex items-center gap-12 px-6">
        {logos.map((l, i) => (
          <div key={i} className="flex items-center gap-3 text-muted/60 hover:text-maroon transition-colors duration-300">
            <span className="text-2xl">{l.icon}</span>
            <span className="text-[11px] uppercase tracking-[0.16em] font-medium whitespace-nowrap">{l.name}</span>
          </div>
        ))}
      </div>
    </Marquee>
  );
}
