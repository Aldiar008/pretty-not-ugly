import { useMemo, useState } from "react";

export interface SpiderDatum {
  category: string;
  score: number; // 0..100
  goal?: number; // 0..100 (optional target)
}

interface Props {
  data: SpiderDatum[];
  size?: number;
  max?: number;
  /** Default goal applied when datum has no explicit `goal`. */
  defaultGoal?: number;
}

/**
 * Lightweight self-contained SVG radar/spider chart with interactive tooltips
 * and an inline current/goal legend.
 */
export function SpiderChart({ data, size = 260, max = 100, defaultGoal = 80 }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const points: Required<Pick<SpiderDatum, "category" | "score">> &
    { goal: number }[] | any = (data.length >= 3
    ? data
    : [
        { category: "Аналитика", score: 0 },
        { category: "Креатив", score: 0 },
        { category: "Лидерство", score: 0 },
        { category: "Коммуникация", score: 0 },
        { category: "Техника", score: 0 },
      ]
  ).map((p: SpiderDatum) => ({
    category: p.category,
    score: Math.max(0, Math.min(max, p.score)),
    goal: Math.max(0, Math.min(max, p.goal ?? defaultGoal)),
  }));

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  const n = points.length;
  const levels = 4;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const polygon = useMemo(
    () =>
      points
        .map((p: any, i: number) => {
          const r = (p.score / max) * radius;
          return `${cx + r * Math.cos(angle(i))},${cy + r * Math.sin(angle(i))}`;
        })
        .join(" "),
    [points, cx, cy, radius, max],
  );

  const goalPoly = useMemo(
    () =>
      points
        .map((p: any, i: number) => {
          const r = (p.goal / max) * radius;
          return `${cx + r * Math.cos(angle(i))},${cy + r * Math.sin(angle(i))}`;
        })
        .join(" "),
    [points, cx, cy, radius, max],
  );

  const hovered = hover != null ? points[hover] : null;

  return (
    <div className="relative inline-block">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
        onMouseLeave={() => setHover(null)}
      >
        {/* concentric grid */}
        {Array.from({ length: levels }).map((_, lv) => {
          const r = (radius * (lv + 1)) / levels;
          const pts = points
            .map((_p: any, i: number) => `${cx + r * Math.cos(angle(i))},${cy + r * Math.sin(angle(i))}`)
            .join(" ");
          return (
            <polygon
              key={lv}
              points={pts}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={1}
              opacity={0.45}
            />
          );
        })}

        {/* axes */}
        {points.map((_p: any, i: number) => {
          const x = cx + radius * Math.cos(angle(i));
          const y = cy + radius * Math.sin(angle(i));
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth={1}
              opacity={0.45}
            />
          );
        })}

        {/* goal polygon (dashed outline) */}
        <polygon
          points={goalPoly}
          fill="none"
          stroke="hsl(var(--text-3))"
          strokeWidth={1.25}
          strokeDasharray="4 4"
          opacity={0.7}
        />

        {/* data polygon */}
        <polygon
          points={polygon}
          fill="hsl(var(--accent))"
          fillOpacity={0.25}
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* points + labels + hover targets */}
        {points.map((p: any, i: number) => {
          const r = (p.score / max) * radius;
          const px = cx + r * Math.cos(angle(i));
          const py = cy + r * Math.sin(angle(i));
          const lx = cx + (radius + 20) * Math.cos(angle(i));
          const ly = cy + (radius + 20) * Math.sin(angle(i));
          const anchor =
            Math.cos(angle(i)) > 0.3 ? "start" : Math.cos(angle(i)) < -0.3 ? "end" : "middle";
          const isOn = hover === i;
          return (
            <g
              key={p.category}
              onMouseEnter={() => setHover(i)}
              style={{ cursor: "pointer" }}
            >
              {/* Label */}
              <text
                x={lx}
                y={ly}
                fontSize={11}
                fill={isOn ? "hsl(var(--foreground))" : "hsl(var(--text-2))"}
                textAnchor={anchor}
                dominantBaseline="middle"
                style={{ fontWeight: isOn ? 600 : 500 }}
              >
                {p.category}
              </text>
              {/* Outer hit area along the axis */}
              <line
                x1={cx}
                y1={cy}
                x2={cx + radius * Math.cos(angle(i))}
                y2={cy + radius * Math.sin(angle(i))}
                stroke="transparent"
                strokeWidth={20}
              />
              {/* Vertex dot */}
              <circle
                cx={px}
                cy={py}
                r={isOn ? 5 : 3.5}
                fill="hsl(var(--accent))"
                stroke={isOn ? "hsl(var(--background))" : "none"}
                strokeWidth={1.5}
              >
                <title>{`${p.category}: ${Math.round(p.score)} / ${Math.round(p.goal)}`}</title>
              </circle>
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
          role="status"
        >
          <div className="font-semibold text-foreground">{hovered.category}</div>
          <div className="tabular text-text2">
            <span className="text-foreground">{Math.round(hovered.score)}</span>
            <span className="text-text3"> / {Math.round(hovered.goal)}</span>
            <span
              className={`ml-1.5 ${
                hovered.score >= hovered.goal ? "text-emerald-500" : "text-text3"
              }`}
            >
              ({Math.round((hovered.score / Math.max(1, hovered.goal)) * 100)}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
