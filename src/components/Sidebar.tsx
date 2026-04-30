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
} from "lucide-react";
import { RhinoLogo } from "./RhinoLogo";
import { useStore, applyTheme } from "@/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { to: "/plan", label: "Мой план", icon: ListChecks },
  { to: "/universities", label: "Университеты", icon: Building2 },
  { to: "/documents", label: "Документы", icon: FileText },
  { to: "/ai", label: "AI-советник", icon: Bot },
  { to: "/interview", label: "Интервью", icon: Mic },
  { to: "/profile", label: "Профиль", icon: UserIcon },
];

export function Sidebar() {
  const user = useStore((s) => s.user);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const navigate = useNavigate();

  useEffect(() => applyTheme(theme), [theme]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 z-30 h-screen w-[240px] flex-col border-r border-border bg-bg2">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-5 py-5 text-left"
        >
          <RhinoLogo size={28} />
          <span className="text-base font-bold tracking-tight">Stepwise</span>
        </button>

        <nav className="flex-1 px-3">
          <ul className="space-y-0.5">
            {NAV.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-bg3 text-foreground [&>svg]:text-accent font-medium"
                        : "text-text2 hover:bg-bg3 hover:text-foreground"
                    )
                  }
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3 border-t border-border p-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-xs text-text2 transition-colors hover:bg-bg3 hover:text-foreground"
          >
            <span>Тема</span>
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-bg3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg3 text-xs font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user?.name || "Гость"}</div>
              <div className="truncate text-[11px] text-text3">{user?.email || ""}</div>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-bg2 md:hidden">
        {NAV.slice(0, 5).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px]",
                isActive ? "text-accent" : "text-text2"
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
