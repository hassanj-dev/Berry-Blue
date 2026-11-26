// One place for the look of every icon in the game toolbar.
// absoluteStrokeWidth keeps the line exactly strokeWidth pixels wide at any icon size,
// so the lines stay crisp instead of turning thin and blurry when the icon is scaled down.
// To try a bolder or lighter line, change strokeWidth here (for example 1.75, 2 or 2.5).
export const iconProps = {
  size: 20,
  strokeWidth: 2,
  absoluteStrokeWidth: true,
} as const;
