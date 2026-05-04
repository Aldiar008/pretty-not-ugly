import { useTranslation } from "react-i18next";
import { useStore } from "@/store";
import { Zap, CheckCircle2, Circle, Flame, ArrowRight } from "lucide-react";
import { RhinoCharacter } from "@/components/RhinoCharacter";
import { Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

interface MissionItem {
  id: string;
  title: string;
  hint?: string;
  link?: string;
  done: boolean;
  realistic: true; // every mission must be doable in 5–20 min
}

const MISSIONS_KEY = () => `sw_missions_${new Date().toISOString().slice(0, 10)}`;
const MISSIONS_DONE_KEY = () => `sw_missions_done_${new Date().toISOString().slice(0, 10)}`;

function buildToday(state: ReturnType<typeof useStore.getState>): MissionItem[] {
  const items: MissionItem[] = [];
  const today = new Date();

  // 1) Closest urgent task
  const urgent = state.tasks
    .filter((t) => !t.done)
    .sort((a, b) => {
      const order = { urgent: 0, important: 1, later: 2 } as const;
      const oa = order[a.priority], ob = order[b.priority];
      if (oa !== ob) return oa - ob;
      return (a.deadline || "9999") < (b.deadline || "9999") ? -1 : 1;
    })[0];
  if (urgent) {
    items.push({
      id: `task-${urgent.id}`, link: "/plan", realistic: true, done: false,
      title: `Закрой задачу: ${urgent.title}`,
      hint: urgent.deadline ? `до ${new Date(urgent.deadline).toLocaleDateString("ru-RU")}` : undefined,
    });
  } else {
    items.push({ id: "plan-add", link: "/plan", realistic: true, done: false,
      title: "Добавь 1 новую задачу в план", hint: "5 минут" });
  }

  // 2) Document micro-step
  const inProgressDoc = state.documents.find((d) => d.status === "in_progress");
  const notStartedDoc = state.documents.find((d) => d.status === "not_started");
  if (inProgressDoc) {
    items.push({
      id: "doc-work", link: "/documents", realistic: true, done: false,
      title: `Поработай 15 минут над «${inProgressDoc.name}»`,
      hint: "Маленький шаг каждый день",
    });
  } else if (notStartedDoc) {
    items.push({
      id: "doc-start", link: "/documents", realistic: true, done: false,
      title: `Начни «${notStartedDoc.name}» — переведи в «В работе»`,
    });
  } else {
    items.push({
      id: "doc-add", link: "/documents", realistic: true, done: false,
      title: "Добавь 1 документ из подсказок (5 мин)",
    });
  }

  // 3) AI / Essay micro-step
  if ((state.chatHistory?.length || 0) < 2) {
    items.push({ id: "ai-1", link: "/ai", realistic: true, done: false,
      title: "Задай AI-советнику 1 вопрос про следующий шаг" });
  } else {
    items.push({ id: "essay-brain", link: "/essay-studio", realistic: true, done: false,
      title: "Сделай Brainstorm в Essay Studio (3 мин)" });
  }

  // 4) Universities
  if (state.universities.length === 0) {
    items.push({ id: "uni-first", link: "/universities", realistic: true, done: false,
      title: "Добавь первый университет в список" });
  } else if (state.universities.length < 5) {
    items.push({ id: "uni-more", link: "/universities", realistic: true, done: false,
      title: "Добавь ещё 1 университет (Safety / Match / Reach)" });
  } else {
    const noDeadline = state.universities.find((u) => !u.deadline);
    if (noDeadline) {
      items.push({ id: "uni-dl", link: "/universities", realistic: true, done: false,
        title: `Уточни дедлайн у «${noDeadline.name}»` });
    } else {
      items.push({ id: "uni-review", link: "/universities", realistic: true, done: false,
        title: "Открой 1 университет и проверь требования" });
    }
  }

  // 5) Interview practice (only if user already has unis)
  if (state.universities.length > 0 && (state.interviewSessions?.length || 0) < 3) {
    items.push({ id: "interview", link: "/interview", realistic: true, done: false,
      title: "Сделай 1 короткое интервью со Степом (5 мин)" });
  }

  return items.slice(0, 5); // never more than 5 — realistic for one day
}

export default function Missions() {
  const { t } = useTranslation();
  const state = useStore();
  const items = useMemo(() => buildToday(state), [state.tasks, state.documents, state.universities, state.chatHistory, state.interviewSessions]);

  const [doneIds, setDoneIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(MISSIONS_DONE_KEY()) || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(MISSIONS_DONE_KEY(), JSON.stringify(doneIds));
  }, [doneIds]);

  const toggle = (id: string) =>
    setDoneIds((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  const doneCount = items.filter((i) => doneIds.includes(i.id)).length;
  const streak = Number(localStorage.getItem("sw_streak") || 0);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="sw-pill mb-3">
            <Zap className="h-4 w-4" /> {t("missions.today", "Сегодня")}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Миссии дня</h1>
          <p className="mt-3 text-[hsl(var(--text-2))] max-w-xl">
            Маленькие реальные шаги — каждый можно закрыть за 5–20 минут. Без невозможных задач.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 sw-card !p-4">
          <Flame className="h-5 w-5 text-[hsl(var(--accent))]" />
          <span className="num text-2xl font-bold">{streak}</span>
          <span className="text-sm text-[hsl(var(--text-2))]">дн.</span>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-[1fr,320px]">
        <div className="sw-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">Сегодня</h3>
            <span className="num text-sm text-[hsl(var(--text-2))]">{doneCount}/{items.length}</span>
          </div>
          <ul className="space-y-2">
            {items.map((m) => {
              const done = doneIds.includes(m.id);
              return (
                <li
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-2))] px-4 py-3"
                >
                  <button onClick={() => toggle(m.id)} aria-label="toggle">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                    ) : (
                      <Circle className="h-5 w-5 text-[hsl(var(--text-3))]" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm ${done ? "line-through text-[hsl(var(--text-3))]" : ""}`}>
                      {m.title}
                    </div>
                    {m.hint && <div className="text-xs text-text3">{m.hint}</div>}
                  </div>
                  {m.link && (
                    <Link to={m.link} className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                      Открыть <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-[hsl(var(--text-2))]">
            Список обновляется каждый день и подстраивается под твой прогресс.
          </p>
        </div>

        <div className="sw-card flex flex-col items-center text-center">
          <RhinoCharacter pose="wave" size={140} />
          <p className="mt-4 text-sm text-[hsl(var(--text-2))]">
            Бэгги верит в тебя. Закрой пару миссий — и день уже не зря 💪
          </p>
        </div>
      </section>
    </div>
  );
}
