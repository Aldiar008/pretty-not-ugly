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
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <RhinoLogo size={28} />
            <span className="text-base font-bold tracking-tight">Stepwise</span>
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
      <section className="mx-auto max-w-[1280px] px-5 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-[1.3fr_1fr]">
          <div>
            <span className="sw-pill mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Платформа для поступления в университеты
            </span>
            <h1 className="text-[44px] md:text-[56px] font-semibold leading-[1.05] tracking-tight">
              Поступи в университет
              <br />
              <span className="text-accent">мечты.</span> Шаг за шагом.
            </h1>
            <p className="mt-6 max-w-[560px] text-base leading-relaxed text-text2">
              Stepwise помогает ученикам из 50+ стран выстроить персональный план поступления,
              отслеживать задачи и документы, находить подходящие университеты и готовиться
              к интервью.
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
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-text2">
              {["Бесплатно", "Без карты", "AI-советник", "100+ университетов"].map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Hero illustration: oversized rhino */}
          <div className="relative hidden md:flex items-center justify-center">
            <div className="absolute inset-0 -z-10 rounded-[40px] bg-bg2" />
            <div className="p-10">
              <RhinoLogo size={240} />
              <div className="mt-6 flex justify-center gap-2">
                <span className="sw-chip">📚 Гайд</span>
                <span className="sw-chip">🎓 Топ-100</span>
                <span className="sw-chip">🌍 50+ стран</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-[1280px] px-5 pb-16">
        <div className="grid gap-6 md:grid-cols-4 relative">
          {STEPS.map((label, i) => (
            <div key={i} className="sw-card relative">
              <div className="text-text3 text-xs font-medium tabular">ШАГ {i + 1}</div>
              <div className="mt-2 text-base font-semibold">{label}</div>
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="hidden md:block absolute top-1/2 -right-4 h-px w-8 border-t border-dashed border-border"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-[1280px] px-5 py-16">
        <h2 className="mb-2 text-3xl font-semibold tracking-tight">
          Всё для поступления — в одном месте
        </h2>
        <p className="mb-10 max-w-[560px] text-text2">
          От первого черновика эссе до интервью в приёмной комиссии. Stepwise держит весь
          путь под контролем.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="sw-card transition-colors hover:border-foreground/20">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-bg3 text-accent">
                <Icon className="h-4 w-4" />
              </div>
              <div className="mb-1 font-semibold">{title}</div>
              <div className="text-sm text-text2">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-[1280px] px-5 pb-20">
        <div className="rounded-2xl border border-border bg-bg3 p-10 text-center">
          <h3 className="text-2xl font-semibold tracking-tight">Готов начать?</h3>
          <p className="mx-auto mt-2 max-w-md text-text2">
            Создай аккаунт за минуту — мы выстроим твой план поступления.
          </p>
          <Link
            to={user ? "/dashboard" : "/auth?mode=signup"}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
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
