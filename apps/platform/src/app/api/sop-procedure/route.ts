import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@fox/supabase/client/server";
import {
  extractSopProcedure,
  countSteps,
  ProcedureExtractionError,
} from "@/lib/sop-procedure";

// POST /api/sop-procedure
//
// multipart/form-data: `file` (a PDF) + `action_type_code`.
//
// Reads the SOP's procedure and returns it for review. Nothing is saved —
// the manager edits the draft and saves it from the Procedures page, which
// is what creates the template version.

// Reading a long SOP into a full procedure runs to about 80 seconds.
// Vercel's default function timeout kills it well before that.
// 300s is the Vercel Pro ceiling; Hobby caps at 60s, which is not enough.
export const maxDuration = 300;

const MAX_BYTES = 32 * 1024 * 1024;

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function safeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "sop.pdf";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "sop.pdf";
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  // No x-user-* headers here: the middleware matcher does not cover /api.
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
    return fail("Only managers and admins can import procedures.", 403);
  }
  const organizationId = profile.organization_id;

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
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return fail("That file does not look like a PDF.", 415);
  }

  const fileName = safeFileName(file.name);
  const storagePath = `${organizationId}/${crypto.randomUUID()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("sop-documents")
    .upload(storagePath, bytes, { contentType: "application/pdf" });

  if (uploadError) {
    console.error("[sop-procedure] upload failed:", uploadError);
    return fail("Could not store the SOP.", 502);
  }

  let procedure;
  try {
    procedure = await extractSopProcedure(bytes.toString("base64"));
  } catch (e) {
    await supabase.storage.from("sop-documents").remove([storagePath]);
    if (e instanceof ProcedureExtractionError) return fail(e.message, e.status);
    console.error("[sop-procedure] extraction failed:", e);
    return fail("Could not read the SOP.", 502);
  }

  if (countSteps(procedure) === 0) {
    await supabase.storage.from("sop-documents").remove([storagePath]);
    return fail(
      "No procedure steps were found in that document. It may be a policy or reference document rather than a procedure.",
      422,
    );
  }

  // Recorded so the saved template can point back at the source document.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (supabase as any)
    .from("sop_imports")
    .insert({
      organization_id: organizationId,
      action_type_code: actionTypeCode,
      storage_path: storagePath,
      file_name: fileName,
      extracted: procedure,
      created_by: user.id,
    })
    .select("id")
    .single();

  return NextResponse.json({
    import_id: row?.id ?? null,
    action_type_code: actionTypeCode,
    file_name: fileName,
    procedure,
  });
}
