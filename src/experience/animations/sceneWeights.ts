import { SCENE_TIMING } from "@/config/scenes";
import { smoothstep } from "./math";

export type SceneWeights = {
  continent: number;
  isolation: number;
  flood: number;
  connect: number;
  challenge: number;
  platform: number;
  framework: number;
  healthcare: number;
  emergency: number;
  compliance: number;
  future: number;
  gridFloor: number;
};

function gated(
  start: number,
  end: number,
  fadeStart?: number,
  fadeEnd?: number,
  progress = 0,
) {
  const inWeight = smoothstep(start, end, progress);
  if (fadeStart === undefined || fadeEnd === undefined) return inWeight;
  return inWeight * (1 - smoothstep(fadeStart, fadeEnd, progress));
}

export function computeSceneWeights(progress: number): SceneWeights {
  const continent = 1 - smoothstep(SCENE_TIMING.continentFade.start, SCENE_TIMING.continentFade.end, progress);

  const isolation = gated(
    SCENE_TIMING.isolation.start,
    SCENE_TIMING.isolation.end,
    SCENE_TIMING.isolationFadeOut.start,
    SCENE_TIMING.isolationFadeOut.end,
    progress,
  );

  const flood = gated(
    SCENE_TIMING.flood.start,
    SCENE_TIMING.flood.end,
    SCENE_TIMING.floodFadeOut.start,
    SCENE_TIMING.floodFadeOut.end,
    progress,
  );

  const connect = gated(
    SCENE_TIMING.connect.start,
    SCENE_TIMING.connect.end,
    SCENE_TIMING.connectFadeOut.start,
    SCENE_TIMING.connectFadeOut.end,
    progress,
  );

  const challenge = gated(
    SCENE_TIMING.challenge.start,
    SCENE_TIMING.challenge.end,
    SCENE_TIMING.challengeFadeOut.start,
    SCENE_TIMING.challengeFadeOut.end,
    progress,
  );

  const platform = gated(
    SCENE_TIMING.platform.start,
    SCENE_TIMING.platform.end,
    SCENE_TIMING.platformFadeOut.start,
    SCENE_TIMING.platformFadeOut.end,
    progress,
  );

  const framework = gated(
    SCENE_TIMING.framework.start,
    SCENE_TIMING.framework.end,
    SCENE_TIMING.frameworkFadeOut.start,
    SCENE_TIMING.frameworkFadeOut.end,
    progress,
  );

  const healthcare = gated(
    SCENE_TIMING.healthcare.start,
    SCENE_TIMING.healthcare.end,
    SCENE_TIMING.healthcareFadeOut.start,
    SCENE_TIMING.healthcareFadeOut.end,
    progress,
  );

  const emergency = gated(
    SCENE_TIMING.emergency.start,
    SCENE_TIMING.emergency.end,
    SCENE_TIMING.emergencyFadeOut.start,
    SCENE_TIMING.emergencyFadeOut.end,
    progress,
  );

  const compliance = gated(
    SCENE_TIMING.compliance.start,
    SCENE_TIMING.compliance.end,
    SCENE_TIMING.complianceFadeOut.start,
    SCENE_TIMING.complianceFadeOut.end,
    progress,
  );

  const future = smoothstep(SCENE_TIMING.future.start, SCENE_TIMING.future.end, progress);

  const gridFloor = smoothstep(SCENE_TIMING.gridFloor.showAfter, SCENE_TIMING.gridFloor.showAfter + 0.08, progress);

  return {
    continent,
    isolation,
    flood,
    connect,
    challenge,
    platform,
    framework,
    healthcare,
    emergency,
    compliance,
    future,
    gridFloor,
  };
}
