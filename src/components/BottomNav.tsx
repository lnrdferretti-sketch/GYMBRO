import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TabKey = "oggi" | "allenamento" | "benessere" | "statistiche" | "impostazioni";

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: "oggi", icon: "🎯", label: "Oggi" },
  { key: "allenamento", icon: "🏋️", label: "Scheda" },
  { key: "benessere", icon: "🌿", label: "Benessere" },
  { key: "statistiche", icon: "📈", label: "Stats" },
  { key: "impostazioni", icon: "⚙️", label: "Setup" },
];

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <nav className="glass border-t border-border safe-bottom">
      <div className="flex justify-around items-center pt-1.5 pb-1.5">
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-2 py-1 min-h-[48px] flex-1 active:scale-95 transition-transform",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="navpill"
                  className="absolute inset-x-2 top-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="text-xl leading-none">{t.icon}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
