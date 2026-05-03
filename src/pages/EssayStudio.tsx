import { useState } from "react";
import { useStore } from "@/store";
import { streamChat } from "@/lib/ai";
import { Sparkles, PenLine, Wand2, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

type Action = "brainstorm" | "draft" | "improve";

export default function EssayStudio() {
  const universities = useStore((s) => s.universities);
  const [action, setAction] = useState<Action>("brainstorm");
  const [university, setUniversity] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (!prompt.trim() && action !== "improve") {
      toast.error("Введи тему/промпт эссе");
      return;
    }
    if (action === "improve" && !draft.trim()) {
      toast.error("Вставь черновик для улучшения");
      return;
    }
    setBusy(true);
    setOutput("");
    try {
      await streamChat({
        mode: "essay",
        messages: [{ role: "user", content: prompt || "—" }],
        university: university || "целевого университета",
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

  const ACTIONS: { v: Action; l: string; d: string; Icon: typeof Sparkles }[] = [
    { v: "brainstorm", l: "Brainstorm", d: "5 свежих углов под промпт", Icon: Sparkles },
    { v: "draft", l: "Draft", d: "Полный черновик 450-650 слов", Icon: PenLine },
    { v: "improve", l: "Improve", d: "Переписать твой черновик", Icon: Wand2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Essay Studio</h1>
        <p className="mt-1 text-sm text-text2">AI-помощник для personal statement и supplemental эссе.</p>
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
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="sw-label">Университет (опц.)</label>
            <select className="sw-input" value={university} onChange={(e) => setUniversity(e.target.value)}>
              <option value="">— Любой —</option>
              {universities.map((u) => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="sw-label">Тема / промпт эссе</label>
            <input
              className="sw-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Например: "Why this major?" или Common App #1'
            />
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
          </div>
        )}

        <button
          onClick={run}
          disabled={busy}
          className="sw-btn-primary disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {busy ? "Генерирую…" : "Запустить AI"}
        </button>
      </div>

      {output && (
        <div className="sw-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Результат</h2>
            <button onClick={copy} className="sw-btn-ghost">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Скопировано" : "Копировать"}
            </button>
          </div>
          <pre className="sw-prose whitespace-pre-wrap break-words text-sm leading-relaxed font-sans">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
