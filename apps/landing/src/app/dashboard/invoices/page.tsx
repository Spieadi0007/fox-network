import { Receipt } from "lucide-react";
import {
  getStaffInvoices,
  getClientOrganizations,
  downloadStaffInvoice,
} from "@fox/supabase/actions/staff-invoices";
import { SubmitButton } from "@/components/ui/submit-button";
import { RaiseInvoicePanel } from "./raise-invoice-panel";
import { InvoiceActions } from "./invoice-actions";

const STATUS_STYLE: Record<string, string> = {
  draft: "border-stone-200 bg-stone-50 text-stone-600",
  sent: "border-amber-200 bg-amber-50 text-amber-700",
  overdue: "border-red-200 bg-red-50 text-red-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  void: "border-stone-200 bg-stone-50 text-stone-400",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  sent: "Awaiting payment",
  overdue: "Overdue",
  paid: "Paid",
  void: "Cancelled",
};

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(date: string | null) {
  if (!date) return null;
  // A date-only string must not go through a timezone-shifting parse.
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function StaffInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;

  // Both of these redirect non-staff to /dashboard before returning.
  const [invoices, clients] = await Promise.all([
    getStaffInvoices(),
    getClientOrganizations(),
  ]);

  const outstanding = invoices
    .filter((i) => i.status === "sent")
    .reduce((sum, i) => sum + i.amount_cents, 0);
  const overdue = invoices
    .filter((i) => i.is_overdue)
    .reduce((sum, i) => sum + i.amount_cents, 0);
  const currency = invoices[0]?.currency ?? "EUR";

  return (
    <div className="p-8">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
        Invoices
      </h1>
      <p className="mt-1 text-sm text-stone-400">
        Everything billed to clients, and what is still owed.
      </p>

      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {invoices.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-stone-500">Outstanding</p>
            <p className="mt-0.5 font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-stone-900">
              {money(outstanding, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Overdue</p>
            <p
              className={`mt-0.5 font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight ${
                overdue > 0 ? "text-red-700" : "text-stone-900"
              }`}
            >
              {money(overdue, currency)}
            </p>
          </div>
        </div>
      )}

      <RaiseInvoicePanel clients={clients} />

      {invoices.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <Receipt className="mx-auto h-8 w-8 text-stone-300" />
          <p className="mt-3 text-sm font-medium text-stone-700">
            No invoices raised yet
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Raise one above. Clients see it as soon as you send it — drafts
            stay hidden from them.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[820px]">
            <thead className="bg-stone-50">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Issued</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {invoices.map((invoice) => {
                const state = invoice.is_overdue ? "overdue" : invoice.status;
                return (
                  <tr key={invoice.id}>
                    <td className="px-5 py-4 text-stone-700">
                      {invoice.organization_name ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-900">
                        {invoice.reference}
                      </p>
                      {invoice.notes && (
                        <p className="mt-0.5 max-w-[220px] truncate text-xs text-stone-500">
                          {invoice.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-stone-600">
                      {formatDate(invoice.issued_on)}
                    </td>
                    <td className="px-5 py-4 text-xs text-stone-600">
                      {formatDate(invoice.due_on) ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLE[state]}`}
                      >
                        {STATUS_LABEL[state]}
                      </span>
                      {invoice.paid_on && (
                        <p className="mt-1 text-[11px] text-stone-400">
                          {formatDate(invoice.paid_on)}
                        </p>
                      )}
                    </td>
                    <td
                      className={`px-5 py-4 text-right font-mono ${
                        invoice.status === "void"
                          ? "text-stone-400 line-through"
                          : "text-stone-900"
                      }`}
                    >
                      {money(invoice.amount_cents, invoice.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.has_pdf && (
                          <form action={downloadStaffInvoice}>
                            <input type="hidden" name="id" value={invoice.id} />
                            <SubmitButton
                              pendingLabel="…"
                              className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
                            >
                              PDF
                            </SubmitButton>
                          </form>
                        )}
                        <InvoiceActions
                          id={invoice.id}
                          status={invoice.status}
                          reference={invoice.reference}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
