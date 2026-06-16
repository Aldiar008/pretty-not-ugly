import { NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  LayoutDashboard,
  ListChecks,
  Building2,
  FileText,
  Bot,
  Mic,
  User as UserIcon,
  Sun,
  Moon,
  Zap,
  Trophy,
  Flame,
  PenLine,
  Map as MapIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { RhinoLogo } from "./RhinoLogo";
import { useStore, applyTheme } from "@/store";
import { setLanguage } from "@/i18n";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const user = useStore((s) => s.user);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const navigate = useNavigate();

  useEffect(() => applyTheme(theme), [theme]);

  const NAV = [
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/plan", label: t("nav.plan"), icon: ListChecks },
    { to: "/universities", label: t("nav.universities"), icon: Building2 },
    { to: "/documents", label: t("nav.documents"), icon: FileText },
    { to: "/essay", label: t("nav.essay"), icon: PenLine },
    { to: "/ai", label: t("nav.ai"), icon: Bot },
    { to: "/interview", label: t("nav.interview"), icon: Mic },
    { to: "/missions", label: t("nav.missions"), icon: Zap },
    { to: "/achievements", label: t("nav.achievements"), icon: Trophy },
    { to: "/roadmap", label: t("nav.roadmap"), icon: MapIcon },
    { to: "/profile", label: t("nav.profile"), icon: UserIcon },
  ];

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "ST";

  const streak = Number(localStorage.getItem("sw_streak") || 0);
  const lang = (i18n.language?.startsWith("en") ? "en" : "ru") as "ru" | "en";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 z-30 h-screen w-[260px] flex-col border-r border-border bg-[hsl(var(--bg-2))]">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2.5 px-5 py-5 text-left"
        >
          <RhinoLogo size={28} />
          <span className="text-[18px] font-bold tracking-tight">Stepwise</span>
        </button>

        <nav className="flex-1 px-3">
          <ul className="space-y-0.5">
            {NAV.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-[hsl(var(--bg-3))] text-foreground font-medium [&>svg]:text-[hsl(var(--accent))]"
                        : "text-[hsl(var(--text-2))] hover:bg-[hsl(var(--bg-2))] hover:text-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3 border-t border-border p-4">
          <div className="flex items-center gap-2 px-2 text-sm font-bold text-[hsl(var(--accent))]">
            <Flame className="h-4 w-4" />
            <span className="num">{streak}</span>
            <span className="text-[hsl(var(--text-2))] font-normal">{t("common.streak_days", { count: streak })}</span>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="flex w-full items-center gap-3 rounded-[10px] p-2 text-left transition-colors hover:bg-[hsl(var(--bg-3))]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--bg-3))] text-xs font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user?.name || "Гость"}</div>
              <div className="truncate text-[11px] text-[hsl(var(--text-3))]">{user?.email || ""}</div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 rounded-[8px] border border-border p-0.5 text-xs">
              {(["ru", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1 font-medium uppercase transition-colors",
                    lang === l
                      ? "bg-[hsl(var(--bg-3))] text-foreground"
                      : "text-[hsl(var(--text-2))] hover:text-foreground"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border text-[hsl(var(--text-2))] transition-colors hover:bg-[hsl(var(--bg-3))] hover:text-foreground"
              aria-label="Theme"
            >
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-[hsl(var(--bg-2))] md:hidden">
        {NAV.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px]",
                isActive ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--text-2))]"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
