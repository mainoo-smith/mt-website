import { brand, sceneColors } from "./brand";

export type SectorIcon = "cross" | "flame" | "shield" | "bolt" | "bank" | "bars";

export type SectorOrg = {
  id: string;
  label: string;
  color: string;
  icon: SectorIcon;
};

export type ScrollChapterId =
  | "continent"
  | "isolation"
  | "connect"
  | "challenge"
  | "platform"
  | "framework";

export type ScrollChapter = {
  id: ScrollChapterId;
  range: readonly [number, number];
  sceneLabel: string;
  lines: string[];
};

/** Full scroll narrative — Act I (Scenes 1–3) + Act II 4a (Scenes 4–6). */
export const SCROLL_CHAPTERS: ScrollChapter[] = [
  {
    id: "continent",
    range: [0, 0.15],
    sceneLabel: "Scene 1",
    lines: [
      "Africa runs on digital systems.",
      "Hospitals. Agencies. Utilities. Cities.",
      "The continent is already online.",
    ],
  },
  {
    id: "isolation",
    range: [0.15, 0.3],
    sceneLabel: "Scene 2",
    lines: [
      "Hospital. Fire. Police. Utility. Government. Finance.",
      "Each system pulses alone.",
      "No shared picture. No coordination.",
    ],
  },
  {
    id: "connect",
    range: [0.3, 0.45],
    sceneLabel: "Scene 3",
    lines: [
      "Signals flow into one coordination layer.",
      "Isolated systems begin to connect.",
      "A shared operating picture emerges.",
    ],
  },
  {
    id: "challenge",
    range: [0.45, 0.6],
    sceneLabel: "The Challenge",
    lines: [
      "The world's most important systems were built separately.",
      "Healthcare. Government. Emergency. Utilities. Finance.",
      "The future requires them to work together.",
    ],
  },
  {
    id: "platform",
    range: [0.6, 0.75],
    sceneLabel: "The Platform",
    lines: [
      "One platform. Multiple sectors.",
      "Applications, coordination, trust, infrastructure.",
      "Endless possibilities.",
    ],
  },
  {
    id: "framework",
    range: [0.75, 0.92],
    sceneLabel: "The Framework",
    lines: [
      "Connect. Normalize. Understand.",
      "Decide. Coordinate. Govern.",
      "How coordination actually works.",
    ],
  },
];

/** Scroll progress thresholds for 3D scene blending (0–1). */
export const SCENE_TIMING = {
  // Act I
  continentFade: { start: 0.1, end: 0.16 },
  isolation: { start: 0.14, end: 0.2 },
  isolationFadeOut: { start: 0.26, end: 0.3 },
  connect: { start: 0.28, end: 0.34 },
  connectFadeOut: { start: 0.4, end: 0.46 },
  /** Isometric camera + ground layout ramp (Scene 3 onward). */
  iso: { start: 0.24, end: 0.36 },
  // Act II — 4a
  challenge: { start: 0.44, end: 0.5 },
  challengeFadeOut: { start: 0.56, end: 0.62 },
  platform: { start: 0.58, end: 0.64 },
  platformFadeOut: { start: 0.7, end: 0.76 },
  framework: { start: 0.74, end: 0.8 },
  // Shared
  orgLabels: { showAfter: 0.14, hideAfter: 0.31 },
  links: { showAfter: 0.05 },
  packets: { showAfter: 0.12 },
  hub: { showAfter: 0.08 },
  gridFloor: { showAfter: 0.3 },
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

export const PLATFORM_LAYERS = [
  { id: "applications", label: "Applications", color: brand.cream },
  { id: "coordination", label: "Coordination", color: sceneColors.hubGlow },
  { id: "trust", label: "Trust", color: sceneColors.cityCool },
  { id: "infrastructure", label: "Infrastructure", color: sceneColors.landmassEmissive },
] as const;

export const FRAMEWORK_STEPS = [
  { id: "connect", label: "Connect", color: sceneColors.hospital },
  { id: "normalize", label: "Normalize", color: sceneColors.fire },
  { id: "understand", label: "Understand", color: sceneColors.police },
  { id: "decide", label: "Decide", color: sceneColors.utility },
  { id: "coordinate", label: "Coordinate", color: sceneColors.government },
  { id: "govern", label: "Govern", color: sceneColors.finance },
] as const;

export const LAYOUT = {
  coordinationOffsetX: 1.7,
  coordinationOffsetAspect: 1,
  sectorRadiusX: 1.3,
  sectorRadiusY: 1.55,
  challengeSpreadMax: 1.05,
  hubZ: 0.15,
  frameworkSpanX: 3.05,
  /** Scenes 3-4 nodes sit on a tall vertical ellipse facing the camera so all
   * six nodes + labels are visible at once (upright mesh network). */
  groundRadius: 1.12,
  ringRadiusX: 1.35,
  ringRadiusY: 1.5,
  groundY: -0.42,
  hubCenterY: 0.34,
  stageOffsetIso: 1.05,
  /** How far left of the stage the iso camera looks, so the stage sits in the right half. */
  stageFramingBias: 1.4,
  /** Lift the floating (padless) composition up so it centres in frame. */
  stageOffsetY: 0.22,
} as const;

export const EXPERIENCE_SCROLL_HEIGHT = "900vh" as const;

export const SCROLL_TRIGGER = {
  start: "top top",
  end: "bottom bottom",
  scrub: 0.65,
} as const;

export const CAMERA_CONFIG = {
  /** Scenes 1-2 — front elevation on the Africa map. */
  front: { y: 0.2, z: 8.5 },
  /** Scenes 3-6 — product-demo camera over a compact stage. */
  iso: { x: 0.15, y: 2.25, z: 7.1, lookY: -0.05 },
  damping: 0.07,
} as const;

export const CONTINENT_MOTION = {
  rotationY: { start: 0.2, end: -0.05, progressEnd: 0.12 },
  scale: { start: 0.95, peak: 1.25, progressEnd: 0.1 },
  positionY: { start: 0.15, end: -1.5 },
  positionZ: { start: 0, end: -2.2 },
} as const;

export const SECTOR_MOTION = {
  scale: { start: 0.12, end: 1 },
  positionY: { start: 1.15, end: 0 },
  bobThreshold: { isolation: 0.3, connect: 0.25 },
  idleBob: 0.035,
  idleRot: 0.018,
} as const;

export const MOTION = {
  hubPulse: 0.05,
  hubRingSpeedA: 0.006,
  hubRingSpeedB: 0.0095,
} as const;
