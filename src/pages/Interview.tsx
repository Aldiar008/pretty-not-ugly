import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store";
import { streamChat } from "@/lib/ai";
import ReactMarkdown from "react-markdown";
import { Mic, MicOff, RotateCcw, History, Star, Send, Video, VideoOff } from "lucide-react";
import { RhinoCharacter, type MascotAnimation } from "@/components/RhinoCharacter";
import { toast } from "sonner";

const TYPES = [
  { v: "general", l: "Общее интервью" },
  { v: "scholarship", l: "Стипендия" },
  { v: "tech", l: "Tech / CS" },
  { v: "mba", l: "MBA / Business" },
];

const LANGS = [
  { v: "ru", l: "Русский" },
  { v: "en", l: "English" },
];

export default function Interview() {
  const user = useStore((s) => s.user);
  const universities = useStore((s) => s.universities);
  const history = useStore((s) => s.interviewHistory);
  const append = useStore((s) => s.appendInterview);
  const reset = useStore((s) => s.resetInterview);
  const setHistory = useStore((s) => s.setInterviewHistory);
  const sessions = useStore((s) => s.interviewSessions);
  const saveSession = useStore((s) => s.saveInterviewSession);

  const [setup, setSetup] = useState(history.length === 0);
  const [university, setUniversity] = useState(universities[0]?.name || "Целевой университет");
  const [type, setType] = useState("general");
  const [language, setLanguage] = useState("ru");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef(input);
  useEffect(() => { inputRef.current = input; }, [input]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, streaming]);

  const toggleCamera = async () => {
    if (cameraOn) {
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraOn(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      cameraStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch (e: any) {
      toast.error("Нет доступа к камере: " + (e.message || e.name || ""));
    }
  };

  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    try { recognitionRef.current?.stop?.(); } catch {}
  }, []);

  const toggleMic = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Голосовой ввод не поддерживается. Открой в Chrome или Safari.");
      return;
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const rec = new SR();
    rec.lang = language === "en" ? "en-US" : "ru-RU";
    rec.interimResults = true;
    rec.continuous = true;
    const baseText = inputRef.current ? inputRef.current.trim() + " " : "";
    let finalText = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript + " ";
        else interim += r[0].transcript;
      }
      setInput((baseText + finalText + interim).replace(/\s+/g, " ").trimStart());
    };
    rec.onerror = (e: any) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        toast.error("Ошибка микрофона: " + e.error);
      }
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const start = async () => {
    setSetup(false);
    // Trigger first interviewer question
    setStreaming(true);
    const assistantStart = { role: "assistant" as const, content: "", timestamp: new Date().toISOString() };
    append(assistantStart);
    let acc = "";
    try {
      await streamChat({
        mode: "interview",
        university, type, language,
        major: user?.targetMajor,
        messages: [{ role: "user", content: "Начни интервью с первого вопроса." }],
        onDelta: (c) => {
          acc += c;
          const cur = useStore.getState().interviewHistory;
          const next = [...cur]; next[next.length - 1] = { ...next[next.length - 1], content: acc };
          setHistory(next);
        },
        onError: (e) => toast.error(e.message),
      });
    } finally {
      setStreaming(false);
    }
  };

  const send = async () => {
    const content = input.trim();
    if (!content || streaming) return;
    const userMsg = { role: "user" as const, content, timestamp: new Date().toISOString() };
    append(userMsg);
    setInput("");
    setStreaming(true);

    const assistantStart = { role: "assistant" as const, content: "", timestamp: new Date().toISOString() };
    append(assistantStart);

    let acc = "";
    try {
      await streamChat({
        mode: "interview",
        university, type, language,
        major: user?.targetMajor,
        messages: [...history, userMsg].map((m) => ({ role: m.role, content: m.content })),
        onDelta: (c) => {
          acc += c;
          const cur = useStore.getState().interviewHistory;
          const next = [...cur]; next[next.length - 1] = { ...next[next.length - 1], content: acc };
          setHistory(next);
        },
        onError: (e) => toast.error(e.message),
      });
    } finally {
      setStreaming(false);
    }
  };

  const finish = () => {
    if (history.length < 2) { toast("Слишком короткая сессия"); return; }
    saveSession({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      university,
      type,
      rating: Math.min(5, Math.max(3, Math.round(history.length / 4))),
      history,
    });
    reset();
    setSetup(true);
    toast.success("Сессия сохранена");
  };

  if (setup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <RhinoCharacter size={84} animation="wave" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Интервью со Степом</h1>
            <p className="mt-1 text-sm text-text2">
              Степ возьмёт у тебя интервью как приёмная комиссия — отвечай голосом или текстом.
            </p>
          </div>
        </div>

        <div className="sw-card max-w-xl space-y-4">
          <div>
            <label className="sw-label">Университет</label>
            <input
              className="sw-input"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Например, MIT"
            />
          </div>
          <div>
            <label className="sw-label">Тип интервью</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.v}
                  type="button"
                  onClick={() => setType(t.v)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    type === t.v ? "border-foreground bg-foreground text-background" : "border-border bg-bg2 text-text2 hover:text-foreground"
                  }`}
                >
                  {t.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="sw-label">Язык</label>
            <div className="flex gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.v}
                  type="button"
                  onClick={() => setLanguage(l.v)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    language === l.v ? "border-foreground bg-foreground text-background" : "border-border bg-bg2 text-text2 hover:text-foreground"
                  }`}
                >
                  {l.l}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={start}
            disabled={!university.trim()}
            className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
          >
            Начать интервью
          </button>
        </div>

        {sessions.length > 0 && (
          <div className="sw-card">
            <div className="mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-text3" />
              <h2 className="text-sm font-semibold">История</h2>
            </div>
            <ul className="divide-y divide-border">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{s.university}</div>
                    <div className="text-xs text-text3">
                      {new Date(s.date).toLocaleDateString("ru-RU")} · {s.history.length} реплик · {TYPES.find(t => t.v === s.type)?.l}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-warning">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} className={`h-3.5 w-3.5 ${n <= s.rating ? "fill-current" : ""}`} />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Mascot state reflects what's happening in the interview
  const mascotState: MascotAnimation = streaming
    ? "think"
    : listening
      ? "pulse"
      : input.trim().length > 0
        ? "nod"
        : history.length === 0
          ? "wave"
          : "idle";

  return (
    <div className="flex h-[calc(100vh-7rem)] md:h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <RhinoCharacter size={48} animation={mascotState} />
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight">
              Степ · {university}
            </h1>
            <p className="text-xs text-text3">
              {TYPES.find(t => t.v === type)?.l} · {LANGS.find(l => l.v === language)?.l}
              {streaming && " · думает…"}
              {!streaming && listening && " · слушает"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleCamera}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs ${
              cameraOn ? "border-accent bg-accent/10 text-accent" : "border-border bg-bg2 text-text2 hover:text-foreground"
            }`}
            title={cameraOn ? "Выключить камеру" : "Включить камеру"}
          >
            {cameraOn ? <VideoOff className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
            {cameraOn ? "Камера" : "Камера"}
          </button>
          <button
            onClick={finish}
            className="rounded-lg border border-border bg-bg2 px-3 py-1.5 text-xs hover:bg-bg3"
          >
            Завершить
          </button>
          <button
            onClick={() => { reset(); setSetup(true); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg2 px-3 py-1.5 text-xs text-text2 hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {cameraOn && (
        <div className="mb-3 mx-auto w-full max-w-3xl">
          <div className="relative aspect-video w-full max-w-xs ml-auto overflow-hidden rounded-xl border border-border bg-black">
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white">
              ● запись
            </span>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto sw-scroll">
        <div className="mx-auto max-w-3xl space-y-6 pb-4">
          {history.map((m, i) => {
            const isLastAssistant = m.role === "assistant" && i === history.length - 1;
            const avatarAnim: MascotAnimation = isLastAssistant
              ? (streaming && !m.content ? "think" : "idle")
              : "none";
            return (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-bg3 overflow-hidden">
                    <RhinoCharacter size={34} animation={avatarAnim} />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user" ? "bg-foreground text-background" : "bg-bg2 text-foreground"
                }`}>
                  {m.role === "user"
                    ? <p className="whitespace-pre-wrap">{m.content}</p>
                    : (
                      m.content
                        ? <div className="sw-prose"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                        : <span className="inline-flex gap-1">
                            <span className="sw-dot h-1.5 w-1.5 rounded-full bg-text2" />
                            <span className="sw-dot h-1.5 w-1.5 rounded-full bg-text2" />
                            <span className="sw-dot h-1.5 w-1.5 rounded-full bg-text2" />
                          </span>
                    )
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 mx-auto w-full max-w-3xl">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-bg2 p-4">
          {input.trim() && (
            <div className="w-full rounded-lg bg-background px-3 py-2 text-sm text-text2">
              {input}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMic}
              disabled={streaming}
              className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all disabled:opacity-30 ${
                listening
                  ? "border-red-500 bg-red-500 text-white animate-pulse"
                  : "border-foreground bg-foreground text-background hover:opacity-90"
              }`}
              aria-label={listening ? "stop recording" : "start recording"}
              title={listening ? "Остановить запись" : "Говорить"}
            >
              {listening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
            <button
              type="button"
              onClick={() => { if (input.trim() && !streaming) send(); }}
              disabled={!input.trim() || streaming || listening}
              className="inline-flex h-12 items-center gap-1.5 rounded-full bg-bg3 px-5 text-sm font-medium text-foreground hover:bg-bg3/70 disabled:opacity-30"
              title="Отправить ответ"
            >
              <Send className="h-4 w-4" /> Отправить ответ
            </button>
          </div>
          <p className="text-xs text-text3">
            {listening
              ? "Говори свободно — Степ слышит. Нажми ещё раз, чтобы остановить."
              : input.trim()
                ? "Готов? Нажми «Отправить ответ»."
                : "Это интервью — отвечай голосом. Нажми микрофон, чтобы начать."}
          </p>
        </div>
      </div>
    </div>
  );
}
