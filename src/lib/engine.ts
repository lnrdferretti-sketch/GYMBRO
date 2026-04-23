import { EXERCISES, type Exercise, type MuscleGroup } from "./exercises";
import type { Profile, WeeklyPlan, DayPlan, PlannedExercise } from "./types";

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function volumeFor(goal: Profile["goal"], type: Exercise["type"], gender: Profile["gender"], glutePriority: boolean) {
  if (type === "cardio") {
    const minutes = goal === "Dimagrimento" ? 30 : goal === "Forza" ? 15 : 20;
    return { sets: 1, reps: `${minutes} min`, rest: "—" };
  }
  if (type === "core") {
    return { sets: 3, reps: "30-45 sec", rest: "45s" };
  }
  // strength
  if (goal === "Forza") {
    return { sets: 5, reps: "3-5", rest: "180s" };
  }
  if (goal === "Dimagrimento") {
    return { sets: 3, reps: "12-15", rest: "45s" };
  }
  // Ipertrofia
  const isFemale = gender === "Femmina";
  if (glutePriority && isFemale) {
    return { sets: 5, reps: "10-15", rest: "75s" };
  }
  return { sets: 4, reps: "8-12", rest: isFemale ? "75s" : "90s" };
}

function buildSplit(focus: MuscleGroup[], days: number): MuscleGroup[][] {
  // Distribute muscles across days, balancing load
  const splits: MuscleGroup[][] = Array.from({ length: days }, () => []);
  // Round-robin sort by typical pairing
  const order: MuscleGroup[] = ["Petto", "Schiena", "Gambe", "Glutei", "Spalle", "Braccia", "Addominali", "Cardio"];
  const sorted = [...focus].sort((a, b) => order.indexOf(a) - order.indexOf(b));

  // Greedy distribution
  sorted.forEach((m, i) => splits[i % days].push(m));

  // Ensure no empty day — fill with Cardio or Addominali
  for (let i = 0; i < days; i++) {
    if (splits[i].length === 0) splits[i].push(focus.includes("Cardio") ? "Cardio" : "Addominali");
  }
  return splits;
}

export function generatePlan(profile: Profile): WeeklyPlan {
  const focus = (Object.entries(profile.focus)
    .filter(([, v]) => v)
    .map(([k]) => k) as MuscleGroup[]);

  const safeFocus = focus.length > 0 ? focus : (["Petto", "Schiena", "Gambe"] as MuscleGroup[]);
  const splits = buildSplit(safeFocus, profile.daysPerWeek);

  const days: DayPlan[] = splits.map((muscles, idx) => {
    const exercises: PlannedExercise[] = [];

    // Priority sort: for Dimagrimento, cardio first; for female with Glutei, glutes first
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
      // Volume: glutes for female get more exercises
      let count = 3;
      if (m === "Cardio") count = 1;
      else if (m === "Addominali") count = 2;
      else if (m === "Glutei" && profile.gender === "Femmina") count = 4;
      else if (profile.goal === "Forza") count = 2;

      // Prefer compound first
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
          rest: v.rest,
          type: ex.type,
        });
      });
    });

    return {
      dayIndex: idx,
      label: `Giorno ${idx + 1} — ${muscles.join(" / ")}`,
      exercises,
    };
  });

  return { generatedAt: Date.now(), days };
}
