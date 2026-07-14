"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { brand, sceneColors } from "@/config/brand";

type GridFloorProps = {
  intensity: number;
};

export function GridFloor({ intensity }: GridFloorProps) {
  const tiles = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let x = -7; x <= 7; x++) {
      for (let z = -5; z <= 5; z++) {
        positions.push([x * 0.42, -1.85, z * 0.36]);
      }
    }
    return positions;
  }, []);

  if (intensity < 0.02) return null;

  return (
    <group>
      {tiles.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.36, 0.05, 0.26]} />
          <meshStandardMaterial
            color="#0a0705"
            emissive={brand.orange}
            emissiveIntensity={0.06 + intensity * 0.22}
            metalness={0.55}
            roughness={0.45}
          />
        </mesh>
      ))}
      <mesh position={[0, -1.92, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 9]} />
        <meshBasicMaterial
          color={sceneColors.landmassEmissive}
          transparent
          opacity={0.04 + intensity * 0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
