import {
  Flame,
  Heart,
  House,
  LayoutGrid,
  Moon,
  Play,
  Search,
  Sparkles,
  Sun,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";

export type IconName = "home" | "grid" | "search" | "heart" | "sun" | "moon" | "flame" | "sparkles";

const icons: Record<IconName, LucideIcon> = {
  home: House,
  grid: LayoutGrid,
  search: Search,
  heart: Heart,
  sun: Sun,
  moon: Moon,
  flame: Flame,
  sparkles: Sparkles,
};

type IconProps = { name: IconName; size?: number; filled?: boolean };

export function Icon({ name, size = 20, filled = false }: IconProps) {
  const Component = icons[name];
  return (
    <Component
      size={size}
      strokeWidth={1.5}
      fill={filled ? "currentColor" : "none"}
      aria-hidden="true"
    />
  );
}

export function NavIcon({ name }: { name: IconName }) {
  return <Icon name={name} />;
}

export function PlayIcon({ size = 16 }: { size?: number }) {
  return <Play size={size} strokeWidth={1.5} fill="currentColor" aria-hidden="true" />;
}

export function ThumbIcon({ size = 16 }: { size?: number }) {
  return <ThumbsUp size={size} strokeWidth={1.5} fill="currentColor" aria-hidden="true" />;
}
