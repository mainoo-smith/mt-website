"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { SECTOR_ORGS } from "@/config/scenes";
import { smoothstep } from "@/experience/animations/math";
import { buildSectorPositions } from "@/experience/objects/NetworkConnections";

type FloodSceneProps = {
  weight: number;
};

/** Scene 03 — a surge event; each sector raises its own alert with no shared response. */
export function FloodScene({ weight }: FloodSceneProps) {
  const alerts = useRef<THREE.Group>(null);

  const alertPositions = useMemo(
    () => buildSectorPositions(SECTOR_ORGS.length, 1.05, 1.2),
    [],
  );

  useFrame(({ clock }) => {
    const rise = smoothstep(0, 1, weight);
    if (alerts.current) {
      alerts.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const pulse = 0.7 + Math.sin(clock.elapsedTime * (2.8 + i * 0.5) + i) * 0.35;
        mesh.scale.setScalar(pulse * rise);
        mesh.rotation.y = clock.elapsedTime * 0.8 + i;
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          0.55 + Math.sin(clock.elapsedTime * 3 + i) * 0.4;
      });
    }
  });

  if (weight < 0.02) return null;

  return (
    <group>
      <group ref={alerts}>
        {alertPositions.map((pos, i) => (
          <mesh key={SECTOR_ORGS[i].id} position={[pos.x, pos.y, pos.z + 0.12]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial
              color={SECTOR_ORGS[i].color}
              emissive={SECTOR_ORGS[i].color}
              emissiveIntensity={0.75}
              toneMapped
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
