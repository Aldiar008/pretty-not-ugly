export type Grade =
  | "9"
  | "10"
  | "11"
  | "12"
  | "bachelor_1"
  | "bachelor_2"
  | "bachelor_3"
  | "bachelor_4"
  | "gap_year";

export interface User {
  id: string;
  name: string;
  email: string;
  country: string; // country code: "KZ", "US"...
  grade: Grade | string;
  gpa: number | null;
  sat: number | null;
  ielts: number | null;
  toefl: number | null;
  nationalExam: string;
  nationalScore: number | null;
  targetCountries: string[]; // codes
  targetMajor: string;
  budget: string;
  startYear: string;
  createdAt: string;
}

export type TaskCategory =
  | "exams"
  | "documents"
  | "applications"
  | "scholarships"
  | "visa"
  | "other";

export type Priority = "urgent" | "important" | "later";

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  deadline: string | null;
  done: boolean;
  priority: Priority;
  universityLinked: string | null;
  notes: string;
  createdAt: string;
}

export type UniversityStatus =
  | "wishlist"
  | "preparing"
  | "submitted"
  | "accepted"
  | "rejected"
  | "waitlist";

export type Tier = "safety" | "match" | "reach";

export interface UniversityApplication {
  id: string;
  name: string;
  country: string; // code
  countryFlag: string;
  deadline: string;
  status: UniversityStatus;
  tier: Tier;
  chancePercent: number;
  minGpa: number;
  minSat: number;
  minIelts: number;
  tuitionUsd: number;
  hasScholarship: boolean;
  notes: string;
}

export type DocType =
  | "personal_statement"
  | "essay"
  | "transcript"
  | "recommendation"
  | "certificate"
  | "financial"
  | "other";

export type DocStatus = "not_started" | "in_progress" | "complete" | "sent";

export interface Document {
  id: string;
  name: string;
  type: DocType;
  status: DocStatus;
  deadline: string | null;
  notes: string;
  universityLinked?: string | null;
}

export interface TestResult {
  date: string;
  scores: { category: string; score: number }[];
  topCompetencies: string[];
  recommendedMajors: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface InterviewSession {
  id: string;
  date: string;
  university: string;
  type: string;
  rating: number;
  history: ChatMessage[];
}

export interface AppState {
  user: User | null;
  onboardingComplete: boolean;
  tasksInitialized: boolean;
  documentsInitialized: boolean;
  tasks: Task[];
  universities: UniversityApplication[];
  documents: Document[];
  testResults: TestResult | null;
  chatHistory: ChatMessage[];
  interviewHistory: ChatMessage[];
  interviewSessions: InterviewSession[];
  monthlyFocus: { month: string; goals: string[] };
  theme: "light" | "dark";
}
