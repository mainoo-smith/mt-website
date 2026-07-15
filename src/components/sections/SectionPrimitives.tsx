import type { ReactNode } from "react";

/** Shared section chrome — matches cinematic chapter copy typography and brand palette. */
export function HomepageCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="homepage-canvas relative overflow-hidden bg-brand-ink text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#241406_0%,#0b0805_42%,#050505_78%)]"
      />
      <div aria-hidden className="homepage-stars pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-ink via-brand-ink/80 to-transparent"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24 lg:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-display text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
      {children}
    </p>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
      {children}
    </h2>
  );
}

export function SectionLead({ children }: { children: ReactNode }) {
  return <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/72 sm:text-lg">{children}</p>;
}

export function AccentRule() {
  return <div className="mt-8 h-px w-16 bg-gradient-to-r from-brand-orange to-transparent" aria-hidden />;
}

export function GlassCard({
  children,
  className = "",
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
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

export function PoweredBadge() {
  return (
    <span className="mt-4 inline-block font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-orange/90">
      Powered by Mainoo Platform
    </span>
  );
}
