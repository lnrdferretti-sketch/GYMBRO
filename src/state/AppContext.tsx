import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppState, Profile, DayOfWeek } from "@/lib/types";
import { DAYS_OF_WEEK } from "@/lib/types";
import { initialState, loadState, saveState } from "@/lib/storage";
import { generatePlan } from "@/lib/engine";

type Ctx = {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  setProfile: (p: Profile) => void;
  updateTrainingFrequency: (daysPerWeek: 2 | 3 | 4 | 5 | 6, trainingDays: DayOfWeek[]) => void;
  regeneratePlan: () => void;
  resetAll: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStateRaw(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const setState = (u: (s: AppState) => AppState) => setStateRaw((s) => u(s));

  const setProfile = (p: Profile) => {
    const plan = generatePlan(p);
    setStateRaw((s) => ({ ...s, profile: p, plan, onboarded: true }));
  };

  const regeneratePlan = () => {
    setStateRaw((s) => (s.profile ? { ...s, plan: generatePlan(s.profile) } : s));
  };

  const updateTrainingFrequency = (daysPerWeek: 2 | 3 | 4 | 5 | 6, trainingDays: DayOfWeek[]) => {
    setStateRaw((s) => {
      if (!s.profile) return s;
      const sortedDays = [...trainingDays].sort(
        (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)
      );
      const nextProfile: Profile = { ...s.profile, daysPerWeek, trainingDays: sortedDays };
      // If day count changed, the split needs full regen; otherwise just remap assignedDay
      // to preserve user-edited exercises.
      if (s.plan && s.plan.days.length === daysPerWeek) {
        const days = s.plan.days.map((d, i) => ({ ...d, assignedDay: sortedDays[i] }));
        return { ...s, profile: nextProfile, plan: { ...s.plan, days } };
      }
      return { ...s, profile: nextProfile, plan: generatePlan(nextProfile) };
    });
  };

  const resetAll = () => {
    setStateRaw(initialState);
  };

  const value = useMemo(
    () => ({ state, setState, setProfile, updateTrainingFrequency, regeneratePlan, resetAll }),
    [state]
  );
  return <AppCtx.Provider value={value}>{hydrated ? children : null}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
