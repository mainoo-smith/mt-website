import type { ReactNode } from "react";
import Link from "next/link";
import { NYANSAPO } from "@/config/homepage";
import { HomepageCanvas, PoweredBadge } from "@/components/sections/SectionPrimitives";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type SolutionShellProps = {
  sector: string;
  title: string;
  children: ReactNode;
  active?: "kontroliq" | "solutions";
};

/** Frames a sector engine as an instance running on Nyansapo — not a standalone company site. */
export function SolutionShell({ sector, title, children, active = "solutions" }: SolutionShellProps) {
  return (
    <HomepageCanvas>
      <SiteHeader active={active} />
      <div className="pt-20">
        <div className="border-b border-white/[0.06] px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <nav className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
              <Link href="/" className="hover:text-brand-orange">
                Mainoo
              </Link>
              <span className="mx-2">/</span>
              <Link href="/#solutions" className="hover:text-brand-orange">
                Solutions
              </Link>
              <span className="mx-2">/</span>
              <span className="text-brand-cream/80">{title}</span>
            </nav>
            <p className="mt-4 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
              {NYANSAPO.name} · {sector}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h1>
            <PoweredBadge />
          </div>
        </div>
        {children}
        <SiteFooter />
      </div>
    </HomepageCanvas>
  );
}
