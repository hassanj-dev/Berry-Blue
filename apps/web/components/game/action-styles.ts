// Round icon buttons under the player: like, dislike, favorite, share, report, fullscreen, back.
// On phones they are 40px so one row fits; from 640px up they are 44px.
// No visible outline: a soft fill made from the text colour, so it works in dark and light themes.
const base =
  "inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent bg-foreground/10 px-3 text-sm text-foreground transition-colors hover:bg-foreground/20 disabled:pointer-events-none disabled:opacity-60 max-sm:h-10 max-sm:min-w-10 max-sm:px-2.5";

// Like and dislike: a solid blue button while pressed.
export const actionButton =
  base +
  " aria-pressed:relative aria-pressed:z-10 aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary-hover";

// Save (bookmark): no solid blue. When saved, the icon is filled and the background gets stronger.
export const saveButton = base + " aria-pressed:bg-foreground/20";
