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
        className="cursor-pointer rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        Delete
      </button>
    );
  }

  return (
    <form action={deleteClientDocument} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-xs text-stone-500">Delete {name}?</span>
      <SubmitButton
        pendingLabel="Deleting…"
        className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
      >
        Delete
      </SubmitButton>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="cursor-pointer rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50"
      >
        Cancel
      </button>
    </form>
  );
}
