"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "../client/server";

const BUCKET = "client-documents";

/** Mirrors the bucket's allowed_mime_types, so a rejection is explainable. */
const ACCEPTED: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "Word document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word document",
  "image/png": "PNG image",
  "image/jpeg": "JPEG image",
};

const MAX_BYTES = 33_554_432; // 32 MB, matching the bucket's file_size_limit

export type ClientDocument = {
  id: string;
  file_name: string;
  description: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
  uploaded_by_name: string | null;
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

  return { db, userId: user.id, orgId: profile.organization_id as string };
}

export async function getClientDocuments(): Promise<ClientDocument[]> {
  const { db, orgId } = await requireOrg();

  const { data } = await db
    .from("client_documents")
    .select(
      "id, file_name, description, mime_type, size_bytes, created_at, uploaded_by:profiles(name)"
    )
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    id: row.id,
    file_name: row.file_name,
    description: row.description,
    mime_type: row.mime_type,
    size_bytes: row.size_bytes,
    created_at: row.created_at,
    uploaded_by_name: row.uploaded_by?.name ?? null,
  }));
}

export async function uploadClientDocument(formData: FormData) {
  const file = formData.get("file") as File | null;
  const description = ((formData.get("description") as string) || "").trim();

  const fail = (message: string) =>
    redirect(`/client/library?error=${encodeURIComponent(message)}`);

  if (!file || file.size === 0) fail("Choose a file to upload.");

  // Checked here as well as at the storage layer: a bucket rejection surfaces
  // as an opaque error, and the person needs to know which rule they hit.
  if (!ACCEPTED[file!.type]) {
    fail(
      `${file!.type || "That file type"} isn't supported. Upload a PDF, Word document, or an image.`
    );
  }
  if (file!.size > MAX_BYTES) {
    fail(
      `That file is ${formatSize(file!.size)}. The limit is 32 MB — split it or compress it.`
    );
  }

  const { db, userId, orgId } = await requireOrg();

  // The object name must be unique and safe; the name the person typed is
  // kept in the table so the UI can still show it.
  const safe = file!.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
  const path = `${orgId}/${crypto.randomUUID()}-${safe}`;

  const { error: uploadError } = await db.storage
    .from(BUCKET)
    .upload(path, file!, { contentType: file!.type, upsert: false });

  if (uploadError) fail(`Upload failed: ${uploadError.message}`);

  const { error: insertError } = await db.from("client_documents").insert({
    organization_id: orgId,
    storage_path: path,
    file_name: file!.name,
    mime_type: file!.type,
    size_bytes: file!.size,
    description: description || null,
    uploaded_by: userId,
  });

  if (insertError) {
    // Don't leave an orphan in the bucket that nothing references.
    await db.storage.from(BUCKET).remove([path]);
    fail(`Could not save the document: ${insertError.message}`);
  }

  revalidatePath("/client/library");
  redirect("/client/library?success=Document+uploaded");
}

export async function downloadClientDocument(formData: FormData) {
  const id = formData.get("id") as string;
  const { db, orgId } = await requireOrg();

  const { data: doc } = await db
    .from("client_documents")
    .select("storage_path")
    .eq("id", id)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (!doc) redirect("/client/library?error=That+document+no+longer+exists");

  // The bucket is private, so the file is reached through a short-lived signed
  // URL rather than a public path.
  const { data: signed, error } = await db.storage
    .from(BUCKET)
    .createSignedUrl(doc.storage_path, 60);

  if (error || !signed?.signedUrl) {
    redirect(
      `/client/library?error=${encodeURIComponent(error?.message ?? "Could not open that document")}`
    );
  }

  redirect(signed.signedUrl);
}

export async function deleteClientDocument(formData: FormData) {
  const id = formData.get("id") as string;
  const { db, orgId } = await requireOrg();

  const { data: doc } = await db
    .from("client_documents")
    .select("storage_path")
    .eq("id", id)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (!doc) redirect("/client/library?error=That+document+no+longer+exists");

  const { error } = await db
    .from("client_documents")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) {
    redirect(`/client/library?error=${encodeURIComponent(error.message)}`);
  }

  // The row is the catalogue; a leftover object is invisible but still costs
  // storage, so it goes too. A failure here is not worth blocking on.
  await db.storage.from(BUCKET).remove([doc.storage_path]);

  revalidatePath("/client/library");
  redirect("/client/library?success=Document+deleted");
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
