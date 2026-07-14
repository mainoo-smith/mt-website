import { forwardRef } from "react";
import { RoundedBox } from "@react-three/drei";
import type { Mesh } from "three";
import { brand } from "@/config/brand";

type CoordinationHubProps = {
  hubRingARef?: React.RefObject<Mesh | null>;
  hubRingBRef?: React.RefObject<Mesh | null>;
  coreGlowRef?: React.RefObject<Mesh | null>;
};

/**
 * Central coordination hub: a solid orange glossy box (the branded core) with a
 * raised cream emblem square on top. Simple boxes wire into it via flat pipes.
 */
export const CoordinationHub = forwardRef<import("three").Group, CoordinationHubProps>(
  function CoordinationHub({ hubRingARef, hubRingBRef, coreGlowRef }, ref) {
    return (
      <group ref={ref} position={[0, 0, 0]}>
        {/* Branded orange body. */}
        <RoundedBox args={[0.9, 0.42, 0.9]} radius={0.08} smoothness={5}>
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

        {/* Darker recessed band near the base for depth. */}
        <mesh position={[0, -0.14, 0]}>
          <boxGeometry args={[0.92, 0.05, 0.92]} />
          <meshStandardMaterial color={brand.orangeDark} roughness={0.5} metalness={0.2} />
        </mesh>

        {/* Raised cream emblem platform on top. */}
        <RoundedBox args={[0.46, 0.12, 0.46]} radius={0.05} smoothness={5} position={[0, 0.25, 0]}>
          <meshPhysicalMaterial
            color={brand.cream}
            metalness={0.08}
            roughness={0.3}
            clearcoat={0.95}
            clearcoatRoughness={0.2}
          />
        </RoundedBox>

        {/* Orange brand mark inset on the emblem (pulses via coreGlowRef). */}
        <mesh ref={coreGlowRef} position={[0, 0.315, 0]}>
          <boxGeometry args={[0.22, 0.03, 0.22]} />
          <meshStandardMaterial
            color={brand.orange}
            emissive={brand.orange}
            emissiveIntensity={1.0}
            toneMapped
          />
        </mesh>
        {/* Thin cream center to give the mark a debossed square-in-square read. */}
        <mesh position={[0, 0.332, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.1]} />
          <meshBasicMaterial color={brand.cream} toneMapped={false} />
        </mesh>

        {/* Hidden helper meshes kept for ref compatibility. */}
        <mesh ref={hubRingARef} visible={false}>
          <torusGeometry args={[0.28, 0.006, 8, 40]} />
          <meshBasicMaterial color={brand.orange} toneMapped={false} />
        </mesh>
        <mesh ref={hubRingBRef} visible={false}>
          <torusGeometry args={[0.2, 0.005, 8, 40]} />
          <meshBasicMaterial color={brand.cream} toneMapped={false} />
        </mesh>
      </group>
    );
  },
);
