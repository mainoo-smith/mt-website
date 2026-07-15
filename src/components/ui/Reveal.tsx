"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, staggerChildren } from "./motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger child reveals when true. */
  stagger?: boolean;
};

/** Scroll-triggered fade-up reveal for 2D sections. Honors prefers-reduced-motion. */
export function Reveal({ children, className = "", stagger = false }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -8% 0px" }}
      variants={stagger ? staggerChildren : fadeUp}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}
