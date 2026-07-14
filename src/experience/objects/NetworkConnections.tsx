import * as THREE from "three";
import { brand, sceneColors } from "@/config/brand";

export function NetworkConnections({ tubeGeos }: { tubeGeos: THREE.BufferGeometry[] }) {
  return (
    <>
      {tubeGeos.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial
            color={sceneColors.conduit}
            emissive={sceneColors.conduit}
            emissiveIntensity={2.2}
            transparent
            opacity={0.78}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

export function DataPackets({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshBasicMaterial
            color={sceneColors.packet}
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

export function buildSectorCurves(orgPositions: THREE.Vector3[], hubZ: number) {
  return orgPositions.map((p) => {
    const mid = new THREE.Vector3(p.x * 0.42, p.y * 0.42, 0.65);
    return new THREE.QuadraticBezierCurve3(p.clone(), mid, new THREE.Vector3(0, 0, hubZ));
  });
}

export function buildTubeGeometries(curves: THREE.QuadraticBezierCurve3[]) {
  return curves.map((curve) => new THREE.TubeGeometry(curve, 64, 0.02, 10, false));
}

export function buildSectorPositions(count: number, radiusX: number, radiusY: number) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    return new THREE.Vector3(Math.cos(a) * radiusX, Math.sin(a) * radiusY, 0);
  });
}
