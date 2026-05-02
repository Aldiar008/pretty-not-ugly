import { useTranslation } from "react-i18next";
import { useStore } from "@/store";
import { Zap, CheckCircle2, Circle, Flame } from "lucide-react";
import { RhinoCharacter } from "@/components/RhinoCharacter";

interface MissionItem {
  id: string;
  title: string;
  done: boolean;
}

function buildToday(state: ReturnType<typeof useStore.getState>): MissionItem[] {
  const items: MissionItem[] = [];
  const incompleteTasks = state.tasks.filter((t) => !t.done).slice(0, 2);
  for (const t of incompleteTasks) {
    items.push({ id: `task-${t.id}`, title: `Закрой задачу: ${t.title}`, done: false });
  }
  if (state.documents.some((d) => d.status === "in_progress")) {
    items.push({ id: "doc", title: "Поработай 15 минут над документом", done: false });
  } else {
    items.push({ id: "doc-start", title: "Открой раздел Документы", done: false });
  }
  if ((state.chatHistory?.length || 0) === 0) {
    items.push({ id: "ai", title: "Задай AI-советнику 1 вопрос", done: false });
  } else {
    items.push({ id: "ai-2", title: "Спроси AI про следующий шаг", done: false });
  }
  if (state.universities.length < 3) {
    items.push({ id: "uni", title: "Добавь ещё 1 университет в список", done: false });
  } else {
    items.push({ id: "uni-2", title: "Открой профиль 1 университета", done: false });
  }
  return items;
}

export default function Missions() {
  const { t } = useTranslation();
  const state = useStore();
  const items = buildToday(state);
  const doneCount = items.filter((i) => i.done).length;
  const streak = state.user?.streak ?? 0;

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="sw-pill mb-3">
            <Zap className="h-4 w-4" /> {t("missions.today")}
          </div>
          <h1>{t("missions.title")}</h1>
          <p className="mt-3 text-[hsl(var(--text-2))] max-w-xl">{t("missions.subtitle")}</p>
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
            <h3 className="!text-lg">{t("missions.today")}</h3>
            <span className="num text-sm text-[hsl(var(--text-2))]">{doneCount}/{items.length}</span>
          </div>
          <ul className="space-y-2">
            {items.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-2))] px-4 py-3"
              >
                {m.done ? (
                  <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                ) : (
                  <Circle className="h-5 w-5 text-[hsl(var(--text-3))]" />
                )}
                <span className={m.done ? "line-through text-[hsl(var(--text-3))]" : ""}>{m.title}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-[hsl(var(--text-2))]">{t("missions.keep_going")}</p>
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
