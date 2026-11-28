"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { approveGame, rejectGame, type ReviewState } from "@/lib/moderation-actions";

type ReviewFormProps = {
  stagedId: string;
  defaultSlug: string;
  defaultCategoryId: string;
  categories: { id: string; name: string }[];
};

const initialState: ReviewState = { error: null };
const inputClass = "rounded-lg border border-border bg-surface px-3 py-2";

// Submitting through onSubmit (not the form's action prop) stops React 19 from clearing the fields after an error.
function submit(action: (data: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  };
}

export function ReviewForm({
  stagedId,
  defaultSlug,
  defaultCategoryId,
  categories,
}: ReviewFormProps) {
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [approveState, approveAction, approving] = useActionState(approveGame, initialState);
  const [rejectState, rejectAction, rejecting] = useActionState(rejectGame, initialState);
  const busy = approving || rejecting;

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={submit(approveAction)}
        className="flex flex-col gap-4 rounded-2xl border border-border p-4"
      >
        <h2 className="text-lg font-bold">Approve</h2>
        <p className="text-sm text-muted">
          A new game goes to Games, under Pending (hidden). Edit it there, then publish it.
        </p>
        <input type="hidden" name="stagedId" value={stagedId} />

        <label className="flex flex-col gap-1 text-sm">
          Category
          <select
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            <option value="">Choose a category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Slug (the game URL)
          <input name="slug" defaultValue={defaultSlug} required className={inputClass} />
        </label>

        {approveState.error && (
          <p role="alert" className="text-sm text-danger">
            {approveState.error}
          </p>
        )}

        <button
          type="submit"
          disabled={!categoryId || busy}
          className="rounded-lg bg-brand px-4 py-2 font-semibold text-brand-foreground disabled:opacity-50"
        >
          {approving ? "Approving..." : "Approve"}
        </button>
        {!categoryId && (
          <p className="text-sm text-muted">Choose a category to enable this button.</p>
        )}
      </form>

      <form
        onSubmit={submit(rejectAction)}
        className="flex flex-col gap-4 rounded-2xl border border-border p-4"
      >
        <h2 className="text-lg font-bold">Reject</h2>
        <input type="hidden" name="stagedId" value={stagedId} />

        <label className="flex flex-col gap-1 text-sm">
          Reason (optional)
          <input name="reason" maxLength={500} className={inputClass} />
        </label>

        {rejectState.error && (
          <p role="alert" className="text-sm text-danger">
            {rejectState.error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="rounded-lg border border-danger px-4 py-2 font-semibold text-danger disabled:opacity-50"
        >
          {rejecting ? "Rejecting..." : "Reject"}
        </button>
      </form>
    </div>
  );
}
