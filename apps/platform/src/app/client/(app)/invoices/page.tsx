import { getClientInvoices } from "@fox/supabase/actions/client-invoices";
import { downloadInvoice } from "@fox/supabase/actions/client-invoices";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  EmptyState,
  Notice,
  PageHeader,
  StatusPill,
  buttonSecondary,
  theadCls,
  thCls,
  type Tone,
} from "../portal-ui";

const STATUS_TONE: Record<string, Tone> = {
  paid: "good",
  sent: "accent",
  overdue: "bad",
  void: "neutral",
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
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Invoices"
        sub="What you owe, and what has been settled."
      />

      {error && <Notice tone="error">{error}</Notice>}

      <div className="grid gap-4 sm:grid-cols-3">
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
        <EmptyState
          title="No invoices yet"
          body="Invoices appear here once we raise them. Nothing is owed right now."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-portal-border bg-portal-surface">
          <table className="w-full min-w-[640px]">
            <thead className={theadCls}>
              <tr>
                <th className={thCls}>Invoice</th>
                <th className={thCls}>Issued</th>
                <th className={thCls}>Due</th>
                <th className={thCls}>Status</th>
                <th className={`${thCls} text-right`}>Amount</th>
                <th className={thCls} />
              </tr>
            </thead>
            <tbody className="divide-y divide-portal-border-soft text-sm">
              {invoices.map((invoice) => {
                const state = invoice.is_overdue ? "overdue" : invoice.status;
                return (
                  <tr key={invoice.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-portal-text">
                        {invoice.reference}
                      </p>
                      {invoice.notes && (
                        <p className="mt-0.5 truncate text-xs text-portal-dim">
                          {invoice.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-portal-dim">
                      {formatDate(invoice.issued_on)}
                    </td>
                    <td className="px-5 py-4 text-xs text-portal-dim">
                      {formatDate(invoice.due_on) ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill tone={STATUS_TONE[state]} size="sm">
                        {STATUS_LABEL[state]}
                      </StatusPill>
                      {invoice.paid_on && (
                        <p className="mt-1 text-[11px] text-portal-muted">
                          {formatDate(invoice.paid_on)}
                        </p>
                      )}
                    </td>
                    <td
                      className={`px-5 py-4 text-right font-mono ${
                        invoice.status === "void"
                          ? "text-portal-muted line-through"
                          : "text-portal-text"
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
                            className={buttonSecondary}
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
  amber: "text-portal-accent",
  red: "text-portal-bad",
  stone: "text-portal-text",
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
    <div className="rounded-2xl border border-portal-border bg-portal-surface px-6 py-5">
      <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-portal-dim">{label}</p>
      <p
        className={`mt-1.5 text-[28px] font-extrabold tracking-[-0.01em] ${TONES[tone]}`}
      >
        {value}
      </p>
    </div>
  );
}
