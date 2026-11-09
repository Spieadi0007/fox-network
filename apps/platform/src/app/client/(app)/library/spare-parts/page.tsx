import { Wrench } from "lucide-react";
import { getClientSpareParts } from "@fox/supabase/actions/client-spare-parts";
import { AddPartPanel } from "./add-part-panel";
import { EmptyState, Notice, PageHeader } from "../../portal-ui";
import { DeletePart } from "./delete-part";

export default async function SparePartsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const parts = await getClientSpareParts();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Spare parts"
        sub="The parts you keep on site. A picture settles which component is meant faster than a description does."
      />

      {success && <Notice tone="success">{success}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <AddPartPanel />

      {parts.length === 0 ? (
        <EmptyState
          title="No parts listed yet"
          body="Add the spares you hold so our technicians know what is already on site before they travel."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parts.map((part) => (
            <li
              key={part.id}
              className="overflow-hidden rounded-2xl border border-portal-border bg-portal-surface"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-portal-sunken">
                {part.image_url ? (
                  <img
                    src={part.image_url}
                    alt={part.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Wrench className="h-8 w-8 text-portal-muted" />
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-portal-text">
                      {part.name}
                    </p>
                    <p className="mt-0.5 text-xs text-portal-dim">
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
                  <p className="mt-2 text-xs leading-relaxed text-portal-dim">
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
