"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "../client/server";

const BUCKET = "invoices";
const PAGE = "/client/invoices";

export type ClientInvoice = {
  id: string;
  reference: string;
  status: "sent" | "paid" | "void";
  amount_cents: number;
  currency: string;
  issued_on: string;
  due_on: string | null;
  paid_on: string | null;
  notes: string | null;
  has_pdf: boolean;
  /** Derived, not stored: due date passed and still unpaid. */
  is_overdue: boolean;
};

export type InvoiceTotals = {
  outstandingCents: number;
  overdueCents: number;
  paidCents: number;
  currency: string;
};

async function requireOrg() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/client/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  if (!profile?.organization_id) redirect("/client/signin");

  return { db, orgId: profile.organization_id as string };
}

export async function getClientInvoices(): Promise<{
  invoices: ClientInvoice[];
  totals: InvoiceTotals;
}> {
  const { db, orgId } = await requireOrg();

  const { data } = await db
    .from("invoices")
    .select(
      "id, reference, status, amount_cents, currency, issued_on, due_on, paid_on, notes, pdf_path"
    )
    .eq("organization_id", orgId)
    .order("issued_on", { ascending: false });

  // Compared as dates, not timestamps: an invoice due today is not late.
  const today = new Date().toISOString().slice(0, 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoices: ClientInvoice[] = (data ?? []).map((row: any) => ({
    id: row.id,
    reference: row.reference,
    status: row.status,
    amount_cents: Number(row.amount_cents),
    currency: row.currency,
    issued_on: row.issued_on,
    due_on: row.due_on,
    paid_on: row.paid_on,
    notes: row.notes,
    has_pdf: !!row.pdf_path,
    is_overdue:
      row.status === "sent" && !!row.due_on && row.due_on < today,
  }));

  // Voided invoices are shown for the record but owed by nobody, so they
  // count towards nothing.
  const live = invoices.filter((i) => i.status !== "void");

  const totals: InvoiceTotals = {
    outstandingCents: live
      .filter((i) => i.status === "sent")
      .reduce((sum, i) => sum + i.amount_cents, 0),
    overdueCents: live
      .filter((i) => i.is_overdue)
      .reduce((sum, i) => sum + i.amount_cents, 0),
    paidCents: live
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.amount_cents, 0),
    currency: live[0]?.currency ?? "EUR",
  };

  return { invoices, totals };
}

export async function downloadInvoice(formData: FormData) {
  const id = formData.get("id") as string;
  const { db, orgId } = await requireOrg();

  const { data: invoice } = await db
    .from("invoices")
    .select("pdf_path")
    .eq("id", id)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (!invoice?.pdf_path) {
    redirect(`${PAGE}?error=There+is+no+PDF+for+that+invoice`);
  }

  const { data: signed, error } = await db.storage
    .from(BUCKET)
    .createSignedUrl(invoice.pdf_path, 60);

  if (error || !signed?.signedUrl) {
    redirect(
      `${PAGE}?error=${encodeURIComponent(error?.message ?? "Could not open that invoice")}`
    );
  }

  redirect(signed.signedUrl);
}
