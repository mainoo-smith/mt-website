type ArchitectureLayerCardProps = {
  index: number;
  label: string;
};

/** Nyansapo architecture layer row — compact. */
export function ArchitectureLayerCard({ index, label }: ArchitectureLayerCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-l-2 border-white/10 border-l-brand-orange bg-white/[0.04] px-5 py-3.5 transition-colors hover:border-brand-orange/30 hover:bg-white/[0.06]">
      <span className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
        Layer {index}
      </span>
      <span className="font-display text-base font-bold uppercase tracking-wide text-white">{label}</span>
    </div>
  );
}
