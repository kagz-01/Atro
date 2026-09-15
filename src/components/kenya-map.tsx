import { Link } from "@tanstack/react-router";
import { ZONES, type ZoneStatus } from "@/lib/site";
import { useSiteStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ZoneStatus, string> = {
  active: "Active",
  limited: "Limited",
  request: "By request",
  diaspora: "Diaspora",
};

export function KenyaMap({
  selected,
  onSelect,
}: {
  selected?: string | null;
  onSelect?: (slug: string) => void;
}) {
  const setZone = useSiteStore((s) => s.setSelectedZone);
  const current = selected ?? null;

  function pick(slug: string) {
    setZone(slug);
    onSelect?.(slug);
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 relative bg-stone/60 border border-line rounded-md p-4 sm:p-8">
        <svg viewBox="0 0 200 260" className="w-full h-auto text-maroon" role="img" aria-label="Kenya coverage map">
          <path
            d="M96 10
               C118 12 142 28 156 48
               C172 72 184 98 188 128
               C191 154 186 176 174 196
               C162 218 150 236 132 246
               C112 256 92 258 74 250
               C52 240 36 222 28 200
               C18 176 10 158 22 146
               C8 132 10 118 18 102
               C24 86 16 72 28 56
               C42 34 66 16 96 10 Z"
            fill="currentColor"
            className="text-burgundy/90"
          />
          <path
            d="M18 168 C28 162 34 170 26 180 C16 188 12 176 18 168 Z"
            fill="var(--color-paper)"
            opacity="0.35"
          />
          {ZONES.filter((z) => z.status !== "diaspora").map((z) => {
            const active = current === z.slug;
            return (
              <g key={z.slug}>
                <circle
                  cx={z.cx * 2}
                  cy={z.cy * 2.2}
                  r={active ? 6.5 : 5}
                  className={cn(
                    active ? "fill-gold" : z.status === "active" ? "fill-gold-light" : "fill-paper/70",
                  )}
                />
                <text
                  x={z.cx * 2 + 8}
                  y={z.cy * 2.2 + 3}
                  className="fill-paper"
                  fontSize="8"
                  fontFamily="Outfit, sans-serif"
                >
                  {z.name}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted">
          Gold marks current delivery. The shape is Kenya — not a survey drawing.
        </p>
      </div>

      <div className="lg:col-span-5 space-y-2">
        {ZONES.map((z) => {
          const active = current === z.slug;
          return (
            <button
              key={z.slug}
              type="button"
              onClick={() => pick(z.slug)}
              className={cn(
                "w-full text-left border rounded-sm px-4 py-3 transition-colors",
                active
                  ? "border-burgundy bg-burgundy text-paper"
                  : "border-line bg-cream hover:border-burgundy",
              )}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-display text-xl">{z.name}</span>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-[0.16em]",
                    active ? "text-gold-light" : "text-muted",
                  )}
                >
                  {STATUS_LABEL[z.status]}
                </span>
              </span>
              <span className={cn("block text-sm mt-1", active ? "text-paper/80" : "text-ink/70")}>
                {z.coverage}
              </span>
            </button>
          );
        })}
        {current ? (
          <Link
            to="/zones/$slug"
            params={{ slug: current }}
            className="inline-flex mt-3 text-[12px] uppercase tracking-[0.16em] text-burgundy"
          >
            Open {ZONES.find((z) => z.slug === current)?.name} →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
