"use client";

import { useState } from "react";
import { setInvoiceStatus } from "@fox/supabase/actions/staff-invoices";
import { SubmitButton } from "@/components/ui/submit-button";

type Status = "draft" | "sent" | "paid" | "void";

/**
 * What you can do next depends on where the invoice is. Cancelling is the one
 * that needs confirming — it is visible to the client and there is no undo
 * beyond re-raising.
 */
const NEXT: Record<Status, { status: Status; label: string; primary?: boolean }[]> = {
  draft: [
    { status: "sent", label: "Send", primary: true },
    { status: "void", label: "Cancel invoice" },
  ],
  sent: [
    { status: "paid", label: "Mark paid", primary: true },
    { status: "void", label: "Cancel invoice" },
  ],
  paid: [{ status: "sent", label: "Mark unpaid" }],
  void: [{ status: "draft", label: "Reopen as draft" }],
};

export function InvoiceActions({
  id,
  status,
  reference,
}: {
  id: string;
  status: Status;
  reference: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <form action={setInvoiceStatus} className="flex items-center gap-1.5">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="void" />
        <span className="text-[11px] text-stone-500">Cancel {reference}?</span>
        <SubmitButton
          pendingLabel="…"
          className="rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-red-700"
        >
          Cancel it
        </SubmitButton>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="cursor-pointer text-[11px] font-medium text-stone-500 hover:text-stone-800"
        >
          Keep
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {NEXT[status].map((next) =>
        next.status === "void" ? (
          <button
            key={next.status}
            type="button"
            onClick={() => setConfirming(true)}
            className="cursor-pointer rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            {next.label}
          </button>
        ) : (
          <form key={next.status} action={setInvoiceStatus}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value={next.status} />
            <SubmitButton
              pendingLabel="…"
              className={
                next.primary
                  ? "rounded-full bg-stone-900 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-stone-800"
                  : "rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
              }
            >
              {next.label}
            </SubmitButton>
          </form>
        ),
      )}
    </div>
  );
}
