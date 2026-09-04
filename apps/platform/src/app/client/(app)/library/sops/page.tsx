import { FileText, FileImage, File as FileIcon } from "lucide-react";
import {
  getClientDocuments,
  downloadClientDocument,
} from "@fox/supabase/actions/client-documents";
import { SubmitButton } from "@/components/ui/submit-button";
import { UploadPanel } from "./upload-panel";
import { DeleteDocument } from "./delete-document";

function formatSize(bytes: number | null) {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function iconFor(mime: string | null) {
  if (mime?.startsWith("image/")) return FileImage;
  if (mime === "application/pdf") return FileText;
  return FileIcon;
}

export default async function ClientLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const documents = await getClientDocuments();

  return (
    <div>
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          Library
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Your standard operating procedures and reference documents. Our team
          works to what you put here.
        </p>
      </div>

      {success && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <UploadPanel />

      {documents.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-stone-900">
            Nothing here yet
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Upload the procedures you want followed on site — PDFs, Word
            documents or photographs of a printed sheet.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {documents.map((doc) => {
            const Icon = iconFor(doc.mime_type);
            const size = formatSize(doc.size_bytes);

            return (
              <li
                key={doc.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
                  <Icon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900">
                    {doc.file_name}
                  </p>
                  {doc.description && (
                    <p className="mt-0.5 truncate text-xs text-stone-500">
                      {doc.description}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-stone-400">
                    {[
                      size,
                      `uploaded ${formatDate(doc.created_at)}`,
                      doc.uploaded_by_name ? `by ${doc.uploaded_by_name}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <form action={downloadClientDocument}>
                    <input type="hidden" name="id" value={doc.id} />
                    <SubmitButton
                      pendingLabel="Opening…"
                      className="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
                    >
                      Download
                    </SubmitButton>
                  </form>
                  <DeleteDocument id={doc.id} name={doc.file_name} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
