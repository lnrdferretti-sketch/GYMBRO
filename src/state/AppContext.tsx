import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppState, Profile } from "@/lib/types";
import { initialState, loadState, saveState } from "@/lib/storage";
import { generatePlan } from "@/lib/engine";

type Ctx = {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  setProfile: (p: Profile) => void;
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

  const resetAll = () => {
    setStateRaw(initialState);
  };

  const value = useMemo(() => ({ state, setState, setProfile, regeneratePlan, resetAll }), [state]);
  return <AppCtx.Provider value={value}>{hydrated ? children : null}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
