import { motion } from "framer-motion";
import { useApp } from "@/state/AppContext";
import type { PlannedExercise } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  exercise: PlannedExercise;
  index: number;
  editable?: boolean;
  onChange?: (next: PlannedExercise) => void;
  onRemove?: () => void;
};

export function ExerciseCard({ exercise, index, editable, onChange, onRemove }: Props) {
  const { state } = useApp();
  const gifUrl = exercise.gifUrl ?? state.gifMap[exercise.exerciseId];

  const update = (patch: Partial<PlannedExercise>) => onChange?.({ ...exercise, ...patch });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2) }}
      className="bg-card/80 border border-border rounded-2xl p-4 shadow-card"
    >
      <div className="flex gap-3">
        <div className="w-20 h-20 rounded-xl bg-gradient-navy border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
          {gifUrl ? (
            <img src={gifUrl} alt={exercise.name} className="w-full h-full object-cover" draggable={false} />
          ) : (
            <div className="text-center px-1">
              <div className="text-xl">🎞️</div>
              <div className="text-[8px] text-muted-foreground mt-0.5 leading-tight">Inserire Animazione GIF</div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            {editable ? (
              <input
                value={exercise.name}
                maxLength={40}
                onChange={(e) => update({ name: e.target.value })}
                className="font-bold text-sm leading-tight bg-input/60 border border-border rounded-lg px-2 py-1 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <h3 className="font-bold text-sm leading-tight">{exercise.name}</h3>
            )}
            <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-electric px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
              {exercise.muscle}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <EditableStat
              label="Serie"
              value={exercise.sets.toString()}
              editable={editable}
              type="number"
              min={1}
              max={10}
              onChange={(v) => update({ sets: Math.max(1, Math.min(10, Number(v) || 1)) })}
            />
            <EditableStat
              label="Reps"
              value={exercise.reps}
              editable={editable}
              maxLength={10}
              onChange={(v) => update({ reps: v.slice(0, 10) })}
            />
            <EditableStat
              label="Rec (s)"
              value={exercise.restSec.toString()}
              editable={editable}
              type="number"
              min={0}
              max={600}
              suffix="s"
              onChange={(v) => update({ restSec: Math.max(0, Math.min(600, Number(v) || 0)) })}
            />
          </div>

          {editable && onRemove && (
            <button
              onClick={onRemove}
              className="mt-3 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-1.5 active:scale-95 transition-transform"
            >
              🗑️ Rimuovi
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EditableStat({
  label, value, editable, onChange, type = "text", min, max, maxLength, suffix,
}: {
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (v: string) => void;
  type?: "text" | "number";
  min?: number;
  max?: number;
  maxLength?: number;
  suffix?: string;
}) {
  return (
    <div className={cn("bg-secondary/40 rounded-lg py-1.5 text-center", editable && "py-1")}>
      <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{label}</div>
      {editable ? (
        <input
          type={type}
          inputMode={type === "number" ? "numeric" : "text"}
          value={value}
          min={min}
          max={max}
          maxLength={maxLength}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-transparent text-sm font-bold text-center focus:outline-none focus:ring-1 focus:ring-primary rounded"
        />
      ) : (
        <div className="text-sm font-bold">{value}{suffix && label !== "Rec (s)" ? suffix : ""}</div>
      )}
    </div>
  );
}
