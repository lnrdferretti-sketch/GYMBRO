import { useRef, useState } from "react";
import { useApp } from "@/state/AppContext";
import { BACKGROUND_OPTIONS } from "@/components/PhoneShell";
import { cn } from "@/lib/utils";

const EMOJIS = ["💪", "🔥", "🏋️", "⚡", "🦾", "🥷", "👑", "🚀", "🎯", "🐺"];

export function ImpostazioniTab() {
  const { state, setState, resetAll } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(state.profile?.coachName ?? "GYMBRO");
  const [emoji, setEmoji] = useState(state.profile?.coachEmoji ?? "💪");

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
            "w-full py-3 rounded-xl font-bold transition-all active:scale-95",
            dirty ? "bg-gradient-primary shadow-glow" : "bg-muted text-muted-foreground"
          )}
        >
          Salva
        </button>
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
              <div className={cn("w-full h-full", `bg-gradient-${bg === "hero" ? "hero" : bg === "navy" ? "navy" : bg === "red" ? "primary" : ""}`, bg === "black" && "bg-black")} />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card/80 border border-border rounded-2xl p-4 shadow-card space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Backup</p>
        <button onClick={exportData} className="w-full py-3 rounded-xl bg-secondary/80 font-semibold active:scale-95 transition-transform">
          📥 Esporta dati (JSON)
        </button>
        <button onClick={() => fileRef.current?.click()} className="w-full py-3 rounded-xl bg-secondary/80 font-semibold active:scale-95 transition-transform">
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
          className="w-full py-3 rounded-xl bg-destructive/20 text-destructive font-semibold active:scale-95 transition-transform border border-destructive/40"
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
