export type MuscleGroup =
  | "Petto" | "Schiena" | "Gambe" | "Glutei"
  | "Spalle" | "Braccia" | "Addominali" | "Cardio";

export type Exercise = {
  id: string;
  name: string;
  muscle: MuscleGroup;
  type: "strength" | "cardio" | "core";
  isCompound?: boolean;
  glutePriority?: boolean;
};

export const EXERCISES: Exercise[] = [
  // Petto (8)
  { id: "p1", name: "Panca Piana con Bilanciere", muscle: "Petto", type: "strength", isCompound: true },
  { id: "p2", name: "Panca Inclinata Manubri", muscle: "Petto", type: "strength", isCompound: true },
  { id: "p3", name: "Panca Declinata", muscle: "Petto", type: "strength", isCompound: true },
  { id: "p4", name: "Croci ai Cavi", muscle: "Petto", type: "strength" },
  { id: "p5", name: "Push-up", muscle: "Petto", type: "strength" },
  { id: "p6", name: "Dips alle Parallele", muscle: "Petto", type: "strength", isCompound: true },
  { id: "p7", name: "Chest Press Macchina", muscle: "Petto", type: "strength" },
  { id: "p8", name: "Pullover Manubrio", muscle: "Petto", type: "strength" },

  // Schiena (8)
  { id: "s1", name: "Stacco da Terra", muscle: "Schiena", type: "strength", isCompound: true },
  { id: "s2", name: "Trazioni alla Sbarra", muscle: "Schiena", type: "strength", isCompound: true },
  { id: "s3", name: "Rematore con Bilanciere", muscle: "Schiena", type: "strength", isCompound: true },
  { id: "s4", name: "Lat Machine", muscle: "Schiena", type: "strength" },
  { id: "s5", name: "Pulley Basso", muscle: "Schiena", type: "strength" },
  { id: "s6", name: "Rematore Manubrio", muscle: "Schiena", type: "strength" },
  { id: "s7", name: "Iperestensioni", muscle: "Schiena", type: "strength" },
  { id: "s8", name: "Face Pull", muscle: "Schiena", type: "strength" },

  // Gambe (8)
  { id: "g1", name: "Squat con Bilanciere", muscle: "Gambe", type: "strength", isCompound: true },
  { id: "g2", name: "Pressa 45°", muscle: "Gambe", type: "strength", isCompound: true },
  { id: "g3", name: "Affondi con Manubri", muscle: "Gambe", type: "strength" },
  { id: "g4", name: "Leg Extension", muscle: "Gambe", type: "strength" },
  { id: "g5", name: "Leg Curl Sdraiato", muscle: "Gambe", type: "strength" },
  { id: "g6", name: "Stacco Rumeno", muscle: "Gambe", type: "strength", isCompound: true },
  { id: "g7", name: "Calf in Piedi", muscle: "Gambe", type: "strength" },
  { id: "g8", name: "Front Squat", muscle: "Gambe", type: "strength", isCompound: true },

  // Glutei (8) — focus dedicato
  { id: "gl1", name: "Hip Thrust con Bilanciere", muscle: "Glutei", type: "strength", isCompound: true, glutePriority: true },
  { id: "gl2", name: "Bulgarian Split Squat", muscle: "Glutei", type: "strength", isCompound: true, glutePriority: true },
  { id: "gl3", name: "Glute Bridge", muscle: "Glutei", type: "strength", glutePriority: true },
  { id: "gl4", name: "Cable Kickback", muscle: "Glutei", type: "strength", glutePriority: true },
  { id: "gl5", name: "Hip Abduction Macchina", muscle: "Glutei", type: "strength", glutePriority: true },
  { id: "gl6", name: "Sumo Deadlift", muscle: "Glutei", type: "strength", isCompound: true, glutePriority: true },
  { id: "gl7", name: "Step-Up con Manubri", muscle: "Glutei", type: "strength", glutePriority: true },
  { id: "gl8", name: "Donkey Kick", muscle: "Glutei", type: "strength", glutePriority: true },

  // Spalle (7)
  { id: "sp1", name: "Military Press", muscle: "Spalle", type: "strength", isCompound: true },
  { id: "sp2", name: "Lento Avanti Manubri", muscle: "Spalle", type: "strength", isCompound: true },
  { id: "sp3", name: "Alzate Laterali", muscle: "Spalle", type: "strength" },
  { id: "sp4", name: "Alzate Frontali", muscle: "Spalle", type: "strength" },
  { id: "sp5", name: "Alzate Posteriori", muscle: "Spalle", type: "strength" },
  { id: "sp6", name: "Arnold Press", muscle: "Spalle", type: "strength" },
  { id: "sp7", name: "Shrug con Manubri", muscle: "Spalle", type: "strength" },

  // Braccia (7)
  { id: "b1", name: "Curl Bilanciere", muscle: "Braccia", type: "strength" },
  { id: "b2", name: "Curl Manubri Alternato", muscle: "Braccia", type: "strength" },
  { id: "b3", name: "Hammer Curl", muscle: "Braccia", type: "strength" },
  { id: "b4", name: "French Press", muscle: "Braccia", type: "strength" },
  { id: "b5", name: "Push-down ai Cavi", muscle: "Braccia", type: "strength" },
  { id: "b6", name: "Dips Tricipiti", muscle: "Braccia", type: "strength" },
  { id: "b7", name: "Curl Cavo Basso", muscle: "Braccia", type: "strength" },

  // Addominali (7)
  { id: "a1", name: "Plank", muscle: "Addominali", type: "core" },
  { id: "a2", name: "Crunch a Terra", muscle: "Addominali", type: "core" },
  { id: "a3", name: "Russian Twist", muscle: "Addominali", type: "core" },
  { id: "a4", name: "Leg Raise", muscle: "Addominali", type: "core" },
  { id: "a5", name: "Mountain Climbers", muscle: "Addominali", type: "core" },
  { id: "a6", name: "Bicycle Crunch", muscle: "Addominali", type: "core" },
  { id: "a7", name: "Plank Laterale", muscle: "Addominali", type: "core" },

  // Cardio (7)
  { id: "c1", name: "Tapis Roulant", muscle: "Cardio", type: "cardio" },
  { id: "c2", name: "Cyclette", muscle: "Cardio", type: "cardio" },
  { id: "c3", name: "Ellittica", muscle: "Cardio", type: "cardio" },
  { id: "c4", name: "Vogatore", muscle: "Cardio", type: "cardio" },
  { id: "c5", name: "Salto della Corda", muscle: "Cardio", type: "cardio" },
  { id: "c6", name: "HIIT 30/30", muscle: "Cardio", type: "cardio" },
  { id: "c7", name: "Camminata Inclinata", muscle: "Cardio", type: "cardio" },
];
