/**
 * Mainoo Platform Showcase
 * Cinematic sticky 3D: scroll + tap/click stages, mouse/touch parallax.
 * Clear ingest → impact data flow. SVG fallback only when necessary.
 */
(function () {
  'use strict';

  var STAGE_COPY = [
    {
      title: 'Signals come in',
      caption: 'Environment, operations, and agency data enter one coordination fabric.'
    },
    {
      title: 'Context becomes shared',
      caption: 'Fragmented inputs resolve into a picture teams can act on together.'
    },
    {
      title: 'Teams coordinate',
      caption: 'Cross-agency workflows move on the same operating picture—in real time.'
    },
    {
      title: 'Decisions land faster',
      caption: 'Operators see what matters when it matters—without losing local control.'
    },
    {
      title: 'Action is orchestrated',
      caption: 'Responses trigger across units so effort compounds instead of colliding.'
    },
    {
      title: 'Impact you can name',
      caption: 'Illustrative outcomes: lives protected · damage reduced · evacuation success.'
    }
  ];

  var showcase = document.querySelector('.platform-showcase');
  var canvas = document.getElementById('platform-canvas');
  var fallback = document.getElementById('platform-fallback');
  var captionEl = document.getElementById('platform-stage-caption');
  var titleEl = document.getElementById('platform-stage-title');
  var stageButtons = document.querySelectorAll('.platform-stage-btn');
  var overlayCopy = document.querySelector('.platform-copy');
  var progressFill = document.getElementById('platform-progress-fill');
  var hintEl = document.querySelector('.platform-hint');

  if (!showcase || !canvas) return;

  var currentStage = 0;
  var targetProgress = 0;
  var renderProgress = 0;
  var manualLockUntil = 0;
  var rafId = 0;
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  var isPortrait = window.innerHeight > window.innerWidth;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var saveData = !!(connection && connection.saveData);

  if (hintEl && window.matchMedia('(hover: none)').matches) {
    hintEl.textContent = 'Scroll to enter the system · Tap a stage';
  }

  function hasWebGL() {
    try {
      var test = document.createElement('canvas');
      return !!(test.getContext('webgl') || test.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  function shouldUseFallback() {
    // Only fall back when we truly cannot run WebGL / user asks for reduced motion
    if (reducedMotion || saveData) return true;
    if (typeof THREE === 'undefined') return true;
    if (!hasWebGL()) return true;
    return false;
  }

  function setStageUI(stage, fromManual) {
    currentStage = Math.max(0, Math.min(5, stage | 0));
    var copy = STAGE_COPY[currentStage];
    if (captionEl) captionEl.textContent = copy.caption;
    if (titleEl) titleEl.textContent = copy.title;
    stageButtons.forEach(function (btn) {
      var active = Number(btn.getAttribute('data-stage')) === currentStage;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (fallback && !fallback.hidden) {
      fallback.setAttribute('data-stage', String(currentStage));
    }
    if (fromManual) {
      targetProgress = currentStage / 5;
      manualLockUntil = performance.now() + 1400;
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

    if (overlayCopy) {
      var fade = 1 - Math.min(targetProgress * 1.6, 0.9);
      overlayCopy.style.opacity = String(fade);
      overlayCopy.style.transform = 'translateY(' + (-24 * targetProgress) + 'px)';
      overlayCopy.style.pointerEvents = fade < 0.2 ? 'none' : '';
    }
    if (progressFill) {
      progressFill.style.width = (targetProgress * 100).toFixed(1) + '%';
    }
    if (fallback && !fallback.hidden) {
      fallback.style.setProperty('--flow', String(targetProgress));
    }
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
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    pointer.tx = (clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (clientY / window.innerHeight) * 2 - 1;
  }

  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('scroll', syncFromScroll, { passive: true });
  window.addEventListener('resize', function () {
    isPortrait = window.innerHeight > window.innerWidth;
    syncFromScroll();
  });

  if (shouldUseFallback()) {
    canvas.style.display = 'none';
    if (fallback) fallback.hidden = false;
    setStageUI(0, false);
    syncFromScroll();
    return;
  }

  if (fallback) fallback.hidden = true;

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: window.devicePixelRatio < 2,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x050505, 1);
  if (renderer.outputEncoding !== undefined) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.038);

  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.15, 7.4);

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  var key = new THREE.PointLight(0xd37506, 2.6, 55);
  key.position.set(2.2, 2.4, 4.5);
  scene.add(key);
  var rim = new THREE.PointLight(0xffe0b0, 1.1, 45);
  rim.position.set(-3.2, -1.2, 2.5);
  scene.add(rim);

  var root = new THREE.Group();
  scene.add(root);

  // Bright coordination core
  var coreInner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.78, 2),
    new THREE.MeshStandardMaterial({
      color: 0xd37506,
      emissive: 0xd37506,
      emissiveIntensity: 0.75,
      metalness: 0.45,
      roughness: 0.2,
      flatShading: true
    })
  );
  root.add(coreInner);

  var coreShell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 1),
    new THREE.MeshStandardMaterial({
      color: 0xffc878,
      emissive: 0xd37506,
      emissiveIntensity: 0.28,
      metalness: 0.65,
      roughness: 0.12,
      transparent: true,
      opacity: 0.42,
      flatShading: true
    })
  );
  root.add(coreShell);

  var coreWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.2, 1)),
    new THREE.LineBasicMaterial({ color: 0xffe6c0, transparent: true, opacity: 0.4 })
  );
  root.add(coreWire);

  var rings = [];
  for (var r = 0; r < 4; r++) {
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.7 + r * 0.6, 0.025, 12, 100),
      new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? 0xd37506 : 0xffe0b0,
        transparent: true,
        opacity: 0.35 + r * 0.06
      })
    );
    ring.rotation.x = Math.PI / 2.35 + r * 0.2;
    ring.rotation.y = r * 0.45;
    root.add(ring);
    rings.push(ring);
  }

  var particleCount = isPortrait ? 220 : 380;
  var particlePositions = new Float32Array(particleCount * 3);
  var particleSeeds = new Float32Array(particleCount);
  for (var i = 0; i < particleCount; i++) {
    particleSeeds[i] = Math.random() * Math.PI * 2;
    var radius = 1.1 + Math.random() * 5.2;
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.7;
    particlePositions[i * 3 + 2] = radius * Math.cos(phi);
  }
  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  var particleMat = new THREE.PointsMaterial({
    color: 0xffe6c0,
    size: isPortrait ? 0.055 : 0.042,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    sizeAttenuation: true
  });
  var particles = new THREE.Points(particleGeo, particleMat);
  root.add(particles);

  // Layout helpers: landscape = left→right, portrait = top→bottom
  function layoutAxis() {
    return isPortrait
      ? { inA: [0, 2.6, 0], inB: [-0.9, 2.2, 0.3], inC: [0.9, 2.35, -0.2], outA: [0, -2.55, 0], outB: [-0.95, -2.2, 0.25], outC: [0.95, -2.3, -0.2] }
      : { inA: [-3.5, 1.15, 0.25], inB: [-3.7, -0.1, -0.45], inC: [-3.3, -1.2, 0.5], outA: [3.45, 1.2, 0], outB: [3.55, 0.05, 0], outC: [3.4, -1.15, 0] };
  }

  var ingestGroup = new THREE.Group();
  root.add(ingestGroup);
  var ingestNodes = [];
  var impactGroup = new THREE.Group();
  root.add(impactGroup);
  var impactOrbs = [];

  function rebuildEndpoints() {
    while (ingestGroup.children.length) ingestGroup.remove(ingestGroup.children[0]);
    while (impactGroup.children.length) impactGroup.remove(impactGroup.children[0]);
    ingestNodes.length = 0;
    impactOrbs.length = 0;

    var L = layoutAxis();
    [[L.inA, 0.22], [L.inB, 0.18], [L.inC, 0.16]].forEach(function (item, idx) {
      var mesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(item[1], 0),
        new THREE.MeshStandardMaterial({
          color: 0xffe6c0,
          emissive: 0xd37506,
          emissiveIntensity: 0.55,
          metalness: 0.35,
          roughness: 0.28
        })
      );
      mesh.position.set(item[0][0], item[0][1], item[0][2]);
      ingestGroup.add(mesh);
      ingestNodes.push(mesh);
    });

    [[L.outA, 0.42], [L.outB, 0.5], [L.outC, 0.36]].forEach(function (item) {
      var orb = new THREE.Mesh(
        new THREE.SphereGeometry(item[1], 24, 24),
        new THREE.MeshStandardMaterial({
          color: 0xd37506,
          emissive: 0xd37506,
          emissiveIntensity: 0.35,
          metalness: 0.3,
          roughness: 0.22,
          transparent: true,
          opacity: 0.9
        })
      );
      orb.position.set(item[0][0], item[0][1], item[0][2]);
      var halo = new THREE.Mesh(
        new THREE.SphereGeometry(item[1] * 1.6, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xd37506, transparent: true, opacity: 0.18 })
      );
      orb.add(halo);
      impactGroup.add(orb);
      impactOrbs.push(orb);
    });
  }
  rebuildEndpoints();

  var beamGroup = new THREE.Group();
  root.add(beamGroup);
  var beamsIn = [];
  var beamsOut = [];

  function makeCurveBeam(from, to, opacity) {
    var mid = new THREE.Vector3(
      (from.x + to.x) * 0.5,
      (from.y + to.y) * 0.5 + (isPortrait ? 0 : 0.5),
      (from.z + to.z) * 0.5 + (isPortrait ? 0.45 : 0)
    );
    var curve = new THREE.QuadraticBezierCurve3(from.clone(), mid, to.clone());
    var geo = new THREE.TubeGeometry(curve, 56, 0.022, 8, false);
    return new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: 0xd37506, transparent: true, opacity: opacity || 0.45 })
    );
  }

  function rebuildBeams() {
    while (beamGroup.children.length) beamGroup.remove(beamGroup.children[0]);
    beamsIn = ingestNodes.map(function (n) {
      var b = makeCurveBeam(n.position, new THREE.Vector3(0, 0, 0), 0.5);
      beamGroup.add(b);
      return b;
    });
    beamsOut = impactOrbs.map(function (n) {
      var b = makeCurveBeam(new THREE.Vector3(0, 0, 0), n.position, 0.25);
      beamGroup.add(b);
      return b;
    });
  }
  rebuildBeams();

  var packets = [];
  for (var p = 0; p < 24; p++) {
    var packet = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffe6c0 })
    );
    packet.userData.t = Math.random();
    packet.userData.lane = p % 3;
    root.add(packet);
    packets.push(packet);
  }

  // Floating labels as simple sprites? skip text — keep visual only

  var lastPortrait = isPortrait;

  function resize() {
    isPortrait = window.innerHeight > window.innerWidth;
    if (isPortrait !== lastPortrait) {
      lastPortrait = isPortrait;
      rebuildEndpoints();
      rebuildBeams();
    }
    var w = canvas.clientWidth || showcase.clientWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function applyNarrative(p) {
    var e = easeInOut(p);

    // Camera: start back → dive through core → reveal impact
    var camZ = (isPortrait ? 8.6 : 7.6) - e * (isPortrait ? 3.8 : 4.8);
    if (e > 0.3 && e < 0.72) {
      camZ -= Math.sin((e - 0.3) / 0.42 * Math.PI) * (isPortrait ? 1.1 : 1.5);
    }
    var camY = isPortrait ? (0.4 - e * 0.9) : (0.2 + Math.sin(e * Math.PI) * 0.25);

    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;

    camera.position.x += (pointer.x * (isPortrait ? 0.45 : 0.9) - camera.position.x) * 0.1;
    camera.position.y += (camY - pointer.y * 0.35 - camera.position.y) * 0.1;
    camera.position.z += (camZ - camera.position.z) * 0.1;
    camera.lookAt(pointer.x * 0.15, isPortrait ? (-e * 0.4) : 0, 0);

    var pulse = 1 + Math.sin(performance.now() * 0.0024) * 0.04;
    var coreScale = (1.05 + e * 0.45) * pulse;
    coreInner.scale.setScalar(coreScale);
    coreShell.scale.setScalar(coreScale * 1.03);
    coreWire.scale.setScalar(coreScale * 1.08);
    coreInner.material.emissiveIntensity = 0.55 + e * 0.7;
    coreShell.material.opacity = 0.3 + e * 0.3;
    coreInner.rotation.y += 0.008;
    coreShell.rotation.y -= 0.005;
    coreWire.rotation.y += 0.004;

    rings.forEach(function (ring, idx) {
      ring.rotation.z += 0.004 + idx * 0.0018;
      ring.scale.setScalar(1 + e * (0.45 + idx * 0.1));
      ring.material.opacity = 0.2 + (1 - Math.abs(e - 0.5)) * 0.45;
    });

    // Ingest strong early
    var ingestStrength = Math.max(0.25, 1 - e * 0.85);
    ingestNodes.forEach(function (n, idx) {
      n.rotation.y += 0.03;
      n.scale.setScalar(0.9 + ingestStrength * 0.55 + Math.sin(performance.now() * 0.004 + idx) * 0.08);
      n.material.emissiveIntensity = 0.35 + (e < 0.4 ? 0.55 : 0.15);
    });
    beamsIn.forEach(function (b) {
      b.material.opacity = 0.2 + (e < 0.45 ? 0.55 : 0.18);
    });

    // Impact strong late
    var impactStrength = Math.max(0, (e - 0.4) / 0.6);
    impactOrbs.forEach(function (orb, idx) {
      var local = Math.max(0, impactStrength - idx * 0.07);
      orb.scale.setScalar(0.5 + local * 1.15);
      orb.material.emissiveIntensity = 0.2 + local * 1.1;
      orb.material.opacity = 0.5 + local * 0.5;
    });
    beamsOut.forEach(function (b) {
      b.material.opacity = 0.1 + impactStrength * 0.65;
    });

    root.rotation.y = (isPortrait ? e * 0.25 : e * 0.55) + pointer.x * 0.12;

    particles.rotation.y += 0.0012;
    particleMat.opacity = 0.45 + e * 0.45;

    // Packets travel ingest → impact along axis
    packets.forEach(function (packet, idx) {
      packet.userData.t += 0.006 + e * 0.008;
      if (packet.userData.t > 1) packet.userData.t -= 1;
      var t = packet.userData.t;
      var lane = packet.userData.lane - 1;
      if (isPortrait) {
        packet.position.set(
          lane * 0.55 + Math.sin(t * Math.PI * 2 + idx) * 0.15,
          2.5 - t * 5.1,
          Math.cos(t * Math.PI + idx) * 0.2
        );
      } else {
        packet.position.set(
          -3.6 + t * 7.3,
          lane * 0.5 + Math.sin(t * Math.PI * 2 + idx) * 0.18,
          Math.cos(t * Math.PI + idx) * 0.22
        );
      }
      packet.scale.setScalar(0.85 + e * 0.7);
      packet.visible = true;
    });
  }

  function tick() {
    rafId = requestAnimationFrame(tick);
    renderProgress += (targetProgress - renderProgress) * 0.07;
    applyNarrative(renderProgress);
    renderer.render(scene, camera);
  }

  function onVisibility() {
    if (document.hidden) cancelAnimationFrame(rafId);
    else tick();
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);

  setStageUI(0, false);
  resize();
  syncFromScroll();
  tick();
})();
