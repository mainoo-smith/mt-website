"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { AFRICA_COUNTRIES } from "./africaShapes";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Continuous easing that keeps data packets flowing without mechanical stops. */
function flowEase(t: number) {
  return t - (Math.sin(t * Math.PI * 2) / (Math.PI * 2)) * 0.18;
}

type IconType = "cross" | "flame" | "shield" | "bolt" | "bank" | "bars";

const ORGS: { label: string; color: string; icon: IconType }[] = [
  { label: "Hospital", color: "#ff9d5c", icon: "cross" },
  { label: "Fire", color: "#ff7a2f", icon: "flame" },
  { label: "Police", color: "#ffd7a0", icon: "shield" },
  { label: "Utility", color: "#ffc061", icon: "bolt" },
  { label: "Government", color: "#f8ead9", icon: "bank" },
  { label: "Finance", color: "#ffb347", icon: "bars" },
];

// --- Real Africa geometry (projected country borders) ---------------------
// Projection constants must match scripts/gen-africa.mjs so city coords align.
const PROJ = {
  cx: 16.75,
  cy: 1.25,
  lonScale: Math.cos((1.25 * Math.PI) / 180),
  scale: 3.1 / 72.1,
};
function projectCity(lon: number, lat: number): [number, number] {
  return [
    (lon - PROJ.cx) * PROJ.lonScale * PROJ.scale,
    (lat - PROJ.cy) * PROJ.scale,
  ];
}

/** Real major cities — glowing nodes sitting on the actual landmass. */
const CITY_COORDS: [number, number][] = [
  [31.24, 30.05], // Cairo
  [3.39, 6.45], // Lagos
  [15.27, -4.44], // Kinshasa
  [28.05, -26.2], // Johannesburg
  [36.82, -1.29], // Nairobi
  [38.74, 9.03], // Addis Ababa
  [-0.19, 5.6], // Accra
  [-7.59, 33.57], // Casablanca
  [-17.44, 14.69], // Dakar
  [32.53, 15.59], // Khartoum
  [13.23, -8.84], // Luanda
  [39.28, -6.82], // Dar es Salaam
  [-4.02, 5.35], // Abidjan
  [3.06, 36.75], // Algiers
  [18.42, -33.92], // Cape Town
  [32.58, 0.31], // Kampala
  [7.49, 9.06], // Abuja
  [32.58, -25.97], // Maputo
  [10.18, 36.81], // Tunis
  [17.08, -22.56], // Windhoek
];
const CITY_LIGHTS: [number, number][] = CITY_COORDS.map(([lon, lat]) =>
  projectCity(lon, lat),
);

// --- Sector glyph geometries (module-level, built once) -------------------
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
const PEDIMENT_GEO = new THREE.ExtrudeGeometry(pedimentShape(), {
  ...EXTRUDE_OPTS,
  depth: 0.26,
});
PEDIMENT_GEO.center();

function SectorGlyph({ icon, color }: { icon: IconType; color: string }) {
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
            <meshStandardMaterial {...matProps} color="#fff2dc" emissive="#fff2dc" emissiveIntensity={1.3} />
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

export function NarrativeScene({ progress }: { progress: number }) {
  const continentGroup = useRef<THREE.Group>(null);
  const city = useRef<THREE.Group>(null);
  const links = useRef<THREE.Group>(null);
  const packets = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const coreGlow = useRef<THREE.Mesh>(null);
  const hubRingA = useRef<THREE.Mesh>(null);
  const hubRingB = useRef<THREE.Mesh>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  // Shift the hub-and-spoke off the copy column on landscape screens.
  const { size } = useThree();
  const offsetX = size.width / size.height >= 1 ? 1.7 : 0;

  // Labels are DOM overlays that ignore mesh .visible, so gate them here.
  const showOrgLabels = progress > 0.26 && progress < 0.95;

  const { africaFill, africaEdges } = useMemo(() => {
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

  const orgPositions = useMemo(() => {
    return ORGS.map((_, i) => {
      const a = (i / ORGS.length) * Math.PI * 2 - Math.PI / 2;
      return new THREE.Vector3(Math.cos(a) * 1.3, Math.sin(a) * 1.55, 0);
    });
  }, []);

  const curves = useMemo(() => {
    return orgPositions.map((p) => {
      const mid = new THREE.Vector3(p.x * 0.42, p.y * 0.42, 0.65);
      return new THREE.QuadraticBezierCurve3(p.clone(), mid, new THREE.Vector3(0, 0, 0.15));
    });
  }, [orgPositions]);

  const tubeGeos = useMemo(
    () => curves.map((curve) => new THREE.TubeGeometry(curve, 64, 0.02, 10, false)),
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
              ? 0.9 + Math.sin(clock.elapsedTime * 3.2) * 0.2
              : 0.35 + Math.sin(clock.elapsedTime * (2.2 + i * 0.8) + i) * 0.6;
        }
      });
    }

    if (links.current) {
      links.current.visible = connect > 0.05;
      links.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
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
          const raw =
            (clock.elapsedTime * (0.2 + p * 0.035) + packetOffsets[cIdx][p] + cIdx * 0.11) % 1;
          const u = flowEase(raw);
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
    }
    if (hubRingA.current) hubRingA.current.rotation.z += 0.006;
    if (hubRingB.current) hubRingB.current.rotation.z -= 0.0095;

    if (coreGlow.current) {
      (coreGlow.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.4 + connect * 1.8 + Math.sin(clock.elapsedTime * 2.6) * 0.25;
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
      <ambientLight intensity={0.28} />
      <hemisphereLight args={["#f8ead9", "#120a04", 0.55]} />
      <spotLight position={[4.5, 5, 6]} intensity={3.4} angle={0.48} penumbra={0.9} color="#d37506" />
      <pointLight position={[-4, 1.5, 4]} intensity={1.8} color="#ffe6c0" />
      <pointLight position={[0, -3.5, 2]} intensity={1.1} color="#e0943a" />

      <points geometry={starGeo}>
        <pointsMaterial color="#f8ead9" size={0.03} sizeAttenuation transparent opacity={0.7} />
      </points>

      {/* Scene 1 — Real Africa map (country borders) */}
      <group ref={continentGroup}>
        <mesh geometry={africaFill}>
          <meshStandardMaterial
            color="#241505"
            metalness={0.32}
            roughness={0.5}
            emissive="#c26a05"
            emissiveIntensity={0.28}
          />
        </mesh>
        <lineSegments geometry={africaEdges}>
          <lineBasicMaterial
            color="#ff9e3d"
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
            <meshBasicMaterial color={i % 3 === 0 ? "#ffb347" : "#ffe6c0"} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Coordination composition — offset right of the copy column */}
      <group position={[offsetX, 0, 0]}>
      {/* Scene 2/3 — Sector systems (symbolic markers, not blocks) */}
      <group ref={city}>
        {ORGS.map((org, i) => {
          const p = orgPositions[i];
          return (
            <group key={org.label} position={p}>
              {/* glowing rim (pulses) */}
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
              {/* thin outer accent ring */}
              <mesh position={[0, 0, -0.012]}>
                <torusGeometry args={[0.47, 0.005, 10, 72]} />
                <meshStandardMaterial
                  color={org.color}
                  emissive={org.color}
                  emissiveIntensity={0.45}
                  toneMapped={false}
                />
              </mesh>
              {/* dark glass face */}
              <mesh position={[0, 0, -0.03]}>
                <circleGeometry args={[0.4, 56]} />
                <meshStandardMaterial
                  color="#0c0805"
                  emissive={org.color}
                  emissiveIntensity={0.08}
                  metalness={0.65}
                  roughness={0.32}
                />
              </mesh>
              {/* inner detail ring */}
              <mesh position={[0, 0, -0.02]}>
                <ringGeometry args={[0.3, 0.315, 56]} />
                <meshBasicMaterial color={org.color} transparent opacity={0.25} toneMapped={false} />
              </mesh>
              {/* line icon */}
              <group position={[0, 0, 0.04]} scale={0.4}>
                <SectorGlyph icon={org.icon} color={org.color} />
              </group>
              {showOrgLabels ? (
                <Html position={[0, -0.58, 0]} center style={{ pointerEvents: "none" }}>
                  <div className="whitespace-nowrap rounded-md border border-white/20 bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90">
                    {org.label}
                  </div>
                </Html>
              ) : null}
            </group>
          );
        })}
      </group>

      {/* Scene 3 — Coordination hub (reactor with Mainoo ring mark) */}
      <group ref={core} position={[0, 0, 0.15]}>
        {/* back halo */}
        <mesh position={[0, 0, -0.12]}>
          <circleGeometry args={[0.98, 64]} />
          <meshBasicMaterial
            color="#d37506"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        {/* structural outer ring */}
        <mesh>
          <torusGeometry args={[0.72, 0.06, 20, 90]} />
          <meshStandardMaterial color="#1b120a" metalness={0.85} roughness={0.35} />
        </mesh>
        {/* outer glow ring */}
        <mesh>
          <torusGeometry args={[0.72, 0.016, 16, 90]} />
          <meshStandardMaterial color="#ff9e3d" emissive="#ff9e3d" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
        {/* rotating faceted ring */}
        <mesh ref={hubRingA}>
          <torusGeometry args={[0.58, 0.032, 8, 14]} />
          <meshStandardMaterial
            color="#d37506"
            emissive="#d37506"
            emissiveIntensity={0.85}
            metalness={0.6}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>
        {/* counter-rotating tick ring */}
        <mesh ref={hubRingB}>
          <torusGeometry args={[0.46, 0.01, 8, 60]} />
          <meshStandardMaterial color="#ffe6c0" emissive="#ffe6c0" emissiveIntensity={0.7} toneMapped={false} />
        </mesh>
        {/* inner dark disc */}
        <mesh position={[0, 0, -0.02]}>
          <circleGeometry args={[0.36, 56]} />
          <meshStandardMaterial color="#0b0705" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Mainoo mark — glowing ring */}
        <mesh ref={coreGlow} position={[0, 0, 0.02]}>
          <torusGeometry args={[0.17, 0.036, 20, 56]} />
          <meshStandardMaterial color="#d37506" emissive="#d37506" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
        {/* mark center glow */}
        <mesh position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color="#fff2dc" toneMapped={false} />
        </mesh>
      </group>

      <group ref={links}>
        {tubeGeos.map((geo, i) => (
          <mesh key={i} geometry={geo}>
            <meshStandardMaterial
              color="#d37506"
              emissive="#d37506"
              emissiveIntensity={2.2}
              transparent
              opacity={0.78}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <group ref={packets}>
        {curves.flatMap((_, cIdx) =>
          [0, 1, 2].map((p) => (
            <mesh key={`${cIdx}-${p}`}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshBasicMaterial
                color="#fff2dc"
                transparent
                opacity={0.95}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          )),
        )}
      </group>
      </group>
    </group>
  );
}
