import { useApp } from "@/state/AppContext";
import { todayDayOfWeek } from "@/lib/storage";
import { ExerciseCard } from "@/components/ExerciseCard";
import { motion } from "framer-motion";
import { DAYS_OF_WEEK, type DayOfWeek } from "@/lib/types";

export function OggiTab() {
  const { state } = useApp();
  if (!state.profile || !state.plan) return null;

  const today = todayDayOfWeek();
  const day = state.plan.days.find((d) => d.assignedDay === today);

  // Build the list of upcoming sessions for the rest of the current week
  // (in week order Lunedì → Domenica, starting AFTER today).
  const todayIdx = DAYS_OF_WEEK.indexOf(today);
  const upcoming = state.plan.days
    .filter((d) => DAYS_OF_WEEK.indexOf(d.assignedDay) > todayIdx)
    .sort(
      (a, b) =>
        DAYS_OF_WEEK.indexOf(a.assignedDay as DayOfWeek) -
        DAYS_OF_WEEK.indexOf(b.assignedDay as DayOfWeek)
    );

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

      {/* Upcoming sessions for the rest of the week */}
      {upcoming.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2 pt-2"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            📅 Prossimi Allenamenti
          </p>
          <div className="space-y-2">
            {upcoming.map((d) => (
              <div
                key={d.assignedDay}
                className="bg-card/80 border border-border rounded-2xl px-4 py-3 shadow-card flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {d.assignedDay}
                  </p>
                  <p className="font-bold text-sm truncate">{d.label}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-electric px-2 py-1 rounded-full font-semibold flex-shrink-0">
                  {d.exercises.length} es.
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
