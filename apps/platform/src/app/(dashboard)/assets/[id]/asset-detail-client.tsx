import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export function AssetDetailClient({
  assetId,
  canEdit,
}: {
  assetId: string;
  canEdit: boolean;
}) {
  if (!canEdit) return null;

  return (
    <div className="flex justify-end">
      <Link href={`/assets/${assetId}/edit`}>
        <Button variant="outline">
          <Pencil className="mr-1.5 h-4 w-4" />
          Edit
        </Button>
      </Link>
    </div>
  );
}
