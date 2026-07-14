"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { FRAMEWORK_STEPS, LAYOUT } from "@/config/scenes";
import { flowEase } from "@/experience/animations/math";

type FrameworkSceneProps = {
  weight: number;
};

export function FrameworkScene({ weight }: FrameworkSceneProps) {
  const packets = useRef<THREE.Group>(null);
  const links = useRef<THREE.Group>(null);

  const positions = useMemo(() => {
    const count = FRAMEWORK_STEPS.length;
    const span = LAYOUT.frameworkSpanX;
    return FRAMEWORK_STEPS.map((_, i) => {
      const t = i / (count - 1);
      const x = (t - 0.5) * span;
      const y = Math.sin(t * Math.PI) * 0.35;
      return new THREE.Vector3(x, y, 0);
    });
  }, []);

  const segmentGeos = useMemo(() => {
    const geos: THREE.TubeGeometry[] = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const a = positions[i];
      const b = positions[i + 1];
      const mid = new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.25, 0.35);
      const curve = new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone());
      geos.push(new THREE.TubeGeometry(curve, 40, 0.018, 8, false));
    }
    return geos;
  }, [positions]);

  useFrame(({ clock }) => {
    if (!packets.current || weight < 0.1) return;

    let idx = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      const a = positions[i];
      const b = positions[i + 1];
      const mid = new THREE.Vector3((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.25, 0.35);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);

      for (let p = 0; p < 2; p++) {
        const mesh = packets.current.children[idx] as THREE.Mesh;
        idx += 1;
        if (!mesh) continue;
        const raw = (clock.elapsedTime * (0.25 + p * 0.05) + i * 0.15 + p * 0.3) % 1;
        const u = flowEase(raw);
        mesh.position.copy(curve.getPoint(u));
        mesh.visible = weight > 0.15;
        (mesh.material as THREE.MeshBasicMaterial).opacity = weight * 0.95;
      }
    }

    if (links.current) {
      links.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = weight * (0.55 + 0.45 * Math.sin(clock.elapsedTime * 2.5 + i));
      });
    }
  });

  if (weight < 0.02) return null;

  return (
    <group>
      <group ref={links}>
        {segmentGeos.map((geo, i) => (
          <mesh key={i} geometry={geo}>
            <meshStandardMaterial
              color="#d37506"
              emissive="#d37506"
              emissiveIntensity={1.8}
              transparent
              opacity={0.7}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {FRAMEWORK_STEPS.map((step, i) => {
        const p = positions[i];
        const stepWeight = Math.min(1, weight * 1.4 - i * 0.08);
        return (
          <group key={step.id} position={p} scale={0.55 + stepWeight * 0.45}>
            <mesh>
              <torusGeometry args={[0.38, 0.024, 14, 64]} />
              <meshStandardMaterial
                color={step.color}
                emissive={step.color}
                emissiveIntensity={0.7 + stepWeight * 0.5}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[0, 0, -0.02]}>
              <circleGeometry args={[0.36, 48]} />
              <meshStandardMaterial color="#0c0805" emissive={step.color} emissiveIntensity={0.1} />
            </mesh>
            {stepWeight > 0.35 ? (
              <Html position={[0, -0.55, 0]} center style={{ pointerEvents: "none" }}>
                <div className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-white/85">
                  {step.label}
                </div>
              </Html>
            ) : null}
          </group>
        );
      })}

      <group ref={packets}>
        {segmentGeos.flatMap((_, i) =>
          [0, 1].map((p) => (
            <mesh key={`${i}-${p}`}>
              <sphereGeometry args={[0.045, 10, 10]} />
              <meshBasicMaterial
                color="#fff2dc"
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}
