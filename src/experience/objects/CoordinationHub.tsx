import { forwardRef } from "react";
import * as THREE from "three";
import type { Mesh } from "three";
import { brand, sceneColors } from "@/config/brand";

type CoordinationHubProps = {
  hubRingARef?: React.RefObject<Mesh | null>;
  hubRingBRef?: React.RefObject<Mesh | null>;
  coreGlowRef?: React.RefObject<Mesh | null>;
};

export const CoordinationHub = forwardRef<import("three").Group, CoordinationHubProps>(
  function CoordinationHub({ hubRingARef, hubRingBRef, coreGlowRef }, ref) {
    return (
      <group ref={ref} position={[0, 0, 0.15]}>
        <mesh position={[0, 0, -0.12]}>
          <circleGeometry args={[0.98, 64]} />
          <meshBasicMaterial
            color={brand.orange}
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[0.72, 0.06, 20, 90]} />
          <meshStandardMaterial color={sceneColors.darkMetal} metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.72, 0.016, 16, 90]} />
          <meshStandardMaterial
            color={sceneColors.hubGlow}
            emissive={sceneColors.hubGlow}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={hubRingARef}>
          <torusGeometry args={[0.58, 0.032, 8, 14]} />
          <meshStandardMaterial
            color={brand.orange}
            emissive={brand.orange}
            emissiveIntensity={0.85}
            metalness={0.6}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={hubRingBRef}>
          <torusGeometry args={[0.46, 0.01, 8, 60]} />
          <meshStandardMaterial
            color={sceneColors.cityCool}
            emissive={sceneColors.cityCool}
            emissiveIntensity={0.7}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, -0.02]}>
          <circleGeometry args={[0.36, 56]} />
          <meshStandardMaterial color="#0b0705" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh ref={coreGlowRef} position={[0, 0, 0.02]}>
          <torusGeometry args={[0.17, 0.036, 20, 56]} />
          <meshStandardMaterial
            color={brand.orange}
            emissive={brand.orange}
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color={sceneColors.hubCore} toneMapped={false} />
        </mesh>
      </group>
    );
  },
);
