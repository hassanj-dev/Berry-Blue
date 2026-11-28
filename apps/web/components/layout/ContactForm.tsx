"use client";

import { Check, CircleAlert } from "lucide-react";
import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { btn, cx, focusRing, iconProps, metaText, textLink } from "@/components/site/ui";
import { sendContact, type ContactState } from "@/lib/contact-actions";

const labelClass = "text-sm font-medium";
const fieldClass = cx(
  "w-full rounded-lg border border-border bg-background px-4 text-base text-foreground placeholder:text-subtle sm:text-sm",
  "transition-colors hover:border-foreground/30",
  focusRing,
);

const MESSAGE_MAX = 4000;

export function ContactForm() {
  // Same server action and state shape as before. Nothing about submission changed.
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, {
    ok: false,
  });
  const uid = useId();
  // Controlled fields so what the person typed survives a failed submit
  // (React resets uncontrolled forms after an action finishes).
  const [values, setValues] = useState({ name: "", email: "", message: "" });

  if (state.ok) {
    return (
      <div role="status" className="rise-in flex flex-col items-start gap-6 py-4">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Check {...iconProps} />
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">Message sent</h2>
          <p className="text-muted">Thanks for writing. We will reply by email.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/faqs" className={btn("secondary", "sm")}>
            Read the FAQs
          </Link>
          <Link href="/games" className={btn("secondary", "sm")}>
            Browse games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6" aria-busy={pending}>
      {/* Honeypot, kept exactly as before. Real visitors never see or fill it. */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-name`} className={labelClass}>
            Full name
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Your name"
            value={values.name}
            onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))}
            className={cx(fieldClass, "h-12")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-email`} className={labelClass}>
            Email address
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            value={values.email}
            onChange={(event) => setValues((v) => ({ ...v, email: event.target.value }))}
            className={cx(fieldClass, "h-12")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor={`${uid}-message`} className={labelClass}>
            Message
          </label>
          <p id={`${uid}-message-hint`} className={metaText}>
            <span className="sr-only">Characters used: </span>
            {values.message.length} / {MESSAGE_MAX}
          </p>
        </div>
        <textarea
          id={`${uid}-message`}
          name="message"
          required
          minLength={5}
          maxLength={MESSAGE_MAX}
          rows={7}
          placeholder="Tell us how we can help"
          aria-describedby={`${uid}-message-hint`}
          value={values.message}
          onChange={(event) => setValues((v) => ({ ...v, message: event.target.value }))}
          className={cx(fieldClass, "resize-y py-3 leading-relaxed")}
        />
      </div>

      {state.error && (
        <div
          role="alert"
          className="flex gap-3 rounded-lg border border-red-500/40 bg-red-500/5 p-4 text-sm"
        >
          <CircleAlert {...iconProps} className="mt-px shrink-0 text-red-500" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">We could not send your message</p>
            <p className="text-muted">{state.error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={pending} className={cx(btn("primary"), "sm:min-w-40")}>
          {pending && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
            />
          )}
          {pending ? "Sending" : "Send message"}
        </button>

        <p className="text-sm text-muted">
          By sending this form, you agree to our{" "}
          <Link href="/privacy-policy" className={cx(textLink, focusRing)}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
