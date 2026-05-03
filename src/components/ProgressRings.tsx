interface RingsProps {
  tasks: { done: number; total: number };
  docs: { done: number; total: number };
  unis: { done: number; total: number };
  size?: number;
}

const RINGS = [
  { key: "tasks", color: "hsl(var(--accent))", label: "Задачи" },
  { key: "docs", color: "hsl(var(--success))", label: "Документы" },
  { key: "unis", color: "hsl(var(--warning))", label: "Заявки" },
];

export function ProgressRings({ tasks, docs, unis, size = 200 }: RingsProps) {
  const cx = size / 2;
  const cy = size / 2;
  const stroke = 14;
  const gap = 4;
  const data = [
    { ...tasks, color: RINGS[0].color, label: RINGS[0].label },
    { ...docs, color: RINGS[1].color, label: RINGS[1].label },
    { ...unis, color: RINGS[2].color, label: RINGS[2].label },
  ];

  const overall = (() => {
    const t = tasks.total + docs.total + unis.total;
    const d = tasks.done + docs.done + unis.done;
    return t > 0 ? Math.round((d / t) * 100) : 0;
  })();

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="-rotate-90">
        {data.map((r, i) => {
          const radius = size / 2 - stroke / 2 - i * (stroke + gap);
          const c = 2 * Math.PI * radius;
          const pct = r.total > 0 ? r.done / r.total : 0;
          return (
            <g key={i}>
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
                style={{ transition: "stroke-dashoffset 600ms ease" }}
              />
            </g>
          );
        })}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(90 ${cx} ${cy})`}
          className="fill-foreground tabular"
          style={{ fontSize: 28, fontWeight: 700 }}
        >
          {overall}%
        </text>
      </svg>
      <div className="space-y-2 text-sm">
        {data.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
            <span className="text-text2">{r.label}</span>
            <span className="tabular font-medium">{r.done}/{r.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
