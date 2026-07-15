import Link from "next/link";
import { PILOT_URL } from "@/config/homepage";
import {
  AccentRule,
  GlassCard,
  Section,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from "@/components/sections/SectionPrimitives";
import { SolutionShell } from "@/components/layout/SolutionShell";

const FEATURES = [
  {
    title: "Sovereign data control",
    description:
      "Deploy directly in your AWS account. Sensitive evidence and control data stay in your environment.",
  },
  {
    title: "Continuous visibility",
    description:
      "Keep compliance posture visible year-round with automated control tracking and audit-state reporting.",
  },
  {
    title: "Actionable remediation",
    description:
      "Move from finding to fix with recommended steps, ownership, and progress tracking.",
  },
] as const;

const LOOP = [
  "Signals",
  "Controls",
  "Violations",
  "Evidence",
  "Remediation",
  "Audit output",
] as const;

const STEPS = [
  { title: "Deploy", description: "One-click CloudFormation deployment in your AWS account." },
  { title: "Configure", description: "Set your compliance scope and control frameworks." },
  { title: "Monitor", description: "Automated scanning and evidence collection begins." },
  { title: "Audit-ready", description: "Complete compliance reports and evidence packages." },
] as const;

const FAQ = [
  {
    q: "Do we keep control of our compliance data?",
    a: "Yes. KontrolIQ runs in your AWS boundary so sensitive evidence and telemetry remain under your governance controls.",
  },
  {
    q: "How long does deployment take?",
    a: "Teams can deploy quickly with AWS-native setup patterns, then tune scope and controls based on SOC 2 readiness objectives.",
  },
  {
    q: "Does it only detect issues, or support remediation?",
    a: "It supports remediation workflows with actionable guidance, owner accountability, and status visibility through closure.",
  },
  {
    q: "Is this only for startups?",
    a: "No. KontrolIQ is built for security-conscious SaaS teams and regulated organizations that need continuous SOC 2 readiness.",
  },
] as const;

export function KontrolIQContent() {
  return (
    <SolutionShell
      crumb="KontrolIQ"
      sector="Governance sector engine"
      title="KontrolIQ"
      active="kontroliq"
    >
      <Section id="overview" className="border-b border-white/[0.06]">
        <SectionEyebrow>Global compliance edition</SectionEyebrow>
        <SectionTitle>
          Automate SOC 2, ISO 27001, and Ghana Data Protection Act compliance without exporting
          sensitive data.
        </SectionTitle>
        <SectionLead>
          KontrolIQ is a compliance control plane for security-conscious cloud infrastructure — helping
          teams continuously collect evidence, monitor controls, generate audit reporting, and execute
          remediation workflows directly inside their AWS environment.
        </SectionLead>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={PILOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand-orange px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-orangeDark"
          >
            Schedule a compliance readiness demo
          </a>
          <a
            href="#how-it-works"
            className="rounded-full border border-white/35 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white hover:border-brand-cream hover:text-brand-cream"
          >
            See how it works
          </a>
        </div>
        <p className="mt-6 max-w-3xl text-sm text-white/55">
          Built with practitioner input and mapped to SOC 2, ISO 27001, and Ghana Data Protection Act
          control requirements for teams that need audit readiness speed and data control.
        </p>
      </Section>

      <Section id="outcomes" className="border-b border-white/[0.06]">
        <SectionTitle>Compliance pain out. Business outcomes in.</SectionTitle>
        <SectionLead>
          Manual evidence collection and late-stage audit scramble slow teams down. KontrolIQ transforms
          SOC 2 from a periodic project into a continuous operating workflow.
        </SectionLead>
        <AccentRule />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <GlassCard key={feature.title}>
              <h3 className="font-display text-lg font-bold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/68">{feature.description}</p>
            </GlassCard>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {["SOC 2", "ISO 27001", "Ghana Data Protection Act"].map((framework) => (
            <span
              key={framework}
              className="rounded-full border border-brand-orange/30 bg-brand-orange/10 px-4 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cream"
            >
              {framework}
            </span>
          ))}
        </div>
      </Section>

      <Section id="operating-loop" className="border-b border-white/[0.06]">
        <SectionTitle>The compliance operating loop</SectionTitle>
        <SectionLead>Signals → controls → violations → evidence → remediation → audit output.</SectionLead>
        <AccentRule />
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LOOP.map((step, i) => (
            <li key={step}>
              <GlassCard accent={i === 4}>
                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 font-display text-lg font-bold uppercase tracking-wide text-white">
                  {step}
                </p>
              </GlassCard>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="how-it-works" className="border-b border-white/[0.06]">
        <SectionTitle>How KontrolIQ works</SectionTitle>
        <SectionLead>Simple deployment, powerful automation.</SectionLead>
        <AccentRule />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <GlassCard>
                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                  Step {i + 1}
                </p>
                <p className="mt-2 font-display text-lg font-bold text-white">{step.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{step.description}</p>
              </GlassCard>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="architecture" className="border-b border-white/[0.06]">
        <SectionTitle>Trusted architecture for SOC 2 operations</SectionTitle>
        <SectionLead>
          Operate compliance automation inside your AWS environment while maintaining continuous
          readiness and remediation visibility.
        </SectionLead>
        <AccentRule />
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {[
            {
              title: "Your AWS environment",
              description: "Workloads, control signals, and evidence remain under your account governance.",
            },
            {
              title: "Local collector",
              description: "Collects and normalizes compliance signals without externalizing sensitive datasets.",
            },
            {
              title: "Compliance engine",
              description: "Evaluates controls, identifies gaps, and generates remediation guidance continuously.",
            },
            {
              title: "Audit reporting",
              description: "Produces evidence views, readiness status, and remediation progress for stakeholders.",
            },
          ].map((step) => (
            <GlassCard key={step.title} accent>
              <p className="font-display text-base font-bold text-white">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{step.description}</p>
            </GlassCard>
          ))}
        </div>
        <p className="mt-8 text-sm text-white/55">
          No forced third-party data export required to maintain SOC 2 readiness workflows.
        </p>
      </Section>

      <Section id="faq" className="border-b border-white/[0.06]">
        <SectionTitle>Frequently asked questions</SectionTitle>
        <AccentRule />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FAQ.map((item) => (
            <GlassCard key={item.q}>
              <h3 className="font-display text-base font-bold text-white">{item.q}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/68">{item.a}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section id="contact">
        <div className="rounded-3xl border border-brand-cream/15 bg-gradient-to-br from-brand-orange/[0.08] via-white/[0.03] to-transparent p-8 sm:p-12">
          <SectionEyebrow>Get started</SectionEyebrow>
          <SectionTitle>Ready to move SOC 2 from project to operating rhythm?</SectionTitle>
          <SectionLead>
            KontrolIQ runs on {` `}
            <Link href="/#nyansapo" className="text-brand-orange hover:text-brand-cream">
              Nyansapo
            </Link>
            — Mainoo&apos;s coordination architecture for governance workflows that must stay inside your
            boundary.
          </SectionLead>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={PILOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-orange px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-orangeDark"
            >
              Book a demo
            </a>
            <Link
              href="/#solutions"
              className="rounded-full border border-white/35 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white hover:border-brand-cream hover:text-brand-cream"
            >
              All solutions
            </Link>
          </div>
        </div>
      </Section>
    </SolutionShell>
  );
}
