import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/state/AppContext";
import { DEFAULT_FOCUS, DAYS_OF_WEEK } from "@/lib/types";
import type { Gender, Goal, Profile, DayOfWeek } from "@/lib/types";
import type { MuscleGroup } from "@/lib/exercises";
import { defaultTrainingDays } from "@/lib/engine";
import { cn } from "@/lib/utils";

const EMOJIS = ["💪", "🔥", "🏋️", "⚡", "🦾", "🥷", "👑", "🚀", "🎯", "🐺"];
const MUSCLES: MuscleGroup[] = ["Petto", "Schiena", "Gambe", "Glutei", "Spalle", "Braccia", "Addominali", "Cardio"];
const GOALS: Goal[] = ["Ipertrofia", "Forza", "Dimagrimento"];
const DAYS = [2, 3, 4, 5, 6] as const;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</label>
      {children}
      {error && <p className="text-xs text-primary">{error}</p>}
    </div>
  );
}

function NumberInput({
  value, onChange, min, max, placeholder,
}: { value: string; onChange: (v: string) => void; min: number; max: number; placeholder?: string }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      min={min}
      max={max}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value.replace(/[^0-9]/g, "");
        onChange(v);
      }}
      className="w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );
}

export function Onboarding() {
  const { setProfile } = useApp();
  const [step, setStep] = useState(0);

  const [coachName, setCoachName] = useState("GYMBRO");
  const [coachEmoji, setCoachEmoji] = useState("💪");
  const [gender, setGender] = useState<Gender | "">("");
  const [age, setAge] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [goal, setGoal] = useState<Goal | "">("");
  const [days, setDays] = useState<2 | 3 | 4 | 5 | 6 | 0>(0);
  const [focus, setFocus] = useState<Record<MuscleGroup, boolean>>(DEFAULT_FOCUS);
  const [trainingDays, setTrainingDays] = useState<DayOfWeek[]>([]);

  // Auto-suggest a default day set whenever the day count changes
  useEffect(() => {
    if (days === 0) { setTrainingDays([]); return; }
    setTrainingDays(defaultTrainingDays(days));
  }, [days]);

  const toggleDay = (d: DayOfWeek) => {
    setTrainingDays((curr) => {
      if (curr.includes(d)) return curr.filter((x) => x !== d);
      if (days !== 0 && curr.length >= days) return curr; // cap at requested count
      return [...curr, d];
    });
  };

  // Validation
  const nameOk = coachName.trim().length > 0 && coachName.length <= 15;
  const ageNum = Number(age);
  const ageOk = age !== "" && Number.isInteger(ageNum) && ageNum >= 18 && ageNum <= 35;
  const cwNum = Number(currentWeight);
  const cwOk = currentWeight !== "" && cwNum >= 45 && cwNum <= 150;
  const twNum = Number(targetWeight);
  const twOk = targetWeight !== "" && twNum >= 45 && twNum <= 150;
  const focusOk = Object.values(focus).some(Boolean);

  const step0Ok = nameOk;
  const step1Ok = !!gender && ageOk && cwOk && twOk && !!goal;
  const daysOk = days !== 0 && trainingDays.length === days;
  const step2Ok = daysOk && focusOk;

  const finish = () => {
    if (!step0Ok || !step1Ok || !step2Ok) return;
    const p: Profile = {
      coachName: coachName.trim(),
      coachEmoji,
      gender: gender as Gender,
      age: ageNum,
      currentWeight: cwNum,
      targetWeight: twNum,
      goal: goal as Goal,
      daysPerWeek: days as 2 | 3 | 4 | 5 | 6,
      trainingDays: [...trainingDays].sort(
        (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)
      ),
      focus,
      background: "hero",
    };
    setProfile(p);
  };

  return (
    <div className="flex flex-col h-full safe-top safe-bottom">
      <div className="px-6 pt-6 pb-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-white/15"
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6 pt-4"
            >
              <div>
                <h1 className="text-3xl font-black leading-tight">
                  Crea il tuo<br />
                  <span className="text-electric">AI Coach</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Dagli un nome e una personalità.
                </p>
              </div>

              <Field label="Nome del Coach (max 15)" error={!nameOk && coachName.length > 15 ? "Massimo 15 caratteri" : undefined}>
                <input
                  type="text"
                  maxLength={15}
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  className="w-full bg-input/60 border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground text-right">{coachName.length}/15</p>
              </Field>

              <Field label="Emoji del Coach">
                <div className="grid grid-cols-5 gap-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setCoachEmoji(e)}
                      className={cn(
                        "aspect-square rounded-xl text-2xl flex items-center justify-center transition-all",
                        coachEmoji === e
                          ? "bg-primary shadow-glow scale-105"
                          : "bg-secondary/60 active:scale-95"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </Field>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-5 pt-4"
            >
              <h1 className="text-3xl font-black">I tuoi <span className="text-electric">dati</span></h1>

              <Field label="Genere">
                <div className="grid grid-cols-2 gap-2">
                  {(["Maschio", "Femmina"] as Gender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={cn(
                        "py-3 rounded-xl font-semibold transition-all",
                        gender === g ? "bg-primary shadow-glow" : "bg-secondary/60"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Età (18–35)" error={age !== "" && !ageOk ? "Inserisci un valore tra 18 e 35" : undefined}>
                <NumberInput value={age} onChange={setAge} min={18} max={35} placeholder="25" />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Peso (kg)" error={currentWeight !== "" && !cwOk ? "45–150" : undefined}>
                  <NumberInput value={currentWeight} onChange={setCurrentWeight} min={45} max={150} placeholder="70" />
                </Field>
                <Field label="Obiettivo (kg)" error={targetWeight !== "" && !twOk ? "45–150" : undefined}>
                  <NumberInput value={targetWeight} onChange={setTargetWeight} min={45} max={150} placeholder="75" />
                </Field>
              </div>

              <Field label="Obiettivo">
                <div className="grid grid-cols-3 gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={cn(
                        "py-3 rounded-xl text-sm font-semibold transition-all",
                        goal === g ? "bg-primary shadow-glow" : "bg-secondary/60"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Field>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-5 pt-4"
            >
              <h1 className="text-3xl font-black">Il tuo <span className="text-electric">allenamento</span></h1>

              <Field label="Giorni a settimana">
                <div className="grid grid-cols-5 gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={cn(
                        "aspect-square rounded-xl text-lg font-bold transition-all",
                        days === d ? "bg-primary shadow-glow" : "bg-secondary/60"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Focus muscolare e cardio">
                <div className="grid grid-cols-2 gap-2">
                  {MUSCLES.map((m) => {
                    const on = focus[m];
                    return (
                      <button
                        key={m}
                        onClick={() => setFocus({ ...focus, [m]: !on })}
                        className={cn(
                          "py-3 rounded-xl font-semibold flex items-center justify-between px-4 transition-all",
                          on ? "bg-primary shadow-glow" : "bg-secondary/60"
                        )}
                      >
                        <span>{m}</span>
                        <span className="text-xs opacity-80">{on ? "Sì" : "No"}</span>
                      </button>
                    );
                  })}
                </div>
                {!focusOk && <p className="text-xs text-primary">Seleziona almeno un focus.</p>}
              </Field>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 pb-6 pt-3 flex gap-2 glass">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 py-3.5 rounded-xl bg-secondary/80 font-semibold active:scale-95 transition-transform"
          >
            Indietro
          </button>
        )}
        {step < 2 ? (
          <button
            disabled={(step === 0 && !step0Ok) || (step === 1 && !step1Ok)}
            onClick={() => setStep((s) => (s + 1) as 0 | 1 | 2)}
            className={cn(
              "flex-[2] py-3.5 rounded-xl font-bold transition-all active:scale-95",
              ((step === 0 && step0Ok) || (step === 1 && step1Ok))
                ? "bg-gradient-primary shadow-glow"
                : "bg-muted text-muted-foreground"
            )}
          >
            Avanti
          </button>
        ) : (
          <button
            disabled={!step2Ok}
            onClick={finish}
            className={cn(
              "flex-[2] py-3.5 rounded-xl font-bold transition-all active:scale-95",
              step2Ok ? "bg-gradient-primary shadow-glow" : "bg-muted text-muted-foreground"
            )}
          >
            Genera Scheda 🔥
          </button>
        )}
      </div>
    </div>
  );
}
