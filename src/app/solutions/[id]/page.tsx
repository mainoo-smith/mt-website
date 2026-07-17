import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PILOT_URL, SOLUTIONS } from "@/config/homepage";
import { getSolutionDemoUrl } from "@/config/solutions";
import {
  AccentRule,
  GlassCard,
  Section,
  SectionLead,
  SectionTitle,
} from "@/components/sections/SectionPrimitives";
import { SolutionShell } from "@/components/layout/SolutionShell";

const SECTOR_LABELS: Record<string, string> = {
  emergency: "Emergency coordination sector engine",
  flood: "Flood operations sector engine",
};

const CRUMBS: Record<string, string> = {
  emergency: "Emergency",
  flood: "Flood",
};

type SolutionBridgePageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return SOLUTIONS.filter((s) => getSolutionDemoUrl(s.id)).map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: SolutionBridgePageProps): Promise<Metadata> {
  const { id } = await params;
  const solution = SOLUTIONS.find((s) => s.id === id);
  if (!solution) return { title: "Solution | Mainoo Technologies" };

  return {
    title: `${solution.title} | Mainoo Technologies`,
    description: solution.description,
  };
}

export default async function SolutionBridgePage({ params }: SolutionBridgePageProps) {
  const { id } = await params;
  const solution = SOLUTIONS.find((s) => s.id === id);
  const demoUrl = getSolutionDemoUrl(id);
  if (!solution || !demoUrl) notFound();

  return (
    <SolutionShell
      crumb={CRUMBS[id] ?? solution.title}
      sector={SECTOR_LABELS[id] ?? "Sector engine"}
      title={solution.title}
    >
      <Section id="overview">
        <SectionTitle>Explore the live MVP</SectionTitle>
        <SectionLead>{solution.description}</SectionLead>
        <AccentRule />
        <GlassCard className="mt-10 max-w-3xl">
          <p className="text-sm leading-relaxed text-white/70">
            This solution is an early MVP proving coordination patterns on Nyansapo. Open the live demo
            to explore workflows, or request a pilot to discuss deployment in your environment.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-orange px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-orangeDark"
            >
              Open live demo →
            </a>
            <a
              href={PILOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/35 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white hover:border-brand-cream hover:text-brand-cream"
            >
              Request a pilot
            </a>
            <Link
              href="/#solutions"
              className="inline-flex items-center font-display text-xs font-bold uppercase tracking-wider text-white/55 hover:text-white"
            >
              ← All solutions
            </Link>
          </div>
        </GlassCard>
      </Section>
    </SolutionShell>
  );
}
