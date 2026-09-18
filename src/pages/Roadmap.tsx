import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  CalendarClock,
  Lightbulb,
  Sparkles,
  ThumbsUp,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "shipped" | "in_progress" | "planned" | "idea";

type Item = {
  id: string;
  title: string;
  desc: string;
  status: Status;
  quarter: string;
  tag: "AI" | "UX" | "Data" | "Mobile" | "Community";
  votes: number;
};

const ITEMS: Item[] = [
  {
    id: "spider",
    title: "Spider Chart компетенций",
    desc: "Интерактивный график сильных сторон с тултипами current/goal.",
    status: "shipped",
    quarter: "Q2 2026",
    tag: "Data",
    votes: 142,
  },
  {
    id: "uni-detail",
    title: "Бланк университета",
    desc: "Детальная страница с шансами поступления, статистикой и стоимостью.",
    status: "shipped",
    quarter: "Q2 2026",
    tag: "Data",
    votes: 213,
  },
  {
    id: "essay-presets",
    title: "Essay Studio пресеты под вузы",
    desc: "Разные промпты и черновики в зависимости от выбранных университетов.",
    status: "shipped",
    quarter: "Q2 2026",
    tag: "AI",
    votes: 98,
  },
  {
    id: "interview-cam",
    title: "Камера в интервью",
    desc: "Опциональная видеокамера, чтобы тренироваться как на реальном собесе.",
    status: "in_progress",
    quarter: "Q3 2026",
    tag: "UX",
    votes: 176,
  },
  {
    id: "missions-v2",
    title: "Умный подбор миссий",
    desc: "AI-планировщик с реалистичными дедлайнами и приоритетом по слабым местам.",
    status: "in_progress",
    quarter: "Q3 2026",
    tag: "AI",
    votes: 204,
  },
  {
    id: "eu-unis",
    title: "Расширение базы вузов ЕС",
    desc: "Германия, Нидерланды, Франция, Италия и ещё 12 стран Европы.",
    status: "in_progress",
    quarter: "Q3 2026",
    tag: "Data",
    votes: 311,
  },
  {
    id: "mentors",
    title: "Менторы и созвоны 1:1",
    desc: "Бронирование часа со студентом топ-вуза прямо из кабинета.",
    status: "planned",
    quarter: "Q4 2026",
    tag: "Community",
    votes: 267,
  },
  {
    id: "mobile",
    title: "Мобильное приложение",
    desc: "Нативный iOS/Android клиент с офлайн-режимом для миссий.",
    status: "planned",
    quarter: "Q4 2026",
    tag: "Mobile",
    votes: 489,
  },
  {
    id: "scholarship",
    title: "AI-поиск стипендий",
    desc: "Подбор грантов и financial aid под профиль студента.",
    status: "planned",
    quarter: "Q1 2027",
    tag: "AI",
    votes: 358,
  },
  {
    id: "parents",
    title: "Кабинет родителя",
    desc: "Отдельный доступ для родителей с прогрессом и расходами.",
    status: "idea",
    quarter: "—",
    tag: "UX",
    votes: 74,
  },
  {
    id: "ai-essay-review",
    title: "AI-ревью эссе по рубрикам вуза",
    desc: "Проверка по реальным критериям приёмной комиссии MIT, Stanford, Oxford.",
    status: "idea",
    quarter: "—",
    tag: "AI",
    votes: 412,
  },
];

const STATUS_META: Record<Status, { label: string; icon: typeof CheckCircle2; color: string }> = {
  shipped: { label: "Готово", icon: CheckCircle2, color: "text-emerald-500" },
  in_progress: { label: "В работе", icon: Loader2, color: "text-[hsl(var(--accent))]" },
  planned: { label: "Запланировано", icon: CalendarClock, color: "text-amber-500" },
  idea: { label: "Идея", icon: Lightbulb, color: "text-violet-500" },
};

const COLUMNS: Status[] = ["shipped", "in_progress", "planned", "idea"];

export default function Roadmap() {
  const [filter, setFilter] = useState<"all" | Item["tag"]>("all");
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  const items = useMemo(
    () => (filter === "all" ? ITEMS : ITEMS.filter((i) => i.tag === filter)),
    [filter],
  );

  const tags: Array<"all" | Item["tag"]> = ["all", "AI", "UX", "Data", "Mobile", "Community"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-[hsl(var(--bg-2))] px-3 py-1 text-xs text-[hsl(var(--text-2))]">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
            Public roadmap · обновлено сегодня
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Что мы строим в Beggie</h1>
          <p className="mt-2 max-w-2xl text-[hsl(var(--text-2))]">
            Прозрачный план развития: что уже работает, что в разработке и какие идеи мы обсуждаем.
            Голосуй — фичи с большим числом голосов поднимаются в приоритете.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-[hsl(var(--text-2))]" />
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === t
                  ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]"
                  : "border-border text-[hsl(var(--text-2))] hover:text-foreground",
              )}
            >
              {t === "all" ? "Все" : t}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const meta = STATUS_META[col];
          const Icon = meta.icon;
          const colItems = items.filter((i) => i.status === col);

          return (
            <section
              key={col}
              className="flex flex-col gap-3 rounded-lg border border-border bg-[hsl(var(--bg-2))] p-4"
            >
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", meta.color, col === "in_progress" && "animate-spin-slow")} />
                  <h2 className="text-sm font-semibold">{meta.label}</h2>
                </div>
                <span className="rounded-full bg-[hsl(var(--bg-3))] px-2 py-0.5 text-[11px] text-[hsl(var(--text-2))]">
                  {colItems.length}
                </span>
              </header>

              <div className="flex flex-col gap-3">
                {colItems.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-[hsl(var(--text-3))]">
                    Пока пусто
                  </p>
                )}

                {colItems.map((item) => {
                  const isVoted = !!voted[item.id];
                  return (
                    <article
                      key={item.id}
                      className="group rounded-xl border border-border bg-[hsl(var(--bg-1))] p-4 transition-colors hover:border-[hsl(var(--accent)/0.5)]"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-md bg-[hsl(var(--bg-3))] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--text-2))]">
                          {item.tag}
                        </span>
                        <span className="text-[10px] text-[hsl(var(--text-3))]">{item.quarter}</span>
                      </div>
                      <h3 className="text-sm font-semibold leading-tight">{item.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--text-2))]">
                        {item.desc}
                      </p>

                      <button
                        onClick={() =>
                          setVoted((v) => ({ ...v, [item.id]: !v[item.id] }))
                        }
                        className={cn(
                          "mt-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                          isVoted
                            ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]"
                            : "border-border text-[hsl(var(--text-2))] hover:text-foreground",
                        )}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span className="num">{item.votes + (isVoted ? 1 : 0)}</span>
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="mt-10 rounded-lg border border-dashed border-border bg-[hsl(var(--bg-2))] p-6 text-center">
        <h3 className="text-base font-semibold">Не нашёл свою идею?</h3>
        <p className="mt-1 text-sm text-[hsl(var(--text-2))]">
          Напиши Бэгги в AI-советнике — мы добавим её в раздел «Идея» и вынесем на голосование.
        </p>
      </footer>
    </div>
  );
}
