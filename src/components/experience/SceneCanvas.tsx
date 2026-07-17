"use client";

import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense, useMemo } from "react";
import { sceneColors } from "@/config/brand";
import { SceneManager } from "@/experience/core/SceneManager";
import { getExperienceQuality } from "@/experience/core/experienceQuality";
import { useExperienceLayout } from "@/hooks/useExperienceLayout";

export function SceneCanvas({ progress }: { progress: number }) {
  const { layout } = useExperienceLayout();
  const quality = useMemo(() => getExperienceQuality(layout), [layout]);

  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,#241406_0%,#0b0805_38%,#050505_72%)] lg:bg-[radial-gradient(circle_at_58%_40%,#241406_0%,#0b0805_38%,#050505_72%)]">
      <Canvas
        dpr={quality.dpr}
        camera={{ position: [0, 0.2, 8.5], fov: 40, near: 0.1, far: 100 }}
        gl={{
          antialias: quality.antialias,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <fog attach="fog" args={[sceneColors.fog, 9, 22]} />
        <Suspense fallback={null}>
          <Environment preset="warehouse" environmentIntensity={quality.environmentIntensity} />
          <SceneManager progress={progress} quality={quality} />
          {quality.bloomEnabled ? (
            <EffectComposer multisampling={0}>
              <Bloom
                intensity={quality.bloomIntensity}
                luminanceThreshold={quality.bloomThreshold}
                luminanceSmoothing={0.8}
                mipmapBlur
              />
            </EffectComposer>
          ) : null}
        </Suspense>
      </Canvas>
    </div>
  );
}
