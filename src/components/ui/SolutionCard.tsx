import type { ReactNode } from "react";
import { GlassPanel } from "./GlassPanel";
import { DataStreamLabel } from "./DataStreamLabel";

type SolutionCardProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  showPowered?: boolean;
};

/** Solution / product card used on the homepage and bridge pages. */
export function SolutionCard({
  title,
  description,
  actions,
  showPowered = true,
}: SolutionCardProps) {
  return (
    <GlassPanel className="flex flex-col">
      <h3 className="font-display text-xl font-bold text-white">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-white/68 sm:text-base">{description}</p>
      {showPowered ? <DataStreamLabel>Powered by Nyansapo</DataStreamLabel> : null}
      {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
    </GlassPanel>
  );
}
