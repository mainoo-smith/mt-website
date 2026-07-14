"use client";

import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense } from "react";
import { sceneColors } from "@/config/brand";
import { SceneManager } from "@/experience/core/SceneManager";

export function SceneCanvas({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_40%,#241406_0%,#0b0805_38%,#050505_72%)]">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.2, 8.5], fov: 40, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <fog attach="fog" args={[sceneColors.fog, 9, 22]} />
        <Suspense fallback={null}>
          <Environment preset="warehouse" environmentIntensity={0.55} />
          <SceneManager progress={progress} />
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={1.0}
              luminanceThreshold={0.42}
              luminanceSmoothing={0.8}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
