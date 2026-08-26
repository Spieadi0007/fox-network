"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadClientDocument } from "@fox/supabase/actions/client-documents";
import { SubmitButton } from "@/components/ui/submit-button";

const ACCEPT = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
const MAX_BYTES = 33_554_432;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [tooBig, setTooBig] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function choose(next: File | null) {
    setFile(next);
    setTooBig(!!next && next.size > MAX_BYTES);
  }

  // The file input is the source of truth for the form, so a dropped file has
  // to be written back into it rather than just held in state.
  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (!dropped || !inputRef.current) return;
    inputRef.current.files = event.dataTransfer.files;
    choose(dropped);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    choose(null);
  }

  return (
    <form
      action={uploadClientDocument}
      className="mt-8 rounded-2xl border border-stone-200 bg-white p-5"
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragging
            ? "border-fox-orange bg-orange-50/50"
            : "border-stone-200 bg-stone-50/50"
        }`}
      >
        <input
          ref={inputRef}
          id="file"
          name="file"
          type="file"
          accept={ACCEPT}
          required
          onChange={(e) => choose(e.target.files?.[0] ?? null)}
          className="sr-only"
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <div className="text-left">
              <p className="text-sm font-medium text-stone-900">{file.name}</p>
              <p className="text-xs text-stone-500">{formatSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={clear}
              aria-label="Remove selected file"
              className="cursor-pointer rounded-full p-1 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-6 w-6 text-stone-400" />
            <p className="mt-3 text-sm text-stone-600">
              Drag a document here, or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="cursor-pointer font-medium text-fox-orange hover:underline"
              >
                browse
              </button>
            </p>
            <p className="mt-1 text-xs text-stone-400">
              PDF, Word or image · up to 32 MB
            </p>
          </>
        )}
      </div>

      {tooBig && (
        <p className="mt-3 text-sm text-red-600">
          That file is {formatSize(file!.size)}. The limit is 32 MB — split it
          or compress it before uploading.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="description"
            className="block text-xs font-medium text-stone-600"
          >
            Note <span className="text-stone-400">(optional)</span>
          </label>
          <input
            id="description"
            name="description"
            type="text"
            maxLength={200}
            placeholder="Supersedes v2 · applies to Zone 4"
            className="mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange"
          />
        </div>
        <SubmitButton
          pendingLabel="Uploading…"
          disabled={!file || tooBig}
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Upload
        </SubmitButton>
      </div>
    </form>
  );
}
