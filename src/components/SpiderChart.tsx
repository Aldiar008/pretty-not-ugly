import { useMemo } from "react";

export interface SpiderDatum {
  category: string;
  score: number; // 0..100
}

interface Props {
  data: SpiderDatum[];
  size?: number;
  max?: number;
}

/**
 * Lightweight self-contained SVG radar/spider chart.
 * Always renders — even with empty/fallback data.
 */
export function SpiderChart({ data, size = 260, max = 100 }: Props) {
  const points = data.length >= 3
    ? data
    : [
        { category: "Аналитика", score: 0 },
        { category: "Креатив", score: 0 },
        { category: "Лидерство", score: 0 },
        { category: "Коммуникация", score: 0 },
        { category: "Техника", score: 0 },
      ];

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 36;
  const n = points.length;
  const levels = 4;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const polygon = useMemo(() => {
    return points
      .map((p, i) => {
        const r = (Math.max(0, Math.min(max, p.score)) / max) * radius;
        const x = cx + r * Math.cos(angle(i));
        const y = cy + r * Math.sin(angle(i));
        return `${x},${y}`;
      })
      .join(" ");
  }, [points, cx, cy, radius, max]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      {/* concentric grid */}
      {Array.from({ length: levels }).map((_, lv) => {
        const r = (radius * (lv + 1)) / levels;
        const pts = points
          .map((_p, i) => {
            const x = cx + r * Math.cos(angle(i));
            const y = cy + r * Math.sin(angle(i));
            return `${x},${y}`;
          })
          .join(" ");
        return (
          <polygon
            key={lv}
            points={pts}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={1}
            opacity={0.5}
          />
        );
      })}

      {/* axes */}
      {points.map((_, i) => {
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
            opacity={0.5}
          />
        );
      })}

      {/* data polygon */}
      <polygon
        points={polygon}
        fill="hsl(var(--accent))"
        fillOpacity={0.25}
        stroke="hsl(var(--accent))"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* points + labels */}
      {points.map((p, i) => {
        const r = (Math.max(0, Math.min(max, p.score)) / max) * radius;
        const px = cx + r * Math.cos(angle(i));
        const py = cy + r * Math.sin(angle(i));
        const lx = cx + (radius + 18) * Math.cos(angle(i));
        const ly = cy + (radius + 18) * Math.sin(angle(i));
        const anchor =
          Math.cos(angle(i)) > 0.3 ? "start" : Math.cos(angle(i)) < -0.3 ? "end" : "middle";
        return (
          <g key={p.category}>
            <circle cx={px} cy={py} r={3.5} fill="hsl(var(--accent))" />
            <text
              x={lx}
              y={ly}
              fontSize={11}
              fill="hsl(var(--text-2))"
              textAnchor={anchor}
              dominantBaseline="middle"
              style={{ fontWeight: 500 }}
            >
              {p.category}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
