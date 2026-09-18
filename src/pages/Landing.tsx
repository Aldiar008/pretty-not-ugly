import { Link } from "react-router-dom";
import { useStore } from "@/store";
import { RhinoLogo } from "@/components/RhinoLogo";
import {
  Bot,
  Search,
  ListChecks,
  FileText,
  Mic,
  RefreshCw,
  ArrowRight,
  Check,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect } from "react";
import { applyTheme } from "@/store";

const FEATURES = [
  { icon: Bot, title: "AI-советник", desc: "Персональный чат по твоему профилю" },
  { icon: Search, title: "Умный подбор", desc: "100+ университетов под твои баллы" },
  { icon: ListChecks, title: "План поступления", desc: "Дорожная карта по месяцам" },
  { icon: FileText, title: "Трекер документов", desc: "Не пропусти ни одного дедлайна" },
  { icon: Mic, title: "Интервью-тренер", desc: "Подготовься к реальному интервью с AI" },
  { icon: RefreshCw, title: "Конвертер баллов", desc: "Нац. экзамен → GPA / SAT / %" },
];

const STEPS = [
  "Заполни профиль",
  "Пройди тест компетенций",
  "Получи список университетов",
  "Следуй плану поступления",
];

export default function Landing() {
  const user = useStore((s) => s.user);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  useEffect(() => applyTheme(theme), [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <RhinoLogo size={26} />
            <span className="text-base font-semibold tracking-tight">Stepwise</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg p-2 text-text2 transition-colors hover:bg-bg3 hover:text-foreground"
              aria-label="Тема"
            >
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <Link
              to="/auth"
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-bg3"
            >
              Войти
            </Link>
            <Link
              to={user ? "/dashboard" : "/auth?mode=signup"}
              className="hidden sm:inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-5 pt-14 pb-20 md:pt-20 md:pb-28">
        <div className="grid items-start gap-14 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="font-display text-[42px] leading-[1.08] tracking-tight md:text-[60px]">
              Поступление в университет —
              <br />
              это план, а не удача.
            </h1>
            <p className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-text2">
              Stepwise помогает ученикам из 50+ стран выстроить личный план поступления,
              отслеживать задачи и документы, находить подходящие университеты и готовиться
              к интервью — по шагам, без хаоса в закладках и таблицах.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={user ? "/dashboard" : "/auth?mode=signup"}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Начать бесплатно
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-bg3"
              >
                Посмотреть демо
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text2">
              {["Бесплатно", "Без карты", "AI-советник", "100+ университетов"].map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right: an actual application snapshot, not a decorative illustration */}
          <div className="sw-card-bare overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <div className="text-xs text-text3">Заявка</div>
                <div className="font-medium">Harvard College</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text3">Шанс</div>
                <div className="tabular text-lg font-semibold text-[hsl(var(--accent))]">92%</div>
              </div>
            </div>
            <ul className="divide-y divide-border">
              {[
                { label: "Эссе", done: true },
                { label: "Рекомендательные письма", done: true },
                { label: "Транскрипт", done: true },
                { label: "SAT-результаты", done: false },
              ].map((row) => (
                <li key={row.label} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span
                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[4px] border ${
                      row.done
                        ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                        : "border-border"
                    }`}
                  >
                    {row.done && <Check className="h-3 w-3" />}
                  </span>
                  <span className={row.done ? "text-text2 line-through decoration-border" : "text-foreground"}>
                    {row.label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 border-t border-[hsl(var(--gold)/25%)] bg-[hsl(var(--gold-subtle))] px-5 py-3 text-xs text-[hsl(var(--gold))]">
              <RhinoLogo size={16} static />
              Дедлайн через 12 дней — Степ напомнит вовремя
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-border bg-bg2">
        <div className="mx-auto max-w-[1200px] px-5 py-10">
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-4">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-baseline gap-3">
                <span className="font-display text-2xl text-[hsl(var(--gold))]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — read like a checklist, not decoration */}
      <section className="mx-auto max-w-[1200px] px-5 py-20">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-display text-3xl leading-tight tracking-tight md:text-[34px]">
              Всё для поступления —
              <br />в одном месте
            </h2>
            <p className="mt-4 max-w-[42ch] text-text2">
              От первого черновика эссе до интервью в приёмной комиссии. Stepwise держит весь
              путь под контролем.
            </p>
          </div>
          <div className="sw-card-bare divide-y divide-border">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{title}</div>
                  <div className="text-sm text-text2">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-[1200px] px-5 pb-20">
        <div className="rounded-lg border border-border bg-[hsl(var(--foreground))] px-8 py-12 text-center text-[hsl(var(--background))] md:px-16">
          <h3 className="font-display text-3xl tracking-tight">Готов начать?</h3>
          <p className="mx-auto mt-3 max-w-md text-[hsl(var(--background)/70%)]">
            Создай аккаунт за минуту — мы выстроим твой план поступления.
          </p>
          <Link
            to={user ? "/dashboard" : "/auth?mode=signup"}
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--gold))] px-6 py-3 text-sm font-medium text-[hsl(var(--sidebar-bg))] transition-opacity hover:opacity-90"
          >
            Создать аккаунт
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-text3">
        Stepwise — твой путь в зарубежный университет.
      </footer>
    </div>
  );
}
