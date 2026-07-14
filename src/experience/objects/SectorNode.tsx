import { Html } from "@react-three/drei";
import type { SectorOrg } from "@/config/scenes";
import { sceneColors } from "@/config/brand";
import type { Vector3 } from "three";
import { SectorGlyph } from "./SectorGlyph";

export function SectorNode({
  org,
  showLabel,
  position,
}: {
  org: SectorOrg;
  showLabel: boolean;
  position: Vector3;
}) {
  return (
    <group position={position}>
      <mesh userData={{ kind: "pulse" }}>
        <torusGeometry args={[0.4, 0.026, 16, 72]} />
        <meshStandardMaterial
          color={org.color}
          emissive={org.color}
          emissiveIntensity={0.9}
          metalness={0.4}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, -0.012]}>
        <torusGeometry args={[0.47, 0.005, 10, 72]} />
        <meshStandardMaterial
          color={org.color}
          emissive={org.color}
          emissiveIntensity={0.45}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, -0.03]}>
        <circleGeometry args={[0.4, 56]} />
        <meshStandardMaterial
          color={sceneColors.darkSurface}
          emissive={org.color}
          emissiveIntensity={0.08}
          metalness={0.65}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <ringGeometry args={[0.3, 0.315, 56]} />
        <meshBasicMaterial color={org.color} transparent opacity={0.25} toneMapped={false} />
      </mesh>
      <group position={[0, 0, 0.04]} scale={0.4}>
        <SectorGlyph icon={org.icon} color={org.color} />
      </group>
      {showLabel ? (
        <Html position={[0, -0.58, 0]} center style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-md border border-white/20 bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90">
            {org.label}
          </div>
        </Html>
      ) : null}
    </group>
  );
}
