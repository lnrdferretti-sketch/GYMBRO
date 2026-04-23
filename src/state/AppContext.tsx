import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppState, Profile, DayOfWeek } from "@/lib/types";
import { DAYS_OF_WEEK } from "@/lib/types";
import { initialState, loadState, saveState } from "@/lib/storage";
import { generatePlan } from "@/lib/engine";

type Ctx = {
  state: AppState;
  generating: boolean;
  setState: (updater: (s: AppState) => AppState) => void;
  setProfile: (p: Profile) => Promise<void>;
  updateTrainingFrequency: (daysPerWeek: 2 | 3 | 4 | 5 | 6, trainingDays: DayOfWeek[]) => Promise<void>;
  regeneratePlan: () => Promise<void>;
  resetAll: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setStateRaw(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const setState = (u: (s: AppState) => AppState) => setStateRaw((s) => u(s));

  const setProfile = async (p: Profile) => {
    setGenerating(true);
    try {
      const plan = await generatePlan(p);
      setStateRaw((s) => ({ ...s, profile: p, plan, onboarded: true }));
    } finally {
      setGenerating(false);
    }
  };

  const regeneratePlan = async () => {
    const profile = state.profile;
    if (!profile) return;
    setGenerating(true);
    try {
      const plan = await generatePlan(profile);
      setStateRaw((s) => ({ ...s, plan }));
    } finally {
      setGenerating(false);
    }
  };

  const updateTrainingFrequency = async (
    daysPerWeek: 2 | 3 | 4 | 5 | 6,
    trainingDays: DayOfWeek[]
  ) => {
    const profile = state.profile;
    if (!profile) return;
    const sortedDays = [...trainingDays].sort(
      (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)
    );
    const nextProfile: Profile = { ...profile, daysPerWeek, trainingDays: sortedDays };

    // If day count is unchanged we can simply remap assignedDay and keep
    // every user-edited exercise intact. Otherwise the split must be regenerated.
    if (state.plan && state.plan.days.length === daysPerWeek) {
      const days = state.plan.days.map((d, i) => ({ ...d, assignedDay: sortedDays[i] }));
      setStateRaw((s) => ({ ...s, profile: nextProfile, plan: { ...s.plan!, days } }));
      return;
    }

    setGenerating(true);
    try {
      const plan = await generatePlan(nextProfile);
      setStateRaw((s) => ({ ...s, profile: nextProfile, plan }));
    } finally {
      setGenerating(false);
    }
  };

  const resetAll = () => {
    setStateRaw(initialState);
  };

  const value = useMemo(
    () => ({ state, generating, setState, setProfile, updateTrainingFrequency, regeneratePlan, resetAll }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, generating]
  );
  return <AppCtx.Provider value={value}>{hydrated ? children : null}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
