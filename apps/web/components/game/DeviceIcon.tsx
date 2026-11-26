import { Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";
import type { Device } from "@berryblue/shared";

const icons: Record<Device, LucideIcon> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

export function DeviceIcon({ device }: { device: Device }) {
  const Component = icons[device];
  return <Component size={16} strokeWidth={1.5} aria-hidden="true" />;
}
