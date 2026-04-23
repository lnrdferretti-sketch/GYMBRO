import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/state/AppContext";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import { OggiTab } from "@/components/tabs/OggiTab";
import { AllenamentoTab } from "@/components/tabs/AllenamentoTab";
import { BenessereTab } from "@/components/tabs/BenessereTab";
import { StatisticheTab } from "@/components/tabs/StatisticheTab";
import { ImpostazioniTab } from "@/components/tabs/ImpostazioniTab";
import { BACKGROUND_OPTIONS } from "@/components/PhoneShell";

export function MainApp() {
  const { state, setState } = useApp();
  const [tab, setTab] = useState<TabKey>("oggi");

  if (!state.profile) return null;
  const profile = state.profile;

  const cycleBackground = () => {
    const idx = BACKGROUND_OPTIONS.indexOf(profile.background);
    const next = BACKGROUND_OPTIONS[(idx + 1) % BACKGROUND_OPTIONS.length];
    setState((s) => s.profile ? { ...s, profile: { ...s.profile, background: next } } : s);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="safe-top px-5 pt-4 pb-3 glass border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="w-11 h-11 rounded-2xl bg-gradient-primary flex items-center justify-center text-2xl shadow-glow"
          >
            {profile.coachEmoji}
          </motion.div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Coach</p>
            <p className="font-black text-lg leading-tight">{profile.coachName}</p>
          </div>
        </div>
        <button
          onClick={cycleBackground}
          className="px-3 py-2 rounded-xl bg-secondary/70 text-xs font-semibold active:scale-95 transition-transform"
        >
          🎨 Sfondo
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "oggi" && <OggiTab />}
            {tab === "allenamento" && <AllenamentoTab />}
            {tab === "benessere" && <BenessereTab />}
            {tab === "statistiche" && <StatisticheTab />}
            {tab === "impostazioni" && <ImpostazioniTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
