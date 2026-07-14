"use client";

import { RoundedBox } from "@react-three/drei";
import { PLATFORM_LAYERS } from "@/config/scenes";
import { smoothstep } from "@/experience/animations/math";

type PlatformSceneProps = {
  weight: number;
};

export function PlatformScene({ weight }: PlatformSceneProps) {
  if (weight < 0.02) return null;

  return (
    <group>
      {PLATFORM_LAYERS.map((layer, i) => {
        const stagger = smoothstep(i * 0.18, i * 0.18 + 0.55, weight);
        const y = -1.35 + i * 0.58 * stagger;
        const opacity = 0.22 + stagger * 0.35;

        return (
          <RoundedBox
            key={layer.id}
            args={[3.1, 0.14, 1.75]}
            radius={0.05}
            smoothness={4}
            position={[0, y, 0]}
            scale={[stagger, stagger, stagger]}
          >
            <meshPhysicalMaterial
              color={layer.color}
              transparent
              opacity={opacity}
              roughness={0.12}
              metalness={0.2}
              transmission={0.65}
              thickness={0.4}
              emissive={layer.color}
              emissiveIntensity={0.15 * stagger}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </RoundedBox>
        );
      })}
    </group>
  );
}
