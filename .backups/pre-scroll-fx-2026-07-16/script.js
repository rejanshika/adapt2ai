/*
  Adapt2AI Consulting — Refined Creative Motion & WebGL Script (Iteration 5)
  Awwwards-Level Polish: Parallax, Connected Ledger Cube, and GSAP timelines
*/

(() => {
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // 1b. BACKGROUND AUTOMATION PARALLAX GRAPH
  const bgAutomation = document.getElementById('bg-automation');
  let bgTargetX = 0, bgTargetY = 0;
  let bgCurX = 0, bgCurY = 0;

  window.addEventListener('pointermove', (e) => {
    bgTargetX = (e.clientX / window.innerWidth - 0.5) * 32;
    bgTargetY = (e.clientY / window.innerHeight - 0.5) * 32;
  });

  function updateBgAutomation() {
    if (prefersReducedMotion) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollOffset = scrollTop * 0.12; // vertical parallax rate
    
    bgCurX += (bgTargetX - bgCurX) * 0.04;
    bgCurY += (bgTargetY - bgCurY) * 0.04;
    
    if (bgAutomation) {
      bgAutomation.style.transform = `translate3d(${bgCurX}px, ${bgCurY + scrollOffset}px, 0) rotate(${scrollTop * 0.025}deg)`;
    }
    requestAnimationFrame(updateBgAutomation);
  }
  updateBgAutomation();

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
    // Dynamic height calculation on every scroll event to handle layout shifts
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
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

  window.addEventListener('scroll', updateScrollProgress);
  updateScrollProgress();

  if (scrollProgressWrap) {
    scrollProgressWrap.addEventListener('click', () => {
      const action = scrollProgressWrap.getAttribute('data-scroll-action');
      if (action === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
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
      if (!prefersReducedMotion) requestAnimationFrame(animateHeroScene);
    }
    animateHeroScene();
  }

  /* =========================================================================
     5. THREE.JS SCENE 2: 3D NODAL AUTOMATION FLOW (n8n-style workflow chain)
     ========================================================================= */
  const productContainer = document.getElementById('product-canvas-container');
  if (productContainer && window.THREE) {
    const width = productContainer.clientWidth;
    const height = productContainer.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    productContainer.appendChild(renderer.domElement);

    // Automation Node Group
    const flowGroup = new THREE.Group();
    scene.add(flowGroup);

    // Node data definition (alternating circle spheres and boxes in space)
    const nodesData = [
      { type: 'sphere', color: 0x93C5FD, pos: new THREE.Vector3(-1.8,  0.8,  0.2) }, // Node 1: Trigger
      { type: 'box',    color: 0x2563EB, pos: new THREE.Vector3(-0.4, -0.6,  0.8) }, // Node 2: Logic
      { type: 'sphere', color: 0x93C5FD, pos: new THREE.Vector3( 0.9,  0.7, -0.6) }, // Node 3: AI Engine
      { type: 'box',    color: 0x2563EB, pos: new THREE.Vector3( 1.7, -0.5,  0.1) }, // Node 4: Action Output
      { type: 'sphere', color: 0x93C5FD, pos: new THREE.Vector3( 0.0, -1.2, -0.4) }  // Node 5: Sync Loopback
    ];

    const glassMat = new THREE.MeshPhysicalMaterial({
      transparent: true,
      opacity: 0.2,
      transmission: 0.9,
      ior: 1.5,
      roughness: 0.12,
      thickness: 0.25,
      side: THREE.DoubleSide
    });

    const nodeMeshes = [];
    const coreCylinderGeom = new THREE.CylinderGeometry(0.015, 0.015, 1, 8);

    nodesData.forEach((data, index) => {
      // 1. Double layer meshes: Glass outer shell
      let outerGeom;
      if (data.type === 'box') {
        outerGeom = new THREE.BoxGeometry(0.48, 0.48, 0.48);
      } else {
        outerGeom = new THREE.SphereGeometry(0.28, 20, 20);
      }
      
      const glassMesh = new THREE.Mesh(outerGeom, glassMat);
      
      // 2. Solid glowing core
      let innerGeom;
      if (data.type === 'box') {
        innerGeom = new THREE.BoxGeometry(0.24, 0.24, 0.24);
      } else {
        innerGeom = new THREE.SphereGeometry(0.14, 16, 16);
      }
      
      const coreMat = new THREE.MeshBasicMaterial({ 
        color: data.color, 
        wireframe: data.type === 'box' 
      });
      const coreMesh = new THREE.Mesh(innerGeom, coreMat);
      
      // Node Container Group to support scaling animations easily
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(data.pos);
      nodeGroup.add(glassMesh);
      nodeGroup.add(coreMesh);
      
      // Outline helper for Awwwards luxury vector feel
      const edges = new THREE.EdgesGeometry(outerGeom);
      const lineHelperMat = new THREE.LineBasicMaterial({ color: data.color, opacity: 0.35, transparent: true });
      const helperLines = new THREE.LineSegments(edges, lineHelperMat);
      nodeGroup.add(helperLines);

      flowGroup.add(nodeGroup);
      nodeMeshes.push(nodeGroup);
    });

    // 3. Connect nodes with clean workflow paths (Cables)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x93C5FD,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });

    for(let i = 0; i < nodesData.length; i++) {
      const p1 = nodesData[i].pos;
      const p2 = nodesData[(i + 1) % nodesData.length].pos;
      const lineGeom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const connectionLine = new THREE.Line(lineGeom, lineMat);
      flowGroup.add(connectionLine);
    }

    // 4. Animated Data Packets flowing along connecting paths
    const packetGeom = new THREE.SphereGeometry(0.065, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({ 
      color: 0x93C5FD,
      transparent: true,
      opacity: 0.8
    });

    const packets = [];
    for(let i = 0; i < nodesData.length; i++) {
      const packetMesh = new THREE.Mesh(packetGeom, packetMat);
      flowGroup.add(packetMesh);
      packets.push({
        mesh: packetMesh,
        startIndex: i,
        endIndex: (i + 1) % nodesData.length,
        progress: i / nodesData.length // offset start progress sequence
      });
    }

    // Lighting
    const spotBlue = new THREE.DirectionalLight(0x2563EB, 2);
    spotBlue.position.set(5, 5, 2);
    scene.add(spotBlue);

    const spotLightBlue = new THREE.DirectionalLight(0x93C5FD, 1.5);
    spotLightBlue.position.set(-5, -5, 2);
    scene.add(spotLightBlue);

    let mouseTargetX = 0, mouseTargetY = 0;
    productContainer.addEventListener('pointermove', (e) => {
      const rect = productContainer.getBoundingClientRect();
      mouseTargetX = ((e.clientX - rect.left) / rect.width - 0.5) * 1.5;
      mouseTargetY = -((e.clientY - rect.top) / rect.height - 0.5) * 1.5;
    });

    window.addEventListener('resize', () => {
      const w = productContainer.clientWidth;
      const h = productContainer.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    let time = 0;
    function animateProductScene() {
      time += 0.01;

      // Gentle floating sinusoidal drift and slow rotation
      flowGroup.position.y = Math.sin(time * 0.8) * 0.15;
      flowGroup.rotation.y += 0.003;
      flowGroup.rotation.x = Math.cos(time * 0.4) * 0.04;

      // Animate flowing data packets along connecting lines
      packets.forEach(packet => {
        packet.progress += 0.0045; // Speed of workflow execution
        if (packet.progress >= 1) {
          packet.progress = 0;
          
          // Trigger a pulse animation on target node upon data arrival
          const targetNode = nodeMeshes[packet.endIndex];
          if (window.gsap) {
            gsap.fromTo(targetNode.scale, 
              { x: 1.35, y: 1.35, z: 1.35 },
              { x: 1.0, y: 1.0, z: 1.0, duration: 0.5, ease: 'back.out(2.5)' }
            );
          }
        }
        
        const startPos = nodesData[packet.startIndex].pos;
        const endPos = nodesData[packet.endIndex].pos;
        packet.mesh.position.copy(startPos).lerp(endPos, packet.progress);
      });

      // Pointer parallax coordinate tilt
      camera.position.x += (mouseTargetX - camera.position.x) * 0.05;
      camera.position.y += (mouseTargetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
      if (!prefersReducedMotion) requestAnimationFrame(animateProductScene);
    }
    animateProductScene();

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
      if (!prefersReducedMotion) requestAnimationFrame(animateCTAScene);
    }
    animateCTAScene();
  }

  /* =========================================================================
     7. GSAP SCROLLTRIGGER INTERACTION SYSTEM
     ========================================================================= */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ nullTargetWarn: false });

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

    // Pin Hero section to let subsequent sections overlap it
    let soundCooldown = false;
    function playWhooshSound() {
      if (soundCooldown) return;
      soundCooldown = true;
      setTimeout(() => { soundCooldown = false; }, 2200);

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      try {
        const ctx = new AudioContext();
        const bufferSize = ctx.sampleRate * 1.6;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 4.5;
        filter.frequency.setValueAtTime(110, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.55);
        filter.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 1.6);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.45);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
        noise.stop(ctx.currentTime + 1.6);
      } catch (e) {
        console.warn("Audio Context sweep failed:", e);
        soundCooldown = false;
      }
    }

    ScrollTrigger.create({
      trigger: '#hero-section',
      start: 'top top',
      end: 'bottom top',
      pin: true,
      pinSpacing: false,
      onLeave: () => {
        playWhooshSound();
      },
      onEnterBack: () => {
        playWhooshSound();
      }
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

    gsap.to('.hero-graph', {
      scale: 1.25,
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    // 3D architectural lines rotation
    window.addEventListener('pointermove', (e) => {
      if (prefersReducedMotion) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      gsap.to('.hero-architecture i', {
        rotationY: -24 + x * 0.1,
        rotationZ: 8 + y * 0.1,
        x: x * 0.5,
        y: y * 0.5,
        stagger: 0.05,
        duration: 0.6
      });
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

    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 75%',
        onEnter: () => item.classList.add('active'),
        onLeaveBack: () => item.classList.remove('active')
      });
    });

    // SECTION 7: Coming Soon Waitlist Handler
    const waitlistForm = document.getElementById('waitlist-form');
    const waitlistStatus = document.getElementById('waitlist-status');
    if (waitlistForm && waitlistStatus) {
      waitlistForm.addEventListener('submit', (e) => {
        e.preventDefault();
        waitlistStatus.textContent = "Thank you! You have been added to the private beta list.";
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
