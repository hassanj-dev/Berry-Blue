import {
  Brain,
  Car,
  Coffee,
  Gamepad2,
  Puzzle,
  Swords,
  Trophy,
  Type,
  type LucideIcon,
} from "lucide-react";

// By category slug. A category without an entry gets the Shapes icon where it is used.
export const categoryIcons: Record<string, LucideIcon> = {
  action: Swords,
  arcade: Gamepad2,
  casual: Coffee,
  puzzle: Puzzle,
  racing: Car,
  sports: Trophy,
  strategy: Brain,
  word: Type,
};
