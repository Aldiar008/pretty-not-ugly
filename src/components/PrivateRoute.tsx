import { Navigate } from "react-router-dom";
import { useStore } from "@/store";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((s) => s.user);
  const onboardingComplete = useStore((s) => s.onboardingComplete);
  if (!user) return <Navigate to="/auth" replace />;
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
