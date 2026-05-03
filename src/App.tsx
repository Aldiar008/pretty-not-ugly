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
import Plan from "./pages/Plan";
import Universities from "./pages/Universities";
import Documents from "./pages/Documents";
import AIAdvisor from "./pages/AIAdvisor";
import Interview from "./pages/Interview";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Missions from "./pages/Missions";
import Achievements from "./pages/Achievements";
import EssayStudio from "./pages/EssayStudio";

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
            <Route path="/plan" element={<Plan />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/ai" element={<AIAdvisor />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/essay" element={<EssayStudio />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
