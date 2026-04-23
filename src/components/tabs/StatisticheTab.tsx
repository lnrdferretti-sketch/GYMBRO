import { useState } from "react";
import { useApp } from "@/state/AppContext";
import { todayKey } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const LIFTS = [
  { key: "bench", label: "Panca Piana", emoji: "🏋️" },
  { key: "squat", label: "Squat", emoji: "🦵" },
  { key: "deadlift", label: "Stacco", emoji: "💪" },
] as const;

export function StatisticheTab() {
  const { state, setState } = useApp();
  const [vals, setVals] = useState({
    bench: state.maxes.bench.toString() || "",
    squat: state.maxes.squat.toString() || "",
    deadlift: state.maxes.deadlift.toString() || "",
  });

  const update = (k: "bench" | "squat" | "deadlift", v: string) => {
    const clean = v.replace(/[^0-9]/g, "");
    setVals({ ...vals, [k]: clean });
  };

  const save = () => {
    const b = Math.max(0, Math.min(500, Number(vals.bench) || 0));
    const s = Math.max(0, Math.min(500, Number(vals.squat) || 0));
    const d = Math.max(0, Math.min(500, Number(vals.deadlift) || 0));
    setState((st) => ({
      ...st,
      maxes: {
        bench: b, squat: s, deadlift: d,
        history: [...st.maxes.history, { date: todayKey(), bench: b, squat: s, deadlift: d }],
      },
    }));
  };

  const total = (Number(vals.bench) || 0) + (Number(vals.squat) || 0) + (Number(vals.deadlift) || 0);
  const dirty =
    vals.bench !== state.maxes.bench.toString() ||
    vals.squat !== state.maxes.squat.toString() ||
    vals.deadlift !== state.maxes.deadlift.toString();

  return (
    <div className="px-5 pb-6 space-y-4">
      <h2 className="text-2xl font-black">Massimali</h2>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-primary rounded-2xl p-5 shadow-glow text-center"
      >
        <p className="text-xs uppercase tracking-wider opacity-90">Powerlifting Total</p>
        <p className="text-5xl font-black mt-1">{total}<span className="text-xl ml-1">kg</span></p>
      </motion.div>

      <div className="space-y-3">
        {LIFTS.map((l) => (
          <div key={l.key} className="bg-card/80 border border-border rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{l.emoji}</div>
                <div>
                  <p className="font-bold">{l.label}</p>
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wider">1 RM</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  inputMode="numeric"
                  value={vals[l.key]}
                  onChange={(e) => update(l.key, e.target.value)}
                  placeholder="0"
                  className="w-20 bg-input/60 border border-border rounded-xl px-3 py-2 text-right text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">kg</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={!dirty}
        onClick={save}
        className={cn(
          "w-full py-3.5 rounded-xl font-bold transition-all active:scale-95",
          dirty ? "bg-gradient-primary shadow-glow" : "bg-muted text-muted-foreground"
        )}
      >
        Salva Massimali
      </button>

      {state.maxes.history.length > 0 && (
        <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Storico</p>
          <div className="space-y-1.5">
            {state.maxes.history.slice(-5).reverse().map((h, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{h.date}</span>
                <span className="font-mono">P {h.bench} · S {h.squat} · D {h.deadlift}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
