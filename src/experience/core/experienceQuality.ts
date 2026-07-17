import type { ExperienceLayout } from "@/experience/core/experienceFraming";

/**
 * Layout-aware 3D quality knobs for Step 8 mobile hybrid.
 * Desktop keeps cinematic fidelity; tablet/mobile trade particles and post for FPS.
 */
export type ExperienceQuality = {
  layout: ExperienceLayout;
  /** Canvas device pixel ratio range. */
  dpr: [number, number];
  antialias: boolean;
  bloomEnabled: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  environmentIntensity: number;
  /** Packet offsets along each conduit (fewer = cheaper). */
  packetOffsets: readonly number[];
  starCount: number;
};

const QUALITY_BY_LAYOUT: Record<ExperienceLayout, ExperienceQuality> = {
  mobile: {
    layout: "mobile",
    dpr: [1, 1.25],
    antialias: false,
    bloomEnabled: true,
    bloomIntensity: 0.42,
    bloomThreshold: 0.62,
    environmentIntensity: 0.35,
    packetOffsets: [0, 0.5],
    starCount: 80,
  },
  tablet: {
    layout: "tablet",
    dpr: [1, 1.5],
    antialias: true,
    bloomEnabled: true,
    bloomIntensity: 0.65,
    bloomThreshold: 0.56,
    environmentIntensity: 0.45,
    packetOffsets: [0, 0.4],
    starCount: 120,
  },
  desktop: {
    layout: "desktop",
    dpr: [1, 1.75],
    antialias: true,
    bloomEnabled: true,
    bloomIntensity: 1,
    bloomThreshold: 0.42,
    environmentIntensity: 0.55,
    packetOffsets: [0, 0.33, 0.66],
    starCount: 180,
  },
};

export function getExperienceQuality(layout: ExperienceLayout): ExperienceQuality {
  return QUALITY_BY_LAYOUT[layout];
}
