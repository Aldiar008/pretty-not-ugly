import { useStore } from "@/store";
import { Link } from "react-router-dom";
import { AlertCircle, Plus, ArrowRight } from "lucide-react";
import { flagFor } from "@/data/reference";
import { ProgressRings } from "@/components/ProgressRings";
import { SpiderChart } from "@/components/SpiderChart";

export default function Dashboard() {
  const user = useStore((s) => s.user);
  const tasks = useStore((s) => s.tasks);
  const universities = useStore((s) => s.universities);
  const documents = useStore((s) => s.documents);
  const testResults = useStore((s) => s.testResults);
  const toggleTask = useStore((s) => s.toggleTask);

  const hour = new Date().getHours();
  const greet =
    hour < 6 ? "Не спишь?" : hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.done).length;
  const totalDocs = documents.length;
  const doneDocs = documents.filter((d) => d.status === "complete" || d.status === "sent").length;
  const submittedUnis = universities.filter((u) => ["submitted", "accepted"].includes(u.status)).length;

  const total = totalTasks + totalDocs + universities.length;
  const done = doneTasks + doneDocs + submittedUnis;
  const overall = total ? Math.round((done / total) * 100) : 0;

  const safety = universities.filter((u) => u.tier === "safety").length;
  const match = universities.filter((u) => u.tier === "match").length;
  const reach = universities.filter((u) => u.tier === "reach").length;

  const today = new Date();
  const upcoming = [...universities]
    .filter((u) => u.deadline)
    .sort((a, b) => (a.deadline < b.deadline ? -1 : 1))[0];
  const daysTo = upcoming
    ? Math.max(0, Math.ceil((+new Date(upcoming.deadline) - +today) / 86400000))
    : null;

  const todoNow = [...tasks]
    .filter((t) => !t.done)
    .sort((a, b) => {
      const order = { urgent: 0, important: 1, later: 2 } as const;
      if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
      return (a.deadline || "9999") < (b.deadline || "9999") ? -1 : 1;
    })
    .slice(0, 3);

  const dlColor = (deadline: string | null) => {
    if (!deadline) return "text-text3";
    const days = Math.ceil((+new Date(deadline) - +today) / 86400000);
    if (days < 14) return "text-danger";
    if (days <= 30) return "text-warning";
    return "text-success";
  };

  const upcomingDeadlines = [...universities]
    .filter((u) => u.deadline)
    .sort((a, b) => (a.deadline < b.deadline ? -1 : 1))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header + Rings */}
      <div className="sw-card flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {greet}, {user?.name?.split(" ")[0] || "друг"} 👋
          </h1>
          <p className="mt-1 text-sm text-text2">Вот срез твоего прогресса.</p>
          <div className="mt-3 text-xs text-text2">
            Общий прогресс: <span className="font-semibold text-foreground">{overall}%</span>
          </div>
        </div>
        <ProgressRings
          tasks={{ done: doneTasks, total: totalTasks }}
          docs={{ done: doneDocs, total: totalDocs }}
          unis={{ done: submittedUnis, total: universities.length }}
        />
      </div>

      {/* Metric cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Университеты" big={`${universities.length}`}>
          <div className="text-xs text-text3 tabular">Safety {safety} · Match {match} · Reach {reach}</div>
        </Metric>
        <Metric label="Задачи" big={`${doneTasks} / ${totalTasks}`}>
          <ProgressBar value={totalTasks ? (doneTasks / totalTasks) * 100 : 0} />
        </Metric>
        <Metric label="Документы" big={`${doneDocs} / ${totalDocs}`}>
          <ProgressBar value={totalDocs ? (doneDocs / totalDocs) * 100 : 0} />
        </Metric>
        <Metric label="До дедлайна" big={daysTo !== null ? `${daysTo} дн` : "—"}>
          <div className="truncate text-xs text-text3">{upcoming?.name || "Нет дедлайнов"}</div>
        </Metric>
      </div>

      {/* Two columns */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Do now */}
          <section className="sw-card">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-danger" />
                <h2 className="text-base font-semibold">Сделать сейчас</h2>
              </div>
              <Link to="/plan" className="text-xs text-accent hover:underline">Весь план →</Link>
            </div>
            {todoNow.length === 0 ? (
              <div className="py-6 text-center text-sm text-text3">Свободен! Все срочные задачи закрыты ✓</div>
            ) : (
              <ul className="space-y-2">
                {todoNow.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                    <button
                      onClick={() => toggleTask(t.id)}
                      className="h-4 w-4 flex-shrink-0 rounded border border-border hover:border-accent"
                      aria-label="Выполнено"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{t.title}</div>
                      <div className={`text-xs ${dlColor(t.deadline)}`}>
                        {t.deadline ? new Date(t.deadline).toLocaleDateString("ru-RU") : "Без даты"}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleTask(t.id)}
                      className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-bg3"
                    >
                      Готово
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Universities table */}
          <section className="sw-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Заявки в университеты</h2>
              <Link to="/universities" className="text-xs text-accent hover:underline">Все →</Link>
            </div>
            {universities.length === 0 ? (
              <EmptyAction to="/universities" label="Добавить первый университет" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-text3">
                      <th className="pb-2">Университет</th>
                      <th className="pb-2">Шанс</th>
                      <th className="pb-2">Статус</th>
                      <th className="pb-2 text-right">Дедлайн</th>
                    </tr>
                  </thead>
                  <tbody>
                    {universities.slice(0, 6).map((u) => (
                      <tr key={u.id} className="border-t border-border">
                        <td className="py-2.5"><span className="mr-1.5">{flagFor(u.country)}</span>{u.name}</td>
                        <td className="py-2.5 tabular text-text2">{u.chancePercent}%</td>
                        <td className="py-2.5"><StatusDot status={u.status} /></td>
                        <td className="py-2.5 text-right text-text2 tabular">{u.deadline ? new Date(u.deadline).toLocaleDateString("ru-RU") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Quick actions */}
          <section className="grid grid-cols-2 gap-3">
            <QuickAction to="/plan" label="+ Задача" />
            <QuickAction to="/universities" label="+ Университет" />
            <QuickAction to="/documents" label="+ Документ" />
            <QuickAction to="/ai" label="Спросить AI" primary />
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className="sw-card">
            <h2 className="mb-4 text-base font-semibold">Компетенции</h2>
            <div className="flex flex-col items-center">
              <SpiderChart data={testResults?.scores ?? []} size={240} />
              {testResults ? (
                <div className="mt-2 text-center text-sm">
                  <span className="text-text2">Главная сила:</span>{" "}
                  <strong>{testResults.topCompetencies.join(", ")}</strong>
                </div>
              ) : (
                <Link to="/onboarding" className="mt-2 text-xs text-accent hover:underline">
                  Пройди тест, чтобы увидеть свои сильные стороны →
                </Link>
              )}
            </div>
          </section>

          <section className="sw-card">
            <h2 className="mb-4 text-base font-semibold">Ближайшие дедлайны</h2>
            {upcomingDeadlines.length === 0 ? (
              <div className="py-6 text-center text-sm text-text3">Пока нет дедлайнов</div>
            ) : (
              <ul className="space-y-3">
                {upcomingDeadlines.map((u) => {
                  const days = Math.ceil((+new Date(u.deadline) - +today) / 86400000);
                  const color = days < 14 ? "bg-danger" : days <= 30 ? "bg-warning" : "bg-success";
                  return (
                    <li key={u.id} className="flex items-center gap-3 text-sm">
                      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${color}`} />
                      <span className="tabular text-text3 w-20">{new Date(u.deadline).toLocaleDateString("ru-RU")}</span>
                      <span className="flex-1 truncate">{u.name}</span>
                      <span className="text-xs text-text2 tabular">{days} дн</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, big, children }: { label: string; big: string; children?: React.ReactNode }) {
  return (
    <div className="sw-card">
      <div className="text-xs uppercase tracking-wider text-text3">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight tabular">{big}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-bg3">
      <div className="h-full bg-accent transition-all duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}
function StatusDot({ status }: { status: string }) {
  const map: Record<string, { c: string; l: string }> = {
    wishlist: { c: "bg-text3", l: "Wishlist" },
    preparing: { c: "bg-accent", l: "Готовлюсь" },
    submitted: { c: "bg-warning", l: "Подано" },
    accepted: { c: "bg-success", l: "Принят" },
    rejected: { c: "bg-danger", l: "Отказ" },
    waitlist: { c: "bg-purple", l: "Лист ожидания" },
  };
  const m = map[status] || map.wishlist;
  return <span className="inline-flex items-center gap-1.5 text-xs"><span className={`h-1.5 w-1.5 rounded-full ${m.c}`} />{m.l}</span>;
}
function QuickAction({ to, label, primary }: { to: string; label: string; primary?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
        primary
          ? "border-accent bg-accent text-accent-foreground hover:opacity-90"
          : "border-border bg-bg2 text-foreground hover:bg-bg3"
      }`}
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
function EmptyAction({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-8 text-sm text-text2 hover:border-accent hover:text-foreground">
      <Plus className="h-4 w-4" /> {label} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
