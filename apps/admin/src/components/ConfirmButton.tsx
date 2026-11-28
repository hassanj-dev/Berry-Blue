"use client";

import type { ButtonHTMLAttributes } from "react";

// A submit button that asks "are you sure?" first.
export function ConfirmButton({
  message,
  ...props
}: { message: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      {...props}
    />
  );
}
