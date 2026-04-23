import { useState } from "react";
import { useApp } from "@/state/AppContext";
import { todayKey } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ExtraMaxKey } from "@/lib/types";

const LIFTS = [
  { key: "bench", label: "Panca Piana", emoji: "🏋️" },
  { key: "squat", label: "Squat", emoji: "🦵" },
  { key: "deadlift", label: "Stacco", emoji: "💪" },
] as const;

const EXTRA_GROUPS: { group: string; items: { key: ExtraMaxKey; label: string; emoji: string }[] }[] = [
  {
    group: "Petto",
    items: [
      { key: "inclineBench", label: "Panca Inclinata 1RM", emoji: "🏋️" },
      { key: "cableFly", label: "Cable Fly PR", emoji: "✨" },
    ],
  },
  {
    group: "Schiena",
    items: [
      { key: "latPulldown", label: "Lat Pulldown PR", emoji: "🪢" },
      { key: "seatedRow", label: "Seated Row PR", emoji: "🚣" },
    ],
  },
  {
    group: "Spalle",
    items: [
      { key: "militaryPress", label: "Military Press 1RM", emoji: "🪖" },
    ],
  },
  {
    group: "Braccia",
    items: [
      { key: "bicepCurl", label: "Bicep Curl PR", emoji: "💪" },
      { key: "tricepExt", label: "Tricep Extension PR", emoji: "🔱" },
    ],
  },
  {
    group: "Gambe",
    items: [
      { key: "legPress", label: "Leg Press PR", emoji: "🦿" },
      { key: "bulgarianSplit", label: "Bulgarian Split Squat", emoji: "🦵" },
    ],
  },
  {
    group: "Addominali",
    items: [
      { key: "weightedCrunch", label: "Crunch Zavorrato PR", emoji: "🔥" },
    ],
  },
];

export function StatisticheTab() {
  const { state, setState } = useApp();
  const [vals, setVals] = useState({
    bench: state.maxes.bench.toString() || "",
    squat: state.maxes.squat.toString() || "",
    deadlift: state.maxes.deadlift.toString() || "",
  });
  const [extras, setExtras] = useState<Record<ExtraMaxKey, string>>(() => {
    const o: Record<string, string> = {};
    Object.entries(state.maxes.extras).forEach(([k, v]) => { o[k] = v ? v.toString() : ""; });
    return o as Record<ExtraMaxKey, string>;
  });

  const updateBig = (k: "bench" | "squat" | "deadlift", v: string) => {
    setVals({ ...vals, [k]: v.replace(/[^0-9]/g, "") });
  };
  const updateExtra = (k: ExtraMaxKey, v: string) => {
    setExtras({ ...extras, [k]: v.replace(/[^0-9]/g, "") });
  };

  const clamp = (v: string) => Math.max(0, Math.min(500, Number(v) || 0));

  const save = () => {
    const b = clamp(vals.bench);
    const s = clamp(vals.squat);
    const d = clamp(vals.deadlift);
    const newExtras = { ...state.maxes.extras };
    (Object.keys(extras) as ExtraMaxKey[]).forEach((k) => { newExtras[k] = clamp(extras[k]); });
    setState((st) => ({
      ...st,
      maxes: {
        bench: b, squat: s, deadlift: d,
        extras: newExtras,
        history: [...st.maxes.history, { date: todayKey(), bench: b, squat: s, deadlift: d }],
      },
    }));
  };

  const total = clamp(vals.bench) + clamp(vals.squat) + clamp(vals.deadlift);
  const dirty =
    vals.bench !== state.maxes.bench.toString() ||
    vals.squat !== state.maxes.squat.toString() ||
    vals.deadlift !== state.maxes.deadlift.toString() ||
    (Object.keys(extras) as ExtraMaxKey[]).some((k) => clamp(extras[k]) !== state.maxes.extras[k]);

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

      {/* Big Three */}
      <div className="space-y-3">
        {LIFTS.map((l) => (
          <LiftRow
            key={l.key}
            emoji={l.emoji}
            label={l.label}
            sub="1 RM"
            value={vals[l.key]}
            onChange={(v) => updateBig(l.key, v)}
          />
        ))}
      </div>

      {/* Extras */}
      <div className="bg-card/60 border border-border rounded-2xl p-4 shadow-card space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Altri Massimali</p>
        {EXTRA_GROUPS.map((g) => (
          <div key={g.group} className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-electric font-bold">{g.group}</p>
            <div className="space-y-2">
              {g.items.map((it) => (
                <LiftRow
                  key={it.key}
                  emoji={it.emoji}
                  label={it.label}
                  sub="PR"
                  value={extras[it.key]}
                  onChange={(v) => updateExtra(it.key, v)}
                  compact
                />
              ))}
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
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Storico Big Three</p>
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

function LiftRow({
  emoji, label, sub, value, onChange, compact,
}: {
  emoji: string;
  label: string;
  sub: string;
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn(
      "border border-border rounded-2xl shadow-card flex items-center justify-between",
      compact ? "bg-secondary/30 p-3" : "bg-card/80 p-4"
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={compact ? "text-2xl" : "text-3xl"}>{emoji}</div>
        <div className="min-w-0">
          <p className={cn("font-bold truncate", compact ? "text-sm" : "")}>{label}</p>
          <p className="text-[10px] uppercase text-muted-foreground tracking-wider">{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          min={0}
          max={500}
          className={cn(
            "bg-input/60 border border-border rounded-xl px-3 py-2 text-right font-bold focus:outline-none focus:ring-2 focus:ring-primary",
            compact ? "w-16 text-base" : "w-20 text-lg"
          )}
        />
        <span className="text-xs text-muted-foreground">kg</span>
      </div>
    </div>
  );
}
