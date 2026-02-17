import { cn } from "@/lib/cn";

interface GradientBlobProps {
  className?: string;
  color?: "indigo" | "purple" | "blue";
}

const colors = {
  indigo: "from-indigo-200/40 to-indigo-400/20",
  purple: "from-purple-200/40 to-purple-400/20",
  blue: "from-blue-200/40 to-blue-400/20",
};

export function GradientBlob({ className, color = "indigo" }: GradientBlobProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute h-72 w-72 rounded-full bg-gradient-to-br blur-3xl",
        colors[color],
        className,
      )}
      aria-hidden
    />
  );
}
