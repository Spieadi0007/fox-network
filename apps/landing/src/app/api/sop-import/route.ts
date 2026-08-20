import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@fox/supabase/client/server";
import {
  extractSopConfig,
  SopExtractionError,
} from "@/lib/sop-extraction";

// POST /api/sop-import
//
// multipart/form-data: `file` (a PDF) + `action_type_code`.
//
// Stores the SOP, derives a proposed Field App config for that service type,
// and records both as a `sop_imports` row. Nothing is written to
// `field_app_config` here — the manager reviews the proposal first.

/** Mirrors the Anthropic API's request ceiling and the bucket's own limit. */
const MAX_BYTES = 32 * 1024 * 1024;

const DEFAULT_ACTION_TYPE_LABELS: Record<string, string> = {
  survey: "Survey",
  installation: "Installation",
  inspection: "Inspection",
  maintenance: "Maintenance",
  repair: "Repair",
  testing: "Testing",
  documentation: "Documentation",
  other: "Other",
};

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Strip anything that could escape the org folder or upset storage. */
function safeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "sop.pdf";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "sop.pdf";
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  // The middleware matcher does not cover /api, so there are no x-user-*
  // headers here and getAuthUser() would always return null. Resolve the
  // session directly instead.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Not authenticated.", 401);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single<{ role: string | null; organization_id: string | null }>();

  if (!profile?.organization_id) return fail("No organization.", 403);
  if (profile.role !== "admin" && profile.role !== "manager") {
    return fail("Only managers and admins can import SOPs.", 403);
  }
  const organizationId = profile.organization_id;

  // ── Input ──────────────────────────────────────────────────────────

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Expected multipart/form-data.", 400);
  }

  const actionTypeCode = String(form.get("action_type_code") ?? "").trim();
  if (!actionTypeCode) return fail("action_type_code is required.", 400);

  const file = form.get("file");
  if (!(file instanceof File)) return fail("file is required.", 400);
  if (file.type !== "application/pdf") {
    return fail("Only PDF files are supported.", 415);
  }
  if (file.size === 0) return fail("The uploaded file is empty.", 400);
  if (file.size > MAX_BYTES) {
    return fail(
      `The PDF is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 32 MB.`,
      413,
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  // Cheap sanity check that this really is a PDF, whatever the mime says.
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return fail("That file does not look like a PDF.", 415);
  }

  // Prefer the org's own label for this service type; fall back to the
  // built-in set so the prompt always names something human-readable.
  //
  // Queried inline rather than via getFieldOptions(): that module is
  // "use server", and importing a server action into a route handler makes
  // Next treat multipart POSTs here as Server Action invocations, which fails
  // with "Failed to find Server Action" before the handler ever runs.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: option } = await (supabase as any)
    .from("configurable_field_options")
    .select("label")
    .eq("organization_id", organizationId)
    .eq("field_key", "action_type")
    .eq("code", actionTypeCode)
    .maybeSingle();

  const serviceTypeLabel =
    option?.label ??
    DEFAULT_ACTION_TYPE_LABELS[actionTypeCode] ??
    actionTypeCode;

  // ── Store the SOP ──────────────────────────────────────────────────

  const fileName = safeFileName(file.name);
  const storagePath = `${organizationId}/${crypto.randomUUID()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("sop-documents")
    .upload(storagePath, bytes, { contentType: "application/pdf" });

  if (uploadError) {
    console.error("[sop-import] upload failed:", uploadError);
    return fail("Could not store the SOP.", 502);
  }

  // ── Extract ────────────────────────────────────────────────────────

  let extraction;
  try {
    extraction = await extractSopConfig(
      bytes.toString("base64"),
      serviceTypeLabel,
    );
  } catch (e) {
    // Don't leave an orphaned file behind if the model call failed.
    await supabase.storage.from("sop-documents").remove([storagePath]);

    if (e instanceof SopExtractionError) return fail(e.message, e.status);
    console.error("[sop-import] extraction failed:", e);
    return fail("Could not read the SOP.", 502);
  }

  // ── Record the proposal ────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error: insertError } = await (supabase as any)
    .from("sop_imports")
    .insert({
      organization_id: organizationId,
      action_type_code: actionTypeCode,
      storage_path: storagePath,
      file_name: fileName,
      extracted: extraction,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[sop-import] audit insert failed:", insertError);
    return fail("Could not record the import.", 502);
  }

  return NextResponse.json({
    import_id: row.id,
    action_type_code: actionTypeCode,
    service_type_label: serviceTypeLabel,
    file_name: fileName,
    extraction,
  });
}
