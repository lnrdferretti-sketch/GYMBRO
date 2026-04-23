import type { AppState, DayOfWeek } from "./types";
import { DEFAULT_EXTRAS, DAYS_OF_WEEK } from "./types";

const KEY = "gymbro_state_v2";

export const initialState: AppState = {
  profile: null,
  plan: null,
  wellness: { weights: [], water: {}, steps: {}, kcal: {} },
  maxes: { bench: 0, squat: 0, deadlift: 0, extras: { ...DEFAULT_EXTRAS }, history: [] },
  gifMap: {},
  onboarded: false,
};

export function loadState(): AppState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    // Backfill trainingDays for profiles saved before this field existed
    let profile = parsed.profile ?? null;
    if (profile && !Array.isArray(profile.trainingDays)) {
      const presets: Record<number, DayOfWeek[]> = {
        2: ["Lunedì", "Giovedì"],
        3: ["Lunedì", "Mercoledì", "Venerdì"],
        4: ["Lunedì", "Martedì", "Giovedì", "Venerdì"],
        5: ["Lunedì", "Martedì", "Mercoledì", "Venerdì", "Sabato"],
        6: ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
      };
      profile = { ...profile, trainingDays: presets[profile.daysPerWeek] ?? DAYS_OF_WEEK.slice(0, profile.daysPerWeek ?? 3) };
    }
    return {
      ...initialState,
      ...parsed,
      profile,
      maxes: {
        ...initialState.maxes,
        ...parsed.maxes,
        extras: { ...DEFAULT_EXTRAS, ...(parsed.maxes?.extras ?? {}) },
      },
      gifMap: parsed.gifMap ?? {},
    };
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

export function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function shortDate(iso: string) {
  // "2026-04-23" → "23-Apr"
  const d = new Date(iso);
  const months = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
  return `${d.getDate()}-${months[d.getMonth()]}`;
}

export function todayDayOfWeek(): import("./types").DayOfWeek {
  const days: import("./types").DayOfWeek[] = [
    "Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato",
  ];
  return days[new Date().getDay()];
}
