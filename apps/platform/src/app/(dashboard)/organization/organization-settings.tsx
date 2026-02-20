"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserClient } from "@fox/supabase/client/browser";
import { updateOrganization } from "@fox/supabase/actions/organizations";
import { backfillCodes } from "@fox/supabase/actions/backfill-codes";
import { Loader2, Check, Upload, X, Hash } from "lucide-react";

type Org = {
  id: string;
  name: string;
  size: string;
  industry: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
};

const SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"];

export function OrganizationSettings({ org }: { org: Org }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState(org.logo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const orgInitial = org.name[0]?.toUpperCase() ?? "O";

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be under 2 MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${org.id}/logo.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("org-logos")
        .upload(path, file, { upsert: true });

      if (uploadErr) {
        setError(uploadErr.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("org-logos")
        .getPublicUrl(path);

      // Append cache-buster so the browser loads the new image
      const freshUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      setLogoUrl(freshUrl);
    } catch {
      setError("Failed to upload logo.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeLogo() {
    setLogoUrl("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      setError(null);
      setSaved(false);

      const values = {
        name: form.get("name") as string,
        size: form.get("size") as string,
        industry: (form.get("industry") as string) || null,
        website: (form.get("website") as string) || null,
        description: (form.get("description") as string) || null,
        logo_url: logoUrl || null,
      };

      if (!values.name.trim()) {
        setError("Organization name is required.");
        return;
      }

      const { error: err } = await updateOrganization(org.id, values);
      if (err) {
        setError(typeof err === "string" ? err : err.message ?? "Failed to update");
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);

  async function handleBackfill() {
    setBackfilling(true);
    setBackfillResult(null);
    try {
      const result = await backfillCodes();
      setBackfillResult(result.message);
      if (result.success) router.refresh();
    } catch {
      setBackfillResult("Failed to run backfill.");
    } finally {
      setBackfilling(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5">
        {/* Logo section */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-stone-400 mb-3">
            Logo
          </label>
          <div className="flex items-center gap-5">
            {/* Preview */}
            <div className="relative group">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={org.name}
                  className="h-20 w-20 rounded-xl object-cover border border-stone-200"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-stone-100 border border-stone-200">
                  <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-stone-400">
                    {orgInitial}
                  </span>
                </div>
              )}
              {logoUrl && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-stone-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Upload controls */}
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="h-9 rounded-lg bg-stone-100 px-4 text-xs font-medium text-stone-700 hover:bg-stone-200 border border-stone-200"
              >
                {uploading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                )}
                {uploading ? "Uploading..." : "Upload Logo"}
              </Button>
              <p className="text-[11px] text-stone-400">
                PNG, JPG or SVG. Max 2 MB.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-stone-400 mb-1.5">
            Organization Name *
          </label>
          <Input
            name="name"
            defaultValue={org.name}
            className="h-10 rounded-lg border-stone-200 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-stone-400 mb-1.5">
              Company Size
            </label>
            <select
              name="size"
              defaultValue={org.size}
              className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900"
            >
              {SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s} employees
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-stone-400 mb-1.5">
              Industry
            </label>
            <Input
              name="industry"
              defaultValue={org.industry ?? ""}
              placeholder="e.g. Telecommunications"
              className="h-10 rounded-lg border-stone-200 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-stone-400 mb-1.5">
            Website
          </label>
          <Input
            name="website"
            defaultValue={org.website ?? ""}
            placeholder="https://example.com"
            className="h-10 rounded-lg border-stone-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-stone-400 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={org.description ?? ""}
            rows={3}
            placeholder="Brief description of your organization..."
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-10 rounded-xl bg-stone-900 px-6 text-sm text-white hover:bg-stone-800"
      >
        {pending ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="mr-1.5 h-4 w-4" />
        ) : null}
        {saved ? "Saved" : "Save Changes"}
      </Button>
    </form>

    {/* Backfill codes section */}
    <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-stone-400" />
        <h3 className="text-sm font-semibold text-stone-900">Generate Codes</h3>
      </div>
      <p className="text-sm text-stone-500">
        Generate hierarchical codes for existing locations, projects, and actions that don&apos;t have one yet.
      </p>
      {backfillResult && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-sm text-stone-700">{backfillResult}</p>
        </div>
      )}
      <Button
        type="button"
        onClick={handleBackfill}
        disabled={backfilling}
        className="h-10 rounded-xl bg-stone-900 px-6 text-sm text-white hover:bg-stone-800"
      >
        {backfilling ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Hash className="mr-1.5 h-4 w-4" />}
        {backfilling ? "Generating..." : "Generate Missing Codes"}
      </Button>
    </div>
    </div>
  );
}
