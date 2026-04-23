import { useState } from "react";
import { useApp } from "@/state/AppContext";
import { todayKey } from "@/lib/storage";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export function BenessereTab() {
  const { state, setState } = useApp();
  const [newWeight, setNewWeight] = useState("");
  const [steps, setSteps] = useState(state.wellness.steps[todayKey()]?.toString() ?? "");
  const [kcal, setKcal] = useState(state.wellness.kcal[todayKey()]?.toString() ?? "");

  if (!state.profile) return null;

  const water = state.wellness.water[todayKey()] ?? 0;
  const profile = state.profile;

  const start = profile.currentWeight;
  const target = profile.targetWeight;
  const latest = state.wellness.weights[state.wellness.weights.length - 1]?.value ?? start;
  const totalDelta = Math.abs(target - start) || 1;
  const doneDelta = Math.abs(latest - start);
  const progress = Math.min(100, Math.round((doneDelta / totalDelta) * 100));

  const addWeight = () => {
    const v = Number(newWeight);
    if (!v || v < 45 || v > 150) return;
    setState((s) => ({
      ...s,
      wellness: {
        ...s.wellness,
        weights: [...s.wellness.weights, { date: todayKey(), value: v }],
      },
    }));
    setNewWeight("");
  };

  const setWater = (n: number) => {
    setState((s) => ({
      ...s,
      wellness: { ...s.wellness, water: { ...s.wellness.water, [todayKey()]: n } },
    }));
  };

  const saveSteps = (val: string) => {
    setSteps(val);
    const n = Math.max(0, Math.min(100000, Number(val) || 0));
    setState((s) => ({ ...s, wellness: { ...s.wellness, steps: { ...s.wellness.steps, [todayKey()]: n } } }));
  };
  const saveKcal = (val: string) => {
    setKcal(val);
    const n = Math.max(0, Math.min(10000, Number(val) || 0));
    setState((s) => ({ ...s, wellness: { ...s.wellness, kcal: { ...s.wellness.kcal, [todayKey()]: n } } }));
  };

  const chartData = state.wellness.weights.length > 0
    ? state.wellness.weights.map((w) => ({ date: w.date.slice(5), peso: w.value }))
    : [{ date: "—", peso: start }];

  const newWeightOk = newWeight !== "" && Number(newWeight) >= 45 && Number(newWeight) <= 150;

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

      {/* Weight chart */}
      <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Andamento Peso</p>
        <div className="h-32 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} />
              <YAxis tick={{ fontSize: 10, fill: "#888" }} domain={["dataMin - 2", "dataMax + 2"]} width={28} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }} />
              <Line type="monotone" dataKey="peso" stroke="oklch(0.62 0.24 25)" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-2 mt-3">
          <input
            type="number"
            inputMode="decimal"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="Nuovo peso (kg)"
            className="flex-1 bg-input/60 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            disabled={!newWeightOk}
            onClick={addWeight}
            className={cn(
              "px-4 rounded-xl font-bold text-sm active:scale-95 transition-all",
              newWeightOk ? "bg-gradient-primary shadow-glow" : "bg-muted text-muted-foreground"
            )}
          >
            +
          </button>
        </div>
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
                  "aspect-[1/1.4] rounded-md text-xs flex items-end justify-center pb-1 transition-all min-h-0",
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

      {/* Steps & Kcal */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">👟 Passi</p>
          <input
            type="number"
            inputMode="numeric"
            value={steps}
            onChange={(e) => saveSteps(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            className="w-full bg-transparent text-2xl font-black mt-1 focus:outline-none"
          />
        </div>
        <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">🔥 Kcal</p>
          <input
            type="number"
            inputMode="numeric"
            value={kcal}
            onChange={(e) => saveKcal(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            className="w-full bg-transparent text-2xl font-black mt-1 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
