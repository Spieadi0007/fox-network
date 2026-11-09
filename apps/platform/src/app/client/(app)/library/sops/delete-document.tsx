"use client";

import { useState } from "react";
import { deleteClientDocument } from "@fox/supabase/actions/client-documents";
import { SubmitButton } from "@/components/ui/submit-button";

/**
 * Two-step delete rather than a window.confirm(): a native dialog blocks the
 * page, reads as a browser warning rather than part of the app, and gives no
 * room to name what is about to go.
 */
export function DeleteDocument({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="cursor-pointer rounded-full border border-portal-border bg-portal-surface px-3.5 py-1.5 text-xs font-medium text-portal-dim transition-colors hover:border-portal-bad-border hover:bg-portal-bad-bg hover:text-portal-bad"
      >
        Delete
      </button>
    );
  }

  return (
    <form action={deleteClientDocument} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-xs text-portal-dim">Delete {name}?</span>
      <SubmitButton
        pendingLabel="Deleting…"
        className="rounded-full bg-portal-bad px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#8a2219]"
      >
        Delete
      </SubmitButton>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="cursor-pointer rounded-full border border-portal-border bg-portal-surface px-3.5 py-1.5 text-xs font-medium text-portal-dim transition-colors hover:bg-portal-sunken"
      >
        Cancel
      </button>
    </form>
  );
}
