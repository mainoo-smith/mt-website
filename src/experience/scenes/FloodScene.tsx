"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { brand, sceneColors } from "@/config/brand";
import { LAYOUT, SECTOR_ORGS } from "@/config/scenes";
import { smoothstep } from "@/experience/animations/math";
import { buildSectorPositions } from "@/experience/objects/NetworkConnections";

type FloodSceneProps = {
  weight: number;
};

/** Scene 03 — flood surge; sector nodes alert independently with no shared coordination. */
export function FloodScene({ weight }: FloodSceneProps) {
  const water = useRef<THREE.Mesh>(null);
  const alerts = useRef<THREE.Group>(null);

  const alertPositions = useMemo(
    () => buildSectorPositions(SECTOR_ORGS.length, 1.05, 1.2),
    [],
  );

  useFrame(({ clock }) => {
    const rise = smoothstep(0, 1, weight);
    if (water.current) {
      water.current.position.y = LAYOUT.groundY - 0.35 + rise * 0.55;
      const mat = water.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.35 + rise * 0.35;
      mat.emissiveIntensity = 0.15 + Math.sin(clock.elapsedTime * 1.4) * 0.08;
    }
    if (alerts.current) {
      alerts.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const pulse = 0.6 + Math.sin(clock.elapsedTime * (2.8 + i * 0.5) + i) * 0.4;
        mesh.scale.setScalar(pulse * rise);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          0.5 + Math.sin(clock.elapsedTime * 3 + i) * 0.35;
      });
    }
  });

  if (weight < 0.02) return null;

  return (
    <group>
      <mesh ref={water} rotation={[-Math.PI / 2, 0, 0]} position={[0, LAYOUT.groundY - 0.35, 0.05]}>
        <planeGeometry args={[3.8, 2.8, 32, 32]} />
        <meshStandardMaterial
          color="#0c1824"
          emissive="#1e5a7a"
          emissiveIntensity={0.2}
          metalness={0.35}
          roughness={0.25}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, LAYOUT.groundY - 0.32, 0.08]}>
        <ringGeometry args={[0.9, 1.35, 48]} />
        <meshBasicMaterial
          color={brand.orange}
          transparent
          opacity={0.18 * weight}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <group ref={alerts}>
        {alertPositions.map((pos, i) => (
          <mesh key={SECTOR_ORGS[i].id} position={[pos.x, pos.y, pos.z + 0.1]}>
            <octahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial
              color={SECTOR_ORGS[i].color}
              emissive={SECTOR_ORGS[i].color}
              emissiveIntensity={0.7}
              toneMapped
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
