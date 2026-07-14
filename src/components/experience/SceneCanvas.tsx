"use client";

import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { Suspense } from "react";
import { NarrativeScene } from "./NarrativeScene";

export function SceneCanvas({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,#211306_0%,#0b0805_36%,#050505_72%)]">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.2, 8.5], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <fog attach="fog" args={["#080604", 8, 20]} />
        <Suspense fallback={null}>
          <NarrativeScene progress={progress} />
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={1.15}
              luminanceThreshold={0.35}
              luminanceSmoothing={0.8}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
