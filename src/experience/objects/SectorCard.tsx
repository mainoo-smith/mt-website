"use client";

import { RoundedBox, Text } from "@react-three/drei";
import type { SectorOrg } from "@/config/scenes";
import { brand } from "@/config/brand";
import { SectorGlyph } from "./SectorGlyph";

type SectorCardProps = {
  org: SectorOrg;
  showLabel?: boolean;
};

/**
 * Reference-style "system box": a clean cream glossy rounded slab that floats
 * above the stage, with the sector glyph inset on the left of the top face and
 * an upright label. Boxes are wired to the hub by flat orange pipes.
 */
export function SectorCard({ org, showLabel = true }: SectorCardProps) {
  return (
    <group>
      {/* Card body — cream glossy rounded slab. */}
      <RoundedBox args={[0.56, 0.1, 0.36]} radius={0.038} smoothness={5}>
        <meshPhysicalMaterial
          color={brand.cream}
          metalness={0.08}
          roughness={0.36}
          clearcoat={0.9}
          clearcoatRoughness={0.28}
        />
      </RoundedBox>

      {/* Thin orange accent seam along the base. */}
      <mesh position={[0, -0.055, 0]}>
        <boxGeometry args={[0.52, 0.018, 0.32]} />
        <meshBasicMaterial color={brand.orange} toneMapped={false} />
      </mesh>

      {/* Glyph chip inset on the left of the top face. */}
      <group position={[-0.19, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.095}>
        <SectorGlyph icon={org.icon} color={org.color} />
      </group>

      {showLabel ? (
        <Text
          position={[0.055, 0.056, 0.008]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.068}
          maxWidth={0.48}
          letterSpacing={0.005}
          color={brand.ink}
          anchorX="center"
          anchorY="middle"
        >
          {org.label.toUpperCase()}
        </Text>
      ) : null}
    </group>
  );
}
