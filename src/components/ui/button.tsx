import { cn } from "@/lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  shimmer?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  shimmer,
  className,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 cursor-pointer select-none";
  const variants = {
    primary:
      "bg-stone-900 text-white hover:bg-stone-800 shadow-sm shadow-stone-900/10",
    secondary:
      "bg-white text-stone-700 border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50 shadow-sm shadow-stone-200/20",
    ghost:
      "text-stone-600 hover:text-stone-900 hover:bg-stone-100/60",
  };
  const sizes = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2 text-[13px] gap-2",
    lg: "px-7 py-3 text-sm gap-2",
  };

  const classes = cn(
    base,
    variants[variant],
    sizes[size],
    shimmer && "shimmer-btn",
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
