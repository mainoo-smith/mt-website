import Link from "next/link";
import { FRAMEWORK_STEPS, PLATFORM_LAYERS, SECTOR_ORGS } from "@/config/scenes";
import { HOMEPAGE_NAV, INDUSTRIES, LABS, NYANSAPO, PILOT_URL, SOLUTIONS } from "@/config/homepage";
import {
  ArchitectureLayerCard,
  GlassPanel,
  PlatformNode,
  Reveal,
  RevealItem,
  SolutionCard,
} from "@/components/ui";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  AccentRule,
  HomepageCanvas,
  Section,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from "./SectionPrimitives";

export function HomepageSections() {
  return (
    <HomepageCanvas>
      <ChallengeSection />
      <PlatformSection />
      <FrameworkSection />
      <SolutionsSection />
      <IndustriesSection />
      <SovereigntySection />
      <LabsSection />
      <ContactSection />
      <SiteFooter />
    </HomepageCanvas>
  );
}

function ChallengeSection() {
  return (
    <Section id="challenge">
      <Reveal>
        <SectionEyebrow>The Challenge</SectionEyebrow>
        <SectionTitle>The world&apos;s most important systems were built separately.</SectionTitle>
        <SectionLead>
          Healthcare, government, emergency response, utilities, and finance each run on their own
          stack — powerful alone, blind together. Citizens and operators pay the cost when critical
          systems cannot share a picture.
        </SectionLead>
        <AccentRule />
      </Reveal>
      <Reveal stagger className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTOR_ORGS.map((org) => (
          <RevealItem key={org.id}>
            <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: org.color, boxShadow: `0 0 12px ${org.color}88` }}
              />
              <span className="font-display text-sm font-semibold uppercase tracking-wider text-brand-cream/90">
                {org.label}
              </span>
            </div>
          </RevealItem>
        ))}
      </Reveal>
      <Reveal>
        <p className="mt-10 max-w-2xl font-display text-xl font-semibold text-brand-cream/80 sm:text-2xl">
          The future requires them to work together.
        </p>
      </Reveal>
    </Section>
  );
}

function PlatformSection() {
  return (
    <Section id="nyansapo">
      <Reveal>
        <SectionEyebrow>{NYANSAPO.name}</SectionEyebrow>
        <SectionTitle>One architecture. Multiple sectors.</SectionTitle>
        <SectionLead>
          {NYANSAPO.name} is Mainoo Technologies&apos; {NYANSAPO.descriptor} — applications,
          coordination, trust, and infrastructure layered so sector engines can plug in without
          rebuilding from scratch.
        </SectionLead>
      </Reveal>
      <Reveal stagger className="mt-8 grid gap-4 sm:grid-cols-2">
        <RevealItem>
          <GlassPanel>
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
              Today
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{NYANSAPO.today}</p>
          </GlassPanel>
        </RevealItem>
        <RevealItem>
          <GlassPanel>
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
              Direction
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{NYANSAPO.direction}</p>
          </GlassPanel>
        </RevealItem>
      </Reveal>
      <AccentRule />
      <Reveal stagger className="mt-8 space-y-2">
        {PLATFORM_LAYERS.map((layer, i) => (
          <RevealItem key={layer.id}>
            <ArchitectureLayerCard index={i + 1} label={layer.label} />
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}

function FrameworkSection() {
  return (
    <Section id="framework">
      <Reveal>
        <SectionEyebrow>The Framework</SectionEyebrow>
        <SectionTitle>How coordination actually works.</SectionTitle>
        <SectionLead>
          From raw signals to governed action — six capabilities at the heart of {NYANSAPO.name} that
          turn disconnected data into trusted, coordinated operations.
        </SectionLead>
        <AccentRule />
      </Reveal>
      <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FRAMEWORK_STEPS.map((step, i) => (
          <li key={step.id}>
            <Reveal>
              <GlassPanel>
                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
                  Step {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 font-display text-lg font-bold uppercase tracking-wide text-white">
                  {step.label}
                </p>
              </GlassPanel>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function SolutionsSection() {
  return (
    <Section id="solutions">
      <Reveal>
        <SectionEyebrow>Solutions</SectionEyebrow>
        <SectionTitle>Solutions in action.</SectionTitle>
        <SectionLead>
          Live demos and early products today — each proving coordination patterns on {NYANSAPO.name}.
          Explore each solution or request a pilot for your environment.
        </SectionLead>
        <AccentRule />
      </Reveal>
      <Reveal stagger className="mt-10 grid gap-5 sm:grid-cols-2">
        {SOLUTIONS.map((solution) => {
          const LinkTag = solution.external ? "a" : Link;
          const linkProps = solution.external
            ? { href: solution.href, target: "_blank", rel: "noopener noreferrer" }
            : { href: solution.href };

          return (
            <RevealItem key={solution.id}>
              <SolutionCard
                title={solution.title}
                description={solution.description}
                actions={
                  <>
                    <LinkTag
                      {...linkProps}
                      className="inline-flex font-display text-xs font-bold uppercase tracking-wider text-brand-orange hover:text-brand-cream"
                    >
                      {solution.linkLabel} →
                    </LinkTag>
                    {solution.status === "live-demo" ? (
                      <a
                        href={PILOT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex font-display text-xs font-bold uppercase tracking-wider text-white/55 hover:text-white"
                      >
                        Request a pilot
                      </a>
                    ) : null}
                  </>
                }
              />
            </RevealItem>
          );
        })}
      </Reveal>
    </Section>
  );
}

function IndustriesSection() {
  return (
    <Section id="industries">
      <Reveal>
        <SectionEyebrow>Industries</SectionEyebrow>
        <SectionTitle>Built for sectors that cannot afford silos.</SectionTitle>
        <SectionLead>
          {NYANSAPO.name} meets institutions where they operate — with interoperability, sovereignty,
          and operational clarity designed in from the start.
        </SectionLead>
        <AccentRule />
      </Reveal>
      <Reveal stagger className="mt-10 flex flex-wrap gap-3">
        {INDUSTRIES.map((industry) => (
          <RevealItem key={industry}>
            <PlatformNode label={industry} />
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}

function SovereigntySection() {
  return (
    <Section id="sovereignty">
      <Reveal>
        <div className="rounded-3xl border border-brand-cream/15 bg-gradient-to-br from-brand-orange/[0.08] via-white/[0.03] to-transparent p-8 sm:p-12">
          <SectionEyebrow>Data Sovereignty</SectionEyebrow>
          <blockquote className="mt-4 max-w-3xl font-display text-2xl font-semibold leading-snug text-brand-cream sm:text-3xl">
            &ldquo;Organizations should benefit from intelligence without losing control of their
            data.&rdquo;
          </blockquote>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70">
            Trusted connections, not centralized ownership. {NYANSAPO.name} enables coordination across
            institutions while each organization retains authority over its own information.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

function LabsSection() {
  return (
    <Section id="research">
      <Reveal>
        <SectionEyebrow>Mainoo Labs</SectionEyebrow>
        <SectionTitle>Research that feeds {NYANSAPO.name}.</SectionTitle>
        <SectionLead>
          Applied research in AI, spatial intelligence, and digital infrastructure — informing the
          next capabilities {NYANSAPO.name} will generalize across sector engines.
        </SectionLead>
        <AccentRule />
      </Reveal>
      <Reveal stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LABS.map((lab) => (
          <RevealItem key={lab.id}>
            <GlassPanel>
              <h3 className="font-display text-base font-bold text-white">{lab.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{lab.description}</p>
            </GlassPanel>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}

function ContactSection() {
  return (
    <Section id="contact" className="pb-28">
      <Reveal>
        <SectionEyebrow>Contact</SectionEyebrow>
        <SectionTitle>The future belongs to connected systems.</SectionTitle>
        <SectionLead>
          Mainoo Technologies is building {NYANSAPO.name} — coordination infrastructure for
          organizations and sectors that need to work together, without over-centralizing control.
        </SectionLead>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="https://calendly.com/mainootechnologies"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand-orange px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-orangeDark"
          >
            Build with Mainoo
          </a>
          <a
            href="mailto:info@mainootechnologies.com"
            className="rounded-full border border-white/35 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white hover:border-brand-cream hover:text-brand-cream"
          >
            Partner with Mainoo
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
