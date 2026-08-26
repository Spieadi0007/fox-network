"use client";

import { useRef, useState } from "react";
import { Plus, Paperclip, X } from "lucide-react";
import {
  createInvoice,
  type ClientOrg,
} from "@fox/supabase/actions/staff-invoices";
import { SubmitButton } from "@/components/ui/submit-button";

const FIELD =
  "mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange";
const LABEL = "block text-xs font-medium text-stone-600";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function inDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function RaiseInvoicePanel({ clients }: { clients: ClientOrg[] }) {
  const [open, setOpen] = useState(false);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  if (clients.length === 0) {
    return (
      <p className="mt-6 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-500">
        No client organisations exist yet, so there is nobody to invoice.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
      >
        <Plus className="h-4 w-4" />
        Raise an invoice
      </button>
    );
  }

  return (
    <form
      action={createInvoice}
      className="mt-6 rounded-2xl border border-stone-200 bg-white p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <label htmlFor="organization_id" className={LABEL}>
            Client
          </label>
          <select
            id="organization_id"
            name="organization_id"
            required
            defaultValue=""
            className={FIELD}
          >
            <option value="" disabled>
              Choose a client…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="reference" className={LABEL}>
            Reference
          </label>
          <input
            id="reference"
            name="reference"
            type="text"
            required
            maxLength={60}
            placeholder="INV-1003"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="amount" className={LABEL}>
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            required
            min={0}
            step="0.01"
            placeholder="1250.00"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="currency" className={LABEL}>
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue="EUR"
            className={FIELD}
          >
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div>
          <label htmlFor="issued_on" className={LABEL}>
            Issued
          </label>
          <input
            id="issued_on"
            name="issued_on"
            type="date"
            required
            defaultValue={today()}
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="due_on" className={LABEL}>
            Due <span className="text-stone-400">(optional)</span>
          </label>
          <input
            id="due_on"
            name="due_on"
            type="date"
            defaultValue={inDays(30)}
            className={FIELD}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="notes" className={LABEL}>
            Notes <span className="text-stone-400">(shown to the client)</span>
          </label>
          <input
            id="notes"
            name="notes"
            type="text"
            maxLength={200}
            placeholder="Q3 planned maintenance — lifts 1–4"
            className={FIELD}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => pdfRef.current?.click()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
        >
          <Paperclip className="h-3.5 w-3.5" />
          {pdfName ?? "Attach a PDF"}
        </button>
        {pdfName && (
          <button
            type="button"
            onClick={() => {
              if (pdfRef.current) pdfRef.current.value = "";
              setPdfName(null);
            }}
            className="inline-flex cursor-pointer items-center gap-1 text-[11px] text-stone-500 hover:text-stone-800"
          >
            <X className="h-3 w-3" />
            Remove
          </button>
        )}
        <input
          ref={pdfRef}
          id="pdf"
          name="pdf"
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfName(e.target.files?.[0]?.name ?? null)}
          className="sr-only"
        />

        {/* Drafts stay invisible to the client, so sending is a deliberate act. */}
        <label className="flex cursor-pointer items-center gap-2 text-xs text-stone-600">
          <input
            type="checkbox"
            name="send"
            defaultChecked
            className="h-3.5 w-3.5 rounded border-stone-300 text-stone-900 focus:ring-fox-orange"
          />
          Send to the client now
        </label>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <SubmitButton
          pendingLabel="Raising…"
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
        >
          Raise invoice
        </SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
