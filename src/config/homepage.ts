/** Volume II homepage IA — 2D sections below the cinematic scroll experience. */

export const HOMEPAGE_NAV = [
  { label: "Experience", href: "#experience" },
  { label: "Platform", href: "#platform" },
  { label: "Solutions", href: "#solutions" },
  { label: "Industries", href: "#industries" },
  { label: "Labs", href: "#research" },
  { label: "Contact", href: "#contact" },
] as const;

export const SOLUTIONS = [
  {
    id: "healthcare",
    title: "Healthcare Coordination",
    description: "Connecting healthcare systems for better patient outcomes across facilities and agencies.",
  },
  {
    id: "emergency",
    title: "Emergency Operations",
    description: "Real-time coordination during critical events — hospital, fire, police, and utility on one picture.",
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
  { id: "nyansapo", title: "Nyansapo", description: "Applied intelligence for complex coordination problems." },
  { id: "sovereign-ai", title: "Sovereign AI", description: "AI systems designed for institutional trust and control." },
  { id: "digital-twins", title: "Digital Twins", description: "Live models of cities, networks, and critical infrastructure." },
  { id: "gis", title: "GIS Intelligence", description: "Spatial data woven into operational decision-making." },
  { id: "smart-cities", title: "Smart Cities", description: "Urban coordination platforms for connected municipalities." },
] as const;
