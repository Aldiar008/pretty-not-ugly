import { useState } from "react";

interface RingDatum {
  done: number;
  total: number;
}
interface RingsProps {
  tasks: RingDatum;
  docs: RingDatum;
  unis: RingDatum;
  size?: number;
}

export function ProgressRings({ tasks, docs, unis, size = 220 }: RingsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const cx = size / 2;
  const cy = size / 2;
  const stroke = 14;
  const gap = 5;

  const data = [
    {
      key: "tasks",
      color: "hsl(var(--accent))",
      label: "Задачи",
      hint: "Выполнено задач из плана",
      ...tasks,
    },
    {
      key: "docs",
      color: "hsl(var(--success))",
      label: "Документы",
      hint: "Готовых или отправленных документов",
      ...docs,
    },
    {
      key: "unis",
      color: "hsl(var(--warning))",
      label: "Заявки",
      hint: "Поданных или принятых заявок",
      ...unis,
    },
  ];

  const totalAll = data.reduce((s, r) => s + r.total, 0);
  const doneAll = data.reduce((s, r) => s + r.done, 0);
  const overall = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;

  const active = hover !== null ? data[hover] : null;
  const centerBig = active
    ? `${active.total > 0 ? Math.round((active.done / active.total) * 100) : 0}%`
    : `${overall}%`;
  const centerSmall = active ? active.label : "Общий";

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {data.map((r, i) => {
            const radius = size / 2 - stroke / 2 - i * (stroke + gap);
            const c = 2 * Math.PI * radius;
            const pct = r.total > 0 ? r.done / r.total : 0;
            const isActive = hover === i;
            return (
              <g key={r.key}>
                <title>{`${r.label}: ${r.done}/${r.total} · ${r.hint}`}</title>
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke="hsl(var(--bg-3))"
                  strokeWidth={stroke}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={r.color}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={c * (1 - pct)}
                  style={{
                    transition: "stroke-dashoffset 600ms ease, opacity 150ms ease",
                    opacity: hover === null || isActive ? 1 : 0.35,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                />
              </g>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[28px] font-bold tabular leading-none">{centerBig}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-text3">{centerSmall}</div>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        {data.map((r, i) => {
          const pct = r.total > 0 ? Math.round((r.done / r.total) * 100) : 0;
          const isActive = hover === i;
          return (
            <li
              key={r.key}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors cursor-default ${
                isActive ? "bg-[hsl(var(--bg-3))]" : ""
              }`}
              title={r.hint}
            >
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ background: r.color }}
              />
              <div className="flex flex-col">
                <span className="text-foreground font-medium">{r.label}</span>
                <span className="text-[11px] text-text3">{r.hint}</span>
              </div>
              <span className="ml-3 tabular text-text2">
                {r.done}/{r.total}
              </span>
              <span className="tabular text-xs text-text3">· {pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
