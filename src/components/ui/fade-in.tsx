"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import type { ReactNode } from "react";

type FadeInProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
  readonly direction?: "up" | "left" | "none";
};

/**
 * Fades children in when they enter the viewport.
 * direction="up" slides up 24px, direction="left" slides from left, "none" is pure fade.
 */
export function FadeIn({ children, className, delay = 0, direction = "up" }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const initial = {
    opacity: 0,
    y: direction === "up" ? 24 : 0,
    x: direction === "left" ? -24 : 0,
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
