import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { COUNTRIES, GRADES, MAJORS, BUDGETS, examFor, flagFor, countryName } from "@/data/reference";
import { LogOut, Save, Edit2, BarChart3 } from "lucide-react";
import { SpiderChart } from "@/components/SpiderChart";
import { toast } from "sonner";

const TARGET_COUNTRIES = [
  "US", "GB", "CA", "AU", "SG", "KR", "AE", "JP",
  // Europe
  "DE", "NL", "CH", "FR", "IT", "ES", "SE", "NO", "FI", "DK", "IE", "BE", "AT", "PL", "CZ", "PT",
];

export default function Profile() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const updateUser = useStore((s) => s.updateUser);
  const testResults = useStore((s) => s.testResults);
  const reset = useStore((s) => s.reset);

  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(() => ({
    name: user?.name || "",
    country: user?.country || "KZ",
    grade: user?.grade || "11",
    startYear: user?.startYear || "2026",
    nationalScore: user?.nationalScore?.toString() || "",
    gpa: user?.gpa?.toString() || "",
    sat: user?.sat?.toString() || "",
    ielts: user?.ielts?.toString() || "",
    toefl: user?.toefl?.toString() || "",
    targetCountries: user?.targetCountries || [],
    targetMajor: user?.targetMajor || "Computer Science",
    budget: user?.budget || "any",
  }));

  if (!user) return null;

  const exam = examFor(draft.country);

  const save = () => {
    const ns = draft.nationalScore ? parseFloat(draft.nationalScore) : null;
    updateUser({
      name: draft.name,
      country: draft.country,
      grade: draft.grade,
      startYear: draft.startYear,
      nationalScore: ns,
      gpa: draft.gpa ? parseFloat(draft.gpa) : null,
      sat: draft.sat ? parseInt(draft.sat) : null,
      ielts: draft.ielts ? parseFloat(draft.ielts) : null,
      toefl: draft.toefl ? parseInt(draft.toefl) : null,
      targetCountries: draft.targetCountries,
      targetMajor: draft.targetMajor,
      budget: draft.budget,
    });
    toast.success("Профиль обновлён · шансы пересчитаны");
    setEdit(false);
  };

  const signOut = () => {
    if (!confirm("Выйти и удалить локальные данные?")) return;
    reset();
    navigate("/");
  };

  const toggleTarget = (code: string) => {
    setDraft((d) => ({
      ...d,
      targetCountries: d.targetCountries.includes(code)
        ? d.targetCountries.filter((c) => c !== code)
        : [...d.targetCountries, code],
    }));
  };

  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg3 text-lg font-semibold">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
            <p className="text-sm text-text2">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!edit ? (
            <button onClick={() => setEdit(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg2 px-3.5 py-2 text-sm hover:bg-bg3">
              <Edit2 className="h-3.5 w-3.5" /> Редактировать
            </button>
          ) : (
            <>
              <button onClick={() => setEdit(false)} className="rounded-lg border border-border px-3.5 py-2 text-sm hover:bg-bg3">Отмена</button>
              <button onClick={save} className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90">
                <Save className="h-3.5 w-3.5" /> Сохранить
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Personal */}
          <section className="sw-card space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text2">Личные данные</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Имя">
                {edit
                  ? <input className="sw-input" value={draft.name} onChange={(e) => setDraft({...draft, name: e.target.value})} />
                  : <Value>{user.name}</Value>}
              </Field>
              <Field label="Страна">
                {edit
                  ? <select className="sw-input" value={draft.country} onChange={(e) => setDraft({...draft, country: e.target.value})}>
                      {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                    </select>
                  : <Value>{flagFor(user.country)} {countryName(user.country)}</Value>}
              </Field>
              <Field label="Класс / курс">
                {edit
                  ? <select className="sw-input" value={draft.grade} onChange={(e) => setDraft({...draft, grade: e.target.value})}>
                      {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  : <Value>{GRADES.find((g) => g.value === user.grade)?.label || user.grade}</Value>}
              </Field>
              <Field label="Год поступления">
                {edit
                  ? <input className="sw-input" value={draft.startYear} onChange={(e) => setDraft({...draft, startYear: e.target.value})} />
                  : <Value>{user.startYear}</Value>}
              </Field>
            </div>
          </section>

          {/* Academic */}
          <section className="sw-card space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text2">Академические показатели</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={`${exam.name} (${exam.hint})`}>
                {edit
                  ? <input className="sw-input tabular" value={draft.nationalScore} onChange={(e) => setDraft({...draft, nationalScore: e.target.value})} />
                  : <Value>{user.nationalScore ?? "—"}</Value>}
              </Field>
              <Field label="GPA (4.0)">
                {edit
                  ? <input className="sw-input tabular" placeholder="3.7" value={draft.gpa} onChange={(e) => setDraft({...draft, gpa: e.target.value})} />
                  : <Value>{user.gpa ?? "—"}</Value>}
              </Field>
              <Field label="SAT">
                {edit
                  ? <input className="sw-input tabular" placeholder="1450" value={draft.sat} onChange={(e) => setDraft({...draft, sat: e.target.value})} />
                  : <Value>{user.sat ?? "—"}</Value>}
              </Field>
              <Field label="IELTS">
                {edit
                  ? <input className="sw-input tabular" value={draft.ielts} onChange={(e) => setDraft({...draft, ielts: e.target.value})} />
                  : <Value>{user.ielts ?? "—"}</Value>}
              </Field>
              <Field label="TOEFL">
                {edit
                  ? <input className="sw-input tabular" value={draft.toefl} onChange={(e) => setDraft({...draft, toefl: e.target.value})} />
                  : <Value>{user.toefl ?? "—"}</Value>}
              </Field>
            </div>
          </section>

          {/* Goals */}
          <section className="sw-card space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text2">Цели</h2>
            <Field label="Целевые страны">
              {edit ? (
                <div className="flex flex-wrap gap-2">
                  {TARGET_COUNTRIES.map((code) => {
                    const active = draft.targetCountries.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleTarget(code)}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          active ? "border-foreground bg-foreground text-background" : "border-border bg-bg2 text-text2 hover:text-foreground"
                        }`}
                      >
                        {flagFor(code)} {countryName(code)}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <Value>
                  {user.targetCountries.length
                    ? user.targetCountries.map((c) => `${flagFor(c)} ${countryName(c)}`).join(", ")
                    : "—"}
                </Value>
              )}
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Специальность">
                {edit
                  ? <select className="sw-input" value={draft.targetMajor} onChange={(e) => setDraft({...draft, targetMajor: e.target.value})}>
                      {MAJORS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  : <Value>{user.targetMajor}</Value>}
              </Field>
              <Field label="Бюджет">
                {edit
                  ? <select className="sw-input" value={draft.budget} onChange={(e) => setDraft({...draft, budget: e.target.value})}>
                      {BUDGETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                  : <Value>{BUDGETS.find((b) => b.value === user.budget)?.label || user.budget}</Value>}
              </Field>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className="sw-card">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold">Карта компетенций</h2>
            </div>
            {testResults ? (
              <>
                <div className="flex justify-center">
                  <SpiderChart data={testResults.scores} size={260} />
                </div>
                <div className="mt-2 space-y-1.5 text-sm">
                  <div><span className="text-text2">Сильные стороны:</span> <strong>{testResults.topCompetencies.join(", ")}</strong></div>
                  <div><span className="text-text2">Подходящие специальности:</span> {testResults.recommendedMajors.join(", ")}</div>
                </div>
                <button
                  onClick={() => navigate("/onboarding")}
                  className="mt-4 w-full rounded-lg border border-border bg-bg2 px-3.5 py-2 text-xs hover:bg-bg3"
                >
                  Пройти тест заново
                </button>
              </>
            ) : (
              <div className="space-y-3 py-4 text-center">
                <SpiderChart data={[]} size={220} />
                <p className="text-sm text-text3">Тест компетенций не пройден</p>
                <button
                  onClick={() => navigate("/onboarding")}
                  className="rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90"
                >
                  Пройти тест
                </button>
              </div>
            )}
          </section>

          <section className="sw-card">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text2">Аккаунт</h2>
            <button
              onClick={signOut}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-bg2 px-3.5 py-2 text-sm text-danger hover:bg-bg3"
            >
              <LogOut className="h-3.5 w-3.5" /> Выйти и сбросить данные
            </button>
            <p className="mt-2 text-[11px] text-text3">
              Данные хранятся локально в твоём браузере.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="sw-label">{label}</label>
      {children}
    </div>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm">{children}</div>;
}
