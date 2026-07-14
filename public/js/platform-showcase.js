/**
 * Mainoo Platform Showcase
 * Simple narrative: 5 signal sources → glass coordination board → impacts
 * (ops + compliance). Scroll + tap stages.
 */
(function () {
  'use strict';

  var SOURCES = [
    { label: 'Sensors & GIS', color: 0xffe6c0 },
    { label: 'Hospital systems', color: 0xf0c090 },
    { label: 'Agency feeds', color: 0xd37506 },
    { label: 'Cloud signals', color: 0xffc878 },
    { label: 'Compliance evidence', color: 0xe0943a }
  ];

  var IMPACTS = [
    { label: 'Lives protected', color: 0xd37506 },
    { label: 'Damage reduced', color: 0xe0943a },
    { label: 'Evacuation success', color: 0xffc878 },
    { label: 'Risk reduced', color: 0xf0c090 },
    { label: 'Trust ensured', color: 0xffe6c0 }
  ];

  var STAGE_COPY = [
    { title: 'Signals arrive', caption: 'Five live sources stream into the coordination board.', zone: 'in' },
    { title: 'Signals unify', caption: 'Fragmented inputs land on one shared glass board.', zone: 'in' },
    { title: 'Teams coordinate', caption: 'The board becomes the shared operating picture.', zone: 'core' },
    { title: 'Decisions form', caption: 'Operators act from one view—without losing local control.', zone: 'core' },
    { title: 'Action leaves the board', caption: 'Coordinated responses fan out to people and systems.', zone: 'out' },
    { title: 'Impact you can name', caption: 'Ops + compliance outcomes: lives, damage, evacuation, risk reduced, trust ensured.', zone: 'out' }
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
  scene.fog = new THREE.FogExp2(0x050505, 0.022);

  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  var root = new THREE.Group();
  root.position.x = isPortrait ? 0 : 1.6;
  scene.add(root);

  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  var key = new THREE.PointLight(0xd37506, 2.4, 50);
  key.position.set(2, 3, 5);
  scene.add(key);
  var fill = new THREE.PointLight(0xffffff, 0.8, 40);
  fill.position.set(-3, 1, 4);
  scene.add(fill);

  // ---- Glass coordination board ----
  var boardGroup = new THREE.Group();
  root.add(boardGroup);

  var board = new THREE.Mesh(
    new THREE.BoxGeometry(isPortrait ? 2.6 : 2.2, isPortrait ? 3.2 : 2.8, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0xf3efe8,
      metalness: 0.12,
      roughness: 0.12,
      transparent: true,
      opacity: 0.38,
      emissive: 0xd37506,
      emissiveIntensity: 0.14
    })
  );
  boardGroup.add(board);

  // Glass rim
  var rim = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(isPortrait ? 2.62 : 2.22, isPortrait ? 3.22 : 2.82, 0.14)),
    new THREE.LineBasicMaterial({ color: 0xd37506, transparent: true, opacity: 0.85 })
  );
  boardGroup.add(rim);

  // Subtle grid on board face
  var grid = new THREE.GridHelper(2.4, 6, 0xd37506, 0x665544);
  grid.rotation.x = Math.PI / 2;
  grid.position.z = 0.08;
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  boardGroup.add(grid);

  var boardGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(isPortrait ? 2.4 : 2.0, isPortrait ? 3.0 : 2.6),
    new THREE.MeshBasicMaterial({ color: 0xd37506, transparent: true, opacity: 0.12 })
  );
  boardGlow.position.z = -0.02;
  boardGroup.add(boardGlow);

  function makeLabelSprite(text, colorHex) {
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    // pill background
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    roundRect(ctx, 16, 28, 480, 72, 18);
    ctx.fill();
    ctx.strokeStyle = '#' + colorHex.toString(16).padStart(6, '0');
    ctx.lineWidth = 4;
    roundRect(ctx, 16, 28, 480, 72, 18);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Montserrat, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 66);
    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.55, 0.39, 1);
    return sprite;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  var sourceGroup = new THREE.Group();
  var impactGroup = new THREE.Group();
  root.add(sourceGroup);
  root.add(impactGroup);

  var sourceNodes = [];
  var impactNodes = [];
  var homeSources = [];
  var homeImpacts = [];

  function layoutHomes() {
    homeSources = [];
    homeImpacts = [];
    var n = SOURCES.length;
    for (var i = 0; i < n; i++) {
      var t = n === 1 ? 0.5 : i / (n - 1);
      if (isPortrait) {
        homeSources.push(new THREE.Vector3((t - 0.5) * 2.2, 3.35, 0.3));
        homeImpacts.push(new THREE.Vector3((t - 0.5) * 2.4, -3.4, 0.35));
      } else {
        homeSources.push(new THREE.Vector3(-3.7, (0.5 - t) * 2.6, 0.25));
        homeImpacts.push(new THREE.Vector3(3.7, (0.5 - t) * 2.8, 0.3));
      }
    }
  }

  function buildNodes() {
    while (sourceGroup.children.length) sourceGroup.remove(sourceGroup.children[0]);
    while (impactGroup.children.length) impactGroup.remove(impactGroup.children[0]);
    sourceNodes = [];
    impactNodes = [];
    layoutHomes();

    SOURCES.forEach(function (src, i) {
      var g = new THREE.Group();
      var orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 20, 20),
        new THREE.MeshStandardMaterial({
          color: src.color,
          emissive: src.color,
          emissiveIntensity: 0.65,
          metalness: 0.25,
          roughness: 0.3
        })
      );
      g.add(orb);
      var label = makeLabelSprite(src.label, src.color);
      label.position.set(isPortrait ? 0 : -0.15, isPortrait ? 0.42 : 0.38, 0);
      g.add(label);
      g.position.copy(homeSources[i]);
      g.userData.home = homeSources[i].clone();
      g.userData.orb = orb;
      sourceGroup.add(g);
      sourceNodes.push(g);
    });

    IMPACTS.forEach(function (imp, i) {
      var g = new THREE.Group();
      var orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 22, 22),
        new THREE.MeshStandardMaterial({
          color: imp.color,
          emissive: imp.color,
          emissiveIntensity: 0.35,
          metalness: 0.2,
          roughness: 0.28,
          transparent: true,
          opacity: 0.85
        })
      );
      g.add(orb);
      g.add(new THREE.Mesh(
        new THREE.SphereGeometry(0.36, 16, 16),
        new THREE.MeshBasicMaterial({ color: imp.color, transparent: true, opacity: 0.12 })
      ));
      var label = makeLabelSprite(imp.label, imp.color);
      label.position.set(isPortrait ? 0 : 0.1, isPortrait ? -0.45 : 0.4, 0);
      g.add(label);
      g.position.copy(homeImpacts[i]);
      g.userData.home = homeImpacts[i].clone();
      g.userData.orb = orb;
      impactGroup.add(g);
      impactNodes.push(g);
    });
  }
  buildNodes();

  // Packets flowing source → board → impact
  var packets = [];
  for (var p = 0; p < 20; p++) {
    var packet = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffe6c0, transparent: true, opacity: 0.95 })
    );
    packet.userData.t = Math.random();
    packet.userData.lane = p % SOURCES.length;
    packet.userData.half = p % 2; // 0 = to board, 1 = from board
    root.add(packet);
    packets.push(packet);
  }

  var lastPortrait = isPortrait;

  function resize() {
    isPortrait = window.matchMedia('(orientation: portrait), (max-width: 900px)').matches;
    if (isPortrait !== lastPortrait) {
      lastPortrait = isPortrait;
      // rebuild board size + node homes
      board.geometry.dispose();
      board.geometry = new THREE.BoxGeometry(isPortrait ? 2.6 : 2.2, isPortrait ? 3.2 : 2.8, 0.12);
      rim.geometry.dispose();
      rim.geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(isPortrait ? 2.62 : 2.22, isPortrait ? 3.22 : 2.82, 0.14));
      buildNodes();
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
    var stageF = p * 5;

    // Camera: pull back enough to read source → glass → impact
    var cam;
    if (isPortrait) {
      cam = { x: 0, y: 0.15 - e * 0.35, z: 9.2 - e * 0.6 };
    } else {
      cam = { x: -0.2, y: 0.2, z: 8.4 };
    }

    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;
    camera.position.x += (cam.x + pointer.x * 0.35 - camera.position.x) * 0.08;
    camera.position.y += (cam.y - pointer.y * 0.25 - camera.position.y) * 0.08;
    camera.position.z += (cam.z - camera.position.z) * 0.08;
    camera.lookAt(root.position.x * 0.3, 0, 0);

    root.position.x += ((isPortrait ? 0 : 1.45) - root.position.x) * 0.08;

    // Board presence
    var boardPulse = 1 + Math.sin(performance.now() * 0.002) * 0.015;
    boardGroup.scale.setScalar(boardPulse);
    boardGroup.rotation.y = Math.sin(performance.now() * 0.0006) * 0.08 + pointer.x * 0.05;
    boardGlow.material.opacity = 0.08 + (1 - Math.abs(e - 0.5)) * 0.12;

    // Sources emphasize early; impacts emphasize late
    var inStrength = Math.max(0.35, 1 - Math.max(0, stageF - 0.5) / 3);
    var outStrength = Math.max(0.2, (stageF - 2.2) / 2.8);

    // Hide floating labels while hero copy is still on screen (avoid clutter)
    var labelsOn = e > 0.12;
    sourceNodes.forEach(function (node, i) {
      var home = node.userData.home;
      var pull = Math.min(1, Math.max(0, (stageF - 0.2) / 3.5));
      var toward = new THREE.Vector3().copy(home).lerp(new THREE.Vector3(0, home.y * 0.35, 0.4), pull * 0.35);
      node.position.lerp(toward, 0.06);
      node.userData.orb.material.emissiveIntensity = 0.4 + inStrength * 0.7;
      node.scale.setScalar(0.9 + inStrength * 0.25 + Math.sin(performance.now() * 0.003 + i) * 0.04);
      node.children.forEach(function (child) {
        if (child.isSprite) child.visible = labelsOn;
      });
    });

    impactNodes.forEach(function (node, i) {
      var home = node.userData.home;
      var emerge = Math.max(0, outStrength - i * 0.04);
      node.position.lerp(home, 0.08);
      node.scale.setScalar(0.55 + emerge * 0.7);
      node.userData.orb.material.emissiveIntensity = 0.2 + emerge * 1.1;
      node.userData.orb.material.opacity = 0.4 + emerge * 0.6;
      node.visible = emerge > 0.05 || stageF > 2;
      if (stageF < 2) {
        node.scale.setScalar(0.35);
        node.userData.orb.material.opacity = 0.25;
      }
      node.children.forEach(function (child) {
        if (child.isSprite) child.visible = labelsOn && stageF > 2;
      });
    });

    // Packets: lane from source home → board center → impact home
    packets.forEach(function (packet, idx) {
      packet.userData.t += 0.006 + e * 0.008;
      if (packet.userData.t > 1) packet.userData.t -= 1;
      var t = packet.userData.t;
      var lane = packet.userData.lane % SOURCES.length;
      var from = homeSources[lane];
      var mid = new THREE.Vector3(0, from.y * 0.25, 0.5);
      var to = homeImpacts[lane];
      var pos;
      if (t < 0.5) {
        var u = t / 0.5;
        pos = new THREE.Vector3().copy(from).lerp(mid, u);
        // only show inbound strongly early
        packet.material.opacity = 0.35 + inStrength * 0.65;
      } else {
        var v = (t - 0.5) / 0.5;
        pos = new THREE.Vector3().copy(mid).lerp(to, v);
        packet.material.opacity = 0.2 + outStrength * 0.8;
      }
      packet.position.copy(pos);
      packet.scale.setScalar(0.85 + e * 0.5);
    });
  }

  function tick() {
    requestAnimationFrame(tick);
    renderProgress += (targetProgress - renderProgress) * 0.075;
    applyNarrative(renderProgress);
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', resize);
  setStageUI(0, false);
  resize();
  syncFromScroll();
  tick();
})();
