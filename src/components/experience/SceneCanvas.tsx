"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { NarrativeScene } from "./NarrativeScene";

export function SceneCanvas({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.2, 8.5], fov: 42, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#050505"]} />
        <Suspense fallback={null}>
          <NarrativeScene progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
