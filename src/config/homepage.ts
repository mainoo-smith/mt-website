/** Volume II homepage IA — 2D sections below the cinematic scroll experience. */

/** Core infrastructure architecture system — sector engines run on Nyansapo. */
export const NYANSAPO = {
  name: "Nyansapo",
  descriptor: "core infrastructure architecture system",
} as const;

export const HOMEPAGE_NAV = [
  { label: "Experience", href: "#experience" },
  { label: "Nyansapo", href: "#nyansapo" },
  { label: "Solutions", href: "#solutions" },
  { label: "Industries", href: "#industries" },
  { label: "Labs", href: "#research" },
  { label: "Contact", href: "#contact" },
] as const;

export const SOLUTIONS = [
  {
    id: "health",
    title: "Nyansapo Health",
    description:
      "Healthcare coordination across facilities, agencies, and patient pathways — one operating picture for clinical and public health response.",
  },
  {
    id: "emergency",
    title: "Nyansapo Emergency Coordination Engine",
    description:
      "Real-time multi-agency coordination during critical events — hospital, fire, police, and utility connected on a single command layer.",
  },
  {
    id: "flood",
    title: "Nyansapo Flood Intelligence",
    description:
      "Predictive flood monitoring and cross-sector response — utilities, government, and emergency services sharing live spatial intelligence.",
  },
  {
    id: "kontroliq",
    title: "KontrolIQ",
    description: "Automated governance and compliance intelligence for regulated environments.",
    href: "/kontroliq.html",
  },
] as const;

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
  { id: "applied-coordination", title: "Applied Coordination", description: "Research prototypes translated into Nyansapo capabilities." },
] as const;
