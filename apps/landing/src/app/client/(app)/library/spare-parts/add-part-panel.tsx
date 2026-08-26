"use client";

import { useRef, useState } from "react";
import { Plus, ImagePlus, X } from "lucide-react";
import { addClientSparePart } from "@fox/supabase/actions/client-spare-parts";
import { SubmitButton } from "@/components/ui/submit-button";

const FIELD =
  "mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange";
const LABEL = "block text-xs font-medium text-stone-600";

export function AddPartPanel() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function choose(file: File | null) {
    // Revoking the previous object URL keeps a long session from leaking one
    // per picture the person tries.
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function clearImage() {
    if (inputRef.current) inputRef.current.value = "";
    choose(null);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
      >
        <Plus className="h-4 w-4" />
        Add a part
      </button>
    );
  }

  return (
    <form
      action={addClientSparePart}
      className="mt-8 rounded-2xl border border-stone-200 bg-white p-5"
    >
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="shrink-0">
          <span className={LABEL}>Picture</span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="relative mt-1 flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 transition-colors hover:border-stone-300"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Selected part"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus className="h-5 w-5 text-stone-400" />
            )}
          </button>
          {preview && (
            <button
              type="button"
              onClick={clearImage}
              className="mt-1 inline-flex cursor-pointer items-center gap-1 text-[11px] text-stone-500 hover:text-stone-800"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          )}
          <input
            ref={inputRef}
            id="image"
            name="image"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => choose(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </div>

        <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className={LABEL}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={120}
              placeholder="Grey filter housing"
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="part_number" className={LABEL}>
              Part number <span className="text-stone-400">(optional)</span>
            </label>
            <input
              id="part_number"
              name="part_number"
              type="text"
              maxLength={60}
              placeholder="FH-2201"
              className={FIELD}
            />
          </div>

          <div>
            <label htmlFor="quantity" className={LABEL}>
              In stock <span className="text-stone-400">(optional)</span>
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              step={1}
              placeholder="4"
              className={FIELD}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="notes" className={LABEL}>
              Notes <span className="text-stone-400">(optional)</span>
            </label>
            <input
              id="notes"
              name="notes"
              type="text"
              maxLength={200}
              placeholder="Stored in the plant room cabinet"
              className={FIELD}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <SubmitButton
          pendingLabel="Adding…"
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
        >
          Add part
        </SubmitButton>
        <button
          type="button"
          onClick={() => {
            clearImage();
            setOpen(false);
          }}
          className="cursor-pointer text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
