import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store";
import { streamChat } from "@/lib/ai";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, RotateCcw, ArrowUp } from "lucide-react";
import { RhinoLogo } from "@/components/RhinoLogo";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Какие у меня шансы на топ-10 вузов США?",
  "С чего начать подготовку к подаче?",
  "Объясни разницу между Early Decision и Regular",
  "Помоги выбрать тему Personal Statement",
];

export default function AIAdvisor() {
  const history = useStore((s) => s.chatHistory);
  const append = useStore((s) => s.appendChat);
  const reset = useStore((s) => s.resetChat);
  const setHistory = useStore((s) => s.setChatHistory);

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history, streaming]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    const userMsg = { role: "user" as const, content, timestamp: new Date().toISOString() };
    append(userMsg);
    setInput("");
    setStreaming(true);

    // Add empty assistant placeholder
    const assistantStart = { role: "assistant" as const, content: "", timestamp: new Date().toISOString() };
    append(assistantStart);

    let accumulated = "";
    try {
      await streamChat({
        mode: "advisor",
        messages: [...history, userMsg].map((m) => ({ role: m.role, content: m.content })),
        onDelta: (chunk) => {
          accumulated += chunk;
          // Replace last assistant message
          const cur = useStore.getState().chatHistory;
          const next = [...cur];
          next[next.length - 1] = { ...next[next.length - 1], content: accumulated };
          setHistory(next);
        },
        onError: (e) => toast.error(e.message),
      });
    } catch (e: any) {
      toast.error(e?.message || "Ошибка соединения");
    } finally {
      setStreaming(false);
    }
  };

  const empty = history.length === 0;

  return (
    <div className="flex h-[calc(100vh-7rem)] md:h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RhinoLogo size={32} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">AI-советник</h1>
            <p className="text-xs text-text3">Бэгги знает твой план, заявки и дедлайны</p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => { reset(); toast("Чат очищен"); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg2 px-3 py-1.5 text-xs text-text2 hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Очистить
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto sw-scroll">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
            <div className="sw-float">
              <RhinoLogo size={56} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Чем помочь?</h2>
              <p className="mt-2 max-w-md text-sm text-text2">
                Задавай любые вопросы про поступление: эссе, выбор университета, шансы, дедлайны, стипендии.
              </p>
            </div>
            <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-border bg-bg2 p-3 text-left text-sm text-text2 transition-colors hover:border-text3 hover:text-foreground"
                >
                  <Sparkles className="mb-1.5 h-3.5 w-3.5 text-accent" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 pb-4">
            {history.map((m, i) => (
              <Message key={i} role={m.role} content={m.content} />
            ))}
            {streaming && history[history.length - 1]?.content === "" && (
              <Message role="assistant" content="" loading />
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="mt-4 mx-auto w-full max-w-3xl"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-bg2 p-2 focus-within:border-text3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Спроси Бэгги что угодно…"
            rows={1}
            className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-text3"
            disabled={streaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-30"
            aria-label="send"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-text3">
          Бэгги может ошибаться — проверяй важные детали на сайтах вузов.
        </p>
      </form>
    </div>
  );
}

function Message({ role, content, loading }: { role: "user" | "assistant"; content: string; loading?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg3">
          <RhinoLogo size={20} />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
        isUser ? "bg-foreground text-background" : "bg-bg2 text-foreground"
      }`}>
        {loading ? (
          <span className="inline-flex gap-1">
            <span className="sw-dot h-1.5 w-1.5 rounded-full bg-text2" />
            <span className="sw-dot h-1.5 w-1.5 rounded-full bg-text2" />
            <span className="sw-dot h-1.5 w-1.5 rounded-full bg-text2" />
          </span>
        ) : isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="sw-prose">
            <ReactMarkdown>{content || "…"}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
