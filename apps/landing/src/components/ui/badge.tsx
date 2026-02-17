import { cn } from "@/lib/cn";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-fox-orange/20 bg-fox-orange/5 px-3.5 py-1 text-xs font-medium text-fox-orange",
        className,
      )}
    >
      {children}
    </span>
  );
}
