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
  | "flood"
  | "connect"
  | "challenge"
  | "platform"
  | "framework"
  | "emergency"
  | "compliance"
  | "future";

export type ScrollChapter = {
  id: ScrollChapterId;
  range: readonly [number, number];
  sceneLabel: string;
  lines: string[];
};

/** Full scroll narrative — Act I + Act II + Act III (Volume III storyboard). */
export const SCROLL_CHAPTERS: ScrollChapter[] = [
  {
    id: "continent",
    range: [0, 0.12],
    sceneLabel: "Scene 1",
    lines: [
      "Africa runs on digital systems.",
      "Hospitals. Agencies. Utilities. Cities.",
      "The continent is already online.",
    ],
  },
  {
    id: "isolation",
    range: [0.12, 0.24],
    sceneLabel: "Scene 2",
    lines: [
      "Hospital. Fire. Police. Utility. Government. Finance.",
      "Each system pulses alone.",
      "No shared picture. No coordination.",
    ],
  },
  {
    id: "flood",
    range: [0.24, 0.32],
    sceneLabel: "The Event",
    lines: [
      "A flood surge reaches the city.",
      "Each system sees a fragment.",
      "No shared response. No shared picture.",
    ],
  },
  {
    id: "connect",
    range: [0.32, 0.44],
    sceneLabel: "Scene 3",
    lines: [
      "Signals flow into one coordination layer.",
      "Isolated systems begin to connect.",
      "A shared operating picture emerges.",
    ],
  },
  {
    id: "challenge",
    range: [0.44, 0.54],
    sceneLabel: "The Challenge",
    lines: [
      "The world's most important systems were built separately.",
      "Healthcare. Government. Emergency. Utilities. Finance.",
      "The future requires them to work together.",
    ],
  },
  {
    id: "platform",
    range: [0.54, 0.64],
    sceneLabel: "Nyansapo",
    lines: [
      "One architecture. Multiple sectors.",
      "Live MVPs prove the model today.",
      "More engines on the roadmap.",
    ],
  },
  {
    id: "framework",
    range: [0.64, 0.74],
    sceneLabel: "The Framework",
    lines: [
      "Connect. Normalize. Understand.",
      "Decide. Coordinate. Govern.",
      "How coordination actually works.",
    ],
  },
  {
    id: "emergency",
    range: [0.74, 0.84],
    sceneLabel: "Health Emergency Coordination",
    lines: [
      "Multi-agency command in real time.",
      "Hospital. Fire. Police. Utility.",
      "New sectors plug into the same core.",
    ],
  },
  {
    id: "compliance",
    range: [0.84, 0.92],
    sceneLabel: "KontrolIQ",
    lines: [
      "Governance woven into operations.",
      "Evidence, remediation, and trust.",
      "Compliance without the scramble.",
    ],
  },
  {
    id: "future",
    range: [0.92, 0.98],
    sceneLabel: "The Road Ahead",
    lines: [
      "More sectors. More engines.",
      "One Nyansapo architecture.",
      "Coordination that scales with Africa.",
    ],
  },
];

/** Scroll progress thresholds for 3D scene blending (0–1). */
export const SCENE_TIMING = {
  // Act I
  continentFade: { start: 0.08, end: 0.13 },
  isolation: { start: 0.11, end: 0.17 },
  isolationFadeOut: { start: 0.22, end: 0.26 },
  flood: { start: 0.23, end: 0.29 },
  floodFadeOut: { start: 0.3, end: 0.34 },
  connect: { start: 0.32, end: 0.38 },
  connectFadeOut: { start: 0.42, end: 0.48 },
  iso: { start: 0.28, end: 0.4 },
  // Act II
  challenge: { start: 0.44, end: 0.5 },
  challengeFadeOut: { start: 0.52, end: 0.58 },
  platform: { start: 0.54, end: 0.6 },
  platformFadeOut: { start: 0.62, end: 0.68 },
  framework: { start: 0.66, end: 0.72 },
  frameworkFadeOut: { start: 0.72, end: 0.76 },
  // Act III — sector engine demos
  emergency: { start: 0.76, end: 0.81 },
  emergencyFadeOut: { start: 0.83, end: 0.87 },
  compliance: { start: 0.85, end: 0.89 },
  complianceFadeOut: { start: 0.91, end: 0.95 },
  future: { start: 0.92, end: 0.96 },
  // Shared
  orgLabels: { showAfter: 0.12, hideAfter: 0.28 },
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

export const EXPERIENCE_SCROLL_HEIGHT = "1200vh" as const;

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
