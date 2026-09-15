import { useRef, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ScrollRevealTextProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollRevealText({
  children,
  className,
  delay = 0,
}: ScrollRevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-1000 ease-out",
        visible
          ? "opacity-100 translate-y-0 blur-0"
          : "opacity-0 translate-y-8 blur-[2px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type SplitTextProps = {
  text: string;
  className?: string;
  tag?: "h1" | "h2" | "h3" | "p";
  delay?: number;
  staggerDelay?: number;
};

export function SplitText({
  text,
  className,
  tag: Tag = "h2",
  delay = 0,
  staggerDelay = 30,
}: SplitTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const words = text.split(" ");

  return (
    <Tag className={cn("overflow-hidden", className)}>
      <div ref={ref} className="flex flex-wrap">
        {words.map((word, i) => (
          <span
            key={i}
            className="inline-block mr-[0.3em]"
            style={{
              transition: `opacity 600ms ease ${i * staggerDelay}ms, transform 600ms ease ${i * staggerDelay}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(100%)",
            }}
          >
            {word}
          </span>
        ))}
      </div>
    </Tag>
  );
}

type CountUpProps = {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
};

export function CountUp({
  end,
  suffix = "",
  prefix = "",
  duration = 2000,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
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
  }, [end, duration, started]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}{count}{suffix}
    </span>
  );
}

type FloatingElementProps = {
  children: ReactNode;
  className?: string;
  speed?: number;
  range?: number;
};

export function FloatingElement({
  children,
  className,
  speed = 2,
  range = 20,
}: FloatingElementProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setOffset(Math.sin(Date.now() / 1000 / speed) * range);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [speed, range]);

  return (
    <div
      className={cn("pointer-events-none", className)}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </div>
  );
}
