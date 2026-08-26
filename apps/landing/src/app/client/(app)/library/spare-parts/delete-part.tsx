"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteClientSparePart } from "@fox/supabase/actions/client-spare-parts";
import { SubmitButton } from "@/components/ui/submit-button";

/** Two-step, for the same reason as document delete: no blocking native dialog. */
export function DeletePart({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Remove ${name}`}
        className="shrink-0 cursor-pointer rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <form
      action={deleteClientSparePart}
      className="flex shrink-0 items-center gap-1.5"
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton
        pendingLabel="…"
        className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-red-700"
      >
        Remove
      </SubmitButton>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="cursor-pointer text-[11px] font-medium text-stone-500 hover:text-stone-800"
      >
        Cancel
      </button>
    </form>
  );
}
