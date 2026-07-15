"use client";

import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import { brand } from "@/config/brand";
import type { SectorIcon } from "@/config/scenes";
import { SectorGlyph } from "./SectorGlyph";

/**
 * Dark glossy "app cube" — a rounded black-plastic node with a sector glyph on
 * the top face, an orange base seam and a small side power light. Mirrors the
 * automation-diagram cubes in the reference, themed for Mainoo.
 */
export function AppCube({
  icon,
  color,
  size = 0.46,
  label,
  showLabel = false,
}: {
  icon: SectorIcon;
  color: string;
  size?: number;
  label?: string;
  showLabel?: boolean;
}) {
  return (
    <group>
      {/* Orange base seam glow. */}
      <mesh position={[0, -size * 0.52, 0]}>
        <boxGeometry args={[size * 0.9, 0.02, size * 0.9]} />
        <meshBasicMaterial color={brand.orange} toneMapped={false} />
      </mesh>

      {/* Body. */}
      <RoundedBox args={[size, size, size]} radius={size * 0.18} smoothness={5}>
        <meshPhysicalMaterial
          color={brand.keycapBody}
          metalness={0.42}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.18}
        />
      </RoundedBox>

      {/* Glyph inset on the top face. */}
      <group position={[0, size * 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={size * 0.62}>
        <SectorGlyph icon={icon} color={color} emissiveIntensity={0.38} />
      </group>

      {/* Side power light. */}
      <mesh position={[size * 0.5, 0, size * 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
        <meshBasicMaterial color={brand.keycapEdge} toneMapped={false} />
      </mesh>

      {/* Front-face label (matches DeviceNode). */}
      {showLabel && label ? (
        <Text
          position={[0, -size * 0.18, size * 0.51]}
          fontSize={size * 0.15}
          maxWidth={size * 1.6}
          letterSpacing={0.01}
          color={brand.cream}
          anchorX="center"
          anchorY="middle"
          outlineWidth={size * 0.008}
          outlineColor={brand.ink}
        >
          {label.toUpperCase()}
        </Text>
      ) : null}
    </group>
  );
}

/**
 * Device node — a small rounded box "unit" with a glowing square on the top
 * face and a label on the front face, matching the reference's connected
 * devices, in the Mainoo brand. Wired to the hub by simple pipes.
 */
export function DeviceNode({
  label,
  size = 0.5,
  accent = brand.orange,
  showLabel = true,
}: {
  label?: string;
  size?: number;
  accent?: string;
  showLabel?: boolean;
}) {
  const h = size * 0.66;
  return (
    <group>
      {/* Body. */}
      <RoundedBox args={[size, h, size]} radius={size * 0.12} smoothness={5}>
        <meshPhysicalMaterial
          color={brand.keycapBody}
          metalness={0.42}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.18}
        />
      </RoundedBox>

      {/* Recessed top frame. */}
      <RoundedBox
        args={[size * 0.66, size * 0.12, size * 0.66]}
        radius={size * 0.05}
        smoothness={4}
        position={[0, h / 2 + 0.01, 0]}
      >
        <meshPhysicalMaterial color={brand.keycapTop} metalness={0.35} roughness={0.34} clearcoat={0.8} />
      </RoundedBox>

      {/* Glowing square on top. */}
      <mesh position={[0, h / 2 + 0.05, 0]}>
        <boxGeometry args={[size * 0.34, size * 0.05, size * 0.34]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.85}
          toneMapped
        />
      </mesh>

      {/* Side vents. */}
      {[-size * 0.14, 0, size * 0.14].map((z) => (
        <mesh key={z} position={[size * 0.505, -h * 0.05, z]}>
          <boxGeometry args={[0.006, 0.02, 0.05]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
      ))}

      {/* Caption below the unit — larger and outlined so it stays legible. */}
      {showLabel && label ? (
        <Text
          position={[0, -h / 2 - size * 0.24, size * 0.3]}
          fontSize={size * 0.2}
          maxWidth={size * 3}
          letterSpacing={0.02}
          color={brand.cream}
          anchorX="center"
          anchorY="middle"
          outlineWidth={size * 0.012}
          outlineColor={brand.ink}
        >
          {label.toUpperCase()}
        </Text>
      ) : null}
    </group>
  );
}

/**
 * Central branded hub tower — the "Workflows"-style core. A floating orange
 * glossy cube capped with the Mainoo orange mark on cream.
 */
export function HubTower({ glowRef }: { glowRef?: React.RefObject<THREE.Mesh | null> }) {
  return (
    <group>
      {/* Branded tower. */}
      <RoundedBox args={[0.62, 0.52, 0.62]} radius={0.07} smoothness={5} position={[0, 0.1, 0]}>
        <meshPhysicalMaterial
          color={brand.orange}
          metalness={0.3}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.16}
          emissive={brand.orangeDark}
          emissiveIntensity={0.18}
        />
      </RoundedBox>

      {/* Cream emblem cap. */}
      <RoundedBox args={[0.34, 0.08, 0.34]} radius={0.03} smoothness={4} position={[0, 0.4, 0]}>
        <meshPhysicalMaterial color={brand.cream} metalness={0.08} roughness={0.3} clearcoat={0.9} />
      </RoundedBox>
      <mesh ref={glowRef} position={[0, 0.45, 0]}>
        <boxGeometry args={[0.16, 0.03, 0.16]} />
        <meshStandardMaterial
          color={brand.orange}
          emissive={brand.orange}
          emissiveIntensity={1.0}
          toneMapped
        />
      </mesh>
    </group>
  );
}
