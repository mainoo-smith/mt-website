/** Volume II homepage IA — 2D sections below the cinematic scroll experience. */

/** Core infrastructure architecture system — sector engines run on Nyansapo. */
export const NYANSAPO = {
  name: "Nyansapo",
  descriptor: "core infrastructure architecture system",
  today:
    "Live MVPs and early products prove coordination patterns in health, emergency response, flood operations, and governance — each built to inform the shared core.",
  direction:
    "The roadmap extends Nyansapo across government, utilities, finance, and agriculture — one architecture, more sector engines over time.",
} as const;

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
    id: "health",
    title: "Nyansapo Health",
    description:
      "MVP exploring secure exchange, patient routing workflows, and cross-facility visibility for health operations.",
    status: "live-demo",
    statusLabel: "Live demo · MVP",
    href: "https://nyansapo-one.vercel.app/#/hospital",
    linkLabel: "View live demo",
    external: true,
  },
  {
    id: "emergency",
    title: "Nyansapo Emergency Coordination Engine",
    description:
      "MVP for multi-agency emergency coordination — hospital, fire, police, and utility signals on one operational picture.",
    status: "live-demo",
    statusLabel: "Live demo · MVP",
    href: "https://nyansapo-one.vercel.app/#/emergency",
    linkLabel: "View live demo",
    external: true,
  },
  {
    id: "flood",
    title: "Nyansapo Flood Intelligence",
    description:
      "MVP for environmental monitoring, unified command views, and cross-agency flood response coordination.",
    status: "live-demo",
    statusLabel: "Live demo · MVP",
    href: "https://flood-xi-five.vercel.app/#/command",
    linkLabel: "View live demo",
    external: true,
  },
  {
    id: "kontroliq",
    title: "KontrolIQ",
    description:
      "Compliance control plane for regulated businesses — local-first data control, evidence workflows, and remediation tracking.",
    status: "product",
    statusLabel: "Product",
    href: "/kontroliq.html",
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
