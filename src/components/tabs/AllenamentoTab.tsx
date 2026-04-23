import { useState } from "react";
import { useApp } from "@/state/AppContext";
import { ExerciseCard } from "@/components/ExerciseCard";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EXERCISES, type MuscleGroup } from "@/lib/exercises";
import { DAYS_OF_WEEK, type DayOfWeek, type PlannedExercise } from "@/lib/types";

const MUSCLES: MuscleGroup[] = ["Petto", "Schiena", "Gambe", "Glutei", "Spalle", "Braccia", "Addominali", "Cardio"];

export function AllenamentoTab() {
  const { state, setState, regeneratePlan } = useApp();
  const [active, setActive] = useState(0);
  const [editing, setEditing] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [adding, setAdding] = useState<MuscleGroup | null>(null);

  if (!state.plan) return null;
  const day = state.plan.days[active];

  const updateExercise = (idx: number, next: PlannedExercise) => {
    setState((s) => {
      if (!s.plan) return s;
      const days = s.plan.days.map((d, i) => {
        if (i !== active) return d;
        const exercises = d.exercises.map((e, j) => (j === idx ? next : e));
        return { ...d, exercises };
      });
      return { ...s, plan: { ...s.plan, days } };
    });
  };

  const removeExercise = (idx: number) => {
    setState((s) => {
      if (!s.plan) return s;
      const days = s.plan.days.map((d, i) =>
        i === active ? { ...d, exercises: d.exercises.filter((_, j) => j !== idx) } : d
      );
      return { ...s, plan: { ...s.plan, days } };
    });
  };

  const moveExercise = (idx: number, direction: -1 | 1) => {
    setState((s) => {
      if (!s.plan) return s;
      const days = s.plan.days.map((d, i) => {
        if (i !== active) return d;
        const next = [...d.exercises];
        const target = idx + direction;
        if (target < 0 || target >= next.length) return d;
        [next[idx], next[target]] = [next[target], next[idx]];
        return { ...d, exercises: next };
      });
      return { ...s, plan: { ...s.plan, days } };
    });
  };

  const addExerciseFromMuscle = (muscle: MuscleGroup) => {
    const pool = EXERCISES.filter((e) => e.muscle === muscle);
    const ex = pool[Math.floor(Math.random() * pool.length)];
    if (!ex) return;
    const newPlanned: PlannedExercise = {
      exerciseId: ex.id,
      name: ex.name,
      muscle: ex.muscle,
      sets: ex.type === "cardio" ? 1 : 4,
      reps: ex.type === "cardio" ? "20 min" : ex.type === "core" ? "30-45 sec" : "8-12",
      restSec: ex.type === "cardio" ? 0 : ex.type === "core" ? 45 : 90,
      type: ex.type,
    };
    setState((s) => {
      if (!s.plan) return s;
      const days = s.plan.days.map((d, i) =>
        i === active ? { ...d, exercises: [...d.exercises, newPlanned] } : d
      );
      return { ...s, plan: { ...s.plan, days } };
    });
    setAdding(null);
  };

  const setAssignedDay = (newDay: DayOfWeek) => {
    setState((s) => {
      if (!s.plan) return s;
      const days = s.plan.days.map((d, i) => (i === active ? { ...d, assignedDay: newDay } : d));
      return { ...s, plan: { ...s.plan, days } };
    });
  };

  return (
    <div className="px-5 pb-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-black">La tua Scheda</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing((e) => !e)}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all",
              editing ? "bg-electric/20 text-electric border border-electric/40" : "bg-secondary/80"
            )}
          >
            {editing ? "✓ Fine" : "✏️ Modifica"}
          </button>
          <button
            onClick={() => {
              if (confirmRegen) { regeneratePlan(); setConfirmRegen(false); setEditing(false); }
              else setConfirmRegen(true);
            }}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all",
              confirmRegen ? "bg-primary shadow-glow" : "bg-secondary/80"
            )}
          >
            {confirmRegen ? "Conferma 🔥" : "Rigenera"}
          </button>
        </div>
      </div>

      {/* Day-of-week tabs */}
      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1">
        {state.plan.days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap min-h-[44px] flex flex-col items-center justify-center",
              active === i ? "bg-primary shadow-glow" : "bg-secondary/60"
            )}
          >
            <span className="text-[10px] opacity-80">{d.assignedDay.slice(0, 3)}</span>
            <span className="text-[11px]">{d.muscles[0] ?? "Riposo"}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Assegnato a</p>
              {editing ? (
                <select
                  value={day.assignedDay}
                  onChange={(e) => setAssignedDay(e.target.value as DayOfWeek)}
                  className="mt-1 bg-input/60 border border-border rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : (
                <p className="text-lg font-black">{day.assignedDay}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Focus</p>
              <p className="text-sm font-semibold text-electric">{day.label}</p>
            </div>
          </div>
        </div>

        {day.exercises.map((ex, i) => (
          <ExerciseCard
            key={ex.exerciseId + i}
            exercise={ex}
            index={i}
            editable={editing}
            onChange={(next) => updateExercise(i, next)}
            onRemove={() => removeExercise(i)}
          />
        ))}

        {editing && (
          <div className="space-y-2">
            <button
              onClick={() => setAdding(adding ? null : "Petto")}
              className="w-full py-3 rounded-xl bg-gradient-primary shadow-glow font-bold active:scale-95 transition-transform"
            >
              ➕ Aggiungi Esercizio
            </button>
            <AnimatePresence>
              {adding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card/80 border border-border rounded-2xl p-3 shadow-card overflow-hidden"
                >
                  <p className="text-xs text-muted-foreground mb-2">Scegli il gruppo muscolare</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MUSCLES.map((m) => (
                      <button
                        key={m}
                        onClick={() => addExerciseFromMuscle(m)}
                        className="py-2 rounded-lg bg-secondary/60 text-sm font-semibold active:scale-95 transition-transform"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setAdding(null)}
                    className="w-full mt-2 py-2 text-xs text-muted-foreground"
                  >
                    Annulla
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {day.exercises.length === 0 && !editing && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Nessun esercizio. Tocca "Modifica" per aggiungerne.
          </p>
        )}
      </motion.div>
    </div>
  );
}
