import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@fox/supabase/client/server";
import { extractSopConfig, SopExtractionError } from "@/lib/sop-extraction";
import {
  extractSopProcedure,
  countSteps,
  ProcedureExtractionError,
} from "@/lib/sop-procedure";

// POST /api/sop-analyse
//
// multipart/form-data: `file` (a PDF), optional `action_type_code`.
//
// One SOP describes one kind of job, so one upload produces everything that
// job needs: which fields and modules the technician sees, and the procedure
// they work through. Previously the same document had to be uploaded twice on
// two different pages, and neither import knew about the other.
//
// Nothing is saved to the service type here — the manager reviews and
// publishes. The SOP itself is stored, and the extraction recorded.

// Config extraction takes ~20s and the procedure ~80s; they run in parallel,
// so the request is bounded by the slower one. Well past Vercel's default.
export const maxDuration = 300;

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

function safeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "sop.pdf";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "sop.pdf";
}

/**
 * A URL-safe code derived from the SOP's own name, since a new service type
 * needs one and the manager should not have to invent it.
 */
function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 48) || "service_type"
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  // The middleware matcher does not cover /api, so resolve the session here.
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

  // Absent when the SOP is being imported as a brand new service type.
  const targetCode = String(form.get("action_type_code") ?? "").trim();

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
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return fail("That file does not look like a PDF.", 415);
  }

  // Label the prompt with the target type where there is one; otherwise the
  // SOP is describing a job we have no name for yet.
  let serviceTypeLabel = "this";
  if (targetCode) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: option } = await (supabase as any)
      .from("configurable_field_options")
      .select("label")
      .eq("organization_id", organizationId)
      .eq("field_key", "action_type")
      .eq("code", targetCode)
      .maybeSingle();
    serviceTypeLabel =
      option?.label ?? DEFAULT_ACTION_TYPE_LABELS[targetCode] ?? targetCode;
  }

  // ── Store the SOP ──────────────────────────────────────────────────

  const fileName = safeFileName(file.name);
  const storagePath = `${organizationId}/${crypto.randomUUID()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("sop-documents")
    .upload(storagePath, bytes, { contentType: "application/pdf" });

  if (uploadError) {
    console.error("[sop-analyse] upload failed:", uploadError);
    return fail("Could not store the SOP.", 502);
  }

  // ── Extract ────────────────────────────────────────────────────────

  const base64 = bytes.toString("base64");

  // Run in parallel rather than merging into one schema: each stays focused,
  // neither risks the token ceiling, and the wall clock is the slower of the
  // two instead of their sum.
  const [configResult, procedureResult] = await Promise.allSettled([
    extractSopConfig(base64, serviceTypeLabel),
    extractSopProcedure(base64),
  ]);

  if (configResult.status === "rejected" || procedureResult.status === "rejected") {
    await supabase.storage.from("sop-documents").remove([storagePath]);

    const reason =
      configResult.status === "rejected"
        ? configResult.reason
        : (procedureResult as PromiseRejectedResult).reason;

    if (
      reason instanceof SopExtractionError ||
      reason instanceof ProcedureExtractionError
    ) {
      return fail(reason.message, reason.status);
    }
    console.error("[sop-analyse] extraction failed:", reason);
    return fail("Could not read the SOP.", 502);
  }

  const config = configResult.value;
  const procedure = procedureResult.value;

  if (countSteps(procedure) === 0) {
    await supabase.storage.from("sop-documents").remove([storagePath]);
    return fail(
      "No procedure steps were found in that document. It may be a policy or reference document rather than a procedure.",
      422,
    );
  }

  // ── Record the import ──────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error: insertError } = await (supabase as any)
    .from("sop_imports")
    .insert({
      organization_id: organizationId,
      // Blank until the manager decides which type this becomes.
      action_type_code: targetCode || slugify(procedure.service_type_name),
      storage_path: storagePath,
      file_name: fileName,
      extracted: { config, procedure },
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[sop-analyse] audit insert failed:", insertError);
    return fail("Could not record the import.", 502);
  }

  return NextResponse.json({
    import_id: row.id,
    file_name: fileName,
    // What this SOP suggests calling the service type, when creating a new one.
    suggested_name: procedure.service_type_name,
    suggested_code: slugify(procedure.service_type_name),
    target_code: targetCode || null,
    config,
    procedure,
  });
}
