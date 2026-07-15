"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CAMERA_CONFIG,
  CONTINENT_MOTION,
  LAYOUT,
  MOTION,
  SCENE_TIMING,
  SECTOR_MOTION,
  SECTOR_ORGS,
} from "@/config/scenes";
import { computeSceneWeights } from "@/experience/animations/sceneWeights";
import { flowEase, lerp, smoothstep } from "@/experience/animations/math";
import { getCameraTargets, getExperienceFraming } from "@/experience/core/experienceFraming";
import { ExperienceLighting, Starfield } from "@/experience/core/ExperienceLighting";
import { AfricaMap } from "@/experience/objects/AfricaMap";
import { CoordinationHub } from "@/experience/objects/CoordinationHub";
import { SectorCard } from "@/experience/objects/SectorCard";
import {
  buildSectorPositions,
  DataPackets,
  NetworkConnections,
} from "@/experience/objects/NetworkConnections";
import { SectorNode } from "@/experience/objects/SectorNode";
import { FrameworkScene } from "@/experience/scenes/FrameworkScene";
import { PlatformScene } from "@/experience/scenes/PlatformScene";
import { FloodScene } from "@/experience/scenes/FloodScene";
import { HealthcareScene } from "@/experience/scenes/HealthcareScene";
import { EmergencyScene } from "@/experience/scenes/EmergencyScene";
import { ComplianceScene } from "@/experience/scenes/ComplianceScene";
import { FutureScene } from "@/experience/scenes/FutureScene";

const HUB_STAND_Y = LAYOUT.groundY + 0.34;
/** Final display scale of the coordination hub at full connect. */
const HUB_SCALE = 0.66;
/** Radius of the hub body footprint at HUB_SCALE (pipes dock to this edge). */
const HUB_DOCK_RADIUS = 0.3;
/** Radius of a card footprint toward the hub (pipes start from this edge). */
const CARD_DOCK_INSET = 0.28;

export function SceneManager({ progress }: { progress: number }) {
  const continentGroup = useRef<THREE.Group>(null);
  const sectors = useRef<THREE.Group>(null);
  const cards = useRef<THREE.Group>(null);
  const links = useRef<THREE.Group>(null);
  const packets = useRef<THREE.Group>(null);
  const hub = useRef<THREE.Group>(null);
  const coreGlow = useRef<THREE.Mesh>(null);
  const hubRingA = useRef<THREE.Mesh>(null);
  const hubRingB = useRef<THREE.Mesh>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const { size } = useThree();
  const framing = getExperienceFraming(size.width, size.height);

  const showOrgLabels =
    progress > SCENE_TIMING.orgLabels.showAfter && progress < SCENE_TIMING.orgLabels.hideAfter;

  // Scene 2 vertical ring (kept as-is) and Scene 3+ ground ring.
  const basePositions = useMemo(
    () => buildSectorPositions(SECTOR_ORGS.length, LAYOUT.sectorRadiusX, LAYOUT.sectorRadiusY),
    [],
  );
  // Nodes sit on a tall vertical ellipse (XY plane) facing the camera.
  const groundPositions = useMemo(
    () =>
      SECTOR_ORGS.map((_, i) => {
        const n = SECTOR_ORGS.length;
        const a = Math.PI / 2 - (i / n) * Math.PI * 2; // node 0 at top, clockwise
        return new THREE.Vector3(
          Math.cos(a) * LAYOUT.ringRadiusX,
          HUB_STAND_Y + Math.sin(a) * LAYOUT.ringRadiusY,
          0,
        );
      }),
    [],
  );

  // Spoke pipes run in the vertical plane from each tile edge to the hub edge,
  // bowed slightly toward the camera so they read as connections.
  const groundCurves = useMemo(() => {
    const hubCenter = new THREE.Vector3(0, HUB_STAND_Y, 0);
    return groundPositions.map((p) => {
      const dir = new THREE.Vector2(p.x - hubCenter.x, p.y - hubCenter.y).normalize();
      const start = new THREE.Vector3(
        p.x - dir.x * CARD_DOCK_INSET,
        p.y - dir.y * CARD_DOCK_INSET,
        0,
      );
      const end = new THREE.Vector3(
        hubCenter.x + dir.x * HUB_DOCK_RADIUS,
        hubCenter.y + dir.y * HUB_DOCK_RADIUS,
        0,
      );
      const mid = start.clone().lerp(end, 0.5);
      mid.z = 0.18;
      return new THREE.QuadraticBezierCurve3(start, mid, end);
    });
  }, [groundPositions]);

  const tubeGeos = useMemo(
    () => groundCurves.map((curve) => new THREE.TubeGeometry(curve, 40, 0.024, 12, false)),
    [groundCurves],
  );
  const packetOffsets = useMemo(() => groundCurves.map(() => [0, 0.33, 0.66]), [groundCurves]);
  const packetCount = groundCurves.length * 3;

  useFrame(({ camera, clock }) => {
    const t = progressRef.current;
    const w = computeSceneWeights(t);
    const { continent, isolation, flood, connect, challenge, platform, framework } = w;
    const iso = smoothstep(SCENE_TIMING.iso.start, SCENE_TIMING.iso.end, t);

    const sectorPhase = Math.max(isolation, flood, connect, challenge);
    const actIExit = 1 - smoothstep(0.5, 0.56, t);
    const coordinationVisible = sectorPhase > 0.02 && actIExit > 0.02;
    const hubVisible =
      connect > SCENE_TIMING.hub.showAfter &&
      challenge < 0.15 &&
      flood < 0.12 &&
      actIExit > 0.02;

    const spread = 1 + challenge * (LAYOUT.challengeSpreadMax - 1);
    // Crossfade: Scene 2 flat badges (iso=0) → dimensional system boxes (iso=1).
    const badgeVisibility = 1 - smoothstep(0.2, 0.55, iso);
    const cardVisibility = smoothstep(0.4, 0.78, iso);

    if (continentGroup.current) {
      continentGroup.current.visible = continent > 0.02;
      continentGroup.current.rotation.z = Math.sin(clock.elapsedTime * 0.2) * 0.03;
      continentGroup.current.rotation.y = lerp(
        CONTINENT_MOTION.rotationY.start,
        CONTINENT_MOTION.rotationY.end,
        smoothstep(0, CONTINENT_MOTION.rotationY.progressEnd, t),
      );
      continentGroup.current.scale.setScalar(
        lerp(CONTINENT_MOTION.scale.start, CONTINENT_MOTION.scale.peak, smoothstep(0, CONTINENT_MOTION.scale.progressEnd, t)) *
          Math.max(continent, 0.001),
      );
      continentGroup.current.position.y = lerp(CONTINENT_MOTION.positionY.start, CONTINENT_MOTION.positionY.end, 1 - continent);
      continentGroup.current.position.z = lerp(CONTINENT_MOTION.positionZ.start, CONTINENT_MOTION.positionZ.end, 1 - continent);
    }

    if (sectors.current) {
      sectors.current.visible = coordinationVisible && badgeVisibility > 0.02;
      sectors.current.scale.setScalar(lerp(SECTOR_MOTION.scale.start, SECTOR_MOTION.scale.end, sectorPhase));
      sectors.current.position.y = lerp(
        lerp(SECTOR_MOTION.positionY.start, SECTOR_MOTION.positionY.end, Math.max(isolation, connect)),
        0,
        iso,
      );

      sectors.current.children.forEach((child, i) => {
        const g = child as THREE.Group;
        const vert = basePositions[i];
        const gnd = groundPositions[i];

        const px = lerp(vert.x, gnd.x * spread, iso);
        const py = lerp(vert.y, gnd.y, iso);
        const pz = lerp(vert.z, gnd.z, iso);

        const idle = Math.sin(clock.elapsedTime * 0.9 + i * 0.7) * SECTOR_MOTION.idleBob;
        const bob =
          (isolation > SECTOR_MOTION.bobThreshold.isolation || flood > 0.2) &&
          connect < SECTOR_MOTION.bobThreshold.connect
            ? Math.sin(clock.elapsedTime * (1.5 + i * 0.4) + i) * 0.1
            : 0;

        g.position.set(px, py + idle, pz + bob * (1 - iso));
        g.scale.setScalar(badgeVisibility);
        g.rotation.z = Math.sin(clock.elapsedTime * 0.5 + i) * SECTOR_MOTION.idleRot;

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

    if (cards.current) {
      cards.current.visible = coordinationVisible && cardVisibility > 0.02;
      cards.current.children.forEach((child, i) => {
        const g = child as THREE.Group;
        const gnd = groundPositions[i];
        const idle = Math.sin(clock.elapsedTime * 0.8 + i * 0.8) * 0.02;
        g.position.set(gnd.x * spread, gnd.y + idle, gnd.z);
        g.scale.setScalar(cardVisibility * actIExit);
      });
    }

    if (links.current) {
      links.current.visible = hubVisible && connect > SCENE_TIMING.links.showAfter;
      links.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.opacity =
          Math.min(1, connect * 1.6) * actIExit * (0.7 + 0.3 * Math.sin(clock.elapsedTime * 2.2 + i));
      });
    }

    if (packets.current) {
      packets.current.visible = hubVisible && connect > SCENE_TIMING.packets.showAfter;
      let idx = 0;
      groundCurves.forEach((curve, cIdx) => {
        for (let p = 0; p < 3; p++) {
          const mesh = packets.current!.children[idx] as THREE.Mesh;
          idx += 1;
          if (!mesh) return;
          const raw =
            (clock.elapsedTime * (0.2 + p * 0.035) + packetOffsets[cIdx][p] + cIdx * 0.11) % 1;
          const u = flowEase(raw);
          mesh.position.copy(curve.getPoint(u));
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = (0.4 + connect * 0.6) * actIExit;
          mesh.scale.setScalar(0.85 + (1 - u) * 0.4);
        }
      });
    }

    if (hub.current) {
      hub.current.visible = hubVisible;
      const pulse = 1 + Math.sin(clock.elapsedTime * 2.6) * MOTION.hubPulse;
      hub.current.scale.setScalar(lerp(0.04, lerp(0.9, 1, iso) * HUB_SCALE, connect) * pulse * actIExit);
      hub.current.position.set(0, lerp(LAYOUT.hubZ, HUB_STAND_Y, iso), 0);
      // Static: pipes dock to fixed hub edges, so the hub must not spin.
      hub.current.rotation.y = 0;
    }
    if (hubRingA.current) hubRingA.current.rotation.z += MOTION.hubRingSpeedA;
    if (hubRingB.current) hubRingB.current.rotation.z -= MOTION.hubRingSpeedB;

    if (coreGlow.current) {
      (coreGlow.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.75 + connect * 0.55 + Math.sin(clock.elapsedTime * 2.6) * 0.15;
    }

    // Camera: front elevation (Scenes 1-2) → product-demo 3/4 over compact stage (Scenes 3-6).
    // The stage lives at world x = cx, but the camera looks left of it (framing bias)
    // so the composition sits in the right half and clears the left-hand copy column.
    const cameraTargets = getCameraTargets(framing, iso);
    camera.position.x += (cameraTargets.x - camera.position.x) * CAMERA_CONFIG.damping;
    camera.position.y += (cameraTargets.y - camera.position.y) * CAMERA_CONFIG.damping;
    camera.position.z += (cameraTargets.z - camera.position.z) * CAMERA_CONFIG.damping;
    camera.lookAt(cameraTargets.lookX, cameraTargets.lookY, 0);
  });

  const weights = computeSceneWeights(progress);
  const isoProgress = smoothstep(SCENE_TIMING.iso.start, SCENE_TIMING.iso.end, progress);
  const stageOffsetX = framing.stageOffsetX + isoProgress * framing.stageOffsetIso;
  const stageY =
    framing.layout === "desktop"
      ? isoProgress * framing.stageOffsetY
      : framing.stageOffsetY * lerp(0.42, 1, isoProgress);
  const stageScale = lerp(
    framing.layout === "desktop" ? 1 : framing.stageScale * 0.9,
    framing.stageScale,
    isoProgress,
  );

  return (
    <group>
      <ExperienceLighting />
      <Starfield />

      <group ref={continentGroup}>
        <AfricaMap />
      </group>

      <group position={[stageOffsetX, stageY, 0]} scale={stageScale}>
        <group ref={sectors}>
          {SECTOR_ORGS.map((org, i) => (
            <SectorNode
              key={org.id}
              org={org}
              position={basePositions[i]}
              showLabel={showOrgLabels}
            />
          ))}
        </group>

        <group ref={cards}>
          {SECTOR_ORGS.map((org) => (
            <SectorCard key={org.id} org={org} />
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

        <FloodScene weight={weights.flood} />
        <PlatformScene weight={weights.platform} />
        <FrameworkScene weight={weights.framework} />
        <HealthcareScene weight={weights.healthcare} />
        <EmergencyScene weight={weights.emergency} />
        <ComplianceScene weight={weights.compliance} />
        <FutureScene weight={weights.future} />
      </group>
    </group>
  );
}
