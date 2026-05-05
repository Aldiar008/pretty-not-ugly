import { useMemo, useState } from "react";
import { useStore } from "@/store";
import { streamChat } from "@/lib/ai";
import { Sparkles, PenLine, Wand2, Loader2, Copy, Check, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { flagFor } from "@/data/reference";

type Action = "brainstorm" | "draft" | "improve";

// Country-specific prompt presets — keeps Essay Studio output distinct per uni list.
const PROMPTS_BY_COUNTRY: Record<string, string[]> = {
  US: [
    "Common App #1: Background, identity, interest or talent",
    "Common App #5: Accomplishment that sparked personal growth",
    "Why this major? (Why CS / Why Econ)",
    "Why us? — конкретные курсы и сообщества",
    "Extracurricular activity that matters most (150 words)",
  ],
  UK: [
    "UCAS Personal Statement: академический интерес",
    "Super-curriculars: что читал/делал вне школы",
    "Лидерский/командный опыт по предмету",
    "Career goals и почему этот курс к ним ведёт",
  ],
  CA: [
    "UofT/UBC supplementary: leadership in your community",
    "Why this program at this Canadian university?",
    "Challenge you faced and what you learned",
  ],
  DE: [
    "Motivationsschreiben: почему эта программа в Германии",
    "Academic background и связь со специальностью",
    "Почему Германия и долгосрочные планы",
  ],
  NL: [
    "Motivation letter: fit с small-scale teaching",
    "Why this Dutch programme — language, structure, projects",
  ],
  KR: [
    "Self-introduction letter (자기소개서)",
    "Study plan (학업계획서) — конкретные курсы и цели",
  ],
  JP: [
    "Statement of Purpose для японского вуза",
    "Why Japan и долгосрочные исследовательские планы",
  ],
};

const GENERIC_PROMPTS = [
  "Why this major?",
  "Why this university? (Why us)",
  "Расскажи о себе (Personal Statement)",
  "Самый значимый вызов в жизни",
  "Лидерский опыт и его влияние",
];

function starterDraft(uniName: string, country: string, major?: string): string {
  const m = major || "своей будущей специальности";
  const lower = uniName.toLowerCase();
  if (/oxford|cambridge/.test(lower)) {
    return `Tutorial-style learning at ${uniName} appeals to me because debating ideas one-on-one is how I learn best. In ${m}, I want to test my reasoning against an expert weekly, not just read about it. [Продолжи: конкретный академический интерес → tutorial → исследовательская цель]`;
  }
  if (/harvard|yale|princeton|stanford|mit|columbia|brown|dartmouth|cornell|penn/.test(lower)) {
    return `When I first encountered ${m}, it was not in a classroom — it was [конкретный момент]. ${uniName}'s [конкретная программа/лаб] is where I want to push that question further, alongside [конкретная инициатива/community]. [Развёрнутая личная история на 400+ слов]`;
  }
  if (country === "UK") {
    return `My interest in ${m} began with [конкретный текст/проект] and has grown through [super-curricular: чтение, MOOC, олимпиада]. Beyond the syllabus, I [практический опыт]. The course at ${uniName} attracts me because [конкретные модули]. [Продолжи в академическом UCAS-стиле]`;
  }
  if (country === "DE") {
    return `Meine Motivation für das Studium ${m} an ${uniName} ergibt sich aus [конкретный академический опыт]. Besonders interessiert mich [конкретный модуль/профессор]. [Продолжи: background → программа → планы]`;
  }
  return `My path toward ${m} took shape when [конкретный момент, не клише]. At ${uniName}, I want to build on this through [конкретный курс/проект/community]. [Развёрни в 450–650 слов с конкретикой]`;
}


export default function EssayStudio() {
  const universities = useStore((s) => s.universities);
  const targetMajor = useStore((s) => s.user?.targetMajor);
  const documents = useStore((s) => s.documents);
  const addDocument = useStore((s) => s.addDocument);

  const [action, setAction] = useState<Action>("brainstorm");
  const [universityId, setUniversityId] = useState<string>(universities[0]?.id || "");
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedUni = useMemo(
    () => universities.find((u) => u.id === universityId),
    [universities, universityId],
  );

  // Show user's existing essay docs they can quickly improve
  const essayDrafts = useMemo(
    () => documents.filter((d) => d.type === "essay" || d.type === "personal_statement"),
    [documents],
  );

  const validate = (): string | null => {
    if (universities.length === 0) return "Сначала добавь университеты в свой список";
    if (!universityId) return "Выбери университет";
    if (action !== "improve" && !prompt.trim()) return "Введи тему/промпт эссе";
    if (action === "improve" && !draft.trim()) return "Вставь черновик для улучшения";
    if (action === "improve" && draft.trim().split(/\s+/).length < 20)
      return "Слишком короткий черновик — минимум 20 слов";
    return null;
  };

  const run = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setBusy(true);
    setOutput("");
    try {
      await streamChat({
        mode: "essay",
        messages: [{ role: "user", content: prompt || "—" }],
        university: selectedUni?.name || "целевого университета",
        major: targetMajor,
        essayAction: action,
        essayPrompt: prompt,
        essayDraft: draft,
        onDelta: (c) => setOutput((p) => p + c),
        onError: (e) => toast.error(e.message),
      });
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const saveAsDoc = () => {
    if (!output.trim() || !selectedUni) return;
    addDocument({
      name: `${action === "draft" ? "Draft" : action === "improve" ? "Улучшение" : "Идеи"}: ${selectedUni.name}`,
      type: "essay",
      status: "in_progress",
      deadline: selectedUni.deadline || null,
      notes: output.slice(0, 4000),
      universityLinked: selectedUni.id,
    });
    toast.success("Сохранено в Документы");
  };

  const ACTIONS: { v: Action; l: string; d: string; Icon: typeof Sparkles }[] = [
    { v: "brainstorm", l: "Brainstorm", d: "5 свежих углов под промпт", Icon: Sparkles },
    { v: "draft", l: "Draft", d: "Полный черновик 450–650 слов", Icon: PenLine },
    { v: "improve", l: "Improve", d: "Перепиши свой черновик", Icon: Wand2 },
  ];

  if (universities.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Essay Studio</h1>
          <p className="mt-1 text-sm text-text2">AI-помощник для personal statement и supplemental эссе.</p>
        </div>
        <div className="sw-card flex flex-col items-center gap-3 py-14 text-center">
          <AlertCircle className="h-8 w-8 text-text3" />
          <div className="font-semibold">Сначала добавь университеты</div>
          <p className="max-w-sm text-sm text-text2">
            Эссе пишется под конкретный университет — добавь хотя бы один в список,
            чтобы Essay Studio учитывал его требования.
          </p>
          <Link to="/universities" className="sw-btn-primary mt-2">
            Добавить университет
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Essay Studio</h1>
        <p className="mt-1 text-sm text-text2">
          AI-помощник для эссе. Пишет с учётом университета, специальности и твоих черновиков.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {ACTIONS.map(({ v, l, d, Icon }) => (
          <button
            key={v}
            onClick={() => setAction(v)}
            className={`sw-card text-left transition-all ${
              action === v ? "ring-2 ring-[hsl(var(--accent))]" : ""
            }`}
          >
            <Icon className="h-5 w-5 text-[hsl(var(--accent))]" />
            <div className="mt-2 font-semibold">{l}</div>
            <div className="text-xs text-text2">{d}</div>
          </button>
        ))}
      </div>

      <div className="sw-card space-y-4">
        <div>
          <label className="sw-label">Университет</label>
          <div className="flex flex-wrap gap-2">
            {universities.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setUniversityId(u.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  universityId === u.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-bg2 text-text2 hover:text-foreground"
                }`}
              >
                {flagFor(u.country)} {u.name}
              </button>
            ))}
          </div>
          {selectedUni && (
            <div className="mt-2 text-xs text-text3">
              {selectedUni.tier} · шанс {selectedUni.chancePercent}%
              {selectedUni.deadline && ` · дедлайн ${new Date(selectedUni.deadline).toLocaleDateString("ru-RU")}`}
            </div>
          )}
        </div>

        <div>
          <label className="sw-label">Тема / промпт эссе</label>
          <input
            className="sw-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Например: "Why this major?" или Common App #1'
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {COMMON_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrompt(p)}
                className="rounded-full border border-dashed border-border bg-bg2 px-2.5 py-1 text-[11px] text-text2 hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {action === "improve" && (
          <div>
            <label className="sw-label">Твой черновик</label>
            <textarea
              className="sw-input min-h-[180px]"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Вставь свой текст…"
            />
            {essayDrafts.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-text3">Из документов:</span>
                {essayDrafts.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDraft(d.notes || "")}
                    className="rounded-full border border-dashed border-border bg-bg2 px-2.5 py-1 text-[11px] text-text2 hover:text-foreground"
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-1 text-[11px] tabular text-text3">
              {draft.trim() ? draft.trim().split(/\s+/).length : 0} слов
            </div>
          </div>
        )}

        <button onClick={run} disabled={busy} className="sw-btn-primary disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {busy ? "Генерирую…" : "Запустить AI"}
        </button>
      </div>

      {output && (
        <div className="sw-card">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Результат</h2>
            <div className="flex gap-2">
              <button onClick={saveAsDoc} className="sw-btn-ghost">
                <FileText className="h-4 w-4" /> В документы
              </button>
              <button onClick={copy} className="sw-btn-ghost">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Скопировано" : "Копировать"}
              </button>
            </div>
          </div>
          <pre className="sw-prose whitespace-pre-wrap break-words text-sm leading-relaxed font-sans">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
