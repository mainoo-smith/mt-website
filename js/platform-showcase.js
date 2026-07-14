/**
 * Mainoo Platform Showcase
 * Sticky scroll + tap stages. Target: obviously visible ingest → impact flow.
 */
(function () {
  'use strict';

  var STAGE_COPY = [
    { title: 'Data comes in', caption: 'Sensors, hospital systems, and agency feeds enter the coordination fabric.', zone: 'in' },
    { title: 'Shared context forms', caption: 'Scattered inputs become one picture teams can act on together.', zone: 'in' },
    { title: 'Teams coordinate', caption: 'Agencies move on the same operating picture—in real time.', zone: 'core' },
    { title: 'Decisions land faster', caption: 'Operators see what matters when it matters—without losing local control.', zone: 'core' },
    { title: 'Action is orchestrated', caption: 'Responses trigger across units so effort compounds instead of colliding.', zone: 'out' },
    { title: 'Impact you can name', caption: 'Illustrative outcomes: lives protected · damage reduced · evacuation success.', zone: 'out' }
  ];

  var showcase = document.querySelector('.platform-showcase');
  var canvas = document.getElementById('platform-canvas');
  var fallback = document.getElementById('platform-fallback');
  var captionEl = document.getElementById('platform-stage-caption');
  var titleEl = document.getElementById('platform-stage-title');
  var stageButtons = document.querySelectorAll('.platform-stage-btn');
  var overlayCopy = document.querySelector('.platform-copy');
  var progressFill = document.getElementById('platform-progress-fill');
  var storyMap = document.getElementById('story-map');

  if (!showcase || !canvas) return;

  var currentStage = 0;
  var targetProgress = 0;
  var renderProgress = 0;
  var manualLockUntil = 0;
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  var isPortrait = window.matchMedia('(orientation: portrait), (max-width: 900px)').matches;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setEngine(name) {
    showcase.setAttribute('data-engine', name);
  }

  function updateOverlay(progress) {
    if (overlayCopy) {
      var fade = 1 - Math.min(progress * 3.2, 1);
      overlayCopy.style.opacity = String(fade);
      overlayCopy.style.transform = 'translateY(' + (-36 * progress) + 'px)';
      overlayCopy.style.pointerEvents = fade < 0.2 ? 'none' : '';
      overlayCopy.style.visibility = fade < 0.05 ? 'hidden' : 'visible';
    }
    if (progressFill) progressFill.style.width = (progress * 100).toFixed(1) + '%';
    showcase.classList.toggle('is-immersed', progress > 0.18);
    if (fallback && !fallback.hidden) {
      fallback.style.setProperty('--flow', String(progress));
    }
  }

  function setStageUI(stage, fromManual) {
    currentStage = Math.max(0, Math.min(5, stage | 0));
    var copy = STAGE_COPY[currentStage];
    if (captionEl) captionEl.textContent = copy.caption;
    if (titleEl) titleEl.textContent = copy.title;
    if (storyMap) storyMap.setAttribute('data-zone', copy.zone);
    stageButtons.forEach(function (btn) {
      var active = Number(btn.getAttribute('data-stage')) === currentStage;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (fallback) fallback.setAttribute('data-stage', String(currentStage));
    if (fromManual) {
      targetProgress = currentStage / 5;
      manualLockUntil = performance.now() + 1400;
      updateOverlay(targetProgress);
    }
  }

  function syncFromScroll() {
    if (performance.now() < manualLockUntil) return;
    var rect = showcase.getBoundingClientRect();
    var total = showcase.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    var scrolled = Math.min(Math.max(-rect.top, 0), total);
    targetProgress = scrolled / total;
    var stage = Math.round(targetProgress * 5);
    if (stage !== currentStage) setStageUI(stage, false);
    updateOverlay(targetProgress);
  }

  stageButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var stage = Number(btn.getAttribute('data-stage'));
      setStageUI(stage, true);
      var sticky = showcase.querySelector('.platform-showcase-sticky');
      var stickyH = sticky ? sticky.offsetHeight : window.innerHeight;
      var top = showcase.offsetTop + stage * (showcase.offsetHeight - stickyH) / 5;
      window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  function onPointerMove(e) {
    var t = e.touches ? e.touches[0] : e;
    pointer.tx = (t.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (t.clientY / window.innerHeight) * 2 - 1;
  }
  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('scroll', syncFromScroll, { passive: true });
  window.addEventListener('resize', function () {
    isPortrait = window.matchMedia('(orientation: portrait), (max-width: 900px)').matches;
    syncFromScroll();
  });

  function enableFallback(reason) {
    canvas.style.display = 'none';
    if (fallback) fallback.hidden = false;
    setEngine('fallback:' + reason);
    setStageUI(0, false);
    syncFromScroll();
  }

  if (reducedMotion) {
    enableFallback('reduced-motion');
    return;
  }
  if (typeof THREE === 'undefined') {
    enableFallback('no-three');
    return;
  }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    });
  } catch (err) {
    enableFallback('webgl-create');
    return;
  }

  if (fallback) fallback.hidden = true;
  setEngine('webgl');

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x050505, 1);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.028);

  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(isPortrait ? 0 : -0.4, 0, isPortrait ? 7.2 : 6.8);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  var key = new THREE.PointLight(0xd37506, 3.2, 60);
  key.position.set(2, 2.5, 5);
  scene.add(key);
  var fill = new THREE.PointLight(0xffe6c0, 1.2, 50);
  fill.position.set(-3, -1, 3);
  scene.add(fill);

  var root = new THREE.Group();
  // Desktop: keep core/impact to the right of marketing copy
  root.position.x = isPortrait ? 0 : 2.15;
  scene.add(root);

  // Oversized bright core — must read on phone behind overlay gaps
  var coreInner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 2),
    new THREE.MeshStandardMaterial({
      color: 0xd37506,
      emissive: 0xd37506,
      emissiveIntensity: 1.1,
      metalness: 0.4,
      roughness: 0.18,
      flatShading: true
    })
  );
  root.add(coreInner);

  var coreShell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.4, 1),
    new THREE.MeshStandardMaterial({
      color: 0xffc878,
      emissive: 0xd37506,
      emissiveIntensity: 0.45,
      metalness: 0.6,
      roughness: 0.12,
      transparent: true,
      opacity: 0.4,
      flatShading: true
    })
  );
  root.add(coreShell);

  var coreWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.55, 1)),
    new THREE.LineBasicMaterial({ color: 0xffe6c0, transparent: true, opacity: 0.55 })
  );
  root.add(coreWire);

  var rings = [];
  for (var r = 0; r < 3; r++) {
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.0 + r * 0.7, 0.04, 12, 96),
      new THREE.MeshBasicMaterial({
        color: r % 2 ? 0xffe6c0 : 0xd37506,
        transparent: true,
        opacity: 0.55
      })
    );
    ring.rotation.x = Math.PI / 2.2 + r * 0.25;
    root.add(ring);
    rings.push(ring);
  }

  var particleCount = 280;
  var particlePositions = new Float32Array(particleCount * 3);
  var particleSeeds = new Float32Array(particleCount);
  for (var i = 0; i < particleCount; i++) {
    particleSeeds[i] = Math.random() * Math.PI * 2;
    var radius = 1.4 + Math.random() * 5;
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.75;
    particlePositions[i * 3 + 2] = radius * Math.cos(phi);
  }
  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  var particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({
      color: 0xffe6c0,
      size: 0.07,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    })
  );
  root.add(particles);

  var ingestGroup = new THREE.Group();
  var impactGroup = new THREE.Group();
  var beamGroup = new THREE.Group();
  root.add(ingestGroup);
  root.add(impactGroup);
  root.add(beamGroup);
  var ingestNodes = [];
  var impactOrbs = [];
  var beamsIn = [];
  var beamsOut = [];

  function layout() {
    return isPortrait
      ? {
        ins: [[0, 3.1, 0], [-1.1, 2.7, 0.35], [1.1, 2.8, -0.25]],
        outs: [[0, -3.15, 0], [-1.15, -2.7, 0.3], [1.15, -2.75, -0.2]]
      }
      : {
        ins: [[-4.9, 1.35, 0.3], [-5.15, 0.05, -0.45], [-4.8, -1.25, 0.5]],
        outs: [[3.9, 1.3, 0], [4.15, 0.05, 0], [3.95, -1.2, 0]]
      };
  }

  function makeBeam(from, to, opacity) {
    var mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    if (isPortrait) mid.z += 0.55;
    else mid.y += 0.55;
    var curve = new THREE.QuadraticBezierCurve3(from.clone(), mid, to.clone());
    return new THREE.Mesh(
      new THREE.TubeGeometry(curve, 64, 0.035, 8, false),
      new THREE.MeshBasicMaterial({ color: 0xd37506, transparent: true, opacity: opacity })
    );
  }

  function rebuildAnchors() {
    while (ingestGroup.children.length) ingestGroup.remove(ingestGroup.children[0]);
    while (impactGroup.children.length) impactGroup.remove(impactGroup.children[0]);
    while (beamGroup.children.length) beamGroup.remove(beamGroup.children[0]);
    ingestNodes = [];
    impactOrbs = [];
    beamsIn = [];
    beamsOut = [];

    var L = layout();
    L.ins.forEach(function (p, idx) {
      var n = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.28 - idx * 0.03, 0),
        new THREE.MeshStandardMaterial({
          color: 0xffe6c0,
          emissive: 0xd37506,
          emissiveIntensity: 0.9,
          metalness: 0.3,
          roughness: 0.25
        })
      );
      n.position.set(p[0], p[1], p[2]);
      ingestGroup.add(n);
      ingestNodes.push(n);
      var b = makeBeam(n.position, new THREE.Vector3(0, 0, 0), 0.65);
      beamGroup.add(b);
      beamsIn.push(b);
    });

    L.outs.forEach(function (p, idx) {
      var size = 0.48 + (idx === 1 ? 0.12 : 0);
      var orb = new THREE.Mesh(
        new THREE.SphereGeometry(size, 28, 28),
        new THREE.MeshStandardMaterial({
          color: 0xd37506,
          emissive: 0xd37506,
          emissiveIntensity: 0.55,
          metalness: 0.25,
          roughness: 0.2,
          transparent: true,
          opacity: 0.95
        })
      );
      orb.position.set(p[0], p[1], p[2]);
      orb.add(new THREE.Mesh(
        new THREE.SphereGeometry(size * 1.7, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xd37506, transparent: true, opacity: 0.2 })
      ));
      impactGroup.add(orb);
      impactOrbs.push(orb);
      var b = makeBeam(new THREE.Vector3(0, 0, 0), orb.position, 0.35);
      beamGroup.add(b);
      beamsOut.push(b);
    });
  }
  rebuildAnchors();

  var packets = [];
  for (var p = 0; p < 28; p++) {
    var packet = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffe6c0, transparent: true, opacity: 0.9 })
    );
    packet.userData.t = Math.random();
    packet.userData.lane = p % 3;
    root.add(packet);
    packets.push(packet);
  }

  var lastPortrait = isPortrait;

  function resize() {
    isPortrait = window.matchMedia('(orientation: portrait), (max-width: 900px)').matches;
    if (isPortrait !== lastPortrait) {
      lastPortrait = isPortrait;
      rebuildAnchors();
    }
    var w = canvas.clientWidth || showcase.clientWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }

  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function applyNarrative(p) {
    var e = ease(p);
    var stageF = p * 5; // 0..5 continuous

    // Stage-aware camera targets so ingest → impact is readable
    var camTarget;
    if (isPortrait) {
      if (stageF < 1.2) camTarget = { x: 0, y: 1.6, z: 7.8 };       // look at ingest
      else if (stageF < 3.2) camTarget = { x: 0, y: 0.15, z: 6.2 };  // core
      else if (stageF < 4.4) camTarget = { x: 0, y: -0.6, z: 5.8 }; // action
      else camTarget = { x: 0, y: -1.9, z: 7.0 };                     // impact orbs
    } else {
      if (stageF < 1.2) camTarget = { x: -1.5, y: 0.3, z: 7.2 };
      else if (stageF < 3.2) camTarget = { x: 0.8, y: 0.1, z: 6.0 };
      else if (stageF < 4.4) camTarget = { x: 1.6, y: 0, z: 5.6 };
      else camTarget = { x: 2.6, y: 0, z: 6.8 };
    }

    pointer.x += (pointer.tx - pointer.x) * 0.1;
    pointer.y += (pointer.ty - pointer.y) * 0.1;

    var wantX = camTarget.x + pointer.x * (isPortrait ? 0.3 : 0.55);
    var wantY = camTarget.y - pointer.y * 0.28;
    var wantZ = camTarget.z;
    camera.position.x += (wantX - camera.position.x) * 0.08;
    camera.position.y += (wantY - camera.position.y) * 0.08;
    camera.position.z += (wantZ - camera.position.z) * 0.08;

    var lookY = isPortrait ? (1.2 - e * 3.0) : 0;
    var lookX = isPortrait ? 0 : (-1.2 + e * 3.4);
    camera.lookAt(lookX + pointer.x * 0.1, lookY, 0);

    root.position.x += ((isPortrait ? 0 : 2.15) - root.position.x) * 0.08;

    var pulse = 1 + Math.sin(performance.now() * 0.0026) * 0.04;
    var coreScale = (1.05 + Math.sin(Math.min(e, 1) * Math.PI) * 0.35) * pulse;
    coreInner.scale.setScalar(coreScale);
    coreShell.scale.setScalar(coreScale);
    coreWire.scale.setScalar(coreScale * 1.05);
    coreInner.material.emissiveIntensity = 0.7 + (1 - Math.abs(e - 0.5)) * 0.7;
    coreInner.rotation.y += 0.01;
    coreShell.rotation.y -= 0.007;
    coreWire.rotation.y += 0.005;

    rings.forEach(function (ring, idx) {
      ring.rotation.z += 0.006 + idx * 0.002;
      ring.scale.setScalar(1 + e * (0.4 + idx * 0.1));
      ring.material.opacity = 0.25 + (1 - Math.abs(e - 0.45)) * 0.45;
    });

    // Ingest dominant early
    var ingestStrength = Math.max(0.2, 1 - Math.max(0, stageF - 0.4) / 2.8);
    ingestNodes.forEach(function (n, idx) {
      n.rotation.y += 0.045;
      n.scale.setScalar(1.05 + ingestStrength * 0.95 + Math.sin(performance.now() * 0.005 + idx) * 0.12);
      n.material.emissiveIntensity = 0.4 + ingestStrength * 1.1;
      n.visible = true;
    });
    beamsIn.forEach(function (b) {
      b.material.opacity = 0.15 + ingestStrength * 0.7;
    });

    // Impact dominant late — three outcome orbs must blow up at the end
    var impactStrength = Math.max(0, (stageF - 2.8) / 2.2);
    impactOrbs.forEach(function (orb, idx) {
      var local = Math.max(0, impactStrength - idx * 0.05);
      orb.scale.setScalar(0.45 + local * 1.55);
      orb.material.emissiveIntensity = 0.25 + local * 1.6;
      orb.material.opacity = 0.45 + local * 0.55;
    });
    beamsOut.forEach(function (b) {
      b.material.opacity = 0.08 + impactStrength * 0.8;
    });

    root.rotation.y = (isPortrait ? e * 0.18 : e * 0.35) + pointer.x * 0.08;
    particles.rotation.y += 0.0015;

    packets.forEach(function (packet, idx) {
      packet.userData.t += 0.009 + e * 0.012;
      if (packet.userData.t > 1) packet.userData.t -= 1;
      var t = packet.userData.t;
      var lane = packet.userData.lane - 1;
      if (isPortrait) {
        packet.position.set(
          lane * 0.75 + Math.sin(t * Math.PI * 2 + idx) * 0.18,
          3.15 - t * 6.3,
          Math.cos(t * Math.PI + idx) * 0.28
        );
      } else {
        packet.position.set(
          -4.2 + t * 8.5,
          lane * 0.7 + Math.sin(t * Math.PI * 2 + idx) * 0.22,
          Math.cos(t * Math.PI + idx) * 0.28
        );
      }
      packet.scale.setScalar(1.05 + e * 0.9);
      // Emphasize packets near the active region of the story
      packet.material.opacity = 0.35 + (1 - Math.abs(t - Math.min(Math.max(e, 0.05), 0.95))) * 0.65;
    });
  }

  function tick() {
    requestAnimationFrame(tick);
    renderProgress += (targetProgress - renderProgress) * 0.075;
    applyNarrative(renderProgress);
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) tick();
  });

  setStageUI(0, false);
  resize();
  syncFromScroll();
  tick();
})();
