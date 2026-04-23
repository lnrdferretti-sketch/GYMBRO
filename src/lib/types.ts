import type { MuscleGroup } from "./exercises";

export type Gender = "Maschio" | "Femmina";
export type Goal = "Ipertrofia" | "Forza" | "Dimagrimento";

export type Profile = {
  coachName: string;
  coachEmoji: string;
  gender: Gender;
  age: number;
  currentWeight: number;
  targetWeight: number;
  goal: Goal;
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
  focus: Record<MuscleGroup, boolean>;
  background: string; // gradient name
};

export type PlannedExercise = {
  exerciseId: string;
  name: string;
  muscle: MuscleGroup;
  sets: number;
  reps: string; // "8-12" or "30 min"
  rest: string; // "90s"
  type: "strength" | "cardio" | "core";
};

export type DayPlan = {
  dayIndex: number;
  label: string; // "Giorno 1 — Petto/Tricipiti"
  exercises: PlannedExercise[];
};

export type WeeklyPlan = {
  generatedAt: number;
  days: DayPlan[];
};

export type WellnessLog = {
  weights: { date: string; value: number }[];
  water: Record<string, number>; // date -> glasses
  steps: Record<string, number>;
  kcal: Record<string, number>;
};

export type Maxes = {
  bench: number;
  squat: number;
  deadlift: number;
  history: { date: string; bench: number; squat: number; deadlift: number }[];
};

export type AppState = {
  profile: Profile | null;
  plan: WeeklyPlan | null;
  wellness: WellnessLog;
  maxes: Maxes;
  onboarded: boolean;
};

export const DEFAULT_FOCUS: Record<MuscleGroup, boolean> = {
  Petto: true, Schiena: true, Gambe: true, Glutei: false,
  Spalle: true, Braccia: true, Addominali: true, Cardio: false,
};
