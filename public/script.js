/*
  Adapt2AI Consulting — Refined Creative Motion & WebGL Script (Iteration 5)
  Awwwards-Level Polish: Parallax, Connected Ledger Cube, and GSAP timelines
*/

(() => {
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================================
     0. GLOBAL SEAMLESS AUDIO INITIALIZATION SYSTEM
     ========================================================================= */
  let globalAudioContext = null;
  let audioInitialized = false;

  function initGlobalAudio() {
    if (audioInitialized) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      if (!globalAudioContext) {
        globalAudioContext = new AC();
      }
      if (globalAudioContext.state === 'suspended') {
        globalAudioContext.resume();
      }
      // Play a short silent buffer to unlock browser audio context
      const buffer = globalAudioContext.createBuffer(1, 1, 22050);
      const source = globalAudioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(globalAudioContext.destination);
      source.start(0);
      
      audioInitialized = true;
      removeAudioListeners();
    } catch (e) {
      console.warn("Global audio initialization failed:", e);
    }
  }

  const audioEvents = ['pointermove', 'mousemove', 'pointerdown', 'mousedown', 'click', 'wheel', 'scroll', 'touchstart', 'touchmove', 'keydown', 'keyup', 'keypress'];
  
  function removeAudioListeners() {
    audioEvents.forEach(ev => {
      window.removeEventListener(ev, initGlobalAudio, { passive: true });
      document.removeEventListener(ev, initGlobalAudio, { passive: true });
    });
  }

  audioEvents.forEach(ev => {
    window.addEventListener(ev, initGlobalAudio, { passive: true });
    document.addEventListener(ev, initGlobalAudio, { passive: true });
  });

  /* =========================================================================
     1. CUSTOM PREMIUM INTERACTIVE CURSOR & MAGNETISM
     ========================================================================= */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (cursor) {
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    }
  });

  function updateFollower() {
    if (!prefersReducedMotion && follower) {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.left = `${followerX}px`;
      follower.style.top = `${followerY}px`;
    }
    requestAnimationFrame(updateFollower);
  }
  updateFollower();



  function bindHoverState(elements) {
    elements.forEach((el) => {
      el.addEventListener('pointerenter', () => document.body.classList.add('hovering-link'));
      el.addEventListener('pointerleave', () => document.body.classList.remove('hovering-link'));
    });
  }
  bindHoverState(document.querySelectorAll('a, button, .faq-question-btn'));

  // Toggle high-contrast white cursor in dark background sections
  const darkSections = document.querySelectorAll('.hero, .how-section, .upcoming-section, .final-cta');
  darkSections.forEach((section) => {
    section.addEventListener('pointerenter', () => document.body.classList.add('in-dark-section'));
    section.addEventListener('pointerleave', () => document.body.classList.remove('in-dark-section'));
  });

  const magnetics = document.querySelectorAll('.magnetic');
  magnetics.forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (prefersReducedMotion) return;
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(el, {
        x: relX * 0.18,
        y: relY * 0.18,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    el.addEventListener('pointerleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  });

  /* =========================================================================
     2. FLOATING CIRCULAR SCROLL PROGRESS & BACK TO TOP BUTTON
     ========================================================================= */
  const scrollProgressWrap = document.getElementById('scroll-progress-ring');
  const progressCircle = document.getElementById('progress-circle');
  const scrollArrow = document.getElementById('scroll-arrow');

  function updateScrollProgress() {
    // Use the cached height so we never force a layout reflow during scroll (keeps Lenis smooth)
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = cachedScrollHeight;
    const scrollPercent = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    const circumference = 157;
    const offset = circumference - (scrollPercent * circumference);
    
    if (progressCircle) {
      progressCircle.style.strokeDashoffset = offset;
    }

    if (scrollArrow) {
      if (scrollPercent > 0.88) {
        scrollArrow.style.transform = 'rotate(180deg)';
        scrollProgressWrap.setAttribute('data-scroll-action', 'top');
      } else {
        scrollArrow.style.transform = 'rotate(0deg)';
        scrollProgressWrap.setAttribute('data-scroll-action', 'down');
      }
    }
  }

  let cachedScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  function refreshScrollHeight() {
    cachedScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  }
  window.addEventListener('resize', refreshScrollHeight);
  window.addEventListener('load', refreshScrollHeight);
  // recompute a few times as fonts/scenes/images settle the page height
  setTimeout(refreshScrollHeight, 500);
  setTimeout(refreshScrollHeight, 1500);
  if (window.lenis && window.lenis.on) window.lenis.on('resize', refreshScrollHeight);

  window.addEventListener('scroll', updateScrollProgress);
  updateScrollProgress();

  if (scrollProgressWrap) {
    scrollProgressWrap.addEventListener('click', () => {
      const action = scrollProgressWrap.getAttribute('data-scroll-action');
      if (action === 'top') {
        if (window.lenis) window.lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        if (window.lenis) window.lenis.scrollTo(window.scrollY + window.innerHeight);
        else window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    });
  }

  /* =========================================================================
     3. THREE.JS SCENE 1: HERO INTERACTIVE WORKFLOW + REFLECTION LAYERS
     ========================================================================= */
  const heroContainer = document.getElementById('hero-webgl');
  if (heroContainer && window.THREE) {
    const width = heroContainer.clientWidth;
    const height = heroContainer.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    heroContainer.appendChild(renderer.domElement);

    function createCircleTexture() {
      const size = 64;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      grad.addColorStop(0, 'rgba(147, 197, 253, 1)');
      grad.addColorStop(0.3, 'rgba(37, 99, 235, 0.8)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(canvas);
    }
    const dotTexture = createCircleTexture();

    const particleCount = 65;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      velocities.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.002
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.42,
      map: dotTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    const maxConnections = 100;
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x93C5FD,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // Floating Glass elements for reflection depth
    const glassGroup = new THREE.Group();
    const glassGeom = new THREE.IcosahedronGeometry(0.8, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xE9EFFD,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      thickness: 0.8
    });

    const glassItems = [];
    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(glassGeom, glassMat);
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 3
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      glassGroup.add(mesh);
      glassItems.push({
        mesh,
        rotSpeedX: (Math.random() - 0.5) * 0.003,
        rotSpeedY: (Math.random() - 0.5) * 0.003,
        yFrequency: Math.random() * 0.002,
        yPhase: Math.random() * Math.PI
      });
    }
    scene.add(glassGroup);

    const spotBlue = new THREE.PointLight(0x2563EB, 2, 15);
    spotBlue.position.set(4, 3, 2);
    scene.add(spotBlue);

    const spotLightBlue = new THREE.PointLight(0x93C5FD, 1.5, 15);
    spotLightBlue.position.set(-4, -3, 2);
    scene.add(spotLightBlue);

    let mouseTargetX = 0, mouseTargetY = 0;
    window.addEventListener('pointermove', (e) => {
      mouseTargetX = (e.clientX / window.innerWidth - 0.5) * 1.8;
      mouseTargetY = -(e.clientY / window.innerHeight - 0.5) * 1.8;
    });

    window.addEventListener('resize', () => {
      const w = heroContainer.clientWidth;
      const h = heroContainer.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    let time = 0;
    function animateHeroScene() {
      time += 0.003;
      const pos = particleGeometry.attributes.position.array;
      let lineIndex = 0;
      const linePos = lineGeometry.attributes.position.array;

      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += velocities[i].x;
        pos[i * 3 + 1] += velocities[i].y;
        pos[i * 3 + 2] += velocities[i].z;

        if (Math.abs(pos[i * 3]) > 9) velocities[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 6) velocities[i].y *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 3) velocities[i].z *= -1;
      }
      particleGeometry.attributes.position.needsUpdate = true;

      for (let i = 0; i < particleCount; i++) {
        const x1 = pos[i * 3];
        const y1 = pos[i * 3 + 1];
        const z1 = pos[i * 3 + 2];

        for (let j = i + 1; j < particleCount; j++) {
          const x2 = pos[j * 3];
          const y2 = pos[j * 3 + 1];
          const z2 = pos[j * 3 + 2];

          const dx = x1 - x2;
          const dy = y1 - y2;
          const dz = z1 - z2;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 2.6 && lineIndex < maxConnections) {
            linePos[lineIndex * 6] = x1;
            linePos[lineIndex * 6 + 1] = y1;
            linePos[lineIndex * 6 + 2] = z1;
            linePos[lineIndex * 6 + 3] = x2;
            linePos[lineIndex * 6 + 4] = y2;
            linePos[lineIndex * 6 + 5] = z2;
            lineIndex++;
          }
        }
      }
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineIndex * 2);

      glassItems.forEach(item => {
        item.mesh.rotation.x += item.rotSpeedX;
        item.mesh.rotation.y += item.rotSpeedY;
        item.mesh.position.y += Math.sin(time + item.yPhase) * 0.005;
      });

      camera.position.x += (mouseTargetX - camera.position.x) * 0.05;
      camera.position.y += (mouseTargetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      if (!prefersReducedMotion && heroInView) requestAnimationFrame(animateHeroScene);
    }

    let heroInView = false;
    const observer1 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const wasInView = heroInView;
        heroInView = entry.isIntersecting;
        if (heroInView && !wasInView && !prefersReducedMotion) {
          requestAnimationFrame(animateHeroScene);
        }
      });
    }, { threshold: 0.02 });
    observer1.observe(heroContainer);
  }

  /* =========================================================================
     5. THREE.JS SCENE 2: 3D NODAL AUTOMATION FLOW (n8n-style workflow chain)
     ========================================================================= */
  const productContainer = document.getElementById('product-canvas-container');
  if (productContainer && window.THREE) {
    const width = productContainer.clientWidth || 500;   // fallback: container can measure 0 before layout settles
    const height = productContainer.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    productContainer.appendChild(renderer.domElement);

    // Keep camera aspect + canvas correct even if the container starts at 0×0 (fires on first real layout)
    function resizeProductScene() {
      const w = productContainer.clientWidth || 500;
      const h = productContainer.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    if (window.ResizeObserver) new ResizeObserver(resizeProductScene).observe(productContainer);

    // Automation Node Group
    const flowGroup = new THREE.Group();
    scene.add(flowGroup);

    // Soft studio environment — clean, glassy premium reflections (deliberately NOT a rainbow).
    function makeStudioEnv() {
      const c = document.createElement('canvas'); c.width = 512; c.height = 256;
      const x = c.getContext('2d');
      const bg = x.createLinearGradient(0, 0, 0, 256);
      bg.addColorStop(0, '#0a0b18'); bg.addColorStop(0.5, '#191d38'); bg.addColorStop(1, '#080910');
      x.fillStyle = bg; x.fillRect(0, 0, 512, 256);
      // a few soft light blooms give glossy, high-end highlights on the facets
      const blooms = [
        [120, 66, 135, 'rgba(210,202,255,0.95)'],
        [372, 96, 155, 'rgba(150,172,255,0.70)'],
        [262, 210, 115, 'rgba(255,255,255,0.55)'],
        [462, 40, 95, 'rgba(176,150,255,0.60)']
      ];
      blooms.forEach(function (b) {
        const rg = x.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]);
        rg.addColorStop(0, b[3]); rg.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = rg; x.beginPath(); x.arc(b[0], b[1], b[2], 0, Math.PI * 2); x.fill();
      });
      const tex = new THREE.CanvasTexture(c);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      return tex;
    }
    const studioEnv = makeStudioEnv();
    scene.environment = studioEnv; // lights the glass so transmission/reflections read bright & premium
    
    // Node data — 5 gems laid out as a balanced, structured n8n flowchart pipeline
    // Node data — 5 gems laid out as a balanced, structured n8n flowchart pipeline
    const nodesData = [
      { pos: new THREE.Vector3(-2.2,  0.0,  0.0) }, // Node 0: Trigger
      { pos: new THREE.Vector3(-0.7,  0.0,  0.0) }, // Node 1: Split
      { pos: new THREE.Vector3( 0.7,  0.9,  0.0) }, // Node 2: Upper branch
      { pos: new THREE.Vector3( 0.7, -0.9,  0.0) }, // Node 3: Lower branch
      { pos: new THREE.Vector3( 2.2,  0.0,  0.0) }  // Node 4: Merge output
    ];

    // Raw, organic deformed gemstone geometries (chunky rock facets stretched vertically)
    function makeCrystalGeom(radius, seed) {
      const g = new THREE.IcosahedronGeometry(radius, 1); // detail 1 keeps the facets large and bold
      const pos = g.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        
        // Elongate non-uniformly on Y/Z to match the tall shards in the noomo reference image (moderated Y-scale)
        v.y *= 1.30;
        v.z *= 0.92;
        
        // Crystalline skew/shear along Y to make it asymmetric and organic (moderated slant)
        v.x += v.y * 0.08 * Math.sin(seed * 2.3);
        v.z += v.y * 0.06 * Math.cos(seed * 1.7);
        
        // Multi-frequency noise-based displacement to create raw, uneven facets (moderated noise)
        const phase = seed * 4.5;
        const disp = (Math.sin(v.x * 4.0 + phase) + Math.cos(v.y * 4.0 + phase) + Math.sin(v.z * 4.0 + phase)) * 0.08;
                     
        // Apply organic expansion
        const len = v.length();
        v.normalize().multiplyScalar(len + disp);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      g.computeVertexNormals();
      return g;
    }

    // Single-colour clear glass — high-luminous bright blue emission and cyan highlights
    const TINT = new THREE.Color(0x38bdf8);    // Brighter sky-blue tint
    const HILIGHT = new THREE.Color(0x60a5fa); // Electric blue hover glow
    const baseCrystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,             // Bright white body
      emissive: 0x2563eb,          // Vibrant glowing blue core
      emissiveIntensity: 0.9,      // High brightness intensity
      metalness: 0.1,
      roughness: 0.02,
      envMap: studioEnv,
      envMapIntensity: 2.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      transmission: 0.92,          // Luminous transparency
      thickness: 1.5,
      ior: 1.8,
      transparent: true,
      opacity: 1.0,
      flatShading: true,
      side: THREE.DoubleSide
    });
    if ('attenuationColor' in baseCrystalMat) {
      baseCrystalMat.attenuationColor = TINT.clone();
      baseCrystalMat.attenuationDistance = 1.5;
    }

    const nodeMeshes = [];
    const nodeInfo = [];   // per-crystal hover state
    const hitMeshes = [];  // invisible hover targets

    nodesData.forEach((data, index) => {
      const radius = 0.44 + (index % 3) * 0.08;   // Smaller, delicate, elegant crystal sizes
      const geom = makeCrystalGeom(radius, index + 1);
      const mat = baseCrystalMat.clone();
      const crystalMesh = new THREE.Mesh(geom, mat);
      crystalMesh.userData.nodeIndex = index;

      // Larger invisible sphere so the smaller facets are easy to hover
      const hitSphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.55, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitSphere.userData.nodeIndex = index;

      const shell = new THREE.Group();
      shell.add(crystalMesh);
      shell.add(hitSphere);

      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(data.pos);
      nodeGroup.add(shell);

      flowGroup.add(nodeGroup);
      nodeMeshes.push(nodeGroup);
      hitMeshes.push(hitSphere);

      nodeInfo.push({
        shell: shell,
        mat: mat,
        baseColor: mat.color.clone(),
        baseEmissive: mat.emissive.clone(),
        hi: HILIGHT,
        baseEnv: 2.5,
        hover: 0
      });
    });

    // 3. Connect nodes with n8n branched cables
    const workflowConnections = [
      { from: 0, to: 1 }, // Trigger -> Split
      { from: 1, to: 2 }, // Split -> Upper AI
      { from: 1, to: 3 }, // Split -> Lower Data
      { from: 2, to: 4 }, // Upper AI -> Output
      { from: 3, to: 4 }  // Lower Data -> Output
    ];

    const connectionLines = [];
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x93C5FD,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    workflowConnections.forEach(conn => {
      const p1 = nodesData[conn.from].pos;
      const p2 = nodesData[conn.to].pos;
      const lineGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const connectionLine = new THREE.Line(lineGeom, lineMat);
      flowGroup.add(connectionLine);
      connectionLines.push({
        line: connectionLine,
        fromIndex: conn.from,
        toIndex: conn.to
      });
    });

    // 4. Animated Data Packets flowing along connecting paths
    const packetGeom = new THREE.SphereGeometry(0.06, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({ 
      color: 0x93C5FD,
      transparent: true,
      opacity: 0.95
    });

    const packets = [];
    workflowConnections.forEach((conn, index) => {
      const packetMesh = new THREE.Mesh(packetGeom, packetMat);
      flowGroup.add(packetMesh);
      packets.push({
        mesh: packetMesh,
        fromIndex: conn.from,
        toIndex: conn.to,
        progress: index / workflowConnections.length // offset start progress
      });
    });



    // Lighting
    const spotBlue = new THREE.DirectionalLight(0x2563EB, 2);
    spotBlue.position.set(5, 5, 2);
    scene.add(spotBlue);

    const spotLightBlue = new THREE.DirectionalLight(0x93C5FD, 1.5);
    spotLightBlue.position.set(-5, -5, 2);
    scene.add(spotLightBlue);

    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2(-10, -10);
    let mouseTargetX = 0, mouseTargetY = 0;
    productContainer.addEventListener('pointermove', (e) => {
      const rect = productContainer.getBoundingClientRect();
      mouseTargetX = ((e.clientX - rect.left) / rect.width - 0.5) * 1.5;
      mouseTargetY = -((e.clientY - rect.top) / rect.height - 0.5) * 1.5;
      pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    });
    productContainer.addEventListener('pointerleave', () => { pointerNDC.set(-10, -10); });

    window.addEventListener('resize', resizeProductScene);

    // Shared, reusable audio context — one warm marimba/bell voice per crystal.
    // Each crystal sounds a different note of a soft pentatonic scale as you touch it.
    const CrystalAudio = (function () {
      function ensure() {
        if (!globalAudioContext) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) globalAudioContext = new AC();
        }
        if (globalAudioContext && globalAudioContext.state === 'suspended') {
          globalAudioContext.resume();
        }
        return globalAudioContext;
      }
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00]; // C5 D5 E5 G5 A5
      function play(index, strong) {
        const c = ensure();
        if (!c) return;
        const now = c.currentTime;
        const freq = notes[index % notes.length];
        const master = c.createGain(); master.gain.value = 1;
        const filter = c.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 2800; filter.Q.value = 0.5;
        master.connect(filter); filter.connect(c.destination);
        function voice(f, level, dur, type) {
          const o = c.createOscillator(), g = c.createGain();
          o.type = type; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, now);
          g.gain.linearRampToValueAtTime(level, now + 0.012); // soft attack
          g.gain.exponentialRampToValueAtTime(0.0001, now + dur); // natural decay
          o.connect(g); g.connect(master);
          o.start(now); o.stop(now + dur + 0.03);
        }
        const vol = strong ? 0.11 : 0.06;
        voice(freq, vol, strong ? 0.55 : 0.38, 'sine');       // warm fundamental
        voice(freq * 2, vol * 0.32, 0.28, 'sine');            // octave shimmer
        voice(freq * 3.01, vol * 0.10, 0.16, 'triangle');     // faint sparkle
      }
      return { play: play };
    })();

    // Click a crystal → fuller note + elastic pop
    productContainer.addEventListener('click', function () {
      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      if (hits.length > 0) {
        const hitIndex = hits[0].object.userData.nodeIndex;
        CrystalAudio.play(hitIndex, true);
        const targetNode = nodeMeshes[hitIndex];
        if (window.gsap) {
          gsap.fromTo(targetNode.scale,
            { x: 1.4, y: 1.4, z: 1.4 },
            { x: 1.0, y: 1.0, z: 1.0, duration: 0.65, ease: 'elastic.out(1, 0.3)' }
          );
        }
      }
    });

    let time = 0;
    let lastHoverIndex = -1;
    function animateProductScene() {
      time += 0.01;

      // Update node positions with dynamic float equations (different phases)
      nodeMeshes.forEach((node, index) => {
        const basePos = nodesData[index].pos;
        node.position.y = basePos.y + Math.sin(time * 1.1 + index * 1.5) * 0.08;
        node.position.x = basePos.x + Math.cos(time * 0.6 + index * 1.5) * 0.04;
        
        // Spin each crystal node individually
        node.rotation.y += 0.012;
        node.rotation.x += 0.006;
      });



      // Update connection cables dynamically to match the floating nodes
      connectionLines.forEach(conn => {
        const p1 = nodeMeshes[conn.fromIndex].position;
        const p2 = nodeMeshes[conn.toIndex].position;
        conn.line.geometry.setFromPoints([p1, p2]);
      });

      // Animate flowing data packets along connecting paths
      packets.forEach(packet => {
        packet.progress += 0.005; // Speed of workflow execution
        if (packet.progress >= 1) {
          packet.progress = 0;
          
          // Trigger a pulse animation on target node upon data arrival
          const targetNode = nodeMeshes[packet.toIndex];
          if (window.gsap) {
            gsap.fromTo(targetNode.scale, 
              { x: 1.3, y: 1.3, z: 1.3 },
              { x: 1.0, y: 1.0, z: 1.0, duration: 0.45, ease: 'back.out(2.0)' }
            );
          }
        }
        
        const startPos = nodeMeshes[packet.fromIndex].position;
        const endPos = nodeMeshes[packet.toIndex].position;
        packet.mesh.position.copy(startPos).lerp(endPos, packet.progress);
      });

      // Pointer parallax coordinate tilt
      camera.position.x += (mouseTargetX - camera.position.x) * 0.05;
      camera.position.y += (mouseTargetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Cursor hover → recolour the crystal under the pointer to its accent, with glow + slight grow
      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      const hitIndex = hits.length ? hits[0].object.userData.nodeIndex : -1;
      productContainer.style.cursor = hitIndex >= 0 ? 'pointer' : 'grab';
      // Play a soft note the moment the cursor enters a new crystal
      if (hitIndex !== lastHoverIndex) {
        if (hitIndex >= 0) CrystalAudio.play(hitIndex, false);
        lastHoverIndex = hitIndex;
      }
      nodeInfo.forEach((n, i) => {
        const target = (i === hitIndex) ? 1 : 0;
        n.hover += (target - n.hover) * 0.18; // smooth ease in/out

        n.mat.emissive.copy(n.baseEmissive).lerp(n.hi, n.hover * 0.6);   // brighten toward glow on touch
        n.mat.emissiveIntensity = 0.3 + n.hover * 0.9;                  // keep resting inner glow
        n.mat.envMapIntensity = n.baseEnv * (1 + n.hover * 0.7);        // glossier reflections on touch
        const s = 1 + n.hover * 0.24;
        n.shell.scale.set(s, s, s);
      });

      renderer.render(scene, camera);
      if (!prefersReducedMotion && productInView) requestAnimationFrame(animateProductScene);
    }

    let productInView = false;
    const observer2 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const wasInView = productInView;
        productInView = entry.isIntersecting;
        if (productInView && !wasInView && !prefersReducedMotion) {
          requestAnimationFrame(animateProductScene);
        }
      });
    }, { threshold: 0.02 });
    observer2.observe(productContainer);

    // GSAP ScrollTrigger to scale Nodal Automation Group
    if (window.gsap && window.ScrollTrigger) {
      gsap.to(flowGroup.scale, {
        x: 1.25,
        y: 1.25,
        z: 1.25,
        scrollTrigger: {
          trigger: '#upcoming',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }

  /* =========================================================================
     6. THREE.JS SCENE 3: FINAL CTA WAVING MESH BACKGROUND
     ========================================================================= */
  const ctaCanvas = document.getElementById('cta-webgl-canvas');
  if (ctaCanvas && window.THREE) {
    const parent = ctaCanvas.parentElement;
    let width = parent.clientWidth;
    let height = parent.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: ctaCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);

    const gridX = 40;
    const gridY = 40;
    const planeGeometry = new THREE.PlaneGeometry(24, 24, gridX, gridY);
    planeGeometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshBasicMaterial({
      color: 0x93C5FD,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });

    const terrainMesh = new THREE.Mesh(planeGeometry, material);
    scene.add(terrainMesh);

    const positions = planeGeometry.attributes.position;

    window.addEventListener('resize', () => {
      width = parent.clientWidth;
      height = parent.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    let clock = 0;
    function animateCTAScene() {
      clock += 0.012;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const wave = Math.sin(x * 0.35 + clock) * 0.45 + Math.cos(z * 0.35 + clock) * 0.45;
        positions.setY(i, wave);
      }
      positions.needsUpdate = true;
      terrainMesh.rotation.y = clock * 0.02;

      renderer.render(scene, camera);
      if (!prefersReducedMotion && ctaInView) requestAnimationFrame(animateCTAScene);
    }

    let ctaInView = false;
    const observer3 = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const wasInView = ctaInView;
        ctaInView = entry.isIntersecting;
        if (ctaInView && !wasInView && !prefersReducedMotion) {
          requestAnimationFrame(animateCTAScene);
        }
      });
    }, { threshold: 0.02 });
    observer3.observe(parent);
  }

  /* =========================================================================
     7. GSAP SCROLLTRIGGER INTERACTION SYSTEM
     ========================================================================= */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ nullTargetWarn: false });

    // Smooth scrolling (Lenis) wired to ScrollTrigger + GSAP ticker
    if (window.Lenis && !prefersReducedMotion) {
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
      });
      window.lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);

      // Smooth in-page anchor navigation
      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
          const id = a.getAttribute('href');
          if (!id || id === '#') return;
          const target = id === '#top' ? 0 : document.querySelector(id);
          if (target === null) return;
          e.preventDefault();
          lenis.scrollTo(target, { offset: -90 });
        });
      });
    }

    // HEADER NAVIGATION: Scroll state manager
    ScrollTrigger.create({
      trigger: '#hero-section',
      start: 'bottom 90px',
      onEnter: () => document.getElementById('main-nav').classList.add('scrolled'),
      onLeaveBack: () => document.getElementById('main-nav').classList.remove('scrolled')
    });

    // Dark navigation trigger points
    const darkSections = ['#hero-section', '#method', '#upcoming', '#contact'];
    darkSections.forEach((sel) => {
      const sectionEl = document.querySelector(sel);
      if (sectionEl) {
        ScrollTrigger.create({
          trigger: sectionEl,
          start: 'top 90px',
          end: 'bottom 90px',
          onEnter: () => document.getElementById('main-nav').classList.add('dark-mode'),
          onEnterBack: () => document.getElementById('main-nav').classList.add('dark-mode'),
          onLeave: () => document.getElementById('main-nav').classList.remove('dark-mode'),
          onLeaveBack: () => document.getElementById('main-nav').classList.remove('dark-mode')
        });
      }
    });

    // Entrance animation
    const initialTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
    initialTl.from('.nav', { y: -30, opacity: 0, delay: 0.2 })
             .from('.hero-copy h1 span', { y: 60, opacity: 0, stagger: 0.15 }, '<0.25')
             .from('.hero-copy em', { opacity: 0, y: 30, duration: 1.5 }, '<0.4')
             .from('.hero-copy .intro', { opacity: 0, y: 20 }, '<0.3')
             .from('.hero-copy .hero-cta', { opacity: 0, y: 15 }, '<0.2')
             .from('.hero-meta', { opacity: 0 }, '<0.2');

    ScrollTrigger.create({
      trigger: '#hero-section',
      start: 'top top',
      end: 'bottom top',
      pin: true,
      pinSpacing: false
    });

    // Restored Awwwards Scroll Transition Immediately after Hero (Original first version transition)
    gsap.to('.hero-copy', {
      scale: 0.88,
      y: -95,
      transformOrigin: 'left bottom',
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });





    // SECTION 2: Difference Section animations
    gsap.from('.difference h2, .proof', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      scrollTrigger: {
        trigger: '.difference',
        start: 'top 80%'
      }
    });



    // SECTION 4 & 5: 3D Service and Use Case Cards Tilt Interaction
    function bindTiltEffect(cardsList) {
      cardsList.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          if (prefersReducedMotion) return;
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          
          gsap.to(card, {
            rotateY: x * 15,
            rotateX: -y * 15,
            scale: 1.025,
            duration: 0.25,
            ease: 'power2.out'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power3.out'
          });
        });
      });
    }
    bindTiltEffect(document.querySelectorAll('.use-case-card'));

    // SECTION 6: Vertical timeline path drawing
    const timelineProgress = document.getElementById('timeline-progress');
    if (timelineProgress) {
      gsap.to(timelineProgress, {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.timeline-wrapper',
          start: 'top 25%',
          end: 'bottom 75%',
          scrub: 0.2
        }
      });
    }

    // One-by-one stepper highlight: only the current step is lit; the highlight
    // moves down (and back up) with the scroll, like a progress checklist.
    const timelineItems = document.querySelectorAll('.timeline-item');
    function setActiveStep(index) {
      timelineItems.forEach((it, i) => it.classList.toggle('active', i === index));
    }
    if (timelineItems.length) setActiveStep(0); // step 01 highlighted by default
    timelineItems.forEach((item, index) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 65%',
        onEnter: () => setActiveStep(index),
        onLeaveBack: () => setActiveStep(Math.max(0, index - 1))
      });
    });

    // SECTION 7: Coming Soon Waitlist Handler
    const waitlistForm = document.getElementById('waitlist-form');
    const waitlistStatus = document.getElementById('waitlist-status');
    if (waitlistForm && waitlistStatus) {
      const WA_NUMBER = '919322984428';          // +91 93229 84428
      const CONTACT_EMAIL = 'contact@adapt2ai.in';
      waitlistForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = waitlistForm.querySelector('input[type="email"]');
        const email = input && input.value ? input.value.trim() : '';
        const msg = "Hi Adapt2AI, I'd like to join the waitlist for your self-serve AI product." + (email ? " My email: " + email : "");
        const wa = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
        const mail = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Waitlist signup') + '&body=' + encodeURIComponent(msg);
        waitlistStatus.innerHTML = "You're on the list! Confirm your spot via " +
          "<a href='" + wa + "' target='_blank' rel='noopener' style='color:var(--light-blue);text-decoration:underline;'>WhatsApp</a> or " +
          "<a href='" + mail + "' style='color:var(--light-blue);text-decoration:underline;'>Email</a>.";
        waitlistForm.reset();
      });
    }

    // SECTION 8: FAQ Accordion toggles with container color shift
    const faqRows = document.querySelectorAll('.faq-row-item');
    faqRows.forEach((row) => {
      const btn = row.querySelector('.faq-question-btn');
      
      btn.addEventListener('click', () => {
        const isOpen = row.classList.contains('open');
        
        // Close all other rows
        faqRows.forEach((r) => {
          if (r !== row) {
            r.classList.remove('open');
            r.querySelector('.icon').textContent = '+';
          }
        });

        if (isOpen) {
          row.classList.remove('open');
          btn.querySelector('.icon').textContent = '+';
        } else {
          row.classList.add('open');
          btn.querySelector('.icon').textContent = '×';
          
          // Micro-interaction: shift row backdrop lightly on GSAP
          gsap.fromTo(row, 
            { backgroundColor: 'rgba(255, 255, 255, 0.6)' },
            { backgroundColor: '#ffffff', duration: 0.4 }
          );
        }
      });
    });
  }

})();
