export type DiffRow = { label: string; live: string; staged: string; changed: boolean };

export function DiffTable({ rows }: { rows: DiffRow[] }) {
  const changedCount = rows.filter((r) => r.changed).length;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold">
        What changes ({changedCount} of {rows.length} fields)
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-3 py-2">Field</th>
              <th className="px-3 py-2">On the site now</th>
              <th className="px-3 py-2">New version</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className={"border-t border-border align-top " + (row.changed ? "bg-surface" : "")}
              >
                <td className="whitespace-nowrap px-3 py-2 font-medium">
                  {row.label}
                  {row.changed && <span className="ml-2 text-xs text-brand">changed</span>}
                </td>
                <td className="whitespace-pre-wrap break-words px-3 py-2 text-muted">{row.live}</td>
                <td
                  className={
                    "whitespace-pre-wrap break-words px-3 py-2 " +
                    (row.changed ? "font-semibold" : "")
                  }
                >
                  {row.staged}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {changedCount === 0 && (
        <p className="text-sm text-muted">
          No visible difference. Only data that is not shown here changed at the provider.
        </p>
      )}
    </section>
  );
}
