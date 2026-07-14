import * as THREE from "three";
import type { SectorIcon } from "@/config/scenes";

function shieldShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.52);
  s.lineTo(0.36, 0.34);
  s.lineTo(0.36, -0.08);
  s.quadraticCurveTo(0.36, -0.42, 0, -0.54);
  s.quadraticCurveTo(-0.36, -0.42, -0.36, -0.08);
  s.lineTo(-0.36, 0.34);
  s.closePath();
  return s;
}

function boltShape() {
  const s = new THREE.Shape();
  s.moveTo(0.08, 0.54);
  s.lineTo(-0.3, 0.04);
  s.lineTo(-0.03, 0.04);
  s.lineTo(-0.14, -0.54);
  s.lineTo(0.3, 0.1);
  s.lineTo(0.03, 0.1);
  s.closePath();
  return s;
}

function pedimentShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.52, 0);
  s.lineTo(0.52, 0);
  s.lineTo(0, 0.34);
  s.closePath();
  return s;
}

const EXTRUDE_OPTS = {
  depth: 0.1,
  bevelEnabled: true,
  bevelThickness: 0.02,
  bevelSize: 0.02,
  bevelSegments: 2,
  curveSegments: 10,
};

const SHIELD_GEO = new THREE.ExtrudeGeometry(shieldShape(), EXTRUDE_OPTS);
SHIELD_GEO.center();
const BOLT_GEO = new THREE.ExtrudeGeometry(boltShape(), EXTRUDE_OPTS);
BOLT_GEO.center();
const PEDIMENT_GEO = new THREE.ExtrudeGeometry(pedimentShape(), { ...EXTRUDE_OPTS, depth: 0.26 });
PEDIMENT_GEO.center();

export function SectorGlyph({ icon, color }: { icon: SectorIcon; color: string }) {
  const matProps = {
    color,
    emissive: color,
    emissiveIntensity: 0.85,
    metalness: 0.35,
    roughness: 0.25,
    toneMapped: false as const,
  };

  switch (icon) {
    case "cross":
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.24, 0.72, 0.24]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.72, 0.24, 0.24]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        </group>
      );
    case "flame":
      return (
        <group>
          <mesh position={[0, -0.02, 0]}>
            <coneGeometry args={[0.34, 0.86, 28]} />
            <meshStandardMaterial {...matProps} emissiveIntensity={0.55} />
          </mesh>
          <mesh position={[0, -0.06, 0.02]}>
            <coneGeometry args={[0.17, 0.52, 24]} />
            <meshStandardMaterial
              {...matProps}
              color="#fff2dc"
              emissive="#fff2dc"
              emissiveIntensity={1.3}
            />
          </mesh>
        </group>
      );
    case "shield":
      return (
        <mesh geometry={SHIELD_GEO}>
          <meshStandardMaterial {...matProps} />
        </mesh>
      );
    case "bolt":
      return (
        <mesh geometry={BOLT_GEO}>
          <meshStandardMaterial {...matProps} emissiveIntensity={1.1} />
        </mesh>
      );
    case "bank":
      return (
        <group>
          <mesh position={[0, -0.44, 0]}>
            <boxGeometry args={[0.94, 0.12, 0.42]} />
            <meshStandardMaterial {...matProps} emissiveIntensity={0.5} />
          </mesh>
          {[-0.3, -0.1, 0.1, 0.3].map((x) => (
            <mesh key={x} position={[x, -0.04, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.62, 14]} />
              <meshStandardMaterial {...matProps} emissiveIntensity={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[0.86, 0.1, 0.38]} />
            <meshStandardMaterial {...matProps} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0.5, 0]} geometry={PEDIMENT_GEO}>
            <meshStandardMaterial {...matProps} emissiveIntensity={0.75} />
          </mesh>
        </group>
      );
    case "bars":
      return (
        <group>
          {[
            { x: -0.28, h: 0.4 },
            { x: 0, h: 0.66 },
            { x: 0.28, h: 0.98 },
          ].map((b, i) => (
            <mesh key={i} position={[b.x, -0.5 + b.h / 2, 0]}>
              <boxGeometry args={[0.2, b.h, 0.2]} />
              <meshStandardMaterial {...matProps} emissiveIntensity={0.6 + i * 0.2} />
            </mesh>
          ))}
        </group>
      );
  }
}
