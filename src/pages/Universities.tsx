import { useMemo, useState } from "react";
import { useStore } from "@/store";
import {
  UNIVERSITIES, COUNTRIES, calculateChance, flagFor,
} from "@/data/reference";
import type { UniversityRecord } from "@/data/reference";
import type { UniversityApplication, UniversityStatus } from "@/types";
import {
  Search, Plus, ExternalLink, GraduationCap, DollarSign, Award, X, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const STATUSES: { value: UniversityStatus; label: string; cls: string }[] = [
  { value: "wishlist", label: "Wishlist", cls: "bg-text3" },
  { value: "preparing", label: "Готовлюсь", cls: "bg-accent" },
  { value: "submitted", label: "Подано", cls: "bg-warning" },
  { value: "accepted", label: "Принят", cls: "bg-success" },
  { value: "rejected", label: "Отказ", cls: "bg-danger" },
  { value: "waitlist", label: "Лист ожидания", cls: "bg-purple" },
];

export default function Universities() {
  const user = useStore((s) => s.user);
  const universities = useStore((s) => s.universities);
  const addUniversity = useStore((s) => s.addUniversity);
  const updateUniversity = useStore((s) => s.updateUniversity);
  const removeUniversity = useStore((s) => s.removeUniversity);
  const addUniversityTasks = useStore((s) => s.addUniversityTasks);

  const [tab, setTab] = useState<"my" | "browse">("my");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<"all" | "safety" | "match" | "reach">("all");
  const [adding, setAdding] = useState<UniversityRecord | null>(null);

  const userScores = { gpa: user?.gpa ?? null, sat: user?.sat ?? null, ielts: user?.ielts ?? null };

  // Browse with chance precomputed
  const browseList = useMemo(() => {
    return UNIVERSITIES.map((u) => {
      const { chancePercent, tier } = calculateChance(userScores, {
        minGpa: u.minGpa, minSat: u.minSat, minIelts: u.minIelts,
      });
      return { ...u, chancePercent, tier };
    })
      .filter((u) => {
        if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.city.toLowerCase().includes(search.toLowerCase())) return false;
        if (country && u.country !== country) return false;
        if (tierFilter !== "all" && u.tier !== tierFilter) return false;
        return true;
      })
      .sort((a, b) => b.chancePercent - a.chancePercent);
  }, [search, country, tierFilter, user?.gpa, user?.sat, user?.ielts]);

  // Recommendations: top 3 match
  const recommendations = useMemo(() => {
    const targets = user?.targetCountries ?? [];
    return UNIVERSITIES.map((u) => {
      const { chancePercent, tier } = calculateChance(userScores, {
        minGpa: u.minGpa, minSat: u.minSat, minIelts: u.minIelts,
      });
      const targetBoost = targets.includes(u.country) ? 10 : 0;
      return { ...u, chancePercent, tier, _score: chancePercent + targetBoost };
    })
      .filter((u) => u.tier === "match")
      .sort((a, b) => b._score - a._score)
      .slice(0, 3);
  }, [user?.targetCountries, user?.gpa, user?.sat, user?.ielts]);

  const isAdded = (rec: UniversityRecord) => universities.some((u) => u.name === rec.name);

  const counts = {
    safety: universities.filter((u) => u.tier === "safety").length,
    match: universities.filter((u) => u.tier === "match").length,
    reach: universities.filter((u) => u.tier === "reach").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Университеты</h1>
        <p className="mt-1 text-sm text-text2">
          {universities.length} в списке · Safety {counts.safety} · Match {counts.match} · Reach {counts.reach}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-bg2 p-1 w-fit">
        {[
          { v: "my", l: "Мои заявки" },
          { v: "browse", l: "Каталог · 100+" },
        ].map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v as any)}
            className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
              tab === t.v ? "bg-background font-medium text-foreground" : "text-text2 hover:text-foreground"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tab === "my" ? (
        <>
          {/* Recommendations */}
          {universities.length < 3 && recommendations.length > 0 && (
            <section className="sw-card">
              <div className="mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-semibold">Рекомендации Step</h2>
                <span className="text-xs text-text3">— под твой профиль</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {recommendations.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border bg-background p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          <span className="mr-1">{r.countryFlag}</span>{r.name}
                        </div>
                        <div className="text-xs text-text3">{r.city}</div>
                      </div>
                      <ChanceBadge percent={r.chancePercent} tier={r.tier} />
                    </div>
                    <button
                      onClick={() => setAdding(r)}
                      disabled={isAdded(r)}
                      className="mt-3 w-full rounded-md border border-border bg-bg2 px-3 py-1.5 text-xs hover:bg-bg3 disabled:opacity-50"
                    >
                      {isAdded(r) ? "Уже в списке" : "Добавить"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {universities.length === 0 ? (
            <div className="sw-card flex flex-col items-center gap-3 py-14 text-center">
              <GraduationCap className="h-8 w-8 text-text3" />
              <div className="font-semibold">Список пуст</div>
              <p className="max-w-sm text-sm text-text2">Перейди в каталог и добавь первый университет в свой список.</p>
              <button
                onClick={() => setTab("browse")}
                className="mt-1 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90"
              >
                Открыть каталог
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {universities.map((u) => (
                <ApplicationCard
                  key={u.id}
                  uni={u}
                  onStatus={(s) => updateUniversity(u.id, { status: s })}
                  onRemove={() => removeWithUndo("university", u)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Filters */}
          <div className="grid gap-2 md:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text3" />
              <input
                className="sw-input pl-9"
                placeholder="Поиск по университету или городу"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="sw-input" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">Все страны</option>
              {COUNTRIES.filter((c) => UNIVERSITIES.some((u) => u.country === c.code)).map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
            <select className="sw-input" value={tierFilter} onChange={(e) => setTierFilter(e.target.value as any)}>
              <option value="all">Все шансы</option>
              <option value="safety">Safety (&gt;70%)</option>
              <option value="match">Match (40–70%)</option>
              <option value="reach">Reach (&lt;40%)</option>
            </select>
          </div>

          <div className="text-xs text-text3">{browseList.length} результатов</div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {browseList.map((u) => (
              <BrowseCard key={u.id} uni={u} added={isAdded(u)} onAdd={() => setAdding(u)} />
            ))}
          </div>
          {browseList.length === 0 && (
            <div className="py-10 text-center text-sm text-text3">Ничего не нашлось — попробуй другой запрос.</div>
          )}
        </>
      )}

      <AddDialog
        rec={adding}
        onClose={() => setAdding(null)}
        onConfirm={(payload) => {
          addUniversity(payload);
          // Find the just-added uni
          const list = useStore.getState().universities;
          const just = list[list.length - 1];
          if (just) {
            const added = addUniversityTasks(just);
            toast.success(`${payload.name} добавлен`, {
              description: added > 0 ? `Создано ${added} задач(и) под этот университет` : undefined,
            });
          }
          setAdding(null);
        }}
      />
    </div>
  );
}

function ChanceBadge({ percent, tier }: { percent: number; tier: string }) {
  const map: Record<string, string> = {
    safety: "bg-success/15 text-success border-success/30",
    match: "bg-warning/15 text-warning border-warning/30",
    reach: "bg-danger/15 text-danger border-danger/30",
  };
  return (
    <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular ${map[tier] || ""}`}>
      {percent}%
    </span>
  );
}

function BrowseCard({ uni, added, onAdd }: { uni: UniversityRecord & { chancePercent: number; tier: string }; added: boolean; onAdd: () => void }) {
  return (
    <div className="sw-card flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            <span className="mr-1">{uni.countryFlag}</span>{uni.name}
          </div>
          <div className="text-xs text-text3">{uni.city}</div>
        </div>
        <ChanceBadge percent={uni.chancePercent} tier={uni.tier} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-text2">
        <div className="flex items-center gap-1.5"><GraduationCap className="h-3 w-3" /> GPA {uni.minGpa}+</div>
        <div className="flex items-center gap-1.5">SAT {uni.minSat}+</div>
        <div className="flex items-center gap-1.5">IELTS {uni.minIelts}+</div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3 w-3" />
          {uni.tuitionUsd === 0 ? "бесплатно" : `${(uni.tuitionUsd / 1000).toFixed(0)}k/год`}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onAdd}
          disabled={added}
          className="flex-1 rounded-md border border-border bg-bg2 px-3 py-1.5 text-xs hover:bg-bg3 disabled:opacity-50"
        >
          {added ? "В списке ✓" : "+ В список"}
        </button>
        <a
          href={uni.website}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-border bg-bg2 p-1.5 text-text2 hover:text-foreground"
          aria-label="website"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function ApplicationCard({
  uni, onStatus, onRemove,
}: {
  uni: UniversityApplication;
  onStatus: (s: UniversityStatus) => void;
  onRemove: () => void;
}) {
  const today = new Date();
  const days = uni.deadline ? Math.ceil((+new Date(uni.deadline) - +today) / 86400000) : null;
  const dlClass =
    days === null ? "text-text3" :
    days < 0 ? "text-danger" :
    days < 14 ? "text-danger" :
    days <= 30 ? "text-warning" : "text-text2";
  return (
    <div className="sw-card group flex flex-col gap-3 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <div className="text-base font-semibold">
          <span className="mr-1.5">{uni.countryFlag}</span>{uni.name}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text2">
          <span>GPA {uni.minGpa}+ · SAT {uni.minSat}+ · IELTS {uni.minIelts}+</span>
          <span>· {uni.tuitionUsd === 0 ? "бесплатно" : `$${uni.tuitionUsd.toLocaleString()}/год`}</span>
          {uni.hasScholarship && <span className="text-success">· стипендия</span>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ChanceBadge percent={uni.chancePercent} tier={uni.tier} />
        <select
          className="sw-input !py-1.5 !text-xs w-[140px]"
          value={uni.status}
          onChange={(e) => onStatus(e.target.value as UniversityStatus)}
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {uni.deadline && (
          <span className={`text-xs tabular ${dlClass}`}>
            {new Date(uni.deadline).toLocaleDateString("ru-RU")}
            {days !== null && ` · ${days < 0 ? "просрочено" : `${days} дн`}`}
          </span>
        )}
        <button onClick={onRemove} className="rounded-md p-1.5 text-text3 hover:bg-bg3 hover:text-danger" aria-label="delete">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function AddDialog({
  rec, onClose, onConfirm,
}: {
  rec: UniversityRecord | null;
  onClose: () => void;
  onConfirm: (a: Omit<UniversityApplication, "id" | "chancePercent" | "tier">) => void;
}) {
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<UniversityStatus>("wishlist");

  if (!rec) return null;

  return (
    <Dialog open={!!rec} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{rec.countryFlag}</span> {rec.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-bg2 p-3 text-xs text-text2">
            {rec.city} · GPA {rec.minGpa}+ · SAT {rec.minSat}+ · IELTS {rec.minIelts}+
          </div>
          <div>
            <label className="sw-label">Дедлайн подачи</label>
            <input type="date" className="sw-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div>
            <label className="sw-label">Статус</label>
            <select className="sw-input" value={status} onChange={(e) => setStatus(e.target.value as UniversityStatus)}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <p className="text-xs text-text3">
            Step автоматически создаст задачи: проверить требования, написать эссе, подать заявку.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-3.5 py-2 text-sm hover:bg-bg3">Отмена</button>
          <button
            onClick={() =>
              onConfirm({
                name: rec.name,
                country: rec.country,
                countryFlag: rec.countryFlag,
                deadline: deadline || "",
                status,
                minGpa: rec.minGpa,
                minSat: rec.minSat,
                minIelts: rec.minIelts,
                tuitionUsd: rec.tuitionUsd,
                hasScholarship: rec.hasScholarship,
                notes: "",
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Добавить
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
