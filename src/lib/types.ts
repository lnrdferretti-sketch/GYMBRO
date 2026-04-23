import type { MuscleGroup } from "./exercises";

export type Gender = "Maschio" | "Femmina";
export type Goal = "Ipertrofia" | "Forza" | "Dimagrimento";

export type DayOfWeek =
  | "Lunedì" | "Martedì" | "Mercoledì" | "Giovedì"
  | "Venerdì" | "Sabato" | "Domenica";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica",
];

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
  background: string;
};

export type PlannedExercise = {
  exerciseId: string;
  name: string;
  muscle: MuscleGroup;
  sets: number;
  reps: string; // "8-12" or "30 min"
  restSec: number; // seconds
  type: "strength" | "cardio" | "core";
  gifUrl?: string;
};

export type DayPlan = {
  dayIndex: number;
  assignedDay: DayOfWeek;
  label: string;
  muscles: MuscleGroup[];
  exercises: PlannedExercise[];
};

export type WeeklyPlan = {
  generatedAt: number;
  days: DayPlan[];
};

export type WellnessLog = {
  weights: { date: string; value: number }[];
  water: Record<string, number>;
  steps: Record<string, number>;
  kcal: Record<string, number>;
};

export type ExtraMaxKey =
  | "bicepCurl"
  | "militaryPress"
  | "legPress"
  | "bulgarianSplit"
  | "tricepExt"
  | "latPulldown"
  | "seatedRow"
  | "inclineBench"
  | "cableFly"
  | "weightedCrunch";

export type Maxes = {
  bench: number;
  squat: number;
  deadlift: number;
  extras: Record<ExtraMaxKey, number>;
  history: { date: string; bench: number; squat: number; deadlift: number }[];
};

export type AppState = {
  profile: Profile | null;
  plan: WeeklyPlan | null;
  wellness: WellnessLog;
  maxes: Maxes;
  gifMap: Record<string, string>; // exerciseId -> URL
  onboarded: boolean;
};

export const DEFAULT_FOCUS: Record<MuscleGroup, boolean> = {
  Petto: true, Schiena: true, Gambe: true, Glutei: false,
  Spalle: true, Braccia: true, Addominali: true, Cardio: false,
};

export const DEFAULT_EXTRAS: Record<ExtraMaxKey, number> = {
  bicepCurl: 0,
  militaryPress: 0,
  legPress: 0,
  bulgarianSplit: 0,
  tricepExt: 0,
  latPulldown: 0,
  seatedRow: 0,
  inclineBench: 0,
  cableFly: 0,
  weightedCrunch: 0,
};
