import { EXERCISES, type Exercise, type MuscleGroup } from "./exercises";
import type { Profile, WeeklyPlan, DayPlan, PlannedExercise, DayOfWeek } from "./types";
import { DAYS_OF_WEEK } from "./types";
import { loadRemoteDb, pickFromDb, type DbExercise } from "./exerciseDb";

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function volumeFor(goal: Profile["goal"], type: Exercise["type"], gender: Profile["gender"], glutePriority: boolean) {
  if (type === "cardio") {
    const minutes = goal === "Dimagrimento" ? 30 : goal === "Forza" ? 15 : 20;
    return { sets: 1, reps: `${minutes} min`, restSec: 0 };
  }
  if (type === "core") {
    return { sets: 3, reps: "30-45 sec", restSec: 45 };
  }
  if (goal === "Forza") {
    return { sets: 5, reps: "3-5", restSec: 180 };
  }
  if (goal === "Dimagrimento") {
    return { sets: 3, reps: "12-15", restSec: 45 };
  }
  const isFemale = gender === "Femmina";
  if (glutePriority && isFemale) {
    return { sets: 5, reps: "10-15", restSec: 75 };
  }
  return { sets: 4, reps: "8-12", restSec: isFemale ? 75 : 90 };
}

function buildSplit(focus: MuscleGroup[], days: number): MuscleGroup[][] {
  const splits: MuscleGroup[][] = Array.from({ length: days }, () => []);
  const order: MuscleGroup[] = ["Petto", "Schiena", "Gambe", "Glutei", "Spalle", "Braccia", "Addominali", "Cardio"];
  const sorted = [...focus].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  sorted.forEach((m, i) => splits[i % days].push(m));
  for (let i = 0; i < days; i++) {
    if (splits[i].length === 0) splits[i].push(focus.includes("Cardio") ? "Cardio" : "Addominali");
  }
  return splits;
}

function defaultDays(n: number): DayOfWeek[] {
  // Sensible default: spread across the week with rest days
  const presets: Record<number, DayOfWeek[]> = {
    2: ["Lunedì", "Giovedì"],
    3: ["Lunedì", "Mercoledì", "Venerdì"],
    4: ["Lunedì", "Martedì", "Giovedì", "Venerdì"],
    5: ["Lunedì", "Martedì", "Mercoledì", "Venerdì", "Sabato"],
    6: ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
  };
  return presets[n] ?? DAYS_OF_WEEK.slice(0, n);
}

export function defaultTrainingDays(n: number): DayOfWeek[] {
  return defaultDays(n);
}

export function generatePlan(profile: Profile): WeeklyPlan {
  const focus = (Object.entries(profile.focus)
    .filter(([, v]) => v)
    .map(([k]) => k) as MuscleGroup[]);

  const safeFocus = focus.length > 0 ? focus : (["Petto", "Schiena", "Gambe"] as MuscleGroup[]);
  const splits = buildSplit(safeFocus, profile.daysPerWeek);
  const userDays = profile.trainingDays && profile.trainingDays.length === profile.daysPerWeek
    ? profile.trainingDays
    : defaultDays(profile.daysPerWeek);
  // Sort by week order (Lunedì → Domenica) so the schedule reads naturally
  const dayAssignments = [...userDays].sort(
    (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)
  );

  const days: DayPlan[] = splits.map((muscles, idx) => {
    const exercises: PlannedExercise[] = [];

    const sortedMuscles = [...muscles].sort((a, b) => {
      if (profile.goal === "Dimagrimento") {
        if (a === "Cardio") return -1; if (b === "Cardio") return 1;
      }
      if (profile.gender === "Femmina") {
        if (a === "Glutei") return -1; if (b === "Glutei") return 1;
      }
      return 0;
    });

    sortedMuscles.forEach((m) => {
      const pool = EXERCISES.filter((e) => e.muscle === m);
      let count = 3;
      if (m === "Cardio") count = 1;
      else if (m === "Addominali") count = 2;
      else if (m === "Glutei" && profile.gender === "Femmina") count = 4;
      else if (profile.goal === "Forza") count = 2;

      const compounds = pool.filter((e) => e.isCompound);
      const isolations = pool.filter((e) => !e.isCompound);
      const picked = [
        ...pickN(compounds, Math.min(compounds.length, Math.ceil(count / 2))),
        ...pickN(isolations, count),
      ].slice(0, count);

      picked.forEach((ex) => {
        const v = volumeFor(profile.goal, ex.type, profile.gender, !!ex.glutePriority);
        exercises.push({
          exerciseId: ex.id,
          name: ex.name,
          muscle: ex.muscle,
          sets: v.sets,
          reps: v.reps,
          restSec: v.restSec,
          type: ex.type,
        });
      });
    });

    return {
      dayIndex: idx,
      assignedDay: dayAssignments[idx],
      label: muscles.join(" / "),
      muscles,
      exercises,
    };
  });

  return { generatedAt: Date.now(), days };
}
