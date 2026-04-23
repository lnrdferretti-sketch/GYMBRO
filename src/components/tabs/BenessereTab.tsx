import { useState, useMemo } from "react";
import { useApp } from "@/state/AppContext";
import { todayKey, lastNDays, shortDate } from "@/lib/storage";
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip,
  BarChart, Bar, ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BenessereTab() {
  const { state, setState } = useApp();
  // Tomorrow's ISO date, used as the minimum allowed value for planning future weigh-ins
  const tomorrowIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const [newWeight, setNewWeight] = useState("");
  const [newWeightDate, setNewWeightDate] = useState(tomorrowIso);
  const [steps, setSteps] = useState(state.wellness.steps[todayKey()]?.toString() ?? "");
  const [kcal, setKcal] = useState(state.wellness.kcal[todayKey()]?.toString() ?? "");
  const last7 = useMemo(() => lastNDays(7), []);

  const profile = state.profile;
  const latest = state.wellness.weights[state.wellness.weights.length - 1]?.value
    ?? profile?.currentWeight ?? 70;

  // Estimate BMR (Mifflin-St Jeor approx)
  const bmr = useMemo(() => {
    if (!profile) return 0;
    const w = latest;
    const h = 170;
    const a = profile.age;
    const base = profile.gender === "Maschio"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    return Math.round(base);
  }, [latest, profile]);

  if (!profile) return null;

  const water = state.wellness.water[todayKey()] ?? 0;

  const start = profile.currentWeight;
  const target = profile.targetWeight;
  const totalDelta = Math.abs(target - start) || 1;
  const doneDelta = Math.abs(latest - start);
  const progress = Math.min(100, Math.round((doneDelta / totalDelta) * 100));

  const newWeightNum = Number(newWeight);
  const newWeightOk = newWeight !== "" && newWeightNum >= 45 && newWeightNum <= 150;
  const newDateOk = newWeightDate >= tomorrowIso;
  const canSaveWeight = newWeightOk && newDateOk;

  const addWeight = () => {
    if (!canSaveWeight) return;
    setState((s) => {
      const next = [
        ...s.wellness.weights,
        { date: newWeightDate, value: newWeightNum },
      ].sort((a, b) => a.date.localeCompare(b.date));
      return { ...s, wellness: { ...s.wellness, weights: next } };
    });
    setNewWeight("");
    setNewWeightDate(tomorrowIso);
  };

  const deleteWeight = (i: number) => {
    setState((s) => ({
      ...s,
      wellness: { ...s.wellness, weights: s.wellness.weights.filter((_, idx) => idx !== i) },
    }));
  };

  const setWater = (n: number) => {
    setState((s) => ({
      ...s,
      wellness: { ...s.wellness, water: { ...s.wellness.water, [todayKey()]: n } },
    }));
  };

  const saveSteps = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setSteps(clean);
    const n = Math.max(0, Math.min(100000, Number(clean) || 0));
    setState((s) => ({ ...s, wellness: { ...s.wellness, steps: { ...s.wellness.steps, [todayKey()]: n } } }));
  };
  const saveKcal = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setKcal(clean);
    const n = Math.max(0, Math.min(10000, Number(clean) || 0));
    setState((s) => ({ ...s, wellness: { ...s.wellness, kcal: { ...s.wellness.kcal, [todayKey()]: n } } }));
  };

  const weightChartData = state.wellness.weights.length > 0
    ? state.wellness.weights.map((w) => ({ date: shortDate(w.date), peso: w.value }))
    : [{ date: "—", peso: start }];

  const stepsChartData = last7.map((d) => ({
    day: shortDate(d).split("-")[0],
    passi: state.wellness.steps[d] ?? 0,
  }));

  const kcalChartData = last7.map((d) => {
    const logged = state.wellness.kcal[d];
    const stepsVal = state.wellness.steps[d] ?? 0;
    const estimated = Math.round((bmr / 24) * 16 + stepsVal * 0.04); // active estimate
    return { day: shortDate(d).split("-")[0], kcal: logged ?? estimated };
  });

  return (
    <div className="px-5 pb-6 space-y-4">
      <h2 className="text-2xl font-black">Benessere</h2>

      {/* Progress ring */}
      <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" />
              <circle
                cx="50" cy="50" r="42" strokeWidth="8" fill="none"
                stroke="oklch(0.62 0.24 25)"
                strokeDasharray={`${(progress / 100) * 263.9} 263.9`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">{progress}%</span>
              <span className="text-[9px] text-muted-foreground uppercase">Goal</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase">Peso attuale → target</p>
            <p className="text-2xl font-black">{latest} → <span className="text-electric">{target}</span> kg</p>
            <p className="text-xs text-muted-foreground mt-1">Inizio: {start} kg</p>
          </div>
        </div>
      </div>

      {/* Weight input */}
      <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Inserisci peso di oggi</p>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="es. 72.5"
            className="flex-1 bg-input/60 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="self-center text-sm text-muted-foreground">kg</span>
          <button
            disabled={!newWeightOk}
            onClick={addWeight}
            className={cn(
              "px-4 rounded-xl font-bold text-sm active:scale-95 transition-all",
              newWeightOk ? "bg-gradient-primary shadow-glow" : "bg-muted text-muted-foreground"
            )}
          >
            Salva Peso
          </button>
        </div>
        {newWeight !== "" && !newWeightOk && (
          <p className="text-xs text-primary">Inserisci un valore tra 45 e 150 kg</p>
        )}

        {/* Chart */}
        <div className="h-36 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} />
              <YAxis tick={{ fontSize: 10, fill: "#888" }} domain={["dataMin - 2", "dataMax + 2"]} width={28} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <ReferenceLine y={target} stroke="oklch(0.72 0.18 145)" strokeDasharray="4 4" label={{ value: "Target", fill: "#7fd1a3", fontSize: 9, position: "right" }} />
              <Line type="monotone" dataKey="peso" stroke="oklch(0.62 0.24 25)" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* History list */}
        {state.wellness.weights.length > 0 && (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Storico</p>
            {[...state.wellness.weights].reverse().map((w, revIdx) => {
              const realIdx = state.wellness.weights.length - 1 - revIdx;
              return (
                <motion.div
                  key={realIdx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center bg-secondary/40 rounded-lg px-3 py-1.5"
                >
                  <span className="text-xs text-muted-foreground">{shortDate(w.date)}</span>
                  <span className="text-sm font-bold">{w.value} kg</span>
                  <button
                    onClick={() => deleteWeight(realIdx)}
                    className="text-xs text-destructive opacity-70 active:opacity-100 min-h-0 px-2"
                    style={{ minHeight: 0 }}
                  >
                    ✕
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Water */}
      <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">💧 Acqua oggi</p>
          <p className="text-sm font-bold">{(water * 0.25).toFixed(2)} / 2.5 L</p>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }).map((_, i) => {
            const filled = i < water;
            return (
              <button
                key={i}
                onClick={() => setWater(filled && i === water - 1 ? i : i + 1)}
                className={cn(
                  "aspect-[1/1.4] rounded-md text-xs flex items-end justify-center pb-1 transition-all",
                  filled ? "bg-electric shadow-glow" : "bg-secondary/60"
                )}
                style={{ minHeight: 0 }}
              >
                <span className="text-[9px] opacity-80">{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Steps bar chart */}
      <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">👟 Passi (7 giorni)</p>
          <p className="text-sm font-bold">{stepsChartData[6].passi.toLocaleString()}</p>
        </div>
        <div className="h-32 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stepsChartData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#888" }} />
              <YAxis tick={{ fontSize: 9, fill: "#888" }} width={32} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="passi" fill="oklch(0.62 0.24 25)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <input
          type="number"
          inputMode="numeric"
          value={steps}
          onChange={(e) => saveSteps(e.target.value)}
          placeholder="Passi di oggi"
          className="w-full mt-2 bg-input/60 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Kcal chart */}
      <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">🔥 Kcal bruciate (7 giorni)</p>
          <p className="text-sm font-bold">~{bmr} BMR</p>
        </div>
        <div className="h-32 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kcalChartData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#888" }} />
              <YAxis tick={{ fontSize: 9, fill: "#888" }} width={32} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="kcal" stroke="oklch(0.72 0.18 145)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <input
          type="number"
          inputMode="numeric"
          value={kcal}
          onChange={(e) => saveKcal(e.target.value)}
          placeholder="Kcal di oggi (opzionale)"
          className="w-full mt-2 bg-input/60 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}
