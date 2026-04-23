import type { AppState } from "./types";

const KEY = "gymbro_state_v1";

export const initialState: AppState = {
  profile: null,
  plan: null,
  wellness: { weights: [], water: {}, steps: {}, kcal: {} },
  maxes: { bench: 0, squat: 0, deadlift: 0, history: [] },
  onboarded: false,
};

export function loadState(): AppState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return initialState;
  }
}

export function saveState(s: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function dayOfWeekIndex(daysPerWeek: number) {
  // Map current weekday (0=Sun..6=Sat) into 0..daysPerWeek-1
  const d = new Date().getDay();
  // Treat Monday as start
  const mondayIdx = (d + 6) % 7;
  return mondayIdx % daysPerWeek;
}
