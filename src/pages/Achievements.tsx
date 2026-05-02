import { useTranslation } from "react-i18next";
import { Trophy, Medal, Star, Flame, BookOpen, Target, Upload } from "lucide-react";
import { useStore } from "@/store";
import { useRef, useState } from "react";
import { toast } from "sonner";

const BADGES = [
  { id: "first-task", icon: Target, title: "Первый шаг", desc: "Закрыл первую задачу" },
  { id: "streak-3", icon: Flame, title: "Три дня подряд", desc: "Стрик 3 дня" },
  { id: "streak-7", icon: Flame, title: "Неделя силы", desc: "Стрик 7 дней" },
  { id: "uni-3", icon: Star, title: "Список мечты", desc: "3 университета добавлены" },
  { id: "doc-1", icon: BookOpen, title: "Бумажный воин", desc: "Завершил 1 документ" },
  { id: "interview-1", icon: Medal, title: "Голос наружу", desc: "Прошёл 1 интервью с AI" },
];

interface Uploaded {
  id: string;
  title: string;
  imageBase64: string;
  uploadedAt: string;
}

export default function Achievements() {
  const { t } = useTranslation();
  const tasksDone = useStore((s) => s.tasks.filter((x) => x.done).length);
  const uniCount = useStore((s) => s.universities.length);
  const docsDone = useStore((s) => s.documents.filter((d) => d.status === "complete" || d.status === "sent").length);
  const interviews = useStore((s) => s.interviewSessions?.length ?? 0);
  const streak = useStore((s) => s.user?.streak ?? 0);

  const earned = new Set<string>();
  if (tasksDone >= 1) earned.add("first-task");
  if (streak >= 3) earned.add("streak-3");
  if (streak >= 7) earned.add("streak-7");
  if (uniCount >= 3) earned.add("uni-3");
  if (docsDone >= 1) earned.add("doc-1");
  if (interviews >= 1) earned.add("interview-1");

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<Uploaded[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("sw_uploaded_achievements") || "[]");
    } catch {
      return [];
    }
  });

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4_000_000) {
      toast.error("Файл больше 4 МБ");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const item: Uploaded = {
        id: crypto.randomUUID(),
        title: f.name.replace(/\.[^.]+$/, ""),
        imageBase64: reader.result as string,
        uploadedAt: new Date().toISOString(),
      };
      const next = [item, ...uploaded].slice(0, 30);
      setUploaded(next);
      localStorage.setItem("sw_uploaded_achievements", JSON.stringify(next));
      toast.success("Грамота загружена");
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="sw-pill mb-3">
          <Trophy className="h-4 w-4" /> {t("achievements.title")}
        </div>
        <h1>{t("achievements.title")}</h1>
        <p className="mt-3 text-[hsl(var(--text-2))] max-w-xl">{t("achievements.subtitle")}</p>
      </header>

      <section>
        <h3 className="mb-4">{t("achievements.badges")}</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {BADGES.map((b) => {
            const got = earned.has(b.id);
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className={`sw-card flex flex-col items-center text-center transition-opacity ${got ? "" : "opacity-40 grayscale"}`}
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent-subtle))]">
                  <Icon className="h-7 w-7 text-[hsl(var(--accent))]" />
                </div>
                <div className="font-semibold">{b.title}</div>
                <p className="mt-1 text-xs text-[hsl(var(--text-2))]">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3>{t("achievements.uploaded")}</h3>
          <button onClick={() => fileRef.current?.click()} className="sw-btn-primary">
            <Upload className="h-4 w-4" /> {t("achievements.upload_cta")}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        </div>

        {uploaded.length === 0 ? (
          <div className="sw-card text-sm text-[hsl(var(--text-2))]">
            Загрузи грамоты, дипломы и сертификаты — они помогут собрать сильное портфолио.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {uploaded.map((u) => (
              <div key={u.id} className="sw-card-bare overflow-hidden">
                <img src={u.imageBase64} alt={u.title} className="aspect-square w-full object-cover" />
                <div className="p-3 text-sm font-medium">{u.title}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
