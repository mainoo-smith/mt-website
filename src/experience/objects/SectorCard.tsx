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
 * Upright "system tile" that faces the camera: a cream glossy rounded panel with
 * the sector glyph on the upper front face and the label below it. Arranged in a
 * vertical ring so all six nodes and labels stay visible at once.
 */
export function SectorCard({ org, showLabel = true }: SectorCardProps) {
  return (
    <group>
      {/* Tile body (faces +z / camera). */}
      <RoundedBox args={[0.66, 0.5, 0.12]} radius={0.05} smoothness={5}>
        <meshPhysicalMaterial
          color={brand.cream}
          metalness={0.08}
          roughness={0.36}
          clearcoat={0.9}
          clearcoatRoughness={0.28}
        />
      </RoundedBox>

      {/* Orange base seam along the bottom edge. */}
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[0.62, 0.02, 0.1]} />
        <meshBasicMaterial color={brand.orange} toneMapped={false} />
      </mesh>

      {/* Glyph on the upper front face. */}
      <group position={[0, 0.1, 0.062]} scale={0.14}>
        <SectorGlyph icon={org.icon} color={org.color} emissiveIntensity={0.5} />
      </group>

      {/* Label on the lower front face. */}
      {showLabel ? (
        <Text
          position={[0, -0.13, 0.065]}
          fontSize={0.078}
          maxWidth={0.6}
          letterSpacing={0.01}
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
