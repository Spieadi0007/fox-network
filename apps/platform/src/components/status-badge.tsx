const colorMap: Record<string, string> = {
  // Green
  active: "bg-emerald-50 text-emerald-600",
  completed: "bg-emerald-50 text-emerald-600",
  deployed: "bg-emerald-50 text-emerald-600",
  available: "bg-emerald-50 text-emerald-600",
  excellent: "bg-emerald-50 text-emerald-600",
  good: "bg-emerald-50 text-emerald-600",
  // Blue
  planned: "bg-sky-50 text-sky-600",
  draft: "bg-sky-50 text-sky-600",
  scheduled: "bg-sky-50 text-sky-600",
  pending: "bg-amber-50 text-amber-600",
  low: "bg-sky-50 text-sky-600",
  // Amber
  in_progress: "bg-amber-50 text-amber-600",
  on_hold: "bg-amber-50 text-amber-600",
  in_maintenance: "bg-amber-50 text-amber-600",
  medium: "bg-stone-100 text-stone-600",
  fair: "bg-amber-50 text-amber-600",
  // Red
  critical: "bg-red-50 text-red-600",
  high: "bg-red-50 text-red-600",
  blocked: "bg-red-50 text-red-600",
  poor: "bg-red-50 text-red-600",
  cancelled: "bg-red-50 text-red-600",
  // Gray
  decommissioned: "bg-stone-100 text-stone-500",
  retired: "bg-stone-100 text-stone-500",
  inactive: "bg-stone-100 text-stone-500",
};

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusBadge({ value }: { value: string }) {
  const classes = colorMap[value] ?? "bg-stone-100 text-stone-500";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {formatLabel(value)}
    </span>
  );
}
