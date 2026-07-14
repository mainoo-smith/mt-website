/**
 * Mainoo Platform Showcase
 * Cinematic sticky 3D narrative inspired by immersive Spline-style sites:
 * mouse-reactive camera, scroll-scrubbed zoom-through, soft materials,
 * and clickable stages. Falls back to SVG when needed.
 */
(function () {
  'use strict';

  // Capability / impact focused — light on internals
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
  var scrollPanels = document.querySelectorAll('.platform-scroll-panel');
  var overlayCopy = document.querySelector('.platform-copy');
  var progressFill = document.getElementById('platform-progress-fill');

  if (!showcase || !canvas) return;

  var currentStage = 0;
  var targetProgress = 0;
  var renderProgress = 0;
  var manualLockUntil = 0;
  var rafId = 0;
  var pointer = { x: 0, y: 0, tx: 0, ty: 0, down: false };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var saveData = !!(connection && connection.saveData);
  var lowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4);

  function shouldUseFallback() {
    if (reducedMotion || saveData) return true;
    if (lowEnd && window.innerWidth < 768) return true;
    try {
      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return true;
    } catch (e) {
      return true;
    }
    if (typeof THREE === 'undefined') return true;
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
      // Fade hero marketing copy as the cinematic scroll takes over
      var fade = 1 - Math.min(targetProgress * 1.35, 0.82);
      overlayCopy.style.opacity = String(fade);
      overlayCopy.style.transform = 'translateY(' + (-18 * targetProgress) + 'px)';
    }
    if (progressFill) {
      progressFill.style.width = (targetProgress * 100).toFixed(1) + '%';
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
  window.addEventListener('resize', syncFromScroll);

  if (shouldUseFallback()) {
    canvas.style.display = 'none';
    if (fallback) fallback.hidden = false;
    setStageUI(0, false);
    syncFromScroll();
    return;
  }

  if (fallback) fallback.hidden = true;

  // --- Three.js cinematic scene ---
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x050505, 1);
  renderer.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.045);

  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.2, 8.5);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  var key = new THREE.PointLight(0xd37506, 2.2, 50);
  key.position.set(3, 2.5, 5);
  scene.add(key);
  var rim = new THREE.PointLight(0xffe0b0, 0.9, 40);
  rim.position.set(-3.5, -1.5, 3);
  scene.add(rim);
  var back = new THREE.PointLight(0xd37506, 0.55, 60);
  back.position.set(0, 0, -6);
  scene.add(back);

  var root = new THREE.Group();
  scene.add(root);

  // Central iridescent-ish coordination core (layered for fresnel feel)
  var coreInner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.72, 2),
    new THREE.MeshStandardMaterial({
      color: 0xd37506,
      emissive: 0xd37506,
      emissiveIntensity: 0.55,
      metalness: 0.55,
      roughness: 0.22,
      flatShading: true
    })
  );
  root.add(coreInner);

  var coreShell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.95, 1),
    new THREE.MeshStandardMaterial({
      color: 0xf0c090,
      emissive: 0xd37506,
      emissiveIntensity: 0.15,
      metalness: 0.7,
      roughness: 0.15,
      transparent: true,
      opacity: 0.35,
      flatShading: true
    })
  );
  root.add(coreShell);

  var coreWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.08, 1)),
    new THREE.LineBasicMaterial({ color: 0xf8ead9, transparent: true, opacity: 0.28 })
  );
  root.add(coreWire);

  // Scroll-scrubbed orbital rings (Diego-style zoom-through)
  var rings = [];
  for (var r = 0; r < 4; r++) {
    var ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.55 + r * 0.55, 0.018, 10, 96),
      new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? 0xd37506 : 0xf8ead9,
        transparent: true,
        opacity: 0.22 + r * 0.05
      })
    );
    ring.rotation.x = Math.PI / 2.4 + r * 0.18;
    ring.rotation.y = r * 0.4;
    root.add(ring);
    rings.push(ring);
  }

  // Soft particle field
  var particleCount = lowEnd ? 180 : 420;
  var particlePositions = new Float32Array(particleCount * 3);
  var particleSeeds = new Float32Array(particleCount);
  for (var i = 0; i < particleCount; i++) {
    particleSeeds[i] = Math.random() * Math.PI * 2;
    var radius = 1.2 + Math.random() * 5.5;
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.65;
    particlePositions[i * 3 + 2] = radius * Math.cos(phi);
  }
  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  var particleMat = new THREE.PointsMaterial({
    color: 0xf8ead9,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    sizeAttenuation: true
  });
  var particles = new THREE.Points(particleGeo, particleMat);
  root.add(particles);

  // Ingest nodes (left) + impact orbs (right)
  var ingestGroup = new THREE.Group();
  root.add(ingestGroup);
  var ingestNodes = [];
  [[-3.6, 1.2, 0.3], [-3.9, -0.15, -0.5], [-3.4, -1.25, 0.55]].forEach(function (p, idx) {
    var mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.2 - idx * 0.02, 0),
      new THREE.MeshStandardMaterial({
        color: 0xf8ead9,
        emissive: 0xd37506,
        emissiveIntensity: 0.35,
        metalness: 0.4,
        roughness: 0.3
      })
    );
    mesh.position.set(p[0], p[1], p[2]);
    ingestGroup.add(mesh);
    ingestNodes.push(mesh);
  });

  var impactGroup = new THREE.Group();
  root.add(impactGroup);
  var impactOrbs = [];
  // Three illustrative outcome lights
  [{ y: 1.25, s: 0.38 }, { y: 0.05, s: 0.48 }, { y: -1.2, s: 0.34 }].forEach(function (meta) {
    var orb = new THREE.Mesh(
      new THREE.SphereGeometry(meta.s, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0xd37506,
        emissive: 0xd37506,
        emissiveIntensity: 0.2,
        metalness: 0.35,
        roughness: 0.25,
        transparent: true,
        opacity: 0.85
      })
    );
    orb.position.set(3.5, meta.y, 0);
    impactGroup.add(orb);
    impactOrbs.push(orb);

    var halo = new THREE.Mesh(
      new THREE.SphereGeometry(meta.s * 1.55, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0xd37506,
        transparent: true,
        opacity: 0.12
      })
    );
    orb.add(halo);
  });

  function makeCurveBeam(from, to, opacity) {
    var mid = new THREE.Vector3(
      (from.x + to.x) * 0.5,
      (from.y + to.y) * 0.5 + 0.55,
      (from.z + to.z) * 0.5
    );
    var curve = new THREE.QuadraticBezierCurve3(from.clone(), mid, to.clone());
    var geo = new THREE.TubeGeometry(curve, 48, 0.016, 6, false);
    return new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: 0xd37506, transparent: true, opacity: opacity || 0.3 })
    );
  }

  var beamsIn = ingestNodes.map(function (n) {
    var b = makeCurveBeam(n.position, new THREE.Vector3(0, 0, 0), 0.28);
    root.add(b);
    return b;
  });
  var beamsOut = impactOrbs.map(function (n) {
    var b = makeCurveBeam(new THREE.Vector3(0, 0, 0), n.position, 0.18);
    root.add(b);
    return b;
  });

  // Traveling packet dots along the pipeline
  var packets = [];
  for (var p = 0; p < 18; p++) {
    var packet = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe0b0 })
    );
    packet.userData.t = Math.random();
    packet.userData.lane = p % 3;
    root.add(packet);
    packets.push(packet);
  }

  function resize() {
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

    // Camera: start wide → dive through rings → settle on impact (Spline zoom-through)
    var camZ = 8.5 - e * 5.2;
    if (e > 0.35 && e < 0.7) {
      camZ -= Math.sin((e - 0.35) / 0.35 * Math.PI) * 1.4;
    }
    var camY = 0.25 + Math.sin(e * Math.PI) * 0.35;
    var lookY = (e - 0.5) * 0.2;

    // Mouse parallax (Spline-style reactive hero)
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    var targetCamX = pointer.x * 0.85;
    var targetCamY = camY - pointer.y * 0.45;

    camera.position.x += (targetCamX - camera.position.x) * 0.08;
    camera.position.y += (targetCamY - camera.position.y) * 0.08;
    camera.position.z += (camZ - camera.position.z) * 0.08;
    camera.lookAt(pointer.x * 0.2, lookY, 0);

    // Core pulse + scale
    var pulse = 1 + Math.sin(performance.now() * 0.0022) * 0.03;
    var coreScale = (1 + e * 0.35) * pulse;
    coreInner.scale.setScalar(coreScale);
    coreShell.scale.setScalar(coreScale * 1.02);
    coreWire.scale.setScalar(coreScale * 1.05);
    coreInner.material.emissiveIntensity = 0.4 + e * 0.55;
    coreShell.material.opacity = 0.25 + e * 0.25;

    coreInner.rotation.y += 0.006;
    coreInner.rotation.x += 0.002;
    coreShell.rotation.y -= 0.004;
    coreWire.rotation.y += 0.003;

    // Rings spin + open during mid scroll
    rings.forEach(function (ring, idx) {
      ring.rotation.z += 0.003 + idx * 0.0015;
      ring.rotation.y += 0.0015;
      ring.scale.setScalar(1 + e * (0.35 + idx * 0.08));
      ring.material.opacity = 0.15 + (1 - Math.abs(e - 0.45)) * 0.35;
    });

    // Ingest emphasis early
    var ingestStrength = 1 - Math.min(e * 1.1, 1) * 0.45;
    ingestGroup.position.x = -0.4 * e;
    ingestNodes.forEach(function (n, idx) {
      n.rotation.y += 0.02;
      n.scale.setScalar(0.85 + ingestStrength * 0.4 + Math.sin(performance.now() * 0.003 + idx) * 0.05);
      n.material.emissiveIntensity = 0.25 + (e < 0.35 ? 0.45 : 0.15);
    });
    beamsIn.forEach(function (b) {
      b.material.opacity = 0.12 + (e < 0.4 ? 0.4 : 0.15);
    });

    // Impact orbs strengthen late
    var impactStrength = Math.max(0, (e - 0.5) / 0.5);
    impactGroup.position.x = 0.25 * impactStrength;
    impactOrbs.forEach(function (orb, idx) {
      var local = Math.max(0, impactStrength - idx * 0.08);
      orb.scale.setScalar(0.55 + local * 0.9);
      orb.material.emissiveIntensity = 0.15 + local * 0.85;
      orb.material.opacity = 0.45 + local * 0.5;
      orb.position.y += Math.sin(performance.now() * 0.002 + idx) * 0.002;
    });
    beamsOut.forEach(function (b) {
      b.material.opacity = 0.08 + impactStrength * 0.5;
    });

    root.rotation.y = e * 0.65 + pointer.x * 0.15;

    // Particles breathe outward toward impact
    particles.rotation.y += 0.0008;
    particleMat.opacity = 0.35 + e * 0.45;
    var pos = particleGeo.attributes.position.array;
    for (var i = 0; i < particleCount; i++) {
      var base = i * 3;
      // gentle orbital drift
      var ang = particleSeeds[i] + performance.now() * 0.00015 * (1 + e);
      pos[base] += Math.cos(ang) * 0.0015;
      pos[base + 1] += Math.sin(ang * 1.3) * 0.001;
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Packets flow left → right scaled by progress
    packets.forEach(function (packet, idx) {
      packet.userData.t += 0.004 + e * 0.006;
      if (packet.userData.t > 1) packet.userData.t -= 1;
      var t = packet.userData.t;
      var lane = packet.userData.lane;
      var yOff = (lane - 1) * 0.55;
      packet.position.set(
        -3.8 + t * 7.6,
        yOff + Math.sin(t * Math.PI * 2 + idx) * 0.2,
        Math.cos(t * Math.PI + idx) * 0.25
      );
      packet.visible = t < 0.92;
      packet.scale.setScalar(0.7 + e * 0.6);
    });
  }

  function tick() {
    rafId = requestAnimationFrame(tick);
    renderProgress += (targetProgress - renderProgress) * 0.065;
    applyNarrative(renderProgress);
    if (progressFill && performance.now() >= manualLockUntil) {
      // keep bar in sync with smoothed progress during free scroll
    }
    renderer.render(scene, camera);
  }

  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      tick();
    }
  }

  // Drag / click canvas to nudge scene (interactive, Spline-like)
  canvas.addEventListener('pointerdown', function () {
    pointer.down = true;
  });
  window.addEventListener('pointerup', function () {
    pointer.down = false;
  });

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);

  setStageUI(0, false);
  resize();
  syncFromScroll();
  tick();
})();
