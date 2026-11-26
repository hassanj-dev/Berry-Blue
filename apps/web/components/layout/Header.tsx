import { LowInternetToggle } from "@/components/layout/LowInternetToggle";
import { Logo } from "@/components/layout/Logo";
import { SearchBox } from "@/components/layout/SearchBox";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// Phone: logo and toggles on the first row, search under them. Desktop: search on the left (the logo is in the sidebar).
export function Header() {
  return (
    <header className="relative z-40 border-b border-border bg-background lg:sticky lg:top-0">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-2 gap-y-2 px-4 py-2 md:gap-y-3 md:px-8 md:py-3 lg:flex-nowrap">
        <Logo className="order-1 lg:hidden" />

        <div className="order-2 ml-auto flex items-center lg:order-3">
          <LowInternetToggle />
          <ThemeToggle />
        </div>

        <div className="order-3 w-full lg:order-2 lg:max-w-md lg:flex-1">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
