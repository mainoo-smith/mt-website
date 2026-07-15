import Link from "next/link";
import { FRAMEWORK_STEPS, PLATFORM_LAYERS, SECTOR_ORGS } from "@/config/scenes";
import { HOMEPAGE_NAV, INDUSTRIES, LABS, NYANSAPO, PILOT_URL, SOLUTIONS } from "@/config/homepage";
import {
  AccentRule,
  GlassCard,
  HomepageCanvas,
  PoweredBadge,
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
      <SectionEyebrow>The Challenge</SectionEyebrow>
      <SectionTitle>
        The world&apos;s most important systems were built separately.
      </SectionTitle>
      <SectionLead>
        Healthcare, government, emergency response, utilities, and finance each run on their own
        stack — powerful alone, blind together. Citizens and operators pay the cost when critical
        systems cannot share a picture.
      </SectionLead>
      <AccentRule />
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTOR_ORGS.map((org) => (
          <div
            key={org.id}
            className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: org.color, boxShadow: `0 0 12px ${org.color}88` }}
            />
            <span className="font-display text-sm font-semibold uppercase tracking-wider text-brand-cream/90">
              {org.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-10 max-w-2xl font-display text-xl font-semibold text-brand-cream/80 sm:text-2xl">
        The future requires them to work together.
      </p>
    </Section>
  );
}

function PlatformSection() {
  return (
    <Section id="nyansapo" className="border-t border-white/[0.06]">
      <SectionEyebrow>{NYANSAPO.name}</SectionEyebrow>
      <SectionTitle>One architecture. Multiple sectors.</SectionTitle>
      <SectionLead>
        {NYANSAPO.name} is Mainoo&apos;s {NYANSAPO.descriptor} — applications, coordination, trust,
        and infrastructure layered so sector engines can plug in without rebuilding from scratch.
      </SectionLead>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <GlassCard>
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
            Today
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{NYANSAPO.today}</p>
        </GlassCard>
        <GlassCard>
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
            Direction
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{NYANSAPO.direction}</p>
        </GlassCard>
      </div>
      <AccentRule />
      <div className="mt-10 space-y-3">
        {PLATFORM_LAYERS.map((layer, i) => (
          <GlassCard key={layer.id} accent className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                Layer {i + 1}
              </p>
              <p className="mt-1 font-display text-lg font-bold uppercase tracking-wide text-white">
                {layer.label}
              </p>
            </div>
            <span
              className="hidden h-10 w-10 shrink-0 rounded-lg border border-white/10 sm:block"
              style={{
                background: `linear-gradient(135deg, ${layer.color}44, transparent)`,
                boxShadow: `inset 0 0 0 1px ${layer.color}33`,
              }}
            />
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

function FrameworkSection() {
  return (
    <Section id="framework" className="border-t border-white/[0.06]">
      <SectionEyebrow>The Framework</SectionEyebrow>
      <SectionTitle>How coordination actually works.</SectionTitle>
      <SectionLead>
        From raw signals to governed action — six capabilities at the heart of {NYANSAPO.name} that
        turn disconnected data into trusted, coordinated operations.
      </SectionLead>
      <AccentRule />
      <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FRAMEWORK_STEPS.map((step, i) => (
          <li key={step.id}>
            <GlassCard>
              <p className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-orange">
                Step {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 font-display text-lg font-bold uppercase tracking-wide text-white">
                {step.label}
              </p>
            </GlassCard>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function SolutionsSection() {
  return (
    <Section id="solutions" className="border-t border-white/[0.06]">
      <SectionEyebrow>Solutions</SectionEyebrow>
      <SectionTitle>Solutions in action.</SectionTitle>
      <SectionLead>
        Live demos and early products today — each proving coordination patterns on {NYANSAPO.name}.
        Explore each solution or request a pilot for your environment.
      </SectionLead>
      <AccentRule />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {SOLUTIONS.map((solution) => {
          const LinkTag = solution.external ? "a" : Link;
          const linkProps = solution.external
            ? { href: solution.href, target: "_blank", rel: "noopener noreferrer" }
            : { href: solution.href };

          return (
            <GlassCard key={solution.id} className="flex flex-col">
              <h3 className="font-display text-xl font-bold text-white">{solution.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/68 sm:text-base">
                {solution.description}
              </p>
              <PoweredBadge />
              <div className="mt-5 flex flex-wrap gap-3">
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
              </div>
            </GlassCard>
          );
        })}
      </div>
    </Section>
  );
}

function IndustriesSection() {
  return (
    <Section id="industries" className="border-t border-white/[0.06]">
      <SectionEyebrow>Industries</SectionEyebrow>
      <SectionTitle>Built for sectors that cannot afford silos.</SectionTitle>
      <SectionLead>
        {NYANSAPO.name} meets institutions where they operate — with interoperability, sovereignty,
        and operational clarity designed in from the start.
      </SectionLead>
      <AccentRule />
      <div className="mt-10 flex flex-wrap gap-3">
        {INDUSTRIES.map((industry) => (
          <span
            key={industry}
            className="rounded-full border border-brand-orange/25 bg-brand-orange/[0.08] px-5 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.16em] text-brand-cream"
          >
            {industry}
          </span>
        ))}
      </div>
    </Section>
  );
}

function SovereigntySection() {
  return (
    <Section id="sovereignty" className="border-t border-white/[0.06]">
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
    </Section>
  );
}

function LabsSection() {
  return (
    <Section id="research" className="border-t border-white/[0.06]">
      <SectionEyebrow>Mainoo Labs</SectionEyebrow>
      <SectionTitle>Research that feeds {NYANSAPO.name}.</SectionTitle>
      <SectionLead>
        Applied research in AI, spatial intelligence, and digital infrastructure — informing the
        next capabilities {NYANSAPO.name} will generalize across sector engines.
      </SectionLead>
      <AccentRule />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LABS.map((lab) => (
          <GlassCard key={lab.id}>
            <h3 className="font-display text-base font-bold text-white">{lab.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">{lab.description}</p>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

function ContactSection() {
  return (
    <Section id="contact" className="border-t border-white/[0.06] pb-28">
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
    </Section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">
          Mainoo Technologies
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {HOMEPAGE_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50 hover:text-brand-orange"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/kontroliq/"
            className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50 hover:text-brand-orange"
          >
            KontrolIQ
          </Link>
        </nav>
        <p className="text-xs text-white/35">© {new Date().getFullYear()} Mainoo Technologies</p>
      </div>
    </footer>
  );
}
