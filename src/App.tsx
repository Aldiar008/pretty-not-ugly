import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore, applyTheme } from "@/store";
import { AppLayout } from "@/components/AppLayout";
import { PrivateRoute } from "@/components/PrivateRoute";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Stub from "./pages/Stub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ThemeBoot() {
  const theme = useStore((s) => s.theme);
  useEffect(() => applyTheme(theme), [theme]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeBoot />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plan" element={<Stub title="Мой план" description="Таймлайн и чеклист задач." />} />
            <Route path="/universities" element={<Stub title="Университеты" description="100+ университетов, шансы поступления и заявки." />} />
            <Route path="/documents" element={<Stub title="Документы" description="Personal Statement, эссе, транскрипты, рекомендации." />} />
            <Route path="/ai" element={<Stub title="AI-советник" description="Чат с персональным советником по поступлению." />} />
            <Route path="/interview" element={<Stub title="Интервью" description="Тренажёр университетских интервью с AI." />} />
            <Route path="/profile" element={<Stub title="Профиль" description="Личные данные, академические показатели и цели." />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
