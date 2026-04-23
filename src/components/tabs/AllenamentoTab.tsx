import { useState } from "react";
import { useApp } from "@/state/AppContext";
import { ExerciseCard } from "@/components/ExerciseCard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function AllenamentoTab() {
  const { state, regeneratePlan } = useApp();
  const [active, setActive] = useState(0);
  const [confirming, setConfirming] = useState(false);

  if (!state.plan) return null;
  const day = state.plan.days[active];

  return (
    <div className="px-5 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">La tua Scheda</h2>
        <button
          onClick={() => (confirming ? (regeneratePlan(), setConfirming(false)) : setConfirming(true))}
          className={cn(
            "px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all",
            confirming ? "bg-primary shadow-glow" : "bg-secondary/80"
          )}
        >
          {confirming ? "Conferma 🔥" : "Rigenera"}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1">
        {state.plan.days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap min-h-[40px]",
              active === i ? "bg-primary shadow-glow" : "bg-secondary/60"
            )}
          >
            G{i + 1}
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold text-muted-foreground">{day.label}</p>
        {day.exercises.map((ex, i) => (
          <ExerciseCard key={ex.exerciseId + i} exercise={ex} index={i} />
        ))}
      </motion.div>
    </div>
  );
}
