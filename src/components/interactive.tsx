import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
};

export function TiltCard({
  children,
  className,
  intensity = 20,
  glare = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setTilt({
        rotateX: (y - 0.5) * -intensity,
        rotateY: (x - 0.5) * intensity,
      });
      setGlarePos({ x: x * 100, y: y * 100 });
    },
    [intensity],
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn("relative perspective-[1000px]", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      {glare && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
          }}
        />
      )}
    </div>
  );
}

type BeforeAfterSliderProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
};

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPos(percent);
  }, []);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition],
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden rounded-2xl cursor-ew-resize select-none", className)}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* After image (full) */}
      <img
        src={afterSrc}
        alt={afterLabel}
        className="w-full h-full object-cover"
        draggable={false}
      />

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="w-full h-full object-cover"
          style={{ width: `${containerRef.current?.offsetWidth || 1000}px`, maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-1">
            <svg className="size-4 text-maroon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <svg className="size-4 text-maroon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-maroon/80 backdrop-blur-sm text-white text-[11px] uppercase tracking-wider rounded-full">
        {beforeLabel}
      </div>
      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-gold/90 backdrop-blur-sm text-maroon text-[11px] uppercase tracking-wider rounded-full">
        {afterLabel}
      </div>
    </div>
  );
}
