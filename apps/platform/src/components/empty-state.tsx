import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-white px-6 py-20 text-center">
      <div className="h-12 w-12 rounded-full bg-stone-100 mb-4" />
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      <p className="mt-1 text-sm text-stone-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
