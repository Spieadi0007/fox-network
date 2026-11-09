import { FileText, FileImage, File as FileIcon } from "lucide-react";
import {
  getClientDocuments,
  downloadClientDocument,
} from "@fox/supabase/actions/client-documents";
import { SubmitButton } from "@/components/ui/submit-button";
import { UploadPanel } from "./upload-panel";
import { EmptyState, Notice, PageHeader, buttonSecondary } from "../../portal-ui";
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
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Library"
        sub="Your standard operating procedures and reference documents. Our team works to what you put here."
      />

      {success && <Notice tone="success">{success}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <UploadPanel />

      {documents.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          body="Upload the procedures you want followed on site — PDFs, Word documents or photographs of a printed sheet."
        />
      ) : (
        <ul className="divide-y divide-portal-border-soft overflow-hidden rounded-2xl border border-portal-border bg-portal-surface">
          {documents.map((doc) => {
            const Icon = iconFor(doc.mime_type);
            const size = formatSize(doc.size_bytes);

            return (
              <li
                key={doc.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-portal-sunken text-portal-dim">
                  <Icon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-portal-text">
                    {doc.file_name}
                  </p>
                  {doc.description && (
                    <p className="mt-0.5 truncate text-xs text-portal-dim">
                      {doc.description}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-portal-muted">
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
                      className={buttonSecondary}
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
