import { useMemo } from "react";
import * as THREE from "three";
import { sceneColors } from "@/config/brand";
import { AFRICA_COUNTRIES } from "@/experience/data/africaShapes";
import { CITY_LIGHTS } from "@/experience/data/africaCities";

export function useAfricaGeometry() {
  return useMemo(() => {
    const shapes: THREE.Shape[] = [];
    const edgePts: number[] = [];
    const EDGE_Z = 0.205;

    for (const country of AFRICA_COUNTRIES) {
      for (const ring of country.rings) {
        if (ring.length < 3) continue;
        const shape = new THREE.Shape();
        shape.moveTo(ring[0][0], ring[0][1]);
        for (let i = 1; i < ring.length; i++) shape.lineTo(ring[i][0], ring[i][1]);
        shape.closePath();
        shapes.push(shape);
        for (let i = 0; i < ring.length; i++) {
          const a = ring[i];
          const b = ring[(i + 1) % ring.length];
          edgePts.push(a[0], a[1], EDGE_Z, b[0], b[1], EDGE_Z);
        }
      }
    }

    const fill = new THREE.ExtrudeGeometry(shapes, {
      depth: 0.2,
      bevelEnabled: false,
      curveSegments: 1,
    });
    const edges = new THREE.BufferGeometry();
    edges.setAttribute("position", new THREE.Float32BufferAttribute(edgePts, 3));
    return { africaFill: fill, africaEdges: edges };
  }, []);
}

export function AfricaMap() {
  const { africaFill, africaEdges } = useAfricaGeometry();

  return (
    <>
      <mesh geometry={africaFill}>
        <meshStandardMaterial
          color={sceneColors.landmass}
          metalness={0.32}
          roughness={0.5}
          emissive={sceneColors.landmassEmissive}
          emissiveIntensity={0.28}
        />
      </mesh>
      <lineSegments geometry={africaEdges}>
        <lineBasicMaterial
          color={sceneColors.borderGlow}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
      {CITY_LIGHTS.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.22]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? sceneColors.cityWarm : sceneColors.cityCool}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}
