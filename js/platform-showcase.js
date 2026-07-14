/**
 * Mainoo Platform Showcase
 * Scroll-driven + clickable stage interaction for a lightweight Three.js scene.
 * Falls back to SVG when WebGL / device / motion constraints apply.
 */
(function () {
  'use strict';

  var STAGE_CAPTIONS = [
    'Disparate signals enter the coordination fabric.',
    'Fragmented records become usable, shared context.',
    'Teams and systems move on a shared operating picture.',
    'Operators get the right information when it matters.',
    'Workflows trigger across agencies and response units.',
    'Illustrative outcomes: lives protected, damage reduced, response success.'
  ];

  var showcase = document.querySelector('.platform-showcase');
  var canvas = document.getElementById('platform-canvas');
  var fallback = document.getElementById('platform-fallback');
  var captionEl = document.getElementById('platform-stage-caption');
  var stageButtons = document.querySelectorAll('.platform-stage-btn');
  var scrollPanels = document.querySelectorAll('.platform-scroll-panel');

  if (!showcase || !canvas) return;

  var currentStage = 0;
  var targetProgress = 0;
  var renderProgress = 0;
  var manualLockUntil = 0;
  var rafId = 0;
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
    if (captionEl) {
      captionEl.textContent = STAGE_CAPTIONS[currentStage];
    }
    stageButtons.forEach(function (btn) {
      var active = Number(btn.getAttribute('data-stage')) === currentStage;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (fromManual) {
      targetProgress = currentStage / 5;
      manualLockUntil = performance.now() + 1200;
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
  }

  stageButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var stage = Number(btn.getAttribute('data-stage'));
      setStageUI(stage, true);

      // Scroll the track so the chosen stage aligns with sticky viewport
      if (scrollPanels[stage]) {
        var sticky = showcase.querySelector('.platform-showcase-sticky');
        var stickyH = sticky ? sticky.offsetHeight : window.innerHeight;
        var top = showcase.offsetTop + stage * (showcase.offsetHeight - stickyH) / 5;
        window.scrollTo({ top: top, behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  window.addEventListener('scroll', syncFromScroll, { passive: true });
  window.addEventListener('resize', syncFromScroll);

  // Fallback path
  if (shouldUseFallback()) {
    canvas.style.display = 'none';
    if (fallback) fallback.hidden = false;
    setStageUI(0, false);
    syncFromScroll();
    return;
  }

  if (fallback) fallback.hidden = true;

  // --- Three.js scene ---
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x0a0a0a, 1);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.35, 7.2);

  var ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);
  var key = new THREE.PointLight(0xd37506, 1.35, 40);
  key.position.set(2.5, 2.2, 4);
  scene.add(key);
  var fill = new THREE.PointLight(0xffffff, 0.35, 40);
  fill.position.set(-4, -1, 2);
  scene.add(fill);

  var root = new THREE.Group();
  scene.add(root);

  // Core
  var coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
  var coreMat = new THREE.MeshStandardMaterial({
    color: 0xd37506,
    emissive: 0xd37506,
    emissiveIntensity: 0.45,
    metalness: 0.35,
    roughness: 0.35,
    flatShading: true
  });
  var core = new THREE.Mesh(coreGeo, coreMat);
  root.add(core);

  var coreWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.95, 1)),
    new THREE.LineBasicMaterial({ color: 0xf8ead9, transparent: true, opacity: 0.35 })
  );
  root.add(coreWire);

  // Orbiting ingest nodes (left)
  var ingestGroup = new THREE.Group();
  root.add(ingestGroup);
  var ingestNodes = [];
  var ingestPositions = [
    [-3.4, 1.1, 0.2],
    [-3.6, -0.2, -0.6],
    [-3.2, -1.15, 0.5]
  ];
  ingestPositions.forEach(function (p) {
    var mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18, 0),
      new THREE.MeshStandardMaterial({ color: 0xf8ead9, emissive: 0xd37506, emissiveIntensity: 0.2 })
    );
    mesh.position.set(p[0], p[1], p[2]);
    ingestGroup.add(mesh);
    ingestNodes.push(mesh);
  });

  // Sector modules (right) — generic capability endpoints
  var sectorGroup = new THREE.Group();
  root.add(sectorGroup);
  var sectors = [];
  var sectorMeta = [
    { y: 1.15, color: 0xd37506 },
    { y: 0, color: 0xe0943a },
    { y: -1.15, color: 0xb86705 }
  ];
  sectorMeta.forEach(function (meta) {
    var mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.55, 0.55),
      new THREE.MeshStandardMaterial({
        color: meta.color,
        emissive: meta.color,
        emissiveIntensity: 0.15,
        metalness: 0.2,
        roughness: 0.45
      })
    );
    mesh.position.set(3.35, meta.y, 0);
    sectorGroup.add(mesh);
    sectors.push(mesh);
  });

  // Beams / flows
  function makeBeam(from, to) {
    var points = [];
    for (var i = 0; i <= 16; i++) {
      var t = i / 16;
      points.push(new THREE.Vector3(
        from.x + (to.x - from.x) * t,
        from.y + (to.y - from.y) * t + Math.sin(t * Math.PI) * 0.35,
        from.z + (to.z - from.z) * t
      ));
    }
    var curve = new THREE.CatmullRomCurve3(points);
    var tube = new THREE.TubeGeometry(curve, 40, 0.018, 6, false);
    var mat = new THREE.MeshBasicMaterial({
      color: 0xd37506,
      transparent: true,
      opacity: 0.35
    });
    return new THREE.Mesh(tube, mat);
  }

  var beamsIn = [];
  var beamsOut = [];
  ingestNodes.forEach(function (node) {
    var beam = makeBeam(node.position, new THREE.Vector3(0, 0, 0));
    root.add(beam);
    beamsIn.push(beam);
  });
  sectors.forEach(function (node) {
    var beam = makeBeam(new THREE.Vector3(0, 0, 0), node.position);
    root.add(beam);
    beamsOut.push(beam);
  });

  // Particle stream through the core
  var particleCount = 120;
  var particlePositions = new Float32Array(particleCount * 3);
  var particleProgress = new Float32Array(particleCount);
  for (var i = 0; i < particleCount; i++) {
    particleProgress[i] = Math.random();
    particlePositions[i * 3] = -3.5 + Math.random() * 7;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
  }
  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  var particleMat = new THREE.PointsMaterial({
    color: 0xf8ead9,
    size: 0.05,
    transparent: true,
    opacity: 0.85,
    depthWrite: false
  });
  var particles = new THREE.Points(particleGeo, particleMat);
  root.add(particles);

  function resize() {
    var w = canvas.clientWidth || showcase.clientWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }

  function applyStageVisual(p) {
    // p: 0..1 across Ingest → Impact
    var pulse = 0.9 + Math.sin(performance.now() * 0.002) * 0.05;
    core.scale.setScalar(pulse * (1 + p * 0.15));
    coreMat.emissiveIntensity = 0.35 + p * 0.45;

    var ingestOpacity = 1 - Math.min(p * 1.2, 1) * 0.35;
    ingestGroup.visible = true;
    ingestGroup.position.x = -0.2 * p;
    ingestNodes.forEach(function (n, idx) {
      n.scale.setScalar(0.85 + (1 - Math.abs(p - 0.1)) * 0.4);
      n.rotation.y += 0.01 + idx * 0.002;
    });

    beamsIn.forEach(function (b, idx) {
      b.material.opacity = 0.15 + (p < 0.35 ? 0.45 : 0.2) * (1 - idx * 0.05);
    });

    // Mid stages: pull camera inward
    var camZ = 7.2 - p * 2.4 + (p > 0.45 && p < 0.7 ? -0.8 : 0);
    var camY = 0.35 - p * 0.1;
    camera.position.z += (camZ - camera.position.z) * 0.08;
    camera.position.y += (camY - camera.position.y) * 0.08;
    camera.lookAt(0, 0, 0);

    // Outbound / impact
    var outStrength = Math.max(0, (p - 0.45) / 0.55);
    sectorGroup.position.x = 0.15 * outStrength;
    sectors.forEach(function (s, idx) {
      var local = Math.max(0, outStrength - idx * 0.08);
      s.scale.setScalar(0.7 + local * 0.7);
      s.material.emissiveIntensity = 0.1 + local * 0.55;
      s.rotation.x += 0.008;
      s.rotation.y += 0.01;
    });
    beamsOut.forEach(function (b) {
      b.material.opacity = 0.1 + outStrength * 0.55;
    });

    root.rotation.y = p * 0.55;
  }

  function updateParticles(p) {
    var positions = particleGeo.attributes.position.array;
    for (var i = 0; i < particleCount; i++) {
      particleProgress[i] += 0.004 + p * 0.004;
      if (particleProgress[i] > 1) particleProgress[i] -= 1;
      var t = particleProgress[i];
      // Path left → core → right (impact emphasis as p grows)
      var x = -3.6 + t * 7.2;
      var spread = (1 - p) * 0.9 + 0.25;
      var y = Math.sin(t * Math.PI * 2 + i) * spread * (0.4 + (1 - Math.abs(t - 0.5)) );
      var z = Math.cos(t * Math.PI * 3 + i * 0.2) * 0.35;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    particleGeo.attributes.position.needsUpdate = true;
    particleMat.opacity = 0.45 + p * 0.4;
  }

  function tick() {
    rafId = requestAnimationFrame(tick);
    renderProgress += (targetProgress - renderProgress) * 0.07;
    applyStageVisual(renderProgress);
    updateParticles(renderProgress);
    core.rotation.y += 0.004;
    coreWire.rotation.y -= 0.002;
    renderer.render(scene, camera);
  }

  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      tick();
    }
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);

  setStageUI(0, false);
  resize();
  syncFromScroll();
  tick();
})();
