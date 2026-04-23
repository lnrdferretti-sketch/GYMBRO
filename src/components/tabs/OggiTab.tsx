import { useApp } from "@/state/AppContext";
import { dayOfWeekIndex } from "@/lib/storage";
import { ExerciseCard } from "@/components/ExerciseCard";
import { motion } from "framer-motion";

export function OggiTab() {
  const { state } = useApp();
  if (!state.profile || !state.plan) return null;

  const idx = dayOfWeekIndex(state.profile.daysPerWeek);
  const day = state.plan.days[idx];

  return (
    <div className="px-5 pb-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Allenamento di oggi</p>
        <h2 className="text-2xl font-black mt-1">{day.label}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {day.exercises.length} esercizi · Goal: <span className="text-electric font-semibold">{state.profile.goal}</span>
        </p>
      </motion.div>

      <div className="space-y-3">
        {day.exercises.map((ex, i) => (
          <ExerciseCard key={ex.exerciseId + i} exercise={ex} index={i} />
        ))}
      </div>
    </div>
  );
}
