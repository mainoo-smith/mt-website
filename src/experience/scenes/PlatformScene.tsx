"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { brand } from "@/config/brand";
import { PLATFORM_LAYERS } from "@/config/scenes";
import { smoothstep } from "@/experience/animations/math";
import { DeviceNode, HubTower } from "@/experience/objects/WorkflowKit";

type PlatformSceneProps = {
  weight: number;
};

const HUB_POS: [number, number, number] = [0, -0.12, -0.2];

/** Floating device-node slots around the hub — calm, symmetric, uncluttered. */
const NODE_SLOTS: [number, number, number][] = [
  [-1.1, 0.04, 0.15],
  [1.1, 0.04, 0.15],
  [-0.78, -0.16, 0.72],
  [0.78, -0.16, 0.72],
];

export function PlatformScene({ weight }: PlatformSceneProps) {
  const panels = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);

  const pipeGeos = useMemo(() => {
    const hub = new THREE.Vector3(...HUB_POS);
    return NODE_SLOTS.map((pos) => {
      const end = new THREE.Vector3(...pos);
      const mid = hub.clone().lerp(end, 0.5);
      mid.y += 0.04;
      return new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(hub.clone(), mid, end),
        24,
        0.012,
        8,
        false,
      );
    });
  }, []);

  useFrame(({ clock }) => {
    if (panels.current) {
      panels.current.children.forEach((child, i) => {
        const g = child as THREE.Group;
        const appear = smoothstep(0.12 + i * 0.12, 0.5 + i * 0.12, weight);
        g.scale.setScalar(appear);
        g.position.y = NODE_SLOTS[i][1] + Math.sin(clock.elapsedTime * 0.7 + i) * 0.02;
      });
    }
    if (glow.current) {
      (glow.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.75 + Math.sin(clock.elapsedTime * 2.4) * 0.2;
    }
  });

  if (weight < 0.02) return null;

  return (
    <group>
      <group position={HUB_POS} scale={0.74 * smoothstep(0, 0.35, weight)}>
        <HubTower glowRef={glow} />
      </group>

      {pipeGeos.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial
            color={brand.orange}
            emissive={brand.orange}
            emissiveIntensity={0.5}
            metalness={0.3}
            roughness={0.35}
            transparent
            opacity={0.9 * smoothstep(0.2, 0.6, weight)}
            toneMapped={false}
          />
        </mesh>
      ))}

      <group ref={panels}>
        {PLATFORM_LAYERS.map((layer, i) => (
          <group key={layer.id} position={NODE_SLOTS[i]}>
            <DeviceNode label={layer.label} accent={layer.color} size={0.5} />
          </group>
        ))}
      </group>
    </group>
  );
}
