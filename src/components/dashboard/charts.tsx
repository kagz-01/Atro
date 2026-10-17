import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIsHydrated } from "@/lib/use-is-hydrated";
import { cn } from "@/lib/utils";

/**
 * Charts for the studio console and the client portal.
 *
 * Recharts measures its container, which does not exist during SSR — so every
 * chart waits for hydration and shows a same-height placeholder first. That keeps
 * the server tree and the first client tree identical instead of reconciling a
 * chart against an empty <div>.
 */

const MAROON = "var(--color-maroon)";
const BURGUNDY = "var(--color-burgundy)";
const GOLD = "var(--color-gold)";
const GOLD_LIGHT = "var(--color-gold-light)";

/** Brand ramp, ordered so adjacent slices stay distinguishable. */
const SERIES_COLORS = [MAROON, GOLD, BURGUNDY, GOLD_LIGHT, "#8a6a3b"];

function Placeholder({ className, height }: { className?: string; height?: number }) {
  return (
    <div
      className={cn("w-full animate-pulse rounded-xl bg-ink/6", className)}
      style={height ? { height } : undefined}
      aria-hidden
    />
  );
}

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid rgba(60,5,8,0.10)",
  boxShadow: "0 8px 30px rgba(60,5,8,0.10)",
  fontSize: "12px",
  padding: "8px 10px",
} as const;

/** Tiny trend line for a KPI card. */
export function Sparkline({ data, height = 40 }: { data: number[]; height?: number }) {
  const hydrated = useIsHydrated();
  if (!hydrated) return <Placeholder height={height} />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data.map((value, i) => ({ i, value }))} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
        <defs>
          <linearGradient id="atro-spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={GOLD}
          strokeWidth={2}
          fill="url(#atro-spark)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export type Slice = { name: string; value: number; color?: string };

/** Donut with the total in the middle — the "where the money sits" panel. */
export function Donut({
  data,
  centerLabel,
  centerValue,
  height = 220,
  formatValue,
}: {
  data: Slice[];
  centerLabel?: string;
  centerValue?: string;
  height?: number;
  formatValue?: (n: number) => string;
}) {
  const hydrated = useIsHydrated();
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!hydrated) return <Placeholder height={height} />;
  if (total <= 0) {
    return (
      <div className="grid place-items-center text-[13px] text-muted" style={{ height }}>
        Nothing recorded yet.
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="68%"
            outerRadius="92%"
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color ?? SERIES_COLORS[i % SERIES_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number | string) => [
              formatValue ? formatValue(Number(v)) : String(v),
              "",
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {centerValue ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-display text-2xl leading-tight text-maroon">{centerValue}</p>
            {centerLabel ? (
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-muted">
                {centerLabel}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type BarSeries = { key: string; label: string; color: string };

/** Grouped bars — contract value against what has actually been collected. */
export function GroupedBars({
  data,
  series,
  height = 260,
  formatValue,
}: {
  data: Record<string, string | number>[];
  series: BarSeries[];
  height?: number;
  formatValue?: (n: number) => string;
}) {
  const hydrated = useIsHydrated();
  if (!hydrated) return <Placeholder className="w-full" />;
  if (data.length === 0) {
    return (
      <div className="grid place-items-center text-[13px] text-muted" style={{ height }}>
        No projects to chart yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,5,8,0.08)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "rgba(60,5,8,0.55)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "rgba(60,5,8,0.45)" }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickFormatter={(v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : `${v / 1000}k`)}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number | string, name: string) => [
            formatValue ? formatValue(Number(v)) : String(v),
            name,
          ]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
        />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={s.color}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Enquiries per month as a column chart. */
export function MonthlyColumns({
  data,
  height = 200,
  color = GOLD,
}: {
  data: { label: string; enquiries: number }[];
  height?: number;
  color?: string;
}) {
  const hydrated = useIsHydrated();
  if (!hydrated) return <Placeholder className="w-full" />;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,5,8,0.08)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "rgba(60,5,8,0.55)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "rgba(60,5,8,0.45)" }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="enquiries" name="Enquiries" fill={color} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Semicircular gauge for a single percentage. */
export function Gauge({
  value,
  label,
  caption,
  height = 170,
}: {
  value: number;
  label?: string;
  caption?: string;
  height?: number;
}) {
  const hydrated = useIsHydrated();
  const clamped = Math.max(0, Math.min(100, value));
  const data = [
    { name: "done", value: clamped },
    { name: "left", value: 100 - clamped },
  ];

  if (!hydrated) return <Placeholder className="mx-auto w-full" />;

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="72%"
            startAngle={90}
            endAngle={-90}
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill={GOLD} />
            <Cell fill="rgba(60,5,8,0.08)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 bottom-1 text-center">
        <p className="font-display text-2xl leading-none text-maroon">
          {Math.round(clamped)}%
        </p>
        {label ? (
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
        ) : null}
        {caption ? <p className="mt-0.5 text-[11px] text-ink/50">{caption}</p> : null}
      </div>
    </div>
  );
}
