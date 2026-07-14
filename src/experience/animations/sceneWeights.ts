import { SCENE_TIMING } from "@/config/scenes";
import { smoothstep } from "./math";

export type SceneWeights = {
  continent: number;
  isolation: number;
  connect: number;
};

export function computeSceneWeights(progress: number): SceneWeights {
  const continent = 1 - smoothstep(SCENE_TIMING.continentFade.start, SCENE_TIMING.continentFade.end, progress);
  const isolation =
    smoothstep(SCENE_TIMING.isolation.start, SCENE_TIMING.isolation.end, progress) *
    (1 - smoothstep(SCENE_TIMING.isolationFadeOut.start, SCENE_TIMING.isolationFadeOut.end, progress));
  const connect = smoothstep(SCENE_TIMING.connect.start, SCENE_TIMING.connect.end, progress);
  return { continent, isolation, connect };
}
