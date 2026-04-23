import type { MuscleGroup } from "./exercises";

/**
 * Lightweight wrapper around the open-source free-exercise-db on GitHub.
 *
 * MEMORY DISCIPLINE
 * -----------------
 * The full database (~873 rows) is fetched once on demand and held in
 * module-scope memory only. It is NEVER serialized into AppState /
 * localStorage. Only the handful of exercises the engine actually picks
 * are stored — and even then we only persist `name` + `images` paths
 * (two short strings per exercise).
 */

const RAW_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

export const DB_IMAGE_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

export type DbExercise = {
  id: string;
  name: string;
  force?: string | null;
  level?: string;
  mechanic?: string | null; // "compound" | "isolation"
  equipment?: string | null;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  category: string; // strength | cardio | stretching | ...
  images: string[]; // relative paths, e.g. "3_4_Sit-Up/0.jpg"
};

// Map our Italian UI muscle groups to the DB's `primaryMuscles` keys.
// "Gambe" includes quads/hamstrings/calves; "Braccia" includes biceps/triceps/forearms.
export const UI_TO_DB_MUSCLES: Record<MuscleGroup, string[]> = {
  Petto: ["chest"],
  Schiena: ["lats", "middle back", "lower back", "traps"],
  Gambe: ["quadriceps", "hamstrings", "calves"],
  Glutei: ["glutes", "abductors", "adductors"],
  Spalle: ["shoulders"],
  Braccia: ["biceps", "triceps", "forearms"],
  Addominali: ["abdominals"],
  Cardio: [], // matched by category instead
};

let cache: DbExercise[] | null = null;
let inflight: Promise<DbExercise[]> | null = null;

/**
 * Fetch the DB once and reuse it for the lifetime of the page.
 * Resolves to `[]` on failure so callers can degrade gracefully.
 */
export async function loadRemoteDb(): Promise<DbExercise[]> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(RAW_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as DbExercise[];
      cache = Array.isArray(data) ? data : [];
      return cache;
    } catch (e) {
      console.warn("[exerciseDb] fetch failed, using empty DB", e);
      cache = [];
      return cache;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Build the absolute URL for a DB image path like "3_4_Sit-Up/0.jpg". */
export function dbImageUrl(path: string): string {
  return DB_IMAGE_BASE + path;
}

type PickOpts = {
  muscle: MuscleGroup;
  type: "strength" | "cardio" | "core";
  count: number;
  preferCompound?: boolean;
  exclude?: Set<string>; // DB ids already used in this generation pass
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Filter the DB for exercises matching a UI muscle group and pick `count`.
 * Returns an empty array if the DB couldn't be loaded — callers should
 * fall back to the bundled local catalog in that case.
 */
export function pickFromDb(db: DbExercise[], opts: PickOpts): DbExercise[] {
  if (!db.length) return [];
  const { muscle, type, count, preferCompound, exclude } = opts;

  let pool: DbExercise[];
  if (muscle === "Cardio" || type === "cardio") {
    pool = db.filter((e) => e.category === "cardio");
  } else if (muscle === "Addominali" || type === "core") {
    pool = db.filter((e) => e.primaryMuscles.includes("abdominals"));
  } else {
    const wanted = UI_TO_DB_MUSCLES[muscle];
    pool = db.filter(
      (e) =>
        e.category === "strength" &&
        e.primaryMuscles.some((m) => wanted.includes(m))
    );
  }

  // Only consider entries that actually have images — otherwise the flip-book
  // animation would have nothing to show.
  pool = pool.filter((e) => Array.isArray(e.images) && e.images.length > 0);

  if (exclude && exclude.size) {
    pool = pool.filter((e) => !exclude.has(e.id));
  }

  if (preferCompound) {
    const compound = pool.filter((e) => e.mechanic === "compound");
    if (compound.length >= count) pool = compound;
  }

  return shuffle(pool).slice(0, count);
}
