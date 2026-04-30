import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppState,
  Task,
  UniversityApplication,
  Document,
  ChatMessage,
  TestResult,
  User,
  InterviewSession,
} from "@/types";
import { calculateChance } from "@/data/reference";

interface Store extends AppState {
  setUser: (user: User | null) => void;
  updateUser: (patch: Partial<User>) => void;

  completeOnboarding: (initialTasks: Task[], initialDocs: Document[], testResult: TestResult | null) => void;

  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;

  addUniversity: (uni: Omit<UniversityApplication, "id" | "chancePercent" | "tier">) => void;
  updateUniversity: (id: string, patch: Partial<UniversityApplication>) => void;
  removeUniversity: (id: string) => void;
  recomputeChances: () => void;

  addUniversityTasks: (uni: UniversityApplication) => number;

  addDocument: (doc: Omit<Document, "id">) => void;
  updateDocument: (id: string, patch: Partial<Document>) => void;
  removeDocument: (id: string) => void;

  setChatHistory: (history: ChatMessage[]) => void;
  appendChat: (msg: ChatMessage) => void;
  resetChat: () => void;

  setInterviewHistory: (history: ChatMessage[]) => void;
  appendInterview: (msg: ChatMessage) => void;
  resetInterview: () => void;
  saveInterviewSession: (s: InterviewSession) => void;

  setMonthlyFocus: (goals: string[]) => void;

  setTheme: (theme: "light" | "dark") => void;
  setMascotAnimated: (v: boolean) => void;

  reset: () => void;
}

const initial: AppState = {
  user: null,
  onboardingComplete: false,
  tasksInitialized: false,
  documentsInitialized: false,
  tasks: [],
  universities: [],
  documents: [],
  testResults: null,
  chatHistory: [],
  interviewHistory: [],
  interviewSessions: [],
  monthlyFocus: { month: "", goals: [] },
  theme: "light",
  mascotAnimated: true,
};

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,

      setUser: (user) => set({ user }),
      updateUser: (patch) => {
        const u = get().user;
        if (!u) return;
        set({ user: { ...u, ...patch } });
        get().recomputeChances();
      },

      completeOnboarding: (initialTasks, initialDocs, testResult) => {
        const state = get();
        if (state.tasksInitialized && state.documentsInitialized) {
          set({ onboardingComplete: true, testResults: testResult ?? state.testResults });
          return;
        }
        set({
          onboardingComplete: true,
          tasksInitialized: true,
          documentsInitialized: true,
          tasks: state.tasksInitialized ? state.tasks : initialTasks,
          documents: state.documentsInitialized ? state.documents : initialDocs,
          testResults: testResult ?? state.testResults,
        });
      },

      addTask: (task) =>
        set((s) => ({
          tasks: [...s.tasks, { ...task, id: uuid(), createdAt: now() }],
        })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      addUniversity: (uni) => {
        const u = get().user;
        const { chancePercent, tier } = calculateChance(
          { gpa: u?.gpa ?? null, sat: u?.sat ?? null, ielts: u?.ielts ?? null },
          { minGpa: uni.minGpa, minSat: uni.minSat, minIelts: uni.minIelts }
        );
        set((s) => ({
          universities: [
            ...s.universities,
            { ...uni, id: uuid(), chancePercent, tier },
          ],
        }));
      },
      updateUniversity: (id, patch) =>
        set((s) => ({
          universities: s.universities.map((u) =>
            u.id === id ? { ...u, ...patch } : u
          ),
        })),
      removeUniversity: (id) =>
        set((s) => ({ universities: s.universities.filter((u) => u.id !== id) })),
      recomputeChances: () => {
        const u = get().user;
        if (!u) return;
        set((s) => ({
          universities: s.universities.map((uni) => {
            const { chancePercent, tier } = calculateChance(
              { gpa: u.gpa, sat: u.sat, ielts: u.ielts },
              { minGpa: uni.minGpa, minSat: uni.minSat, minIelts: uni.minIelts }
            );
            return { ...uni, chancePercent, tier };
          }),
        }));
      },

      addUniversityTasks: (uni) => {
        const existing = get().tasks;
        const titles = [
          { title: `Проверить требования ${uni.name}`, priority: "important" as const, offsetDays: -45 },
          { title: `Написать эссе для ${uni.name}`, priority: "urgent" as const, offsetDays: -14 },
          { title: `Подать заявку в ${uni.name}`, priority: "urgent" as const, offsetDays: 0 },
        ];
        const deadline = uni.deadline ? new Date(uni.deadline) : null;
        let added = 0;
        const newTasks: Task[] = [];
        for (const t of titles) {
          const dup = existing.find(
            (e) => e.universityLinked === uni.id && e.title === t.title
          );
          if (dup) continue;
          let dl: string | null = null;
          if (deadline) {
            const d = new Date(deadline);
            d.setDate(d.getDate() + t.offsetDays);
            dl = d.toISOString().slice(0, 10);
          }
          newTasks.push({
            id: uuid(),
            title: t.title,
            category: "applications",
            deadline: dl,
            done: false,
            priority: t.priority,
            universityLinked: uni.id,
            notes: "",
            createdAt: now(),
          });
          added++;
        }
        if (newTasks.length) {
          set((s) => ({ tasks: [...s.tasks, ...newTasks] }));
        }
        return added;
      },

      addDocument: (doc) =>
        set((s) => ({ documents: [...s.documents, { ...doc, id: uuid() }] })),
      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

      setChatHistory: (history) => set({ chatHistory: history }),
      appendChat: (msg) => set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
      resetChat: () => set({ chatHistory: [] }),

      setInterviewHistory: (history) => set({ interviewHistory: history }),
      appendInterview: (msg) =>
        set((s) => ({ interviewHistory: [...s.interviewHistory, msg] })),
      resetInterview: () => set({ interviewHistory: [] }),
      saveInterviewSession: (s) =>
        set((st) => ({ interviewSessions: [s, ...st.interviewSessions].slice(0, 20) })),

      setMonthlyFocus: (goals) => {
        const month = new Date().toISOString().slice(0, 7);
        set({ monthlyFocus: { month, goals } });
      },

      setTheme: (theme) => set({ theme }),

      reset: () => set({ ...initial }),
    }),
    {
      name: "stepwise_state",
      version: 1,
    }
  )
);

// Apply theme class to <html> on mount.
export function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}
