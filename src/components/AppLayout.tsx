import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { FloatingMascot } from "./FloatingMascot";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="md:pl-[240px] pb-20 md:pb-0">
        <div className="mx-auto max-w-[1280px] px-5 py-6 md:px-10 md:py-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
      <FloatingMascot />
    </div>
  );
}
