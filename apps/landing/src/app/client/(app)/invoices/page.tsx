import { getClientInvoices } from "@fox/supabase/actions/client-invoices";
import { downloadInvoice } from "@fox/supabase/actions/client-invoices";
import { SubmitButton } from "@/components/ui/submit-button";

const STATUS_STYLE: Record<string, string> = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  sent: "border-amber-200 bg-amber-50 text-amber-700",
  overdue: "border-red-200 bg-red-50 text-red-700",
  void: "border-stone-200 bg-stone-50 text-stone-500",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  sent: "Awaiting payment",
  overdue: "Overdue",
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
  // Date-only strings must not go through a timezone-shifting parse.
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { invoices, totals } = await getClientInvoices();

  return (
    <div>
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          Invoices
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          What you owe, and what has been settled.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Total
          label="Outstanding"
          value={money(totals.outstandingCents, totals.currency)}
          tone={totals.outstandingCents > 0 ? "amber" : "stone"}
        />
        <Total
          label="Overdue"
          value={money(totals.overdueCents, totals.currency)}
          tone={totals.overdueCents > 0 ? "red" : "stone"}
        />
        <Total
          label="Paid to date"
          value={money(totals.paidCents, totals.currency)}
          tone="stone"
        />
      </div>

      {invoices.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-stone-900">
            No invoices yet
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Invoices appear here once we raise them. Nothing is owed right now.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[640px]">
            <thead className="bg-stone-50">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Issued</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {invoices.map((invoice) => {
                const state = invoice.is_overdue ? "overdue" : invoice.status;
                return (
                  <tr key={invoice.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-900">
                        {invoice.reference}
                      </p>
                      {invoice.notes && (
                        <p className="mt-0.5 truncate text-xs text-stone-500">
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
                    <td className="px-5 py-4 text-right">
                      {invoice.has_pdf && (
                        <form action={downloadInvoice}>
                          <input type="hidden" name="id" value={invoice.id} />
                          <SubmitButton
                            pendingLabel="Opening…"
                            className="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
                          >
                            PDF
                          </SubmitButton>
                        </form>
                      )}
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

const TONES: Record<string, string> = {
  amber: "text-amber-700",
  red: "text-red-700",
  stone: "text-stone-900",
};

function Total({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <p className="text-xs text-stone-500">{label}</p>
      <p
        className={`mt-1 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight ${TONES[tone]}`}
      >
        {value}
      </p>
    </div>
  );
}
