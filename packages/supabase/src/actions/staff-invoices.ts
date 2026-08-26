"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "../client/server";

const BUCKET = "invoices";
const PAGE = "/dashboard/invoices";

export type StaffInvoice = {
  id: string;
  organization_id: string;
  organization_name: string | null;
  reference: string;
  status: "draft" | "sent" | "paid" | "void";
  amount_cents: number;
  currency: string;
  issued_on: string;
  due_on: string | null;
  paid_on: string | null;
  notes: string | null;
  has_pdf: boolean;
  is_overdue: boolean;
};

export type ClientOrg = { id: string; name: string };

/**
 * Writes here rely on the fox_staff RLS policy (migration 037), which is the
 * only thing that can insert or update an invoice. Redirecting non-staff away
 * is a courtesy so they get the dashboard rather than a silent no-op.
 */
async function requireFoxStaff() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from("profiles")
    .select("fox_staff")
    .eq("id", user.id)
    .single();
  if (!profile?.fox_staff) redirect("/dashboard");

  return { db, userId: user.id };
}

/** The organisations an invoice can be raised against. */
export async function getClientOrganizations(): Promise<ClientOrg[]> {
  const { db } = await requireFoxStaff();

  // Same derivation as getAllClientRequests: a client org is one whose
  // members signed up as clients. There is no flag on organizations itself.
  const { data: profiles } = await db
    .from("profiles")
    .select("organization_id")
    .eq("account_type", "client")
    .not("organization_id", "is", null);

  const ids = [
    ...new Set(
      (profiles ?? [])
        .map((p: { organization_id: string }) => p.organization_id)
        .filter(Boolean)
    ),
  ];
  if (ids.length === 0) return [];

  const { data: orgs } = await db
    .from("organizations")
    .select("id, name")
    .in("id", ids)
    .order("name");

  return (orgs ?? []) as ClientOrg[];
}

export async function getStaffInvoices(): Promise<StaffInvoice[]> {
  const { db } = await requireFoxStaff();

  const { data } = await db
    .from("invoices")
    .select(
      "id, organization_id, reference, status, amount_cents, currency, issued_on, due_on, paid_on, notes, pdf_path, organization:organizations(name)"
    )
    .order("issued_on", { ascending: false });

  const today = new Date().toISOString().slice(0, 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    organization_id: row.organization_id,
    organization_name: row.organization?.name ?? null,
    reference: row.reference,
    status: row.status,
    amount_cents: Number(row.amount_cents),
    currency: row.currency,
    issued_on: row.issued_on,
    due_on: row.due_on,
    paid_on: row.paid_on,
    notes: row.notes,
    has_pdf: !!row.pdf_path,
    is_overdue: row.status === "sent" && !!row.due_on && row.due_on < today,
  }));
}

export async function createInvoice(formData: FormData) {
  const orgId = (formData.get("organization_id") as string) || "";
  const reference = ((formData.get("reference") as string) || "").trim();
  const amountRaw = ((formData.get("amount") as string) || "").trim();
  const currency = ((formData.get("currency") as string) || "EUR").trim();
  const issuedOn = (formData.get("issued_on") as string) || "";
  const dueOn = ((formData.get("due_on") as string) || "").trim();
  const notes = ((formData.get("notes") as string) || "").trim();
  const send = formData.get("send") === "on";
  const pdf = formData.get("pdf") as File | null;

  const fail = (message: string) =>
    redirect(`${PAGE}?error=${encodeURIComponent(message)}`);

  if (!orgId) fail("Choose the client this invoice is for.");
  if (!reference) fail("Give the invoice a reference.");
  if (!issuedOn) fail("Set an issue date.");

  // Money arrives as a decimal string from a number input. Rounding at cent
  // scale keeps 12.34 from landing as 1233.
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount < 0) {
    fail("Enter the amount as a positive number.");
  }
  const amountCents = Math.round(amount * 100);

  if (dueOn && dueOn < issuedOn) {
    fail("The due date cannot be before the issue date.");
  }

  const { db } = await requireFoxStaff();

  let pdfPath: string | null = null;
  if (pdf && pdf.size > 0) {
    if (pdf.type !== "application/pdf") fail("The invoice file must be a PDF.");
    if (pdf.size > 16_777_216) fail("That PDF is over 16 MB.");

    const safe = pdf.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
    pdfPath = `${orgId}/${crypto.randomUUID()}-${safe}`;

    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(pdfPath, pdf, { contentType: pdf.type, upsert: false });

    if (uploadError) fail(`Could not upload the PDF: ${uploadError.message}`);
  }

  const { error } = await db.from("invoices").insert({
    organization_id: orgId,
    reference,
    status: send ? "sent" : "draft",
    amount_cents: amountCents,
    currency: currency.toUpperCase(),
    issued_on: issuedOn,
    due_on: dueOn || null,
    notes: notes || null,
    pdf_path: pdfPath,
  });

  if (error) {
    if (pdfPath) await db.storage.from(BUCKET).remove([pdfPath]);
    fail(
      error.code === "23505"
        ? `There is already an invoice numbered ${reference} for that client.`
        : `Could not save the invoice: ${error.message}`
    );
  }

  revalidatePath(PAGE);
  redirect(
    `${PAGE}?success=${encodeURIComponent(
      send ? `${reference} raised and sent` : `${reference} saved as a draft`
    )}`
  );
}

/**
 * Move an invoice between states. paid_on is set and cleared here rather than
 * by the caller, because the table's check constraint requires it to agree
 * with status and a form has no business deciding that.
 */
export async function setInvoiceStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as StaffInvoice["status"];

  const fail = (message: string) =>
    redirect(`${PAGE}?error=${encodeURIComponent(message)}`);

  if (!["draft", "sent", "paid", "void"].includes(status)) {
    fail("Unknown invoice status.");
  }

  const { db } = await requireFoxStaff();

  const { error } = await db
    .from("invoices")
    .update({
      status,
      paid_on: status === "paid" ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", id);

  if (error) fail(`Could not update the invoice: ${error.message}`);

  const LABEL: Record<string, string> = {
    draft: "moved back to draft",
    sent: "marked as awaiting payment",
    paid: "marked paid",
    void: "cancelled",
  };

  revalidatePath(PAGE);
  redirect(`${PAGE}?success=${encodeURIComponent(`Invoice ${LABEL[status]}`)}`);
}

export async function downloadStaffInvoice(formData: FormData) {
  const id = formData.get("id") as string;
  const { db } = await requireFoxStaff();

  const { data: invoice } = await db
    .from("invoices")
    .select("pdf_path")
    .eq("id", id)
    .maybeSingle();

  if (!invoice?.pdf_path) redirect(`${PAGE}?error=There+is+no+PDF+for+that+invoice`);

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
