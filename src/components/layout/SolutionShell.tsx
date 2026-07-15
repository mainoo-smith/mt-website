import type { ReactNode } from "react";
import Link from "next/link";
import { HomepageCanvas } from "@/components/sections/SectionPrimitives";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type SolutionShellProps = {
  /** Short breadcrumb crumb, e.g. "Health" or "KontrolIQ". */
  crumb: string;
  sector: string;
  title: string;
  children: ReactNode;
  active?: "kontroliq" | "solutions";
};

/** Frames a sector engine as an instance running on Nyansapo — not a standalone company site. */
export function SolutionShell({
  crumb,
  sector,
  title,
  children,
  active,
}: SolutionShellProps) {
  return (
    <HomepageCanvas>
      <SiteHeader active={active} />
      <div className="pt-20">
        <div className="border-b border-white/[0.06] px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <nav className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
              <Link href="/#solutions" className="hover:text-brand-orange">
                Solutions
              </Link>
              <span className="mx-2">/</span>
              <span className="text-brand-cream/80">{crumb}</span>
            </nav>
            <p className="mt-4 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
              {sector}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          </div>
        </div>
        {children}
        <SiteFooter />
      </div>
    </HomepageCanvas>
  );
}
