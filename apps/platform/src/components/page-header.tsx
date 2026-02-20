import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-stone-400">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
