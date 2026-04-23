import { useEffect, useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
import { BACKGROUND_OPTIONS } from "@/components/PhoneShell";
import { cn } from "@/lib/utils";
import { DAYS_OF_WEEK, type DayOfWeek } from "@/lib/types";
import { defaultTrainingDays } from "@/lib/engine";

const EMOJIS = ["💪", "🔥", "🏋️", "⚡", "🦾", "🥷", "👑", "🚀", "🎯", "🐺"];
const DAY_OPTIONS = [2, 3, 4, 5, 6] as const;

export function ImpostazioniTab() {
  const { state, setState, resetAll, updateTrainingFrequency } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(state.profile?.coachName ?? "GYMBRO");
  const [emoji, setEmoji] = useState(state.profile?.coachEmoji ?? "💪");

  // Training frequency editor (local draft, applied on Save)
  const [draftDpw, setDraftDpw] = useState<2 | 3 | 4 | 5 | 6>(
    (state.profile?.daysPerWeek ?? 3) as 2 | 3 | 4 | 5 | 6
  );
  const [draftDays, setDraftDays] = useState<DayOfWeek[]>(
    state.profile?.trainingDays ?? defaultTrainingDays(state.profile?.daysPerWeek ?? 3)
  );
  const [freqSaved, setFreqSaved] = useState(false);

  // When the user changes the day count, reset draftDays to a sensible preset
  useEffect(() => {
    setDraftDays(defaultTrainingDays(draftDpw));
  }, [draftDpw]);

  if (!state.profile) return null;
  const profile = state.profile;

  const nameOk = name.trim().length > 0 && name.length <= 15;
  const dirty = (nameOk && name !== profile.coachName) || emoji !== profile.coachEmoji;

  const saveCoach = () => {
    if (!nameOk) return;
    setState((s) => s.profile ? { ...s, profile: { ...s.profile, coachName: name.trim(), coachEmoji: emoji } } : s);
  };

  const setBackground = (bg: string) => {
    setState((s) => s.profile ? { ...s, profile: { ...s.profile, background: bg } } : s);
  };

  const toggleDraftDay = (d: DayOfWeek) => {
    setDraftDays((curr) => {
      if (curr.includes(d)) return curr.filter((x) => x !== d);
      if (curr.length >= draftDpw) return curr;
      return [...curr, d];
    });
  };

  const draftDaysOk = draftDays.length === draftDpw;
  const freqDirty =
    draftDpw !== profile.daysPerWeek ||
    JSON.stringify([...draftDays].sort()) !==
      JSON.stringify([...(profile.trainingDays ?? [])].sort());

  const saveFrequency = () => {
    if (!draftDaysOk) return;
    updateTrainingFrequency(draftDpw, draftDays);
    setFreqSaved(true);
    setTimeout(() => setFreqSaved(false), 1800);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gymbro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        setState(() => data);
      } catch {
        alert("File non valido");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="px-5 pb-6 space-y-4">
      <h2 className="text-2xl font-black">Impostazioni</h2>

      <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Il tuo Coach</p>

        <div>
          <label className="text-xs text-muted-foreground">Nome (max 15)</label>
          <input
            type="text"
            maxLength={15}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-input/60 border border-border rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Emoji</label>
          <div className="grid grid-cols-5 gap-2 mt-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={cn(
                  "aspect-square rounded-xl text-2xl transition-all",
                  emoji === e ? "bg-primary shadow-glow scale-105" : "bg-secondary/60"
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={!dirty}
          onClick={saveCoach}
          className={cn(
            "w-full py-3 rounded-xl font-bold transition-all active:scale-95 min-h-[44px]",
            dirty ? "bg-gradient-primary shadow-glow" : "bg-muted text-muted-foreground"
          )}
        >
          Salva
        </button>
      </div>

      {/* Training frequency editor */}
      <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            🗓️ Modifica Frequenza Allenamento
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Cambia il numero di giorni e quali giorni della settimana ti alleni.
          </p>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Giorni a settimana
          </label>
          <div className="grid grid-cols-5 gap-2 mt-1">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDraftDpw(d)}
                className={cn(
                  "aspect-square rounded-xl text-base font-bold transition-all min-h-[44px]",
                  draftDpw === d ? "bg-primary shadow-glow" : "bg-secondary/60"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Quali giorni? ({draftDays.length}/{draftDpw})
          </label>
          <div className="grid grid-cols-7 gap-1.5 mt-1">
            {DAYS_OF_WEEK.map((d) => {
              const on = draftDays.includes(d);
              const disabled = !on && draftDays.length >= draftDpw;
              return (
                <button
                  key={d}
                  onClick={() => toggleDraftDay(d)}
                  disabled={disabled}
                  className={cn(
                    "py-3 rounded-xl text-[11px] font-bold transition-all min-h-[44px] flex items-center justify-center",
                    on
                      ? "bg-primary shadow-glow"
                      : disabled
                        ? "bg-secondary/30 text-muted-foreground opacity-50"
                        : "bg-secondary/60 active:scale-95"
                  )}
                >
                  {d.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {draftDpw !== profile.daysPerWeek && (
          <p className="text-[11px] text-muted-foreground">
            ⚠️ Cambiando il numero di giorni, la scheda verrà rigenerata.
          </p>
        )}

        <button
          disabled={!draftDaysOk || !freqDirty}
          onClick={saveFrequency}
          className={cn(
            "w-full py-3 rounded-xl font-bold transition-all active:scale-95 min-h-[44px]",
            draftDaysOk && freqDirty
              ? "bg-gradient-primary shadow-glow"
              : "bg-muted text-muted-foreground"
          )}
        >
          Salva Frequenza
        </button>
        {freqSaved && (
          <p className="text-xs text-center" style={{ color: "var(--success)" }}>
            ✓ Frequenza aggiornata
          </p>
        )}
      </div>

      <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">🎨 Sfondo</p>
        <div className="grid grid-cols-4 gap-2">
          {BACKGROUND_OPTIONS.map((bg) => (
            <button
              key={bg}
              onClick={() => setBackground(bg)}
              className={cn(
                "aspect-square rounded-xl border-2 transition-all overflow-hidden",
                profile.background === bg ? "border-primary shadow-glow" : "border-border"
              )}
            >
              <div className={cn(
                "w-full h-full",
                bg === "hero" && "bg-gradient-hero",
                bg === "navy" && "bg-gradient-navy",
                bg === "red" && "bg-gradient-primary",
                bg === "black" && "bg-black",
              )} />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Backup</p>
        <button onClick={exportData} className="w-full py-3 rounded-xl bg-secondary/80 font-semibold active:scale-95 transition-transform min-h-[44px]">
          📥 Esporta dati (JSON)
        </button>
        <button onClick={() => fileRef.current?.click()} className="w-full py-3 rounded-xl bg-secondary/80 font-semibold active:scale-95 transition-transform min-h-[44px]">
          📤 Importa dati (JSON)
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
        />
        <button
          onClick={() => { if (confirm("Resettare tutti i dati?")) resetAll(); }}
          className="w-full py-3 rounded-xl bg-destructive/20 text-destructive font-semibold active:scale-95 transition-transform border border-destructive/40 min-h-[44px]"
        >
          🗑️ Reset completo
        </button>
      </div>

      <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card text-center">
        <p className="text-xs text-muted-foreground">💡 Idee o Problemi?</p>
        <a
          href="https://instagram.com/leonard0_Ferretti"
          target="_blank"
          rel="noopener noreferrer"
          className="text-electric font-bold text-sm mt-1 inline-block"
        >
          Scrivimi su Instagram: @leonard0_Ferretti
        </a>
      </div>
    </div>
  );
}
