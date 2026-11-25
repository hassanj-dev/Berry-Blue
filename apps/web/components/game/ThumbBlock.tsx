// Shown instead of the thumbnail in Low Internet Mode (see globals.css).
// The same title always gets the same colour. The caller sets the size and the letter size.
function hueFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  return hash;
}

export function ThumbBlock({ title, className = "" }: { title: string; className?: string }) {
  const letter = Array.from(title.trim())[0]?.toUpperCase() ?? "?";

  return (
    <div
      aria-hidden="true"
      className={`card-block font-bold text-white ${className}`}
      style={{ backgroundColor: `hsl(${hueFor(title)} 45% 38%)` }}
    >
      {letter}
    </div>
  );
}
