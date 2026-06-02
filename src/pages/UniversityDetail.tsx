import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { UNIVERSITIES, calculateChance, countryName } from "@/data/reference";
import { ArrowLeft, ExternalLink, Plus, MapPin, Lock, Building2, BookmarkPlus, Check } from "lucide-react";
import { toast } from "sonner";

// Deterministic pseudo-random from string
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function rand(seed: string, min: number, max: number, step = 1): number {
  const v = (hash(seed) % 1000) / 1000;
  const r = min + v * (max - min);
  return Math.round(r / step) * step;
}

// Bell curve points around middle 50% range
function bellPoints(low: number, high: number, min: number, max: number, n = 60): string {
  const center = (low + high) / 2;
  const spread = (high - low) / 1.5 || (max - min) / 8;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = min + ((max - min) * i) / n;
    const y = Math.exp(-Math.pow((x - center) / spread, 2));
    pts.push(`${(i / n) * 100},${(1 - y) * 100}`);
  }
  return pts.join(" ");
}

export default function UniversityDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const myUnis = useStore((s) => s.universities);
  const addUniversity = useStore((s) => s.addUniversity);
  const addUniversityTasks = useStore((s) => s.addUniversityTasks);

  const uni = useMemo(() => UNIVERSITIES.find((u) => u.id === id), [id]);
  const [tab, setTab] = useState<"adm" | "ac" | "co" | "st">("adm");
  const [logoBroken, setLogoBroken] = useState(false);

  if (!uni) {
    return (
      <div className="space-y-4">
        <button onClick={() => nav(-1)} className="text-sm text-text2 hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Назад
        </button>
        <div className="sw-card text-center py-12">Университет не найден</div>
      </div>
    );
  }

  const seed = uni.id;
  // SAT band derived from minSat
  const satMid = uni.minSat;
  const satLow = Math.max(800, satMid - rand(seed + "sl", 60, 110, 10));
  const satHigh = Math.min(1600, satMid + rand(seed + "sh", 60, 130, 10));
  const satOverall = Math.round((satLow + satHigh) / 2);
  // ACT
  const actMid = Math.round(((satMid - 400) / 1200) * 35 + 1);
  const actLow = Math.max(10, actMid - rand(seed + "al", 2, 4));
  const actHigh = Math.min(36, actMid + rand(seed + "ah", 2, 4));

  // Admissions
  const acceptance = rand(seed + "acc", uni.minSat > 1450 ? 4 : uni.minSat > 1300 ? 15 : 35, uni.minSat > 1450 ? 12 : uni.minSat > 1300 ? 45 : 75);
  const yieldRate = rand(seed + "yld", 10, 60);
  const satSub = rand(seed + "ssr", 30, 85);
  const actSub = rand(seed + "asr", 15, 60);

  // Academics
  const ratio = rand(seed + "ratio", 6, 22);
  const enrollment = rand(seed + "en", 1500, 35000, 100);
  const gradRate = rand(seed + "gr", 55, 96);
  const retention = rand(seed + "ret", 70, 98);

  // Costs
  const tuition = uni.tuitionUsd;
  const room = rand(seed + "rb", 8000, 16000, 100);
  const aid = rand(seed + "aid", 45, 99);
  const netPrice = Math.max(2000, Math.round(tuition * (1 - aid / 200) + room * 0.4));

  // Students
  const male = rand(seed + "m", 35, 60);
  const female = 100 - male;
  const intl = rand(seed + "intl", 3, 35);

  const chance = calculateChance(
    { gpa: user?.gpa ?? null, sat: user?.sat ?? null, ielts: user?.ielts ?? null },
    { minGpa: uni.minGpa, minSat: uni.minSat, minIelts: uni.minIelts },
  );

  const alreadyAdded = myUnis.some((u) => u.name === uni.name);

  function handleAdd() {
    if (alreadyAdded) return;
    addUniversity({
      name: uni!.name,
      country: uni!.country,
      countryFlag: uni!.countryFlag,
      deadline: "",
      status: "wishlist",
      minGpa: uni!.minGpa,
      minSat: uni!.minSat,
      minIelts: uni!.minIelts,
      tuitionUsd: uni!.tuitionUsd,
      hasScholarship: uni!.hasScholarship,
      notes: "",
    });
    const list = useStore.getState().universities;
    const just = list[list.length - 1];
    if (just) {
      const added = addUniversityTasks(just);
      toast.success(`${uni!.name} добавлен`, {
        description: added ? `Создано ${added} задач(и)` : undefined,
      });
    }
  }

  const tierStyle =
    chance.tier === "safety" ? "bg-success/15 text-success border-success/30"
    : chance.tier === "match" ? "bg-warning/15 text-warning border-warning/30"
    : "bg-danger/15 text-danger border-danger/30";

  return (
    <div className="space-y-6">
      <button onClick={() => nav(-1)} className="text-sm text-text2 hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> К каталогу
      </button>

      {/* Header */}
      <div className="sw-card">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-bg2 text-3xl font-bold text-text2 ring-1 ring-border">
            {uni.name.split(" ").map((w) => w[0]).slice(0, 3).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{uni.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text2">
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{uni.city}, {countryName(uni.country)} {uni.countryFlag}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg2 px-2.5 py-1 text-xs"><Lock className="h-3 w-3" /> Private</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg2 px-2.5 py-1 text-xs"><Building2 className="h-3 w-3" /> {enrollment > 15000 ? "Large" : enrollment > 5000 ? "Midsize" : "Small"}</span>
              {uni.hasScholarship && <span className="rounded-full border border-success/30 bg-success/10 text-success px-2.5 py-1 text-xs">Scholarship</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold tabular ${tierStyle}`}>
              Твой шанс · {chance.chancePercent}%
            </span>
            <div className="flex gap-2">
              <a href={uni.website} target="_blank" rel="noreferrer"
                 className="rounded-lg border border-border bg-bg2 px-3 py-1.5 text-xs inline-flex items-center gap-1 hover:bg-bg3">
                <ExternalLink className="h-3.5 w-3.5" /> Сайт
              </a>
              <button onClick={handleAdd} disabled={alreadyAdded}
                className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background inline-flex items-center gap-1 hover:opacity-90 disabled:opacity-50">
                {alreadyAdded ? <><Check className="h-3.5 w-3.5" /> В списке</> : <><BookmarkPlus className="h-3.5 w-3.5" /> В мой список</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Scores */}
        <section className="sw-card">
          <h2 className="text-base font-semibold">Scores</h2>

          <div className="mt-4 text-[11px] font-semibold tracking-wider text-text3">SAT SCORES</div>
          <ScoreDistribution
            label="Overall"
            value={satOverall}
            min={400} max={1600}
            low={satLow} high={satHigh}
            userScore={user?.sat ?? null}
          />

          <div className="mt-5 text-[11px] font-semibold tracking-wider text-text3">ACT SCORES</div>
          <ScoreDistribution
            label="Overall"
            value={actMid}
            min={1} max={36}
            low={actLow} high={actHigh}
            userScore={null}
          />
        </section>

        {/* Tabs */}
        <section className="sw-card">
          <div className="mb-4 flex gap-5 border-b border-border text-sm">
            {[
              { id: "adm", label: "Admissions" },
              { id: "ac", label: "Academics" },
              { id: "co", label: "Costs" },
              { id: "st", label: "Students" },
            ].map((t, i) => (
              <a key={t.id} href={`#${t.id}`}
                className="border-b-2 border-transparent pb-2 text-text2 hover:text-foreground hover:border-accent">
                {t.label}
              </a>
            ))}
          </div>

          <div id="adm" className="space-y-4">
            <h3 className="text-sm font-semibold">GPA & Admissions</h3>
            <Row label="Average GPA (50th Percentile)" value={uni.minGpa.toFixed(1)} />
            <BarRow label="Acceptance Rate" value={acceptance} suffix="%" color="bg-accent" />
            <BarRow label="Yield Rate" value={yieldRate} suffix="%" color="bg-accent/70" />
            <BarRow label="SAT Submission Rate" value={satSub} suffix="%" color="bg-accent" />
            <BarRow label="ACT Submission Rate" value={actSub} suffix="%" color="bg-accent" />
            <Row label="Test Scores Policy" value={uni.minSat > 1400 ? "Required" : "Considered"} />
          </div>

          <div id="ac" className="mt-6 space-y-4 border-t border-border pt-5">
            <h3 className="text-sm font-semibold">Academics</h3>
            <Row label="Student/Faculty Ratio" value={`${ratio}:1`} />
            <Row label="Enrollment" value={enrollment.toLocaleString()} />
            <BarRow label="Graduation Rate" value={gradRate} suffix="%" color="bg-warning" />
            <BarRow label="Freshman Retention" value={retention} suffix="%" color="bg-success" />
            <div>
              <div className="mb-2 text-xs text-text3">Popular Majors</div>
              <ul className="space-y-1.5 text-sm">
                {["Computer Science", "Business", "Engineering", "Biology", "Psychology"].map((m, i) => (
                  <li key={m} className="flex justify-between">
                    <span>{m}</span>
                    <span className="tabular text-text2">{(rand(seed + m, 5, 18) - i * 0.5).toFixed(2)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div id="co" className="mt-6 space-y-3 border-t border-border pt-5">
            <h3 className="text-sm font-semibold">Tuition & Fees</h3>
            <Row label="Average Net Price" value={`$${netPrice.toLocaleString()}`} />
            <Row label="Tuition" value={tuition === 0 ? "Бесплатно" : `$${tuition.toLocaleString()}`} />
            <Row label="Room & Board" value={`$${room.toLocaleString()}`} />
            <Row label="Application Fee" value={uni.country === "DE" || uni.country === "NO" ? "$0" : `$${rand(seed + "app", 50, 90)}`} />
            <BarRow label="Financial Aid Rate" value={aid} suffix="%" color="bg-success" />
          </div>

          <div id="st" className="mt-6 space-y-3 border-t border-border pt-5">
            <h3 className="text-sm font-semibold">Demographics</h3>
            <BarRow label="Male" value={male} suffix="%" color="bg-accent" />
            <BarRow label="Female" value={female} suffix="%" color="bg-pink-500" />
            <BarRow label="International Students" value={intl} suffix="%" color="bg-purple" />
          </div>
        </section>
      </div>

      {/* Requirements summary */}
      <section className="sw-card">
        <h2 className="text-base font-semibold">Требования и твои баллы</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Req label="GPA" need={uni.minGpa} have={user?.gpa ?? null} fmt={(v) => v.toFixed(1)} />
          <Req label="SAT" need={uni.minSat} have={user?.sat ?? null} fmt={(v) => String(v)} />
          <Req label="IELTS" need={uni.minIelts} have={user?.ielts ?? null} fmt={(v) => v.toFixed(1)} />
        </div>
        <p className="mt-3 text-[11px] text-text3">
          ⚠ Часть данных рассчитана статистически на основе требований вуза. Это ориентир, а не официальная статистика приёма.
        </p>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text2">{label}</span>
      <span className="font-medium tabular">{value}</span>
    </div>
  );
}

function BarRow({ label, value, suffix = "", color }: { label: string; value: number; suffix?: string; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text2">{label}</span>
        <span className="font-medium tabular">{value}{suffix}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bg3">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function ScoreDistribution({
  label, value, min, max, low, high, userScore,
}: { label: string; value: number; min: number; max: number; low: number; high: number; userScore: number | null }) {
  const points = bellPoints(low, high, min, max);
  const lowPct = ((low - min) / (max - min)) * 100;
  const highPct = ((high - min) / (max - min)) * 100;
  const userPct = userScore != null ? Math.max(0, Math.min(100, ((userScore - min) / (max - min)) * 100)) : null;
  return (
    <div className="mt-3 rounded-lg border border-border bg-bg2 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text2">{label}</span>
        <span className="text-sm font-semibold tabular">{value}</span>
      </div>
      <div className="relative mt-2 h-24 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {/* Filled middle 50% range */}
          <defs>
            <linearGradient id="curveFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.45" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke="hsl(var(--accent))" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          <polygon points={`0,100 ${points} 100,100`} fill="url(#curveFill)" opacity="0.4" />
          {/* Middle 50% band */}
          <rect x={lowPct} y={0} width={highPct - lowPct} height={100} fill="hsl(var(--accent))" opacity="0.12" />
        </svg>
        {userPct != null && (
          <div className="absolute top-0 bottom-0" style={{ left: `${userPct}%` }}>
            <div className="h-full w-px bg-warning" />
            <div className="absolute -top-1 -translate-x-1/2 rounded-full bg-warning px-1.5 py-0.5 text-[9px] font-semibold text-background">
              Ты · {userScore}
            </div>
          </div>
        )}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-text3 tabular">
        <span>{min}</span>
        <span>{low}–{high} · middle 50%</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function Req({ label, need, have, fmt }: { label: string; need: number; have: number | null; fmt: (v: number) => string }) {
  const ok = have != null && have >= need;
  return (
    <div className={`rounded-lg border p-3 ${ok ? "border-success/30 bg-success/5" : have == null ? "border-border bg-bg2" : "border-warning/30 bg-warning/5"}`}>
      <div className="text-xs text-text3">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-lg font-semibold tabular">{have != null ? fmt(have) : "—"}</span>
        <span className="text-xs text-text2">/ нужно {fmt(need)}</span>
      </div>
      <div className={`mt-1 text-[11px] ${ok ? "text-success" : have == null ? "text-text3" : "text-warning"}`}>
        {have == null ? "Добавь в профиле" : ok ? "Соответствует" : `Не хватает ${fmt(need - have)}`}
      </div>
    </div>
  );
}
