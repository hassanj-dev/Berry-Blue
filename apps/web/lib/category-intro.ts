// A short introduction for each category page: shown under the heading and used as the page description.
// Keyed by category slug. A category without an entry simply shows no intro.
const intros: Record<string, string> = {
  action:
    "Fast reactions, quick fights and close calls. Play free action games in your browser on your phone, tablet or computer, with nothing to download and no sign-up.",
  arcade:
    "Classic arcade-style games that are easy to pick up and hard to put down. Chase a high score in free arcade games that open straight in your browser.",
  casual:
    "Relaxed games for a short break, with simple rules and no pressure. Play free casual games on any device, with nothing to install.",
  puzzle:
    "Think it through and solve it. Free puzzle games that test your logic and patience, playable in your browser on any device.",
  racing:
    "Pick a car, hit the gas and beat the clock. Play free racing games in your browser on any device, with nothing to download.",
  sports:
    "Play free sports games in your browser, from quick matches to score challenges, on your phone, tablet or computer.",
  strategy:
    "Plan ahead, use your resources well and outsmart your opponent. Free strategy games that run in your browser, with no download needed.",
  word: "Spell it, guess it, find it. Free word games to stretch your vocabulary, playable in your browser on any device.",
};

export function getCategoryIntro(slug: string): string | null {
  return intros[slug] ?? null;
}
