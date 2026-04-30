import { Link } from "react-router-dom";
import { Construction } from "lucide-react";

export default function Stub({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-text2">{description}</p>
      </div>
      <div className="sw-card flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg3 text-accent">
          <Construction className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold">Скоро здесь</div>
          <p className="mt-1 text-sm text-text2">
            Эта страница в разработке — допилим в следующей итерации. Пока загляни на{" "}
            <Link to="/dashboard" className="text-accent hover:underline">главную</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
