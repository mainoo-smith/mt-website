/** Volume II homepage IA — 2D sections below the cinematic scroll experience. */

/** Core infrastructure architecture system — sector engines run on Nyansapo. */
export const NYANSAPO = {
  name: "Nyansapo",
  descriptor: "core infrastructure architecture system",
  today:
    "Live MVPs and early products prove coordination patterns in emergency response, flood operations, and governance — each built to inform the shared core.",
  direction:
    "The roadmap extends Nyansapo across government, utilities, finance, and agriculture — one architecture, more sector engines over time. Built in Africa, compliant with African data law from day one.",
} as const;

/** Differentiation pillars — programs vs. platform positioning. */
export const WHY_NYANSAPO = [
  {
    id: "platform-not-project",
    title: "Platform, not project",
    description:
      "One coordination core, many sector engines. When a new sector needs coordination, it plugs into proven infrastructure instead of starting a new build from zero.",
  },
  {
    id: "operations-not-alerts",
    title: "Operations, not just alerts",
    description:
      "Early warning tells you what's coming. Nyansapo coordinates what happens next — live signals, shared operating pictures, and multi-agency action in real time.",
  },
  {
    id: "cross-sector",
    title: "Cross-sector by design",
    description:
      "A flood is never just a flood. It's hospitals, utilities, police, and government at once. Nyansapo connects across silos because real events don't respect them.",
  },
] as const;

export const HOMEPAGE_NAV = [
  { label: "Experience", href: "#experience" },
  { label: "Nyansapo", href: "#nyansapo" },
  { label: "Solutions", href: "#solutions" },
  { label: "Industries", href: "#industries" },
  { label: "Labs", href: "#research" },
  { label: "Contact", href: "#contact" },
] as const;

export type SolutionStatus = "live-demo" | "product";

export type Solution = {
  id: string;
  title: string;
  description: string;
  status: SolutionStatus;
  statusLabel: string;
  href: string;
  linkLabel: string;
  external: boolean;
};

export const SOLUTIONS: Solution[] = [
  {
    id: "emergency",
    title: "Nyansapo Emergency Coordination Engine",
    description:
      "MVP for multi-agency emergency coordination — hospital, fire, police, and utility signals on one operational picture.",
    status: "live-demo",
    statusLabel: "Live demo · MVP",
    href: "/solutions/emergency",
    linkLabel: "Explore solution",
    external: false,
  },
  {
    id: "flood",
    title: "Nyansapo Flood Intelligence",
    description:
      "MVP for environmental monitoring, unified command views, and cross-agency flood response coordination.",
    status: "live-demo",
    statusLabel: "Live demo · MVP",
    href: "/solutions/flood",
    linkLabel: "Explore solution",
    external: false,
  },
  {
    id: "kontroliq",
    title: "KontrolIQ",
    description:
      "Compliance control plane for regulated businesses — local-first data control, evidence workflows, and remediation tracking.",
    status: "product",
    statusLabel: "Product",
    href: "/kontroliq/",
    linkLabel: "Explore KontrolIQ",
    external: false,
  },
];

export const PILOT_URL = "https://calendly.com/mainootechnologies" as const;

export const INDUSTRIES = [
  "Government",
  "Healthcare",
  "Public Safety",
  "Financial Services",
  "Agriculture",
  "Utilities",
] as const;

export const LABS = [
  { id: "sovereign-ai", title: "Sovereign AI", description: "AI systems designed for institutional trust and control." },
  { id: "digital-twins", title: "Digital Twins", description: "Live models of cities, networks, and critical infrastructure." },
  { id: "gis", title: "GIS Intelligence", description: "Spatial data woven into operational decision-making." },
  { id: "smart-cities", title: "Smart Cities", description: "Urban coordination platforms for connected municipalities." },
  {
    id: "applied-coordination",
    title: "Applied Coordination",
    description: "Research prototypes that inform the next Nyansapo sector engines.",
  },
] as const;
