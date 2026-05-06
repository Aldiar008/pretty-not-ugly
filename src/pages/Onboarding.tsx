import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { COUNTRIES, GRADES, MAJORS, BUDGETS, examFor, convertScore } from "@/data/reference";
import { TEST_QUESTIONS, COMPETENCE_AXES, MAJOR_RECOMMENDATIONS } from "@/data/test-questions";
import type { Task, Document } from "@/types";
import { SpiderChart } from "@/components/SpiderChart";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

const TARGET_COUNTRIES = [
  "US", "GB", "CA", "AU", "SG", "KR", "AE", "JP",
  "DE", "NL", "CH", "FR", "IT", "ES", "SE", "NO", "FI", "DK", "IE", "BE", "AT", "PL", "CZ", "PT",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const updateUser = useStore((s) => s.updateUser);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);

  // Step 1
  const [name, setName] = useState(user?.name || "");
  const [country, setCountry] = useState(user?.country || "KZ");
  const [grade, setGrade] = useState(user?.grade || "11");
  const [startYear, setStartYear] = useState(user?.startYear || "2026");

  // Step 2
  const exam = examFor(country);
  const [nationalScore, setNationalScore] = useState(user?.nationalScore?.toString() || "");
  const [gpa, setGpa] = useState(user?.gpa?.toString() || "");
  const [sat, setSat] = useState(user?.sat?.toString() || "");
  const [ielts, setIelts] = useState(user?.ielts?.toString() || "");
  const [toefl, setToefl] = useState(user?.toefl?.toString() || "");
  const [expected, setExpected] = useState(false);
  const conv = convertScore(country, parseFloat(nationalScore));

  // Step 3
  const [targetCountries, setTargetCountries] = useState<string[]>(user?.targetCountries || []);
  const [targetMajor, setTargetMajor] = useState(user?.targetMajor || "Computer Science");
  const [budget, setBudget] = useState(user?.budget || "any");

  // Step 4 — test
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // qid -> category

  const testResult = useMemo(() => {
    if (Object.keys(answers).length !== TEST_QUESTIONS.length) return null;
    const counts: Record<string, number> = { Аналитика: 0, Креатив: 0, Коммуникация: 0, Лидерство: 0, Техника: 0 };
    for (const cat of Object.values(answers)) counts[cat] = (counts[cat] || 0) + 1;
    const max = Math.max(...Object.values(counts));
    const top = Object.entries(counts).filter(([, v]) => v === max).map(([k]) => k);
    const recommended = MAJOR_RECOMMENDATIONS[top[0]] || ["Computer Science"];
    return {
      date: new Date().toISOString(),
      scores: COMPETENCE_AXES.map((c) => ({ category: c, score: counts[c] || 0 })),
      topCompetencies: top,
      recommendedMajors: recommended,
    };
  }, [answers]);

  function next() {
    if (step === 0) {
      updateUser({ name, country, grade, startYear });
    }
    if (step === 1) {
      updateUser({
        gpa: gpa ? parseFloat(gpa) : null,
        sat: sat ? parseInt(sat) : null,
        ielts: ielts ? parseFloat(ielts) : null,
        toefl: toefl ? parseInt(toefl) : null,
        nationalExam: exam.name,
        nationalScore: nationalScore ? parseFloat(nationalScore) : null,
      });
    }
    if (step === 2) {
      updateUser({ targetCountries, targetMajor, budget });
    }
    setStep((s) => Math.min(s + 1, 4));
  }

  function back() { setStep((s) => Math.max(s - 1, 0)); }

  function answer(letter: string, category: string) {
    setAnswers((a) => ({ ...a, [TEST_QUESTIONS[qIdx].id]: category }));
    setTimeout(() => {
      if (qIdx < TEST_QUESTIONS.length - 1) setQIdx((i) => i + 1);
      else setStep(4);
    }, 200);
    void letter;
  }

  function finish() {
    // Generate initial tasks (one-time)
    const today = new Date();
    const date = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().slice(0, 10);
    };
    const initialTasks: Task[] = [
      { id: crypto.randomUUID(), title: "Сдать IELTS — цель 7.0+", category: "exams", deadline: date(60), done: false, priority: "important", universityLinked: null, notes: "", createdAt: today.toISOString() },
      { id: crypto.randomUUID(), title: "Написать Personal Statement", category: "documents", deadline: date(30), done: false, priority: "urgent", universityLinked: null, notes: "", createdAt: today.toISOString() },
      { id: crypto.randomUUID(), title: "Составить список из 8–10 университетов", category: "other", deadline: date(14), done: false, priority: "important", universityLinked: null, notes: "", createdAt: today.toISOString() },
      { id: crypto.randomUUID(), title: "Запросить рекомендательные письма (2 шт.)", category: "documents", deadline: date(45), done: false, priority: "important", universityLinked: null, notes: "", createdAt: today.toISOString() },
      { id: crypto.randomUUID(), title: "Зарегистрироваться на SAT", category: "exams", deadline: date(90), done: false, priority: "later", universityLinked: null, notes: "", createdAt: today.toISOString() },
      { id: crypto.randomUUID(), title: "Получить официальные транскрипты", category: "documents", deadline: date(40), done: false, priority: "important", universityLinked: null, notes: "", createdAt: today.toISOString() },
      { id: crypto.randomUUID(), title: "Изучить требования каждого университета", category: "other", deadline: date(50), done: false, priority: "later", universityLinked: null, notes: "", createdAt: today.toISOString() },
      { id: crypto.randomUUID(), title: "Подготовить финансовые документы", category: "documents", deadline: date(80), done: false, priority: "later", universityLinked: null, notes: "", createdAt: today.toISOString() },
      { id: crypto.randomUUID(), title: "Проверить визовые требования", category: "visa", deadline: date(120), done: false, priority: "later", universityLinked: null, notes: "", createdAt: today.toISOString() },
      { id: crypto.randomUUID(), title: `Найти стипендии для студентов из ${user?.country || country}`, category: "scholarships", deadline: date(70), done: false, priority: "important", universityLinked: null, notes: "", createdAt: today.toISOString() },
    ];

    const initialDocs: Document[] = [
      { id: crypto.randomUUID(), name: "Personal Statement", type: "personal_statement", status: "not_started", deadline: date(30), notes: "" },
      { id: crypto.randomUUID(), name: "Транскрипты / Аттестат", type: "transcript", status: "not_started", deadline: date(40), notes: "" },
      { id: crypto.randomUUID(), name: "Рекомендательное письмо (учитель 1)", type: "recommendation", status: "not_started", deadline: date(45), notes: "" },
      { id: crypto.randomUUID(), name: "Рекомендательное письмо (учитель 2)", type: "recommendation", status: "not_started", deadline: date(45), notes: "" },
      { id: crypto.randomUUID(), name: "Сертификат IELTS / TOEFL", type: "certificate", status: "not_started", deadline: date(60), notes: "" },
      { id: crypto.randomUUID(), name: "Финансовые документы (выписка)", type: "financial", status: "not_started", deadline: date(80), notes: "" },
      { id: crypto.randomUUID(), name: 'Эссе "Why this university"', type: "essay", status: "not_started", deadline: date(35), notes: "" },
    ];

    completeOnboarding(initialTasks, initialDocs, testResult);
    sessionStorage.setItem("sw_first_open", "1");
    toast.success("Твой план готов!");
    navigate("/dashboard");
  }

  const progress = ((step + 1) / 5) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border">
        <div className="mx-auto max-w-[760px] px-5 py-4">
          <div className="mb-2 flex items-center justify-between text-xs text-text2">
            <span>Шаг {step + 1} из 5</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-bg3">
            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10">
        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Привет, {name || "друг"}! 👋</h1>
              <p className="mt-2 text-text2">Давай выстроим твой путь.</p>
            </div>
            <div className="sw-card space-y-4">
              <Field label="Имя"><input className="sw-input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Страна">
                <select className="sw-input" value={country} onChange={(e) => setCountry(e.target.value)}>
                  {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </Field>
              <Field label="Класс / курс">
                <select className="sw-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                  {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </Field>
              <Field label="Планируемый год поступления">
                <select className="sw-input" value={startYear} onChange={(e) => setStartYear(e.target.value)}>
                  {["2025", "2026", "2027"].map((y) => <option key={y}>{y}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Академический профиль</h1>
              <p className="mt-2 text-text2">Чем точнее данные — тем точнее расчёт шансов.</p>
            </div>
            <div className="sw-card space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg2 px-3 py-2">
                <div className="text-xs text-text2">
                  Ещё не сдавал(а) экзамены? Укажи <strong>ожидаемые</strong> результаты — пересчитаем шансы.
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={expected} onChange={(e) => setExpected(e.target.checked)} />
                  Ожидаемые
                </label>
              </div>
              <Field label={`${exam.name} — ${expected ? "ожидаемые" : "фактические"} баллы`}>
                <input type="number" className="sw-input" value={nationalScore} onChange={(e) => setNationalScore(e.target.value)} placeholder={`до ${exam.max}`} />
                <div className="mt-1 text-xs text-text3">{exam.hint}</div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="GPA (0–4.0)"><input className="sw-input" value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="3.7" /><Hint text="Медиана топ-50: 3.8" /></Field>
                <Field label="SAT (400–1600)"><input className="sw-input" value={sat} onChange={(e) => setSat(e.target.value)} placeholder="1450" /><Hint text="Медиана топ-50: 1450" /></Field>
                <Field label="IELTS (0–9.0)"><input className="sw-input" value={ielts} onChange={(e) => setIelts(e.target.value)} placeholder="7.0" /><Hint text="Минимум для топа: 7.0" /></Field>
                <Field label="TOEFL (0–120)"><input className="sw-input" value={toefl} onChange={(e) => setToefl(e.target.value)} placeholder="100" /><Hint text="Минимум для топа: 100" /></Field>
              </div>
              <LevelMeter score={parseFloat(gpa) || 0} />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Куда хочешь?</h1>
              <p className="mt-2 text-text2">Выбери целевые страны и направление.</p>
            </div>
            <div className="sw-card space-y-4">
              <div>
                <label className="sw-label">Целевые страны</label>
                <div className="flex flex-wrap gap-2">
                  {TARGET_COUNTRIES.map((code) => {
                    const c = COUNTRIES.find((x) => x.code === code)!;
                    const active = targetCountries.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setTargetCountries((cs) => active ? cs.filter((x) => x !== code) : [...cs, code])}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          active ? "border-accent bg-accent text-accent-foreground" : "border-border bg-bg2 text-text2 hover:text-foreground"
                        }`}
                      >
                        <span>{c.flag}</span> {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Field label="Желаемая специальность">
                <select className="sw-input" value={targetMajor} onChange={(e) => setTargetMajor(e.target.value)}>
                  {MAJORS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Бюджет">
                <select className="sw-input" value={budget} onChange={(e) => setBudget(e.target.value)}>
                  {BUDGETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* Step 4 — Test */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Тест компетенций</h1>
              <p className="mt-2 text-text2">Определим твои сильные стороны.</p>
            </div>
            <div className="text-xs text-text3 tabular">
              Вопрос {qIdx + 1} из {TEST_QUESTIONS.length}
            </div>
            <div className="h-1 w-full rounded-full bg-bg3">
              <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${((qIdx + 1) / TEST_QUESTIONS.length) * 100}%` }} />
            </div>
            <div className="sw-card animate-fade-in" key={qIdx}>
              <h2 className="mb-5 text-xl font-semibold leading-tight">{TEST_QUESTIONS[qIdx].text}</h2>
              <div className="space-y-2">
                {TEST_QUESTIONS[qIdx].options.map((o) => (
                  <button
                    key={o.letter}
                    onClick={() => answer(o.letter, o.category)}
                    className="flex w-full items-start gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-accent hover:bg-bg3"
                  >
                    <span className="mt-px flex h-6 w-6 items-center justify-center rounded-md bg-bg3 text-xs font-semibold">{o.letter}</span>
                    <span>{o.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — Result */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                <Check className="h-3.5 w-3.5" /> План готов
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Твой план поступления создан</h1>
              <p className="mt-2 text-text2">Главный талант: <strong className="text-foreground">{testResult?.topCompetencies.join(", ") || "—"}</strong></p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="sw-card">
                <div className="mb-3 text-xs uppercase tracking-wider text-text3">Радар компетенций</div>
                <div className="flex justify-center">
                  <SpiderChart data={testResult?.scores || []} size={240} />
                </div>
              </div>
              <div className="sw-card">
                <div className="mb-3 text-xs uppercase tracking-wider text-text3">Рекомендованные специальности</div>
                <ul className="space-y-2 text-sm">
                  {testResult?.recommendedMajors.map((m) => (
                    <li key={m} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" /> {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="sw-card">
              <div className="mb-3 text-xs uppercase tracking-wider text-text3">Первые задачи</div>
              <ul className="space-y-2 text-sm text-text2">
                <li>☐ Сдать IELTS — цель 7.0+</li>
                <li>☐ Написать Personal Statement</li>
                <li>☐ Составить список из 8–10 университетов</li>
                <li>☐ Запросить рекомендательные письма</li>
                <li>☐ Зарегистрироваться на SAT</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 && step !== 3 ? (
            <button onClick={back} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground hover:bg-bg3">
              <ArrowLeft className="h-3.5 w-3.5" /> Назад
            </button>
          ) : <div />}
          {step !== 3 && step < 4 && (
            <button onClick={next} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">
              Дальше <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          {step === 4 && (
            <button onClick={finish} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">
              Перейти на главную <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
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

function Hint({ text }: { text: string }) {
  return <div className="mt-1 text-xs text-text3">{text}</div>;
}

function LevelMeter({ score }: { score: number }) {
  const level = score >= 3.7 ? 4 : score >= 3.3 ? 3 : score >= 2.8 ? 2 : 1;
  const labels = ["Слабо", "Средне", "Хорошо", "Отлично"];
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {labels.map((l, i) => (
        <div key={l} className={`rounded-md px-2 py-1.5 text-center text-[11px] font-medium ${
          i < level ? "bg-accent text-accent-foreground" : "bg-bg3 text-text3"
        }`}>{l}</div>
      ))}
    </div>
  );
}
