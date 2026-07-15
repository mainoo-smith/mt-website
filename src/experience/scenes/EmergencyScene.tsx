"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { brand, sceneColors } from "@/config/brand";
import { smoothstep } from "@/experience/animations/math";
import { DeviceNode, HubTower } from "@/experience/objects/WorkflowKit";

type EmergencySceneProps = {
  weight: number;
};

const HUB: [number, number, number] = [0, 0.05, 0];
// Upright fan so every label faces the camera and stays legible.
const AGENCIES: { pos: [number, number, number]; label: string; accent: string }[] = [
  { pos: [-1.15, 0.62, 0], label: "Hospital", accent: sceneColors.hospital },
  { pos: [1.15, 0.62, 0], label: "Fire", accent: sceneColors.fire },
  { pos: [-1.3, -0.5, 0], label: "Police", accent: sceneColors.police },
  { pos: [1.3, -0.5, 0], label: "Utility", accent: sceneColors.utility },
];

export function EmergencyScene({ weight }: EmergencySceneProps) {
  const glow = useRef<THREE.Mesh>(null);
  const packets = useRef<THREE.Group>(null);

  const curves = useMemo(() => {
    const hub = new THREE.Vector3(...HUB);
    return AGENCIES.map(({ pos }) => {
      const end = new THREE.Vector3(...pos);
      const mid = hub.clone().lerp(end, 0.5);
      mid.z += 0.16;
      return new THREE.QuadraticBezierCurve3(hub.clone(), mid, end);
    });
  }, []);

  const pipeGeos = useMemo(
    () => curves.map((curve) => new THREE.TubeGeometry(curve, 28, 0.012, 8, false)),
    [curves],
  );

  useFrame(({ clock }) => {
    const appear = smoothstep(0, 0.35, weight);
    if (glow.current) {
      (glow.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.75 + Math.sin(clock.elapsedTime * 2.5) * 0.18;
    }
    if (packets.current) {
      packets.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const u = (clock.elapsedTime * 0.16 + i * 0.25) % 1;
        mesh.position.copy(curves[i].getPoint(u));
        (mesh.material as THREE.MeshBasicMaterial).opacity = appear * 0.95;
      });
    }
  });

  if (weight < 0.02) return null;

  const appear = smoothstep(0, 0.35, weight);

  return (
    <group scale={0.88 * appear}>
      <group position={HUB} scale={0.62}>
        <HubTower glowRef={glow} />
      </group>

      {pipeGeos.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial
            color={brand.orange}
            emissive={brand.orange}
            emissiveIntensity={0.5}
            transparent
            opacity={0.88 * appear}
            toneMapped={false}
          />
        </mesh>
      ))}

      <group ref={packets}>
        {curves.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial
              color={brand.cream}
              transparent
              opacity={0.9}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {AGENCIES.map(({ pos, label, accent }) => (
        <group key={label} position={pos}>
          <DeviceNode label={label} accent={accent} size={0.5} />
        </group>
      ))}
    </group>
  );
}
