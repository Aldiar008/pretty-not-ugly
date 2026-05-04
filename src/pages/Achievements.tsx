import { useTranslation } from "react-i18next";
import { Trophy, Medal, Star, Flame, BookOpen, Target, MessageSquare, Sparkles, GraduationCap, CheckCircle2 } from "lucide-react";
import { useStore } from "@/store";

interface Badge {
  id: string;
  icon: typeof Target;
  title: string;
  desc: string;
  earned: boolean;
  progress?: { current: number; goal: number };
}

export default function Achievements() {
  const { t } = useTranslation();
  const tasks = useStore((s) => s.tasks);
  const universities = useStore((s) => s.universities);
  const documents = useStore((s) => s.documents);
  const interviews = useStore((s) => s.interviewSessions || []);
  const chat = useStore((s) => s.chatHistory || []);
  const testResults = useStore((s) => s.testResults);
  const streak = Number(localStorage.getItem("sw_streak") || 0);

  const tasksDone = tasks.filter((t) => t.done).length;
  const docsDone = documents.filter((d) => d.status === "complete" || d.status === "sent").length;
  const submitted = universities.filter((u) => ["submitted", "accepted"].includes(u.status)).length;

  const badges: Badge[] = [
    { id: "first-task", icon: Target, title: "Первый шаг", desc: "Закрой первую задачу",
      earned: tasksDone >= 1, progress: { current: tasksDone, goal: 1 } },
    { id: "tasks-10", icon: CheckCircle2, title: "Десятка", desc: "10 закрытых задач",
      earned: tasksDone >= 10, progress: { current: tasksDone, goal: 10 } },
    { id: "streak-3", icon: Flame, title: "Три дня подряд", desc: "Стрик 3 дня",
      earned: streak >= 3, progress: { current: streak, goal: 3 } },
    { id: "streak-7", icon: Flame, title: "Неделя силы", desc: "Стрик 7 дней",
      earned: streak >= 7, progress: { current: streak, goal: 7 } },
    { id: "uni-3", icon: Star, title: "Список мечты", desc: "3 университета добавлены",
      earned: universities.length >= 3, progress: { current: universities.length, goal: 3 } },
    { id: "uni-balanced", icon: GraduationCap, title: "Сбалансированный лист", desc: "Safety + Match + Reach в списке",
      earned: ["safety","match","reach"].every((tier) => universities.some((u) => u.tier === tier)) },
    { id: "doc-1", icon: BookOpen, title: "Бумажный воин", desc: "Первый завершённый документ",
      earned: docsDone >= 1, progress: { current: docsDone, goal: 1 } },
    { id: "doc-5", icon: BookOpen, title: "Папка готова", desc: "5 завершённых документов",
      earned: docsDone >= 5, progress: { current: docsDone, goal: 5 } },
    { id: "interview-1", icon: Medal, title: "Голос наружу", desc: "Прошёл 1 интервью с AI",
      earned: interviews.length >= 1, progress: { current: interviews.length, goal: 1 } },
    { id: "interview-5", icon: Medal, title: "Уверенный спикер", desc: "5 интервью с AI",
      earned: interviews.length >= 5, progress: { current: interviews.length, goal: 5 } },
    { id: "ai-chat", icon: MessageSquare, title: "Спроси Степа", desc: "Задал AI-советнику вопрос",
      earned: chat.length >= 1 },
    { id: "test", icon: Sparkles, title: "Самопознание", desc: "Прошёл тест компетенций",
      earned: !!testResults },
    { id: "submit-1", icon: GraduationCap, title: "Подал заявку", desc: "Хотя бы 1 заявка отправлена",
      earned: submitted >= 1, progress: { current: submitted, goal: 1 } },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-8">
      <header>
        <div className="sw-pill mb-3">
          <Trophy className="h-4 w-4" /> {t("achievements.title", "Достижения")}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Достижения</h1>
        <p className="mt-3 text-[hsl(var(--text-2))] max-w-xl">
          Открыто {earnedCount} из {badges.length}. Продолжай работать с планом — новые бейджи открываются автоматически.
        </p>
      </header>

      <section>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {badges.map((b) => {
            const Icon = b.icon;
            const pct = b.progress
              ? Math.min(100, Math.round((b.progress.current / b.progress.goal) * 100))
              : b.earned ? 100 : 0;
            return (
              <div
                key={b.id}
                className={`sw-card flex flex-col items-center text-center transition-opacity ${b.earned ? "" : "opacity-60"}`}
              >
                <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
                  b.earned ? "bg-[hsl(var(--accent-subtle))]" : "bg-bg3"
                }`}>
                  <Icon className={`h-7 w-7 ${b.earned ? "text-[hsl(var(--accent))]" : "text-text3"}`} />
                </div>
                <div className="font-semibold">{b.title}</div>
                <p className="mt-1 text-xs text-[hsl(var(--text-2))]">{b.desc}</p>
                {b.progress && !b.earned && (
                  <div className="mt-3 w-full">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-bg3">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="mt-1 text-[10px] tabular text-text3">
                      {b.progress.current} / {b.progress.goal}
                    </div>
                  </div>
                )}
                {b.earned && (
                  <div className="mt-2 text-[10px] uppercase tracking-wider text-[hsl(var(--success))]">
                    Получено
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-xs text-text3">
        Грамоты и сертификаты теперь загружаются на странице <strong>Документы</strong> (тип «Сертификат»).
      </p>
    </div>
  );
}
