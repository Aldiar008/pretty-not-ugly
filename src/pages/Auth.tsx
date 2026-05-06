import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useStore } from "@/store";
import { RhinoLogo } from "@/components/RhinoLogo";
import { COUNTRIES, GRADES, examFor } from "@/data/reference";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setUser = useStore((s) => s.setUser);
  const reset = useStore((s) => s.reset);

  const initialMode = params.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  // signup fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("KZ");
  const [grade, setGrade] = useState("11");
  const [nationalScore, setNationalScore] = useState<string>("");
  const [showInternational, setShowInternational] = useState(false);
  const [gpa, setGpa] = useState("");
  const [sat, setSat] = useState("");
  const [ielts, setIelts] = useState("");
  const [toefl, setToefl] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const exam = examFor(country);
  const conv = convertScore(country, parseFloat(nationalScore));

  function validate() {
    const e: Record<string, string> = {};
    if (mode === "signup") {
      if (!name.trim()) e.name = "Введи имя";
      if (!email.includes("@")) e.email = "Некорректный email";
      if (password.length < 6) e.password = "Минимум 6 символов";
    } else {
      if (!email.includes("@")) e.email = "Некорректный email";
      if (!password) e.password = "Введи пароль";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "signup") {
      reset();
      setUser({
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim(),
        country,
        grade,
        gpa: gpa ? parseFloat(gpa) : null,
        sat: sat ? parseInt(sat) : null,
        ielts: ielts ? parseFloat(ielts) : null,
        toefl: toefl ? parseInt(toefl) : null,
        nationalExam: exam.name,
        nationalScore: nationalScore ? parseFloat(nationalScore) : null,
        targetCountries: [],
        targetMajor: "",
        budget: "any",
        startYear: new Date().getFullYear() + 1 + "",
        createdAt: new Date().toISOString(),
      });
      toast.success("Аккаунт создан!");
      navigate("/onboarding");
    } else {
      // demo: any login works — restore existing user or create demo
      const existing = useStore.getState().user;
      if (existing) {
        navigate(useStore.getState().onboardingComplete ? "/dashboard" : "/onboarding");
      } else {
        toast.error("Аккаунт не найден. Создай новый.");
        setMode("signup");
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-10">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <RhinoLogo size={32} />
        <span className="text-lg font-bold tracking-tight">Stepwise</span>
      </Link>

      <div className="sw-card w-full max-w-[480px]">
        <div className="mb-6 flex rounded-lg border border-border bg-background p-1">
          {(["signup", "login"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === m ? "bg-accent text-accent-foreground" : "text-text2"
              }`}
            >
              {m === "signup" ? "Регистрация" : "Войти"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          {mode === "signup" && (
            <>
              <Field label="Имя" error={errors.name}>
                <input className="sw-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Айдана Сейткали" />
              </Field>
              <Field label="Email" error={errors.email}>
                <input type="email" className="sw-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aidana@example.com" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Страна">
                  <select className="sw-input" value={country} onChange={(e) => setCountry(e.target.value)}>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Класс / курс">
                  <select className="sw-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                    {GRADES.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label={`${exam.name} — баллы`}>
                <input
                  type="number"
                  className="sw-input"
                  value={nationalScore}
                  onChange={(e) => setNationalScore(e.target.value)}
                  placeholder={`до ${exam.max}`}
                />
                <div className="mt-1 text-xs text-text3">{exam.hint}</div>
              </Field>
              <button
                type="button"
                onClick={() => setShowInternational((s) => !s)}
                className="flex w-full items-center justify-between rounded-lg bg-bg3 px-3 py-2 text-xs text-text2 hover:text-foreground"
              >
                Уже есть международные результаты?
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showInternational ? "rotate-180" : ""}`} />
              </button>
              {showInternational && (
                <div className="grid grid-cols-2 gap-3 animate-fade-in">
                  <Field label="GPA"><input className="sw-input" value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="3.7" /></Field>
                  <Field label="SAT"><input className="sw-input" value={sat} onChange={(e) => setSat(e.target.value)} placeholder="1450" /></Field>
                  <Field label="IELTS"><input className="sw-input" value={ielts} onChange={(e) => setIelts(e.target.value)} placeholder="7.0" /></Field>
                  <Field label="TOEFL"><input className="sw-input" value={toefl} onChange={(e) => setToefl(e.target.value)} placeholder="100" /></Field>
                </div>
              )}
            </>
          )}
          {mode === "login" && (
            <Field label="Email" error={errors.email}>
              <input type="email" className="sw-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
          )}
          <Field label="Пароль" error={errors.password}>
            <input type="password" className="sw-input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            {mode === "signup" ? "Создать аккаунт" : "Войти"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-text3">
        Локальный демо-режим — данные хранятся в твоём браузере.
      </p>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="sw-label">{label}</label>
      {children}
      {error && <div className="mt-1 text-xs text-danger">{error}</div>}
    </div>
  );
}
