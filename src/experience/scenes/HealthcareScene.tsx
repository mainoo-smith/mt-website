"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { brand, sceneColors } from "@/config/brand";
import { smoothstep } from "@/experience/animations/math";
import { AppCube, HubTower } from "@/experience/objects/WorkflowKit";

type HealthcareSceneProps = {
  weight: number;
};

const HUB: [number, number, number] = [0, 0.05, 0];
const WARDS: [number, number, number][] = [
  [-0.95, -0.08, 0.35],
  [0.95, -0.08, 0.35],
  [0, -0.42, 0.55],
];

/** Scene 06 — Nyansapo Health: hospital hub with ward nodes and patient-flow pipes. */
export function HealthcareScene({ weight }: HealthcareSceneProps) {
  const packets = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);

  const curves = useMemo(() => {
    const hub = new THREE.Vector3(...HUB);
    return WARDS.map((pos) => {
      const end = new THREE.Vector3(...pos);
      const mid = hub.clone().lerp(end, 0.5);
      mid.y += 0.06;
      return new THREE.QuadraticBezierCurve3(hub.clone(), mid, end);
    });
  }, []);

  const pipeGeos = useMemo(
    () =>
      curves.map(
        (curve) => new THREE.TubeGeometry(curve, 24, 0.01, 8, false),
      ),
    [curves],
  );

  useFrame(({ clock }) => {
    const appear = smoothstep(0, 0.35, weight);
    if (glow.current) {
      (glow.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.7 + Math.sin(clock.elapsedTime * 2.2) * 0.15;
    }
    if (packets.current) {
      packets.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const u = (clock.elapsedTime * 0.14 + i * 0.33) % 1;
        mesh.position.copy(curves[i].getPoint(u));
        (mesh.material as THREE.MeshBasicMaterial).opacity = appear * 0.9;
      });
    }
  });

  if (weight < 0.02) return null;

  const appear = smoothstep(0, 0.35, weight);

  return (
    <group scale={0.82 * appear}>
      <group position={HUB} scale={0.62}>
        <HubTower glowRef={glow} />
      </group>

      {pipeGeos.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial
            color={brand.orange}
            emissive={brand.orange}
            emissiveIntensity={0.45}
            transparent
            opacity={0.85 * appear}
            toneMapped={false}
          />
        </mesh>
      ))}

      <group ref={packets}>
        {curves.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial
              color={sceneColors.packet}
              transparent
              opacity={0.9}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {WARDS.map((pos, i) => (
        <group key={i} position={pos}>
          <AppCube
            icon="cross"
            color={sceneColors.hospital}
            size={0.28}
            label={i === 0 ? "Clinic" : i === 1 ? "ER" : "Agency"}
            showLabel
          />
        </group>
      ))}
    </group>
  );
}
