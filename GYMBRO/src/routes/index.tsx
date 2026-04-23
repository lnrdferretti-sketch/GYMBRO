import { createFileRoute } from "@tanstack/react-router";
import { AppProvider, useApp } from "@/state/AppContext";
import { PhoneShell } from "@/components/PhoneShell";
import { Onboarding } from "@/components/Onboarding";
import { MainApp } from "@/components/MainApp";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "GYMBRO — Il tuo AI Coach Personale" },
      { name: "description", content: "Crea il tuo coach AI personalizzato. Schede di allenamento generate per il tuo obiettivo: ipertrofia, forza, dimagrimento." },
    ],
  }),
});

function Inner() {
  const { state } = useApp();
  return (
    <PhoneShell background={state.profile?.background ?? "hero"}>
      {state.onboarded && state.profile ? <MainApp /> : <Onboarding />}
    </PhoneShell>
  );
}

function Index() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  );
}
