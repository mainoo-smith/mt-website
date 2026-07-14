"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const ORGS = [
  { label: "Hospital", color: "#f0c090" },
  { label: "Fire", color: "#d37506" },
  { label: "Police", color: "#ffe6c0" },
  { label: "Utility", color: "#e0943a" },
  { label: "Government", color: "#f8ead9" },
  { label: "Finance", color: "#ffc878" },
];

/**
 * Recognizable Africa outline (north up). Shape emphasizes:
 * Maghreb shelf, Gulf of Guinea curve, Horn of Africa, Cape.
 */
function createAfricaShape() {
  const s = new THREE.Shape();
  const pts: [number, number][] = [
    // Maghreb / Mediterranean coast (W → E)
    [-0.55, 1.52],
    [-0.25, 1.58],
    [0.05, 1.55],
    [0.28, 1.48],
    [0.42, 1.35],
    // Red Sea / Horn of Africa
    [0.52, 1.15],
    [0.68, 0.95],
    [0.82, 0.72],
    [0.95, 0.48],
    [1.02, 0.22], // tip of Horn
    [0.88, 0.05],
    [0.72, -0.12],
    // East coast down toward Cape
    [0.62, -0.35],
    [0.55, -0.58],
    [0.48, -0.82],
    [0.38, -1.05],
    [0.28, -1.22],
    [0.12, -1.38],
    [0.0, -1.48], // Cape region
    [-0.12, -1.42],
    [-0.22, -1.28],
    // Namibia / Angola west
    [-0.32, -1.05],
    [-0.42, -0.78],
    [-0.52, -0.48],
    [-0.62, -0.18],
    // Gulf of Guinea inward
    [-0.78, 0.05],
    [-0.92, 0.22],
    [-0.98, 0.42],
    [-0.88, 0.58],
    [-0.72, 0.72],
    // West Africa bulge (Senegal / Mauritania)
    [-0.78, 0.95],
    [-0.82, 1.15],
    [-0.72, 1.32],
    [-0.55, 1.52],
  ];
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
}

function createMadagascarShape() {
  const s = new THREE.Shape();
  const pts: [number, number][] = [
    [1.12, -0.55],
    [1.22, -0.62],
    [1.28, -0.78],
    [1.22, -0.95],
    [1.1, -1.05],
    [1.02, -0.92],
    [1.0, -0.72],
    [1.05, -0.58],
    [1.12, -0.55],
  ];
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
}

/** City-light positions seeded inside the mainland bbox (rough interior). */
const CITY_LIGHTS: [number, number][] = [
  [-0.2, 1.2],
  [0.1, 1.15],
  [0.35, 0.9],
  [0.55, 0.55],
  [0.7, 0.25],
  [0.45, 0.1],
  [0.3, -0.2],
  [0.2, -0.55],
  [0.05, -0.9],
  [-0.1, -1.15],
  [-0.25, -0.7],
  [-0.4, -0.3],
  [-0.55, 0.1],
  [-0.7, 0.4],
  [-0.55, 0.7],
  [-0.35, 0.95],
  [0.0, 0.6],
  [0.15, 0.3],
  [-0.15, 0.25],
  [0.05, -0.15],
  [-0.05, 0.85],
  [0.4, -0.9],
  [-0.45, -0.55],
  [0.25, 0.7],
];

export function NarrativeScene({ progress }: { progress: number }) {
  const continentGroup = useRef<THREE.Group>(null);
  const city = useRef<THREE.Group>(null);
  const links = useRef<THREE.Group>(null);
  const packets = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const coreLabel = useRef<THREE.Group>(null);
  const board = useRef<THREE.Mesh>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const africaGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(createAfricaShape(), {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 12,
    });
    geo.center();
    return geo;
  }, []);

  const madagascarGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(createMadagascarShape(), {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.015,
      bevelSegments: 1,
    });
    return geo;
  }, []);

  const orgPositions = useMemo(() => {
    return ORGS.map((_, i) => {
      const a = (i / ORGS.length) * Math.PI * 2 - Math.PI / 2;
      return new THREE.Vector3(Math.cos(a) * 2.65, Math.sin(a) * 1.65, 0);
    });
  }, []);

  const curves = useMemo(() => {
    return orgPositions.map((p) => {
      const mid = new THREE.Vector3(p.x * 0.42, p.y * 0.42, 0.65);
      return new THREE.QuadraticBezierCurve3(p.clone(), mid, new THREE.Vector3(0, 0, 0.15));
    });
  }, [orgPositions]);

  const tubeGeos = useMemo(
    () => curves.map((curve) => new THREE.TubeGeometry(curve, 48, 0.038, 10, false)),
    [curves],
  );

  const starGeo = useMemo(() => {
    const count = 420;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const packetOffsets = useMemo(() => curves.map(() => [0, 0.33, 0.66]), [curves]);

  useFrame(({ camera, clock }) => {
    const t = progressRef.current;
    const continent = 1 - smoothstep(0.2, 0.34, t);
    const isolation = smoothstep(0.22, 0.36, t) * (1 - smoothstep(0.5, 0.62, t));
    const connect = smoothstep(0.52, 0.68, t);

    if (continentGroup.current) {
      continentGroup.current.visible = continent > 0.02;
      continentGroup.current.rotation.z = Math.sin(clock.elapsedTime * 0.2) * 0.03;
      continentGroup.current.rotation.y = lerp(0.2, -0.05, smoothstep(0, 0.25, t));
      continentGroup.current.scale.setScalar(
        lerp(0.95, 1.25, smoothstep(0, 0.18, t)) * Math.max(continent, 0.001),
      );
      continentGroup.current.position.y = lerp(0.15, -1.5, 1 - continent);
      continentGroup.current.position.z = lerp(0, -2.2, 1 - continent);
    }

    if (city.current) {
      city.current.visible = isolation + connect > 0.02;
      city.current.scale.setScalar(lerp(0.12, 1, Math.max(isolation, connect)));
      city.current.rotation.y = connect > 0.25 ? clock.elapsedTime * 0.035 : 0;
      city.current.position.y = lerp(1.15, 0, Math.max(isolation, connect));

      city.current.children.forEach((child, i) => {
        const g = child as THREE.Group;
        // Isolated: each org drifts on its own beat. Connected: settle into formation.
        const bob =
          isolation > 0.3 && connect < 0.25
            ? Math.sin(clock.elapsedTime * (1.5 + i * 0.4) + i) * 0.1
            : 0;
        g.position.z = bob;
        const pulse = g.children.find((c) => c.userData?.kind === "pulse") as THREE.Mesh | undefined;
        if (pulse) {
          const mat = pulse.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity =
            connect > 0.3
              ? 0.85 + Math.sin(clock.elapsedTime * 3.2) * 0.15
              : 0.3 + Math.sin(clock.elapsedTime * (2.2 + i * 0.8) + i) * 0.55;
        }
      });
    }

    if (board.current) {
      board.current.visible = connect > 0.08;
      const s = lerp(0.05, 1, connect);
      board.current.scale.set(s, s, s);
      (board.current.material as THREE.MeshPhysicalMaterial).opacity = 0.18 + connect * 0.22;
    }

    if (links.current) {
      links.current.visible = connect > 0.05;
      links.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.min(1, connect * 1.6) * (0.65 + 0.35 * Math.sin(clock.elapsedTime * 2.2 + i));
      });
    }

    if (packets.current) {
      packets.current.visible = connect > 0.12;
      let idx = 0;
      curves.forEach((curve, cIdx) => {
        for (let p = 0; p < 3; p++) {
          const mesh = packets.current!.children[idx] as THREE.Mesh;
          idx += 1;
          if (!mesh) return;
          // Flow org → core (information into Mainoo)
          const u = (clock.elapsedTime * (0.22 + p * 0.04) + packetOffsets[cIdx][p] + cIdx * 0.11) % 1;
          mesh.position.copy(curve.getPoint(u));
          mesh.visible = connect > 0.12;
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.4 + connect * 0.6;
          mesh.scale.setScalar(0.85 + (1 - u) * 0.4);
        }
      });
    }

    if (core.current) {
      core.current.visible = connect > 0.08;
      const pulse = 1 + Math.sin(clock.elapsedTime * 2.6) * 0.05;
      core.current.scale.setScalar(lerp(0.05, 1, connect) * pulse);
      (core.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.55 + connect * 1.1;
      core.current.rotation.y += 0.012;
    }

    if (coreLabel.current) {
      coreLabel.current.visible = connect > 0.2;
    }

    const camZ = lerp(8.0, 6.4, connect);
    const camY = lerp(0.25, 0.05, isolation);
    camera.position.x += (lerp(0, 0.08, connect) - camera.position.x) * 0.06;
    camera.position.y += (camY - camera.position.y) * 0.06;
    camera.position.z += (camZ - camera.position.z) * 0.06;
    camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      <ambientLight intensity={0.6} />
      <pointLight position={[3.5, 3, 5]} intensity={2.1} color="#d37506" />
      <pointLight position={[-3, -1, 4]} intensity={0.85} color="#ffe6c0" />

      <points geometry={starGeo}>
        <pointsMaterial color="#f8ead9" size={0.03} sizeAttenuation transparent opacity={0.7} />
      </points>

      {/* Scene 1 — Recognizable Africa + Madagascar */}
      <group ref={continentGroup}>
        <mesh geometry={africaGeo}>
          <meshStandardMaterial
            color="#1a1208"
            metalness={0.28}
            roughness={0.42}
            emissive="#d37506"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh geometry={africaGeo} scale={[1.015, 1.015, 1.12]}>
          <meshBasicMaterial color="#d37506" wireframe transparent opacity={0.4} />
        </mesh>
        <mesh geometry={madagascarGeo} position={[0.05, 0.05, 0]}>
          <meshStandardMaterial
            color="#1a1208"
            emissive="#d37506"
            emissiveIntensity={0.35}
            metalness={0.2}
            roughness={0.45}
          />
        </mesh>
        {CITY_LIGHTS.map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.14]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={i % 3 === 0 ? "#d37506" : "#ffe6c0"} />
          </mesh>
        ))}
      </group>

      {/* Scene 2/3 — Labeled systems */}
      <group ref={city}>
        {ORGS.map((org, i) => {
          const p = orgPositions[i];
          return (
            <group key={org.label} position={p}>
              <mesh position={[0, 0.22, 0]}>
                <boxGeometry args={[0.52, 0.88 + (i % 3) * 0.12, 0.52]} />
                <meshStandardMaterial
                  color="#1c1c1c"
                  emissive={org.color}
                  emissiveIntensity={0.22}
                  metalness={0.2}
                  roughness={0.42}
                />
              </mesh>
              <mesh position={[0, 0.78, 0]} userData={{ kind: "pulse" }}>
                <sphereGeometry args={[0.12, 14, 14]} />
                <meshStandardMaterial color={org.color} emissive={org.color} emissiveIntensity={0.7} />
              </mesh>
              <Html position={[0, -0.58, 0]} center style={{ pointerEvents: "none" }}>
                <div className="whitespace-nowrap rounded-md border border-white/25 bg-black/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  {org.label}
                </div>
              </Html>
            </group>
          );
        })}
      </group>

      {/* Scene 3 — Shared board + Mainoo + inbound links */}
      <mesh ref={board} rotation={[0.12, 0.2, 0]} position={[0, 0, -0.2]}>
        <boxGeometry args={[1.55, 1.55, 0.06]} />
        <meshPhysicalMaterial
          color="#f8ead9"
          transparent
          opacity={0.25}
          roughness={0.12}
          metalness={0.05}
          transmission={0.55}
          thickness={0.4}
        />
      </mesh>

      <mesh ref={core} position={[0, 0, 0.15]}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color="#d37506"
          emissive="#d37506"
          emissiveIntensity={0.85}
          metalness={0.35}
          roughness={0.2}
          flatShading
        />
      </mesh>
      <group ref={coreLabel} position={[0, -0.9, 0.15]}>
        <Html center style={{ pointerEvents: "none" }}>
          <div className="rounded-full bg-[#d37506] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white shadow-lg">
            Mainoo
          </div>
        </Html>
      </group>

      <group ref={links}>
        {tubeGeos.map((geo, i) => (
          <mesh key={i} geometry={geo}>
            <meshBasicMaterial color="#d37506" transparent opacity={0.85} depthWrite={false} />
          </mesh>
        ))}
      </group>

      <group ref={packets}>
        {curves.flatMap((_, cIdx) =>
          [0, 1, 2].map((p) => (
            <mesh key={`${cIdx}-${p}`}>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshBasicMaterial color="#ffe6c0" transparent opacity={0.95} />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}
