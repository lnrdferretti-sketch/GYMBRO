import { useApp } from "@/state/AppContext";
import { todayDayOfWeek } from "@/lib/storage";
import { ExerciseCard } from "@/components/ExerciseCard";
import { motion } from "framer-motion";

export function OggiTab() {
  const { state } = useApp();
  if (!state.profile || !state.plan) return null;

  const today = todayDayOfWeek();
  const day = state.plan.days.find((d) => d.assignedDay === today);

  return (
    <div className="px-5 pb-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Oggi · {today}</p>
        {day ? (
          <>
            <h2 className="text-2xl font-black mt-1">{day.label}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {day.exercises.length} esercizi · Goal:{" "}
              <span className="text-electric font-semibold">{state.profile.goal}</span>
            </p>
          </>
        ) : (
          <h2 className="text-2xl font-black mt-1">🌿 Giorno di Riposo</h2>
        )}
      </motion.div>

      {day ? (
        <div className="space-y-3">
          {day.exercises.map((ex, i) => (
            <ExerciseCard key={ex.exerciseId + i} exercise={ex} index={i} />
          ))}
        </div>
      ) : (
        <div className="bg-card/80 border border-border rounded-2xl p-6 text-center shadow-card">
          <p className="text-4xl mb-2">😴</p>
          <p className="font-bold">Recupera bene oggi.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Nessun allenamento programmato per {today}.
          </p>
        </div>
      )}
    </div>
  );
}
