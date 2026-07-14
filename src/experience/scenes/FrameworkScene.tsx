"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { brand } from "@/config/brand";
import { FRAMEWORK_STEPS, LAYOUT, SECTOR_ORGS } from "@/config/scenes";
import { flowEase, smoothstep } from "@/experience/animations/math";
import { AppCube, HubTower } from "@/experience/objects/WorkflowKit";

type FrameworkSceneProps = {
  weight: number;
};

const STAGE_TOP = LAYOUT.groundY - 0.03;
const CUBE_Y = LAYOUT.groundY + 0.17;
const HUB_POS: [number, number, number] = [0, STAGE_TOP + 0.25, 0];
const CUBE_SIZE = 0.32;
const TRACK_RX = 1.28;
const TRACK_RZ = 0.86;
const PACKET_COUNT = 10;

export function FrameworkScene({ weight }: FrameworkSceneProps) {
  const cubes = useRef<THREE.Group>(null);
  const packets = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);

  const positions = useMemo(
    () =>
      FRAMEWORK_STEPS.map((_, i) => {
        const a = (i / FRAMEWORK_STEPS.length) * Math.PI * 2 - Math.PI / 2;
        return new THREE.Vector3(Math.cos(a) * TRACK_RX, CUBE_Y, Math.sin(a) * TRACK_RZ);
      }),
    [],
  );

  const trackCurve = useMemo(
    () => new THREE.CatmullRomCurve3(positions, true, "catmullrom", 0.5),
    [positions],
  );
  const trackGeo = useMemo(
    () => new THREE.TubeGeometry(trackCurve, 160, 0.022, 12, true),
    [trackCurve],
  );

  useFrame(({ clock }) => {
    const appearGlobal = smoothstep(0, 0.3, weight);

    if (cubes.current) {
      cubes.current.children.forEach((child, i) => {
        const g = child as THREE.Group;
        const appear = smoothstep(i * 0.06, i * 0.06 + 0.32, weight);
        g.scale.setScalar(appear);
        g.position.copy(positions[i]);
        g.position.y = CUBE_Y + Math.sin(clock.elapsedTime * 0.9 + i * 0.8) * 0.025;
      });
    }

    if (packets.current) {
      packets.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const raw = (clock.elapsedTime * 0.11 + i / PACKET_COUNT) % 1;
        const u = flowEase(raw);
        mesh.position.copy(trackCurve.getPoint(u));
        (mesh.material as THREE.MeshBasicMaterial).opacity = appearGlobal * 0.95;
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
      <group position={HUB_POS} scale={0.74 * smoothstep(0, 0.3, weight)}>
        <HubTower glowRef={glow} />
      </group>

      {/* Pipe track loop. */}
      <mesh geometry={trackGeo}>
        <meshStandardMaterial
          color={brand.orange}
          emissive={brand.orange}
          emissiveIntensity={0.55}
          metalness={0.3}
          roughness={0.35}
          transparent
          opacity={0.9 * smoothstep(0.05, 0.35, weight)}
          toneMapped={false}
        />
      </mesh>

      {/* Flowing data packets. */}
      <group ref={packets}>
        {Array.from({ length: PACKET_COUNT }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.032, 10, 10]} />
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

      {/* Step cubes on the track, with front-face labels like Platform. */}
      <group ref={cubes}>
        {FRAMEWORK_STEPS.map((step, i) => {
          const org = SECTOR_ORGS[i % SECTOR_ORGS.length];
          return (
            <group key={step.id}>
              <AppCube icon={org.icon} color={step.color} size={CUBE_SIZE} label={step.label} showLabel />
            </group>
          );
        })}
      </group>
    </group>
  );
}
