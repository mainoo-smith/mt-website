import type { ReactNode } from "react";

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
  accent?: boolean;
};

/** Frosted glass surface — primary MVDS panel primitive. */
export function GlassPanel({ children, className = "", accent = false }: GlassPanelProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors hover:border-brand-orange/30 hover:bg-white/[0.06] sm:p-7 ${
        accent ? "border-l-2 border-l-brand-orange pl-5 sm:pl-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
