import { SCENE_TIMING } from "@/config/scenes";
import { smoothstep } from "./math";

export type SceneWeights = {
  continent: number;
  isolation: number;
  connect: number;
  challenge: number;
  platform: number;
  framework: number;
  gridFloor: number;
};

export function computeSceneWeights(progress: number): SceneWeights {
  const continent = 1 - smoothstep(SCENE_TIMING.continentFade.start, SCENE_TIMING.continentFade.end, progress);

  const isolation =
    smoothstep(SCENE_TIMING.isolation.start, SCENE_TIMING.isolation.end, progress) *
    (1 - smoothstep(SCENE_TIMING.isolationFadeOut.start, SCENE_TIMING.isolationFadeOut.end, progress));

  const connect =
    smoothstep(SCENE_TIMING.connect.start, SCENE_TIMING.connect.end, progress) *
    (1 - smoothstep(SCENE_TIMING.connectFadeOut.start, SCENE_TIMING.connectFadeOut.end, progress));

  const challenge =
    smoothstep(SCENE_TIMING.challenge.start, SCENE_TIMING.challenge.end, progress) *
    (1 - smoothstep(SCENE_TIMING.challengeFadeOut.start, SCENE_TIMING.challengeFadeOut.end, progress));

  const platform =
    smoothstep(SCENE_TIMING.platform.start, SCENE_TIMING.platform.end, progress) *
    (1 - smoothstep(SCENE_TIMING.platformFadeOut.start, SCENE_TIMING.platformFadeOut.end, progress));

  const framework = smoothstep(SCENE_TIMING.framework.start, SCENE_TIMING.framework.end, progress);

  const gridFloor = smoothstep(SCENE_TIMING.gridFloor.showAfter, SCENE_TIMING.gridFloor.showAfter + 0.08, progress);

  return { continent, isolation, connect, challenge, platform, framework, gridFloor };
}
