import { useRef, useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(3px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
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
  const words = text.split(" ");

  return (
    <Tag className={cn("overflow-hidden", className)} aria-label={text}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: delay / 1000, staggerChildren: staggerDelay / 1000 }}
        className="flex flex-wrap"
        aria-hidden="true"
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block mr-[0.3em]"
            variants={{
              hidden: { opacity: 0, y: "100%" },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
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
  const started = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          if (prefersReducedMotion) {
            setCount(end);
            observer.disconnect();
            return;
          }
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) frame = requestAnimationFrame(animate);
          };
          frame = requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [end, duration, prefersReducedMotion]);

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
