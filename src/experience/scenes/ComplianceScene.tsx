"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBox, Text } from "@react-three/drei";
import { brand, sceneColors } from "@/config/brand";
import { smoothstep } from "@/experience/animations/math";
import { SectorGlyph } from "@/experience/objects/SectorGlyph";

type ComplianceSceneProps = {
  weight: number;
};

const CHECKPOINTS = ["Evidence", "Policy", "Audit", "Remediate"] as const;

/** Scene 08 — KontrolIQ governance loop on the Nyansapo core. */
export function ComplianceScene({ weight }: ComplianceSceneProps) {
  const ring = useRef<THREE.Group>(null);
  const packets = useRef<THREE.Group>(null);

  const positions = useMemo(() => {
    return CHECKPOINTS.map((_, i) => {
      const a = Math.PI / 2 - (i / CHECKPOINTS.length) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * 0.95, Math.sin(a) * 0.75, 0);
    });
  }, []);

  const track = useMemo(
    () => new THREE.CatmullRomCurve3(positions, true, "catmullrom", 0.5),
    [positions],
  );

  const trackGeo = useMemo(
    () => new THREE.TubeGeometry(track, 80, 0.01, 10, true),
    [track],
  );

  useFrame(({ clock }) => {
    const appear = smoothstep(0, 0.35, weight);
    if (packets.current) {
      packets.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const u = (clock.elapsedTime * 0.1 + i * 0.25) % 1;
        mesh.position.copy(track.getPoint(u));
        (mesh.material as THREE.MeshBasicMaterial).opacity = appear * 0.9;
      });
    }
  });

  if (weight < 0.02) return null;

  const appear = smoothstep(0, 0.35, weight);

  return (
    <group scale={0.78 * appear}>
      <mesh geometry={trackGeo}>
        <meshStandardMaterial
          color={brand.orange}
          emissive={brand.orange}
          emissiveIntensity={0.45}
          transparent
          opacity={0.85 * appear}
          toneMapped={false}
        />
      </mesh>

      <group ref={packets}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.02, 8, 8]} />
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

      <RoundedBox args={[0.48, 0.48, 0.48]} radius={0.06} smoothness={5}>
        <meshPhysicalMaterial
          color={brand.orange}
          metalness={0.3}
          roughness={0.32}
          clearcoat={1}
          emissive={brand.orangeDark}
          emissiveIntensity={0.15}
        />
      </RoundedBox>
      <group position={[0, 0.28, 0.26]} scale={0.16}>
        <SectorGlyph icon="shield" color={brand.cream} emissiveIntensity={0.55} />
      </group>
      <Text
        position={[0, -0.42, 0.26]}
        fontSize={0.13}
        letterSpacing={0.02}
        color={brand.cream}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.006}
        outlineColor={brand.ink}
      >
        KONTROLIQ
      </Text>

      <group ref={ring}>
        {CHECKPOINTS.map((label, i) => (
          <group key={label} position={positions[i]}>
            <RoundedBox args={[0.5, 0.3, 0.1]} radius={0.04} smoothness={4}>
              <meshPhysicalMaterial
                color={brand.keycapBody}
                metalness={0.4}
                roughness={0.34}
                clearcoat={0.85}
              />
            </RoundedBox>
            <Text
              position={[0, 0, 0.06]}
              fontSize={0.078}
              letterSpacing={0.01}
              color={brand.cream}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.004}
              outlineColor={brand.ink}
            >
              {label.toUpperCase()}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );
}
