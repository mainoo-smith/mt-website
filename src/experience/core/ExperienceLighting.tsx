import { useMemo } from "react";
import { sceneColors } from "@/config/brand";

export function ExperienceLighting() {
  return (
    <>
      <ambientLight intensity={0.22} />
      <hemisphereLight args={[sceneColors.hemisphereSky, sceneColors.hemisphereGround, 0.4]} />
      {/* Key light — crisp studio highlight for glossy plastic/chrome. */}
      <spotLight
        position={[5, 7.5, 5.5]}
        intensity={4.2}
        angle={0.5}
        penumbra={0.85}
        color={sceneColors.keyLight}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      {/* Warm rim from behind-right to separate objects from the ink void. */}
      <pointLight position={[3.5, 2.2, -3]} intensity={2.2} color={sceneColors.spotlight} />
      <pointLight position={[-4, 1.5, 4]} intensity={1.4} color={sceneColors.fillWarm} />
      <pointLight position={[0, -2.5, 2]} intensity={0.7} color={sceneColors.fillAccent} />
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
