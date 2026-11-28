import { FaDiscord, FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa6";
import { btn } from "@/components/site/ui";
import { socialLinks } from "@/lib/social";

const items = [
  { name: "YouTube", Glyph: FaYoutube, url: socialLinks.youtube },
  { name: "Instagram", Glyph: FaInstagram, url: socialLinks.instagram },
  { name: "TikTok", Glyph: FaTiktok, url: socialLinks.tiktok },
  { name: "Discord", Glyph: FaDiscord, url: socialLinks.discord },
  { name: "LinkedIn", Glyph: FaLinkedinIn, url: socialLinks.linkedin },
].filter((item) => item.url !== "");

/** Our social profiles as buttons. A network with no address in lib/social.ts is left out. */
export function SocialLinks() {
  return (
    <ul aria-label="BerryBlue on social media" className="flex flex-wrap gap-3">
      {items.map(({ name, Glyph, url }) => (
        <li key={name}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={btn("secondary", "sm")}
          >
            <Glyph size={16} aria-hidden="true" />
            {name}
          </a>
        </li>
      ))}
    </ul>
  );
}
