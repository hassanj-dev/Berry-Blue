"use client";

import { useActionState } from "react";
import { createProvider, type CreateProviderState } from "@/lib/providers-actions";

const initialState: CreateProviderState = { error: null, message: null, values: {} };

const inputClass = "rounded-lg border border-border bg-background px-3 py-2 text-sm";

export function AddProviderForm() {
  const [state, formAction, pending] = useActionState(createProvider, initialState);

  return (
    <details
      className="rounded-2xl border border-border bg-surface p-4"
      open={state.error !== null}
    >
      <summary className="cursor-pointer font-medium">Add provider</summary>

      <form action={formAction} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Provider id
          <input
            name="provider"
            required
            minLength={2}
            maxLength={40}
            pattern="[a-z0-9\-]+"
            autoComplete="off"
            placeholder="for example: gamezop"
            defaultValue={state.values.provider ?? ""}
            className={inputClass}
          />
          <span className="text-xs text-muted">
            Lowercase letters, numbers and dashes. It is stored on every game and cannot be changed
            later.
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Display name
          <input
            name="displayName"
            required
            maxLength={60}
            defaultValue={state.values.displayName ?? ""}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          License status
          <select
            name="licenseStatus"
            defaultValue={state.values.licenseStatus ?? "unverified"}
            className={inputClass}
          >
            <option value="unverified">unverified</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="expired">expired</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Terms URL
          <input
            name="termsUrl"
            type="url"
            defaultValue={state.values.termsUrl ?? ""}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Notes
          <textarea
            name="notes"
            rows={3}
            defaultValue={state.values.notes ?? ""}
            className={inputClass}
          />
        </label>

        <p className="text-sm text-muted md:col-span-2">
          This only registers the provider. To import its games, an adapter for it must also exist
          in the code.
        </p>

        {state.error && (
          <p role="alert" className="text-sm text-danger md:col-span-2">
            {state.error}
          </p>
        )}
        {state.message && (
          <p role="status" className="text-sm md:col-span-2">
            {state.message}
          </p>
        )}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-brand disabled:opacity-60"
          >
            {pending ? "Adding..." : "Add provider"}
          </button>
        </div>
      </form>
    </details>
  );
}
