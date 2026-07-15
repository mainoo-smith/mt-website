import { GlassPanel } from "./GlassPanel";

type ArchitectureLayerCardProps = {
  index: number;
  label: string;
  color: string;
};

/** Nyansapo architecture layer row. */
export function ArchitectureLayerCard({ index, label, color }: ArchitectureLayerCardProps) {
  return (
    <GlassPanel accent className="flex items-center justify-between gap-4">
      <div>
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
          Layer {index}
        </p>
        <p className="mt-1 font-display text-lg font-bold uppercase tracking-wide text-white">{label}</p>
      </div>
      <span
        className="hidden h-10 w-10 shrink-0 rounded-lg border border-white/10 sm:block"
        style={{
          background: `linear-gradient(135deg, ${color}44, transparent)`,
          boxShadow: `inset 0 0 0 1px ${color}33`,
        }}
      />
    </GlassPanel>
  );
}
