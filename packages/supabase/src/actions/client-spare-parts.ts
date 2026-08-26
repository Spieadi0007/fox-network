"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "../client/server";

// Images share the client-documents bucket, under a `spare-parts/` subfolder.
// The bucket's policies are folder-scoped to the organisation, so a second
// bucket would duplicate them for no gain.
const BUCKET = "client-documents";
const PAGE = "/client/library/spare-parts";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg"]);
const MAX_BYTES = 33_554_432;

export type ClientSparePart = {
  id: string;
  name: string;
  part_number: string | null;
  quantity: number | null;
  notes: string | null;
  image_url: string | null;
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

export async function getClientSpareParts(): Promise<ClientSparePart[]> {
  const { db, orgId } = await requireOrg();

  const { data } = await db
    .from("client_spare_parts")
    .select("id, name, part_number, quantity, notes, image_path")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  const rows = data ?? [];

  // The bucket is private, so thumbnails need signed URLs. One batch call
  // rather than one per row.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paths = rows.map((r: any) => r.image_path).filter(Boolean) as string[];

  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data: urls } = await db.storage
      .from(BUCKET)
      .createSignedUrls(paths, 3600);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const u of urls ?? []) {
      if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    part_number: row.part_number,
    quantity: row.quantity,
    notes: row.notes,
    image_url: row.image_path ? (signed.get(row.image_path) ?? null) : null,
  }));
}

export async function addClientSparePart(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim();
  const partNumber = ((formData.get("part_number") as string) || "").trim();
  const quantityRaw = ((formData.get("quantity") as string) || "").trim();
  const notes = ((formData.get("notes") as string) || "").trim();
  const image = formData.get("image") as File | null;

  const fail = (message: string) =>
    redirect(`${PAGE}?error=${encodeURIComponent(message)}`);

  if (!name) fail("Give the part a name.");

  const quantity = quantityRaw === "" ? null : Number(quantityRaw);
  if (quantity !== null && (!Number.isInteger(quantity) || quantity < 0)) {
    fail("Quantity must be a whole number, or left blank.");
  }

  const { db, userId, orgId } = await requireOrg();

  let imagePath: string | null = null;
  if (image && image.size > 0) {
    if (!IMAGE_TYPES.has(image.type)) {
      fail("The picture must be a PNG or JPEG.");
    }
    if (image.size > MAX_BYTES) {
      fail("That picture is over 32 MB. Use a smaller one.");
    }

    const safe = image.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
    imagePath = `${orgId}/spare-parts/${crypto.randomUUID()}-${safe}`;

    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(imagePath, image, { contentType: image.type, upsert: false });

    if (uploadError) fail(`Could not upload the picture: ${uploadError.message}`);
  }

  const { error } = await db.from("client_spare_parts").insert({
    organization_id: orgId,
    name,
    part_number: partNumber || null,
    quantity,
    notes: notes || null,
    image_path: imagePath,
    created_by: userId,
  });

  if (error) {
    // Don't leave an image in the bucket that nothing references.
    if (imagePath) await db.storage.from(BUCKET).remove([imagePath]);
    fail(`Could not save the part: ${error.message}`);
  }

  revalidatePath(PAGE);
  redirect(`${PAGE}?success=Part+added`);
}

export async function deleteClientSparePart(formData: FormData) {
  const id = formData.get("id") as string;
  const { db, orgId } = await requireOrg();

  const { data: part } = await db
    .from("client_spare_parts")
    .select("image_path")
    .eq("id", id)
    .eq("organization_id", orgId)
    .maybeSingle();

  if (!part) redirect(`${PAGE}?error=That+part+no+longer+exists`);

  const { error } = await db
    .from("client_spare_parts")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) redirect(`${PAGE}?error=${encodeURIComponent(error.message)}`);

  if (part.image_path) {
    await db.storage.from(BUCKET).remove([part.image_path]);
  }

  revalidatePath(PAGE);
  redirect(`${PAGE}?success=Part+removed`);
}
