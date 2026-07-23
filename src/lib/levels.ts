import type { Level } from "@prisma/client";

export const LEVELS: Level[] = ["A1", "A2", "B1"];

export const LEVEL_LABELS: Record<Level, { letter: string; name: string }> = {
  A1: { letter: "א", name: "Алеф" },
  A2: { letter: "ב", name: "Бет" },
  B1: { letter: "ג", name: "Гимель" },
};

export function formatLevel(level: Level): string {
  const { letter, name } = LEVEL_LABELS[level];
  return `${letter} · ${name}`;
}
