import { CAMERA_CONFIG, LAYOUT } from "@/config/scenes";

export type ExperienceLayout = "mobile" | "tablet" | "desktop";

export type ExperienceFraming = {
  layout: ExperienceLayout;
  /** Base horizontal shift before isometric transition. */
  stageOffsetX: number;
  /** Extra shift applied as scenes move into the iso product view. */
  stageOffsetIso: number;
  /** Camera look-target offset so the stage clears the copy column. */
  stageFramingBias: number;
  /** Vertical lift of the floating stage. */
  stageOffsetY: number;
  /** Uniform scale for coordination/platform/framework compositions. */
  stageScale: number;
  cameraZMul: number;
  cameraYMul: number;
};

/**
 * Viewport-aware framing so chapter copy and the 3D stage do not compete.
 * Mobile/portrait: stack — 3D centred in the upper viewport, copy anchored below.
 * Tablet: reduced side bias. Desktop landscape: full right-stage framing.
 */
export function getExperienceFraming(width: number, height: number): ExperienceFraming {
  const aspect = width / Math.max(height, 1);
  const isPortrait = aspect < 1;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  if (isMobile || (isPortrait && width < 1024)) {
    return {
      layout: isMobile ? "mobile" : "tablet",
      stageOffsetX: 0,
      stageOffsetIso: 0,
      stageFramingBias: 0,
      stageOffsetY: isPortrait ? 0.58 : 0.42,
      stageScale: isPortrait ? 0.72 : 0.82,
      cameraZMul: isPortrait ? 1.12 : 1.04,
      cameraYMul: isPortrait ? 1.08 : 1.02,
    };
  }

  if (isTablet || width < 1200) {
    return {
      layout: "tablet",
      stageOffsetX: isPortrait ? 0 : LAYOUT.coordinationOffsetX * 0.35,
      stageOffsetIso: isPortrait ? 0 : LAYOUT.stageOffsetIso * 0.42,
      stageFramingBias: isPortrait ? 0 : LAYOUT.stageFramingBias * 0.45,
      stageOffsetY: isPortrait ? 0.52 : LAYOUT.stageOffsetY + 0.08,
      stageScale: isPortrait ? 0.76 : 0.88,
      cameraZMul: isPortrait ? 1.1 : 1.05,
      cameraYMul: isPortrait ? 1.06 : 1.02,
    };
  }

  return {
    layout: "desktop",
    stageOffsetX: LAYOUT.coordinationOffsetX,
    stageOffsetIso: LAYOUT.stageOffsetIso,
    stageFramingBias: LAYOUT.stageFramingBias,
    stageOffsetY: LAYOUT.stageOffsetY,
    stageScale: 1,
    cameraZMul: 1,
    cameraYMul: 1,
  };
}

export function getCameraTargets(
  framing: ExperienceFraming,
  iso: number,
): { x: number; y: number; z: number; lookX: number; lookY: number } {
  const cx = framing.stageOffsetX + iso * framing.stageOffsetIso;
  const framedX = cx - iso * framing.stageFramingBias;
  return {
    x: iso * (framedX + CAMERA_CONFIG.iso.x),
    y: lerp(CAMERA_CONFIG.front.y, CAMERA_CONFIG.iso.y, iso) * framing.cameraYMul,
    z: lerp(CAMERA_CONFIG.front.z, CAMERA_CONFIG.iso.z, iso) * framing.cameraZMul,
    lookX: iso * framedX,
    lookY: iso * CAMERA_CONFIG.iso.lookY,
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
