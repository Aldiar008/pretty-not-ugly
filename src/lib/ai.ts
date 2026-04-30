// Streaming helper for Stepwise AI chat.
import { useStore } from "@/store";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stepwise-chat`;

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

interface StreamOpts {
  mode: "advisor" | "interview";
  messages: ChatMsg[];
  onDelta: (chunk: string) => void;
  onError?: (e: Error) => void;
  // Interview specifics
  university?: string;
  type?: string;
  major?: string;
  language?: string;
}

export async function streamChat(opts: StreamOpts): Promise<void> {
  const state = useStore.getState();
  const user = state.user;
  const universities = state.universities.map((u) => ({
    name: u.name,
    country: u.country,
    status: u.status,
    chancePercent: u.chancePercent,
    deadline: u.deadline,
  }));
  const tasks = state.tasks;
  const today = new Date();
  const upcoming = tasks
    .filter((t) => !t.done && t.deadline)
    .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1));
  const plan = {
    totalTasks: tasks.length,
    doneTasks: tasks.filter((t) => t.done).length,
    nextDeadline: upcoming[0]?.deadline ?? null,
    urgentOpen: tasks.filter((t) => !t.done && t.priority === "urgent").map((t) => t.title),
  };
  void today;

  const body: any = {
    mode: opts.mode,
    messages: opts.messages,
    user,
    universities,
    plan,
  };
  if (opts.mode === "interview") {
    body.university = opts.university;
    body.type = opts.type;
    body.major = opts.major;
    body.language = opts.language;
  }

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok || !resp.body) {
    let msg = "Ошибка соединения. Попробуй снова.";
    try {
      const j = await resp.json();
      if (j?.error) msg = j.error;
    } catch {}
    opts.onError?.(new Error(msg));
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let done = false;

  while (!done) {
    const { done: rDone, value } = await reader.read();
    if (rDone) break;
    textBuffer += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, nl);
      textBuffer = textBuffer.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") {
        done = true;
        break;
      }
      try {
        const p = JSON.parse(json);
        const delta = p.choices?.[0]?.delta?.content;
        if (delta) opts.onDelta(delta);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (!raw.startsWith("data: ")) continue;
      const json = raw.slice(6).trim();
      if (json === "[DONE]") continue;
      try {
        const p = JSON.parse(json);
        const delta = p.choices?.[0]?.delta?.content;
        if (delta) opts.onDelta(delta);
      } catch {}
    }
  }
}
