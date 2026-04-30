import { useMemo, useState } from "react";
import { useStore } from "@/store";
import { Plus, Calendar, Filter, Trash2, AlertCircle, Star, Clock } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import type { Task, TaskCategory, Priority } from "@/types";
import { toast } from "sonner";

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: "exams", label: "Экзамены" },
  { value: "documents", label: "Документы" },
  { value: "applications", label: "Заявки" },
  { value: "scholarships", label: "Стипендии" },
  { value: "visa", label: "Виза" },
  { value: "other", label: "Другое" },
];

const PRIORITIES: { value: Priority; label: string; icon: typeof AlertCircle; cls: string }[] = [
  { value: "urgent", label: "Срочно", icon: AlertCircle, cls: "text-danger" },
  { value: "important", label: "Важно", icon: Star, cls: "text-warning" },
  { value: "later", label: "Позже", icon: Clock, cls: "text-text2" },
];

export default function Plan() {
  const tasks = useStore((s) => s.tasks);
  const universities = useStore((s) => s.universities);
  const addTask = useStore((s) => s.addTask);
  const toggleTask = useStore((s) => s.toggleTask);
  const removeTask = useStore((s) => s.removeTask);

  const [filter, setFilter] = useState<"all" | "open" | "done" | TaskCategory>("open");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    let res = [...tasks];
    if (filter === "open") res = res.filter((t) => !t.done);
    else if (filter === "done") res = res.filter((t) => t.done);
    else if (filter !== "all") res = res.filter((t) => t.category === filter);
    return res.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const order = { urgent: 0, important: 1, later: 2 } as const;
      if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
      return (a.deadline || "9999") < (b.deadline || "9999") ? -1 : 1;
    });
  }, [tasks, filter]);

  // Group by month for timeline
  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of filtered) {
      const key = t.deadline ? t.deadline.slice(0, 7) : "no-date";
      (map[key] ||= []).push(t);
    }
    return Object.entries(map).sort(([a], [b]) => (a < b ? -1 : 1));
  }, [filtered]);

  const monthLabel = (key: string) => {
    if (key === "no-date") return "Без даты";
    const [y, m] = key.split("-");
    const d = new Date(+y, +m - 1, 1);
    return d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  };

  const totalOpen = tasks.filter((t) => !t.done).length;
  const urgentOpen = tasks.filter((t) => !t.done && t.priority === "urgent").length;
  const overdue = tasks.filter(
    (t) => !t.done && t.deadline && new Date(t.deadline) < new Date(new Date().toDateString())
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Мой план</h1>
          <p className="mt-1 text-sm text-text2">
            {totalOpen} открытых · {urgentOpen} срочных {overdue > 0 && <span className="text-danger">· {overdue} просрочено</span>}
          </p>
        </div>
        <AddTaskDialog open={open} onOpenChange={setOpen} onAdd={(t) => { addTask(t); toast.success("Задача добавлена"); }} universities={universities} />
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto sw-scroll pb-1">
        <Filter className="h-4 w-4 flex-shrink-0 text-text3" />
        {[
          { v: "open", l: "Открытые" },
          { v: "all", l: "Все" },
          { v: "done", l: "Готовые" },
          ...CATEGORIES.map((c) => ({ v: c.value, l: c.label })),
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v as any)}
            className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs transition-colors ${
              filter === f.v
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-bg2 text-text2 hover:text-foreground"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="sw-card flex flex-col items-center gap-3 py-14 text-center">
          <div className="text-2xl">🦏</div>
          <div className="font-semibold">Пока пусто</div>
          <p className="max-w-sm text-sm text-text2">
            Добавь свою первую задачу — экзамен, эссе или дедлайн заявки.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Новая задача
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([month, items]) => (
            <div key={month}>
              <div className="mb-3 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-text3" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text2">
                  {monthLabel(month)}
                </h3>
                <span className="text-xs text-text3">· {items.length}</span>
              </div>
              <ul className="space-y-2">
                {items.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    onToggle={() => toggleTask(t.id)}
                    onRemove={() => { removeTask(t.id); toast("Удалено"); }}
                    universityName={universities.find((u) => u.id === t.universityLinked)?.name}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task, onToggle, onRemove, universityName,
}: {
  task: Task; onToggle: () => void; onRemove: () => void; universityName?: string;
}) {
  const today = new Date(new Date().toDateString());
  const days = task.deadline ? Math.ceil((+new Date(task.deadline) - +today) / 86400000) : null;
  const dlClass =
    days === null ? "text-text3" :
    days < 0 ? "text-danger font-medium" :
    days < 14 ? "text-danger" :
    days <= 30 ? "text-warning" : "text-text2";

  const prio = PRIORITIES.find((p) => p.value === task.priority)!;
  const cat = CATEGORIES.find((c) => c.value === task.category)!;

  return (
    <li className="group flex items-center gap-3 rounded-lg border border-border bg-bg2 p-3.5 transition-colors hover:border-text3">
      <button
        onClick={onToggle}
        aria-label="toggle"
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors ${
          task.done
            ? "border-success bg-success text-background"
            : "border-border hover:border-accent"
        }`}
      >
        {task.done && <span className="text-[11px]">✓</span>}
      </button>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm ${task.done ? "text-text3 line-through" : "font-medium"}`}>
          {task.title}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="text-text3">{cat.label}</span>
          {universityName && <span className="text-text3">· {universityName}</span>}
          {task.deadline && (
            <span className={`tabular ${dlClass}`}>
              {new Date(task.deadline).toLocaleDateString("ru-RU")}
              {days !== null && (days < 0 ? ` (просрочено)` : ` · ${days} дн`)}
            </span>
          )}
          <span className={`inline-flex items-center gap-1 ${prio.cls}`}>
            <prio.icon className="h-3 w-3" /> {prio.label}
          </span>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="rounded-md p-1.5 text-text3 opacity-0 transition-opacity hover:bg-bg3 hover:text-danger group-hover:opacity-100"
        aria-label="delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

function AddTaskDialog({
  open, onOpenChange, onAdd, universities,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdd: (t: Omit<Task, "id" | "createdAt">) => void;
  universities: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("applications");
  const [priority, setPriority] = useState<Priority>("important");
  const [deadline, setDeadline] = useState("");
  const [uniId, setUniId] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      category,
      priority,
      deadline: deadline || null,
      universityLinked: uniId || null,
      notes,
      done: false,
    });
    setTitle(""); setDeadline(""); setUniId(""); setNotes("");
    setCategory("applications"); setPriority("important");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 self-start rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90 md:self-auto">
          <Plus className="h-4 w-4" /> Новая задача
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Новая задача</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="sw-label">Название</label>
            <input
              className="sw-input"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например, сдать TOEFL"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="sw-label">Категория</label>
              <select className="sw-input" value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="sw-label">Приоритет</label>
              <select className="sw-input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="sw-label">Дедлайн</label>
              <input type="date" className="sw-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div>
              <label className="sw-label">Университет</label>
              <select className="sw-input" value={uniId} onChange={(e) => setUniId(e.target.value)}>
                <option value="">— Не привязано —</option>
                {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="sw-label">Заметки</label>
            <textarea className="sw-input min-h-[70px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="rounded-lg border border-border px-3.5 py-2 text-sm hover:bg-bg3">Отмена</button>
          <button onClick={submit} disabled={!title.trim()} className="rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40">
            Добавить
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
