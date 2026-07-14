import { useMemo } from "react";
import { sceneColors } from "@/config/brand";

export function ExperienceLighting() {
  return (
    <>
      <ambientLight intensity={0.28} />
      <hemisphereLight args={[sceneColors.hemisphereSky, sceneColors.hemisphereGround, 0.55]} />
      <spotLight
        position={[4.5, 5, 6]}
        intensity={3.4}
        angle={0.48}
        penumbra={0.9}
        color={sceneColors.spotlight}
      />
      <pointLight position={[-4, 1.5, 4]} intensity={1.8} color={sceneColors.fillWarm} />
      <pointLight position={[0, -3.5, 2]} intensity={1.1} color={sceneColors.fillAccent} />
    </>
  );
}

export function Starfield() {
  const positions = useMemo(() => makeStarPositions(), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={sceneColors.starfield} size={0.03} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

function makeStarPositions() {
  const count = 420;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 28;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 3;
  }
  return positions;
}
