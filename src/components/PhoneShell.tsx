import type { ReactNode } from "react";

const BACKGROUNDS: Record<string, string> = {
  hero: "bg-gradient-hero",
  navy: "bg-gradient-navy",
  red: "bg-gradient-primary",
  black: "bg-black",
};

export function getBackgroundClass(name: string) {
  return BACKGROUNDS[name] ?? BACKGROUNDS.hero;
}

export const BACKGROUND_OPTIONS = Object.keys(BACKGROUNDS);

export function PhoneShell({ children, background = "hero" }: { children: ReactNode; background?: string }) {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-black">
      <div
        className={`w-full max-w-md mx-auto h-[100dvh] relative overflow-hidden flex flex-col shadow-2xl text-white ${getBackgroundClass(background)}`}
      >
        {children}
      </div>
    </div>
  );
}
