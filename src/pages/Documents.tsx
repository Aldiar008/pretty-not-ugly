import { useMemo, useState } from "react";
import { useStore } from "@/store";
import type { Document, DocStatus, DocType } from "@/types";
import {
  Plus, FileText, Trash2, Circle, Loader2, CheckCircle2, Send,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { removeWithUndo } from "@/lib/undo";

const TYPES: { v: DocType; l: string }[] = [
  { v: "personal_statement", l: "Personal Statement" },
  { v: "essay", l: "Эссе" },
  { v: "transcript", l: "Транскрипт" },
  { v: "recommendation", l: "Рекомендация" },
  { v: "certificate", l: "Сертификат" },
  { v: "financial", l: "Финансовый документ" },
  { v: "other", l: "Другое" },
];

const STATUSES: { v: DocStatus; l: string; icon: typeof Circle; cls: string }[] = [
  { v: "not_started", l: "Не начато", icon: Circle, cls: "text-text3" },
  { v: "in_progress", l: "В работе", icon: Loader2, cls: "text-accent" },
  { v: "complete", l: "Готово", icon: CheckCircle2, cls: "text-success" },
  { v: "sent", l: "Отправлено", icon: Send, cls: "text-purple" },
];

const NEXT_STATUS: Record<DocStatus, DocStatus> = {
  not_started: "in_progress",
  in_progress: "complete",
  complete: "sent",
  sent: "not_started",
};

export default function Documents() {
  const documents = useStore((s) => s.documents);
  const universities = useStore((s) => s.universities);
  const addDocument = useStore((s) => s.addDocument);
  const updateDocument = useStore((s) => s.updateDocument);
  const removeDocument = useStore((s) => s.removeDocument);

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | DocStatus>("all");

  const filtered = useMemo(() => {
    return documents.filter((d) => filter === "all" || d.status === filter);
  }, [documents, filter]);

  const counts = useMemo(() => {
    const m: Record<DocStatus, number> = { not_started: 0, in_progress: 0, complete: 0, sent: 0 };
    documents.forEach((d) => m[d.status]++);
    return m;
  }, [documents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Документы</h1>
          <p className="mt-1 text-sm text-text2">
            {documents.length} всего · {counts.complete + counts.sent} готово · {counts.in_progress} в работе
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90 md:self-auto"
        >
          <Plus className="h-4 w-4" /> Новый документ
        </button>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>Все · {documents.length}</FilterChip>
        {STATUSES.map((s) => (
          <FilterChip key={s.v} active={filter === s.v} onClick={() => setFilter(s.v)}>
            {s.l} · {counts[s.v]}
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="sw-card flex flex-col items-center gap-3 py-14 text-center">
          <FileText className="h-8 w-8 text-text3" />
          <div className="font-semibold">Документов нет</div>
          <p className="max-w-sm text-sm text-text2">Добавь Personal Statement, эссе, транскрипты — Step будет следить за статусами.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <DocCard
              key={d.id}
              doc={d}
              universityName={universities.find((u) => u.id === d.universityLinked)?.name}
              onCycle={() => updateDocument(d.id, { status: NEXT_STATUS[d.status] })}
              onStatus={(s) => updateDocument(d.id, { status: s })}
              onRemove={() => removeWithUndo("document", d)}
            />
          ))}
        </div>
      )}

      <AddDialog
        open={open}
        onClose={() => setOpen(false)}
        onAdd={(d) => { addDocument(d); toast.success("Документ добавлен"); setOpen(false); }}
        universities={universities}
      />
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active ? "border-foreground bg-foreground text-background" : "border-border bg-bg2 text-text2 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function DocCard({
  doc, universityName, onCycle, onStatus, onRemove,
}: {
  doc: Document;
  universityName?: string;
  onCycle: () => void;
  onStatus: (s: DocStatus) => void;
  onRemove: () => void;
}) {
  const status = STATUSES.find((s) => s.v === doc.status)!;
  const type = TYPES.find((t) => t.v === doc.type)!;
  const Icon = status.icon;

  return (
    <div className="sw-card group flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{doc.name}</div>
          <div className="text-xs text-text3">{type.l}{universityName ? ` · ${universityName}` : ""}</div>
        </div>
        <button onClick={onRemove} className="rounded-md p-1 text-text3 opacity-0 transition-opacity hover:bg-bg3 hover:text-danger group-hover:opacity-100">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {doc.notes && <p className="text-xs text-text2 line-clamp-2">{doc.notes}</p>}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
        <button
          onClick={onCycle}
          className={`inline-flex items-center gap-1.5 text-xs ${status.cls}`}
          title="Сменить статус"
        >
          <Icon className={`h-3.5 w-3.5 ${doc.status === "in_progress" ? "animate-spin" : ""}`} />
          {status.l}
        </button>
        <select
          value={doc.status}
          onChange={(e) => onStatus(e.target.value as DocStatus)}
          className="rounded-md border border-border bg-bg2 px-2 py-1 text-[11px] text-text2"
        >
          {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
      </div>
    </div>
  );
}

function AddDialog({
  open, onClose, onAdd, universities,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (d: Omit<Document, "id">) => void;
  universities: { id: string; name: string }[];
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<DocType>("essay");
  const [status, setStatus] = useState<DocStatus>("not_started");
  const [deadline, setDeadline] = useState("");
  const [uniId, setUniId] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(), type, status, deadline: deadline || null,
      notes, universityLinked: uniId || null,
    });
    setName(""); setNotes(""); setDeadline(""); setUniId("");
    setType("essay"); setStatus("not_started");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader><DialogTitle>Новый документ</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="sw-label">Название</label>
            <input className="sw-input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Personal Statement для MIT" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="sw-label">Тип</label>
              <select className="sw-input" value={type} onChange={(e) => setType(e.target.value as DocType)}>
                {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
              </select>
            </div>
            <div>
              <label className="sw-label">Статус</label>
              <select className="sw-input" value={status} onChange={(e) => setStatus(e.target.value as DocStatus)}>
                {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
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
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-3.5 py-2 text-sm hover:bg-bg3">Отмена</button>
          <button onClick={submit} disabled={!name.trim()} className="rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40">
            Добавить
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
