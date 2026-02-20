import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export function ProjectDetailClient({
  projectId,
  canEdit,
}: {
  projectId: string;
  canEdit: boolean;
}) {
  if (!canEdit) return null;

  return (
    <div className="flex justify-end">
      <Link href={`/projects/${projectId}/edit`}>
        <Button variant="outline">
          <Pencil className="mr-1.5 h-4 w-4" />
          Edit
        </Button>
      </Link>
    </div>
  );
}
