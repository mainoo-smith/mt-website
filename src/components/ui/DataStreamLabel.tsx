import type { ReactNode } from "react";

/** Small orange uppercase label — “data stream” caption style from MVDS. */
export function DataStreamLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mt-4 inline-block font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-orange/90">
      {children}
    </span>
  );
}
