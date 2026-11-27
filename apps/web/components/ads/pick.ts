// Chooses which ad to show when several are eligible at the same time.
//
// 1. "priority" ads win over "shuffle" ads (while a priority ad is still allowed to show,
//    i.e. it has not hit its frequency limit, shuffle ads wait).
// 2. Inside the winning group the pick is random, weighted: weight 3 shows about 3x as
//    often as weight 1.
// 3. The ad that was shown last is skipped when there is another choice, so the same brand
//    does not appear twice in a row.

export type Pickable = {
  id: string;
  weight?: number;
  rotation?: "shuffle" | "priority";
};

const weightOf = (ad: Pickable) => Math.min(10, Math.max(1, Math.round(ad.weight ?? 1)));

export function pickAd<T extends Pickable>(
  ads: T[],
  lastId: string | null,
  random: () => number = Math.random,
): T | null {
  if (ads.length === 0) return null;

  const priority = ads.filter((ad) => ad.rotation === "priority");
  let pool = priority.length > 0 ? priority : ads;

  if (pool.length > 1 && lastId) {
    const others = pool.filter((ad) => ad.id !== lastId);
    if (others.length > 0) pool = others;
  }

  const total = pool.reduce((sum, ad) => sum + weightOf(ad), 0);
  let roll = random() * total;
  for (const ad of pool) {
    roll -= weightOf(ad);
    if (roll < 0) return ad;
  }
  return pool[pool.length - 1];
}
