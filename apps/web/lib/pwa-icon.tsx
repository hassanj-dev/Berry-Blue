import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

// The mascot from components/shared/Mascot.tsx with fixed colours (no CSS variables here).
// Maskable icons get cropped by the phone, so the picture stays in the middle 60%.
export function renderIcon(size: number, maskable: boolean, headers: Record<string, string> = {}) {
  const face = Math.round(size * (maskable ? 0.6 : 0.74));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: siteConfig.themeColor,
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width={face} height={face} viewBox="0 0 100 100">
        <circle cx="50" cy="55" r="38" fill="#ffffff" />
        <circle cx="38" cy="50" r="6" fill={siteConfig.themeColor} />
        <circle cx="62" cy="50" r="6" fill={siteConfig.themeColor} />
        <path
          d="M38 68 Q50 78 62 68"
          stroke={siteConfig.themeColor}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M50 17 Q56 6 66 10 Q60 20 50 17Z" fill={siteConfig.accentColor} />
      </svg>
    </div>,
    { width: size, height: size, headers },
  );
}
