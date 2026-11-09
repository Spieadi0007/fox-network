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
        className="shrink-0 cursor-pointer rounded-lg p-1.5 text-portal-muted transition-colors hover:bg-portal-bad-bg hover:text-portal-bad"
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
        className="rounded-full bg-portal-bad px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-[#8a2219]"
      >
        Remove
      </SubmitButton>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="cursor-pointer text-[11px] font-medium text-portal-dim hover:text-portal-text"
      >
        Cancel
      </button>
    </form>
  );
}
