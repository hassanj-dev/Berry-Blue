export function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex max-w-xl flex-col gap-3">
      <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {description && <p className="text-muted">{description}</p>}
    </div>
  );
}
