import { SOLUTIONS } from "@/config/homepage";

/** Live demo URLs for sector engine MVPs — linked from Nyansapo solution bridge pages. */
export const SOLUTION_DEMO_URLS: Record<string, string> = {
  health: "https://nyansapo-one.vercel.app/#/hospital",
  emergency: "https://nyansapo-one.vercel.app/#/emergency",
  flood: "https://flood-xi-five.vercel.app/#/command",
};

export function getSolutionDemoUrl(id: string): string | undefined {
  return SOLUTION_DEMO_URLS[id];
}

export function getExternalSolutions() {
  return SOLUTIONS.filter((s) => s.id in SOLUTION_DEMO_URLS);
}
