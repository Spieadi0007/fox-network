"use client";

import { cn } from "@/lib/cn";
import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeInUp, viewportConfig } from "@/lib/animations";

type HeadingLevel = "h1" | "h2" | "h3";

interface HeadingProps extends Omit<HTMLMotionProps<"h1">, "children"> {
  as?: HeadingLevel;
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

const styles: Record<HeadingLevel, string> = {
  h1: "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-950 leading-[1.1]",
  h2: "text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-950 leading-[1.15]",
  h3: "text-xl sm:text-2xl font-semibold tracking-tight text-neutral-950 leading-[1.2]",
};

export function Heading({
  as: Tag = "h2",
  children,
  className,
  animate = true,
  ...rest
}: HeadingProps) {
  const Component = motion.create(Tag);
  return (
    <Component
      className={cn(styles[Tag], className)}
      variants={animate ? fadeInUp : undefined}
      initial={animate ? "hidden" : undefined}
      whileInView={animate ? "visible" : undefined}
      viewport={animate ? viewportConfig : undefined}
      {...rest}
    >
      {children}
    </Component>
  );
}
