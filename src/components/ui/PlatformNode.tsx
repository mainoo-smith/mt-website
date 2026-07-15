/** Compact sector / platform node chip. */
export function PlatformNode({
  label,
  color,
}: {
  label: string;
  color?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-brand-orange/25 bg-brand-orange/[0.08] px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.16em] text-brand-cream"
      style={color ? { borderColor: `${color}55`, backgroundColor: `${color}14` } : undefined}
    >
      {color ? (
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
      ) : null}
      {label}
    </span>
  );
}
