import { cn } from "@/lib/cn";

/**
 * Labelled form field wrapper. Renders a label above its control and acts as
 * a single grid cell — pass col-span utilities via `className` when the field
 * should span multiple columns.
 */
export function Field({
  label,
  required,
  hint,
  htmlFor,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-xs font-medium text-stone-600"
      >
        {label}
        {required && <span className="text-red-400">*</span>}
        {hint && <span className="font-normal text-stone-400">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}
