"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { LAYOUT, SCENE_TIMING, SECTOR_ORGS } from "@/config/scenes";
import { computeSceneWeights } from "@/experience/animations/sceneWeights";
import { flowEase, lerp, smoothstep } from "@/experience/animations/math";
import { ExperienceLighting, Starfield } from "@/experience/core/ExperienceLighting";
import { AfricaMap } from "@/experience/objects/AfricaMap";
import { CoordinationHub } from "@/experience/objects/CoordinationHub";
import {
  buildSectorCurves,
  buildSectorPositions,
  buildTubeGeometries,
  DataPackets,
  NetworkConnections,
} from "@/experience/objects/NetworkConnections";
import { SectorNode } from "@/experience/objects/SectorNode";

export function SceneManager({ progress }: { progress: number }) {
  const continentGroup = useRef<THREE.Group>(null);
  const sectors = useRef<THREE.Group>(null);
  const links = useRef<THREE.Group>(null);
  const packets = useRef<THREE.Group>(null);
  const hub = useRef<THREE.Group>(null);
  const coreGlow = useRef<THREE.Mesh>(null);
  const hubRingA = useRef<THREE.Mesh>(null);
  const hubRingB = useRef<THREE.Mesh>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const { size } = useThree();
  const offsetX =
    size.width / size.height >= LAYOUT.coordinationOffsetAspect ? LAYOUT.coordinationOffsetX : 0;

  const showOrgLabels =
    progress > SCENE_TIMING.orgLabels.showAfter && progress < SCENE_TIMING.orgLabels.hideAfter;

  const orgPositions = useMemo(
    () => buildSectorPositions(SECTOR_ORGS.length, LAYOUT.sectorRadiusX, LAYOUT.sectorRadiusY),
    [],
  );

  const curves = useMemo(() => buildSectorCurves(orgPositions, LAYOUT.hubZ), [orgPositions]);
  const tubeGeos = useMemo(() => buildTubeGeometries(curves), [curves]);
  const packetOffsets = useMemo(() => curves.map(() => [0, 0.33, 0.66]), [curves]);
  const packetCount = curves.length * 3;

  useFrame(({ camera, clock }) => {
    const t = progressRef.current;
    const { continent, isolation, connect } = computeSceneWeights(t);

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

    if (sectors.current) {
      sectors.current.visible = isolation + connect > 0.02;
      sectors.current.scale.setScalar(lerp(0.12, 1, Math.max(isolation, connect)));
      sectors.current.position.y = lerp(1.15, 0, Math.max(isolation, connect));

      sectors.current.children.forEach((child, i) => {
        const g = child as THREE.Group;
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
      links.current.visible = connect > SCENE_TIMING.links.showAfter;
      links.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = Math.min(1, connect * 1.6) * (0.65 + 0.35 * Math.sin(clock.elapsedTime * 2.2 + i));
      });
    }

    if (packets.current) {
      packets.current.visible = connect > SCENE_TIMING.packets.showAfter;
      let idx = 0;
      curves.forEach((curve, cIdx) => {
        for (let p = 0; p < 3; p++) {
          const mesh = packets.current!.children[idx] as THREE.Mesh;
          idx += 1;
          if (!mesh) return;
          const raw =
            (clock.elapsedTime * (0.2 + p * 0.035) + packetOffsets[cIdx][p] + cIdx * 0.11) % 1;
          const u = flowEase(raw);
          mesh.position.copy(curve.getPoint(u));
          mesh.visible = connect > SCENE_TIMING.packets.showAfter;
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.4 + connect * 0.6;
          mesh.scale.setScalar(0.85 + (1 - u) * 0.4);
        }
      });
    }

    if (hub.current) {
      hub.current.visible = connect > SCENE_TIMING.hub.showAfter;
      const pulse = 1 + Math.sin(clock.elapsedTime * 2.6) * 0.05;
      hub.current.scale.setScalar(lerp(0.05, 1, connect) * pulse);
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
      <ExperienceLighting />
      <Starfield />

      <group ref={continentGroup}>
        <AfricaMap />
      </group>

      <group position={[offsetX, 0, 0]}>
        <group ref={sectors}>
          {SECTOR_ORGS.map((org, i) => (
            <SectorNode
              key={org.id}
              org={org}
              position={orgPositions[i]}
              showLabel={showOrgLabels}
            />
          ))}
        </group>

        <CoordinationHub
          ref={hub}
          hubRingARef={hubRingA}
          hubRingBRef={hubRingB}
          coreGlowRef={coreGlow}
        />

        <group ref={links}>
          <NetworkConnections tubeGeos={tubeGeos} />
        </group>

        <group ref={packets}>
          <DataPackets count={packetCount} />
        </group>
      </group>
    </group>
  );
}
