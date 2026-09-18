import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { RhinoBust, RhinoLogo } from "./RhinoLogo";

interface Tip {
  text: string;
  cta?: { label: string; to: string };
}

const TIPS: Record<string, Tip> = {
  "/dashboard": {
    text: "Привет! Проверь задачи на этой неделе — не пропусти дедлайны 💪",
    cta: { label: "К плану", to: "/plan" },
  },
  "/plan": {
    text: "Отмечай выполненные задачи — прогресс мотивирует двигаться дальше!",
  },
  "/universities": {
    text: "Добавь 2–3 safety-университета. Степ советует не рисковать 🙂",
  },
  "/documents": {
    text: "Personal Statement — самый важный документ. Начни с него, остальное пойдёт легче.",
  },
  "/ai": {
    text: "Спроси меня что угодно про поступление — я изучил тысячи успешных кейсов 🦏",
  },
  "/interview": {
    text: "Потренируй ответы вслух перед зеркалом после нашей практики — это реально работает.",
  },
  "/profile": {
    text: "Заполни GPA и SAT — тогда расчёт шансов поступления будет точным.",
  },
};

const FIRST_LOGIN_TIP: Tip = {
  text: "Твой план готов! Я буду помогать тебе на каждом шагу. Начнём с главной страницы — там видно всё самое важное 🦏",
};

export function FloatingMascot() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const path = location.pathname;

  // Auto-open after fresh onboarding once
  useEffect(() => {
    const flag = sessionStorage.getItem("sw_first_open");
    if (flag === "1") {
      setOpen(true);
      sessionStorage.removeItem("sw_first_open");
    }
  }, []);

  const tip: Tip =
    sessionStorage.getItem("sw_first_open") === "1"
      ? FIRST_LOGIN_TIP
      : TIPS[path] || { text: "Чем могу помочь сегодня?" };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[320px] rounded-lg border border-border bg-bg2 p-4 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.18)] animate-fade-in">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <RhinoLogo size={20} />
              <span className="font-semibold text-foreground">Степ говорит:</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded p-1 text-text2 transition-colors hover:bg-bg3 hover:text-foreground"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{tip.text}</p>
          {tip.cta && (
            <button
              onClick={() => {
                navigate(tip.cta!.to);
                setOpen(false);
              }}
              className="mt-3 w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              {tip.cta.label}
            </button>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="sw-float flex h-[60px] w-[60px] items-center justify-center rounded-full bg-accent shadow-[0_8px_24px_-8px_hsl(var(--accent)/0.4)] transition-transform hover:scale-105 active:scale-95"
        aria-label="Открыть Степ"
      >
        <RhinoBust size={36} />
      </button>
    </div>
  );
}
