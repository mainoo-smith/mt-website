"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { brand, sceneColors } from "@/config/brand";
import { SECTOR_ORGS } from "@/config/scenes";
import { smoothstep } from "@/experience/animations/math";
import { useAfricaGeometry } from "@/experience/objects/AfricaMap";

type FutureSceneProps = {
  weight: number;
};

/** Scene 09 — continent expands with new sector nodes lighting up across Africa. */
export function FutureScene({ weight }: FutureSceneProps) {
  const continent = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.Group>(null);
  const { africaFill, africaEdges } = useAfricaGeometry();

  const nodeSpots = useMemo(
    () => [
      new THREE.Vector3(-0.35, 0.55, 0.15),
      new THREE.Vector3(0.2, 0.7, 0.12),
      new THREE.Vector3(0.55, 0.15, 0.1),
      new THREE.Vector3(-0.15, -0.05, 0.14),
      new THREE.Vector3(0.35, -0.45, 0.11),
      new THREE.Vector3(-0.5, -0.35, 0.13),
      new THREE.Vector3(0.05, 0.25, 0.16),
      new THREE.Vector3(0.65, -0.15, 0.1),
    ],
    [],
  );

  useFrame(({ clock }) => {
    const appear = smoothstep(0, 0.4, weight);
    if (continent.current) {
      continent.current.rotation.y = Math.sin(clock.elapsedTime * 0.12) * 0.04;
      continent.current.scale.setScalar(0.42 * appear);
    }
    if (nodes.current) {
      nodes.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const pulse = 0.7 + Math.sin(clock.elapsedTime * (1.8 + i * 0.3) + i) * 0.3;
        mesh.scale.setScalar(pulse * appear);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
          0.4 + Math.sin(clock.elapsedTime * 2 + i) * 0.25;
      });
    }
  });

  if (weight < 0.02) return null;

  const appear = smoothstep(0, 0.4, weight);

  return (
    <group position={[0, 0.05, 0]}>
      <group ref={continent}>
        <mesh geometry={africaFill}>
          <meshStandardMaterial
            color={sceneColors.landmass}
            emissive={sceneColors.landmassEmissive}
            emissiveIntensity={0.35 * appear}
            metalness={0.3}
            roughness={0.45}
          />
        </mesh>
        <lineSegments geometry={africaEdges}>
          <lineBasicMaterial
            color={sceneColors.borderGlow}
            transparent
            opacity={0.55 * appear}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0.02]}>
        <ringGeometry args={[0.55, 0.95, 64]} />
        <meshBasicMaterial
          color={brand.orange}
          transparent
          opacity={0.12 * appear}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <group ref={nodes}>
        {nodeSpots.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial
              color={SECTOR_ORGS[i % SECTOR_ORGS.length].color}
              emissive={SECTOR_ORGS[i % SECTOR_ORGS.length].color}
              emissiveIntensity={0.65}
              toneMapped
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
