"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Archive, RotateCcw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  upsertPart,
  retirePart,
  restorePart,
} from "@fox/supabase/actions/parts";

type Part = {
  id: string;
  part_number: string;
  name: string;
  unit: string;
  is_active: boolean;
};

const BLANK = { part_number: "", name: "", unit: "each" };

export function PartsManager({ parts }: { parts: Part[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState(BLANK);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const active = parts.filter((p) => p.is_active);
  const retired = parts.filter((p) => !p.is_active);

  function save() {
    setError(null);
    startTransition(async () => {
      const { error: err } = await upsertPart({
        id: editingId ?? undefined,
        ...draft,
      });
      if (err) {
        setError(
          err.message?.includes("idx_parts_org_number")
            ? `Part number ${draft.part_number} is already in the catalog.`
            : (err.message ?? "Could not save the part."),
        );
        return;
      }
      setDraft(BLANK);
      setEditingId(null);
      router.refresh();
    });
  }

  const input =
    "rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[8rem]">
            <label className="text-xs text-stone-500">Part number</label>
            <input
              value={draft.part_number}
              onChange={(e) =>
                setDraft({ ...draft, part_number: e.target.value })
              }
              placeholder="VLT-HMI-1010"
              className={`mt-1 w-full font-mono ${input}`}
            />
          </div>
          <div className="flex-[2] min-w-[12rem]">
            <label className="text-xs text-stone-500">Name</label>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="HMI display assembly, 10.1&quot;"
              className={`mt-1 w-full ${input}`}
            />
          </div>
          <div className="w-24">
            <label className="text-xs text-stone-500">Unit</label>
            <input
              value={draft.unit}
              onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
              placeholder="each"
              className={`mt-1 w-full ${input}`}
            />
          </div>
          <Button
            onClick={save}
            disabled={pending || !draft.part_number.trim() || !draft.name.trim()}
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {editingId ? "Save" : "Add part"}
          </Button>
          {editingId && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setDraft(BLANK);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      {active.length === 0 && retired.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 px-5 py-12 text-center">
          <Package className="mx-auto h-6 w-6 text-stone-300" />
          <p className="mt-2 text-sm font-medium text-stone-600">
            No parts yet
          </p>
          <p className="mx-auto mt-1 max-w-md text-xs text-stone-400">
            Add them here, or import an SOP from Procedures and we&rsquo;ll
            offer the parts it names.
          </p>
        </div>
      ) : (
        <PartTable
          rows={active}
          pending={pending}
          onEdit={(p) => {
            setEditingId(p.id);
            setDraft({
              part_number: p.part_number,
              name: p.name,
              unit: p.unit,
            });
          }}
          onToggle={(p) =>
            startTransition(async () => {
              await retirePart(p.id);
              router.refresh();
            })
          }
          toggleIcon={<Archive className="h-3.5 w-3.5" />}
          toggleLabel="Retire"
        />
      )}

      {retired.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
            Retired ({retired.length})
          </p>
          <PartTable
            rows={retired}
            pending={pending}
            dimmed
            onToggle={(p) =>
              startTransition(async () => {
                await restorePart(p.id);
                router.refresh();
              })
            }
            toggleIcon={<RotateCcw className="h-3.5 w-3.5" />}
            toggleLabel="Restore"
          />
        </div>
      )}
    </div>
  );
}

function PartTable({
  rows,
  pending,
  dimmed,
  onEdit,
  onToggle,
  toggleIcon,
  toggleLabel,
}: {
  rows: Part[];
  pending: boolean;
  dimmed?: boolean;
  onEdit?: (p: Part) => void;
  onToggle: (p: Part) => void;
  toggleIcon: React.ReactNode;
  toggleLabel: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-stone-200 bg-white ${dimmed ? "opacity-60" : ""}`}
    >
      <div className="divide-y divide-stone-100">
        {rows.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-36 flex-shrink-0 font-mono text-xs text-stone-500">
              {p.part_number}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-stone-800">
              {p.name}
            </span>
            <span className="w-16 flex-shrink-0 text-xs text-stone-400">
              {p.unit}
            </span>
            {onEdit && (
              <button
                onClick={() => onEdit(p)}
                disabled={pending}
                className="flex-shrink-0 text-xs text-stone-400 hover:text-stone-700"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => onToggle(p)}
              disabled={pending}
              className="flex flex-shrink-0 items-center gap-1 text-xs text-stone-400 hover:text-stone-700"
            >
              {toggleIcon}
              {toggleLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
