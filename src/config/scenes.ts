import { sceneColors } from "./brand";

export type SectorIcon = "cross" | "flame" | "shield" | "bolt" | "bank" | "bars";

export type SectorOrg = {
  id: string;
  label: string;
  color: string;
  icon: SectorIcon;
};

export type ScrollChapter = {
  id: "continent" | "isolation" | "connect";
  range: readonly [number, number];
  sceneLabel: string;
  lines: string[];
};

/** Phase 1 scroll narrative — maps to MXDS Volume III Scenes 01–02 + coordination hub. */
export const SCROLL_CHAPTERS: ScrollChapter[] = [
  {
    id: "continent",
    range: [0, 0.28],
    sceneLabel: "Scene 1",
    lines: [
      "Africa runs on digital systems.",
      "Hospitals. Agencies. Utilities. Cities.",
      "The continent is already online.",
    ],
  },
  {
    id: "isolation",
    range: [0.28, 0.55],
    sceneLabel: "Scene 2",
    lines: [
      "Hospital. Fire. Police. Utility. Government. Finance.",
      "Each system pulses alone.",
      "No shared picture. No coordination.",
    ],
  },
  {
    id: "connect",
    range: [0.55, 0.92],
    sceneLabel: "Scene 3",
    lines: [
      "Mainoo sits at the center.",
      "Signals flow into one shared board.",
      "Isolated systems become one operating network.",
    ],
  },
];

/** Scroll progress thresholds for 3D scene blending (0–1). */
export const SCENE_TIMING = {
  continentFade: { start: 0.2, end: 0.34 },
  isolation: { start: 0.22, end: 0.36 },
  isolationFadeOut: { start: 0.5, end: 0.62 },
  connect: { start: 0.52, end: 0.68 },
  orgLabels: { showAfter: 0.26, hideAfter: 0.95 },
  links: { showAfter: 0.05 },
  packets: { showAfter: 0.12 },
  hub: { showAfter: 0.08 },
} as const;

/** Critical-sector nodes feeding the coordination hub. */
export const SECTOR_ORGS: SectorOrg[] = [
  { id: "hospital", label: "Hospital", color: sceneColors.hospital, icon: "cross" },
  { id: "fire", label: "Fire", color: sceneColors.fire, icon: "flame" },
  { id: "police", label: "Police", color: sceneColors.police, icon: "shield" },
  { id: "utility", label: "Utility", color: sceneColors.utility, icon: "bolt" },
  { id: "government", label: "Government", color: sceneColors.government, icon: "bank" },
  { id: "finance", label: "Finance", color: sceneColors.finance, icon: "bars" },
];

export const LAYOUT = {
  /** Shift coordination composition right of copy column on landscape. */
  coordinationOffsetX: 1.7,
  coordinationOffsetAspect: 1,
  sectorRadiusX: 1.3,
  sectorRadiusY: 1.55,
  hubZ: 0.15,
} as const;

export const EXPERIENCE_SCROLL_HEIGHT = "360vh" as const;
