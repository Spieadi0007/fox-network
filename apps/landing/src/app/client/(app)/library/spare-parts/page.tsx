import { Wrench } from "lucide-react";
import { getClientSpareParts } from "@fox/supabase/actions/client-spare-parts";
import { AddPartPanel } from "./add-part-panel";
import { DeletePart } from "./delete-part";

export default async function SparePartsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const parts = await getClientSpareParts();

  return (
    <div>
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          Spare parts
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          The parts you keep on site. A picture settles which component is
          meant faster than a description does.
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

      <AddPartPanel />

      {parts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-stone-900">
            No parts listed yet
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Add the spares you hold so our technicians know what is already on
            site before they travel.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parts.map((part) => (
            <li
              key={part.id}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-stone-50">
                {part.image_url ? (
                  <img
                    src={part.image_url}
                    alt={part.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Wrench className="h-8 w-8 text-stone-300" />
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900">
                      {part.name}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {[
                        part.part_number,
                        part.quantity != null ? `${part.quantity} in stock` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "No part number"}
                    </p>
                  </div>
                  <DeletePart id={part.id} name={part.name} />
                </div>

                {part.notes && (
                  <p className="mt-2 text-xs leading-relaxed text-stone-500">
                    {part.notes}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
