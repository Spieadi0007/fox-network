"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * A submit button that disables itself while its form is in flight.
 *
 * A plain <button type="submit"> inside a form posting to a server action
 * stays live during the round trip, so a second click submits again. On a
 * form that creates a record — a request, a visit, an account — that is a
 * duplicate row, and the person who double-clicked has no way to tell they
 * caused it.
 *
 * useFormStatus reads the pending state of the nearest enclosing form, so
 * this works without turning the page into a client component.
 */
export function SubmitButton({
  children,
  className,
  pendingLabel,
  ...props
}: React.ComponentProps<"button"> & {
  /** Shown instead of the label while submitting. */
  pendingLabel?: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      {...props}
      disabled={pending || props.disabled}
      aria-busy={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-opacity",
        pending && "cursor-not-allowed opacity-70",
        className,
      )}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
