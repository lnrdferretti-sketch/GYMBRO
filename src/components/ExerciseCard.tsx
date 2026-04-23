import { motion } from "framer-motion";
import type { PlannedExercise } from "@/lib/types";

export function ExerciseCard({ exercise, index }: { exercise: PlannedExercise; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card/80 border border-border rounded-2xl p-4 shadow-card"
    >
      <div className="flex gap-3">
        <div className="w-20 h-20 rounded-xl bg-gradient-navy border border-border flex flex-col items-center justify-center flex-shrink-0 text-center">
          <div className="text-2xl">🎞️</div>
          <div className="text-[9px] text-muted-foreground mt-0.5 leading-tight px-1">Animazione GIF</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm leading-tight">{exercise.name}</h3>
            <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-electric px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
              {exercise.muscle}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <Stat label="Serie" value={exercise.sets.toString()} />
            <Stat label="Reps" value={exercise.reps} />
            <Stat label="Rec" value={exercise.rest} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary/40 rounded-lg py-1.5 text-center">
      <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
