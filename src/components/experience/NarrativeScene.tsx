"use client";

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

export function NarrativeScene({ progress }: { progress: number }) {
  const root = useRef<THREE.Group>(null);
  const globe = useRef<THREE.Group>(null);
  const city = useRef<THREE.Group>(null);
  const links = useRef<THREE.Group>(null);
  const logo = useRef<THREE.Mesh>(null);

  const orgPositions = useMemo(() => {
    return ORGS.map((_, i) => {
      const a = (i / ORGS.length) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * 2.6, Math.sin(a) * 1.35, Math.sin(a * 2) * 0.4);
    });
  }, []);

  const starGeo = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ camera, clock }) => {
    const t = progress;
    const continent = 1 - smoothstep(0.22, 0.36, t);
    const isolation = smoothstep(0.24, 0.38, t) * (1 - smoothstep(0.52, 0.64, t));
    const connect = smoothstep(0.55, 0.7, t);

    if (globe.current) {
      globe.current.visible = continent > 0.02;
      globe.current.rotation.y = clock.elapsedTime * 0.08 + t * 0.8;
      // Ease camera toward Africa-ish longitude feel
      globe.current.rotation.x = lerp(0.15, 0.35, smoothstep(0.05, 0.25, t));
      globe.current.scale.setScalar(lerp(0.85, 1.15, smoothstep(0, 0.2, t)) * continent);
      globe.current.position.y = lerp(0, -0.8, 1 - continent);
    }

    if (city.current) {
      city.current.visible = isolation + connect > 0.02;
      city.current.scale.setScalar(lerp(0.2, 1, isolation + connect * 0.35));
      city.current.rotation.y = clock.elapsedTime * 0.05;
      city.current.position.y = lerp(1.5, 0, isolation + connect);
    }

    if (links.current) {
      links.current.visible = connect > 0.05;
      links.current.children.forEach((child, i) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = Math.min(1, connect * 1.4) * (0.35 + ((i + clock.elapsedTime) % 1) * 0.45);
      });
    }

    if (logo.current) {
      logo.current.visible = connect > 0.1;
      const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.03;
      logo.current.scale.setScalar(lerp(0.1, 1, connect) * pulse);
      (logo.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + connect * 0.9;
    }

    // Camera path
    const camZ = lerp(8.8, 6.4, connect);
    const camY = lerp(0.35, 0.1, isolation);
    camera.position.x = lerp(0, 0.2, connect);
    camera.position.y += (camY - camera.position.y) * 0.06;
    camera.position.z += (camZ - camera.position.z) * 0.06;
    camera.lookAt(0, 0, 0);

    if (root.current) {
      root.current.rotation.y = Math.sin(clock.elapsedTime * 0.15) * 0.04;
    }
  });

  return (
    <group ref={root}>
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 3, 5]} intensity={2.2} color="#d37506" />
      <pointLight position={[-4, -1, 3]} intensity={0.8} color="#ffe6c0" />

      <points geometry={starGeo}>
        <pointsMaterial color="#f8ead9" size={0.035} sizeAttenuation transparent opacity={0.75} />
      </points>

      {/* Scene 1 — Digital continent */}
      <group ref={globe}>
        <mesh>
          <sphereGeometry args={[1.55, 48, 48]} />
          <meshStandardMaterial
            color="#1b1b1b"
            metalness={0.4}
            roughness={0.55}
            emissive="#d37506"
            emissiveIntensity={0.08}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.58, 32, 32]} />
          <meshBasicMaterial color="#d37506" wireframe transparent opacity={0.22} />
        </mesh>
        {/* Africa highlight band (stylized, not a geodata map) */}
        <mesh rotation={[0.4, -0.55, 0.1]}>
          <sphereGeometry args={[1.6, 24, 24, 0.2, 1.1, 0.7, 1.1]} />
          <meshBasicMaterial color="#d37506" transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
        {Array.from({ length: 40 }).map((_, i) => {
          const a = (i / 40) * Math.PI * 2;
          const b = ((i * 17) % 40) / 40;
          const r = 1.62;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(a) * Math.cos(b) * r,
                Math.sin(b) * r * 0.9,
                Math.sin(a) * Math.cos(b) * r,
              ]}
            >
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshBasicMaterial color="#ffe6c0" />
            </mesh>
          );
        })}
      </group>

      {/* Scene 2 — Systems in isolation */}
      <group ref={city}>
        {ORGS.map((org, i) => {
          const p = orgPositions[i];
          return (
            <group key={org.label} position={p}>
              <mesh position={[0, 0.35, 0]}>
                <boxGeometry args={[0.55, 0.9 + (i % 3) * 0.15, 0.55]} />
                <meshStandardMaterial
                  color="#222"
                  emissive={org.color}
                  emissiveIntensity={0.35}
                  metalness={0.2}
                  roughness={0.4}
                />
              </mesh>
              <mesh position={[0, 0.95, 0]}>
                <sphereGeometry args={[0.1, 12, 12]} />
                <meshStandardMaterial color={org.color} emissive={org.color} emissiveIntensity={0.8} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Scene 3 — Mainoo connects */}
      <mesh ref={logo} position={[0, 0, 0.2]}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#d37506"
          emissive="#d37506"
          emissiveIntensity={0.7}
          metalness={0.35}
          roughness={0.25}
          flatShading
        />
      </mesh>

      <group ref={links}>
        {orgPositions.map((p, i) => {
          const mid = new THREE.Vector3(p.x * 0.45, p.y * 0.45, p.z * 0.45 + 0.3);
          const curve = new THREE.QuadraticBezierCurve3(p, mid, new THREE.Vector3(0, 0, 0.2));
          const tube = new THREE.TubeGeometry(curve, 32, 0.018, 6, false);
          return (
            <mesh key={i} geometry={tube}>
              <meshBasicMaterial color="#d37506" transparent opacity={0.5} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
