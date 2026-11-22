import { t } from "@/i18n";

export function Mascot({ size = 96 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={t("common.mascotAlt")}
    >
      <circle cx="50" cy="55" r="38" fill="var(--brand)" />
      <circle cx="38" cy="50" r="6" fill="var(--brand-foreground)" />
      <circle cx="62" cy="50" r="6" fill="var(--brand-foreground)" />
      <path
        d="M38 68 Q50 78 62 68"
        stroke="var(--brand-foreground)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M50 17 Q56 6 66 10 Q60 20 50 17Z" fill="var(--accent)" />
    </svg>
  );
}
