/* Services Page Controller */
(() => {
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Lenis Smooth Scroll
  if (window.Lenis) {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // 2. Custom Cursor trail
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (cursor) {
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    }
  });

  function updateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    if (follower) {
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';
    }
    requestAnimationFrame(updateFollower);
  }
  updateFollower();

  // Magnetic items
  const magnetics = document.querySelectorAll('.magnetic');
  magnetics.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.32}px, ${y * 0.32}px)`;
      if (follower) follower.classList.add('hovering');
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translate(0, 0)';
      if (follower) follower.classList.remove('hovering');
    });
  });

  // 3. Interactive Accordions
  const accordionBlocks = document.querySelectorAll('.detail-block');
  accordionBlocks.forEach(block => {
    const trigger = block.querySelector('.accordion-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = block.classList.contains('open');
        const siblingAccordion = block.closest('.service-details-accordion');
        if (siblingAccordion) {
          siblingAccordion.querySelectorAll('.detail-block').forEach(b => {
            b.classList.remove('open');
            const trig = b.querySelector('.accordion-trigger');
            if (trig) trig.setAttribute('aria-expanded', 'false');
          });
        }
        if (!isOpen) {
          block.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // 4. GSAP Entry & ScrollTrigger animations
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // HEADER NAVIGATION: Scroll state manager
    const mainNav = document.getElementById('main-nav');
    if (mainNav) {
      ScrollTrigger.create({
        start: 'top -50',
        onUpdate: (self) => {
          if (self.scroll() > 50) {
            mainNav.classList.add('scrolled');
          } else {
            mainNav.classList.remove('scrolled');
          }
        }
      });

      const darkSections = ['.services-hero', '.s-build', '#contact'];
      darkSections.forEach((sel) => {
        const el = document.querySelector(sel);
        if (el) {
          ScrollTrigger.create({
            trigger: el,
            start: 'top 90px',
            end: 'bottom 90px',
            onEnter: () => mainNav.classList.add('dark-mode'),
            onEnterBack: () => mainNav.classList.add('dark-mode'),
            onLeave: () => mainNav.classList.remove('dark-mode'),
            onLeaveBack: () => mainNav.classList.remove('dark-mode')
          });
        }
      });
    }

    if (!prefersReducedMotion) {
      // Hero Elements Entry
      gsap.from('.hero-copy-side *', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out'
      });

      // Service sections animations
      const sections = document.querySelectorAll('.service-detail-section');
      sections.forEach(sec => {
        const textElements = sec.querySelectorAll('.service-text > *, .detail-block');
        const diagram = sec.querySelector('.diagram-card');

        gsap.from(textElements, {
          opacity: 0,
          y: 25,
          duration: 0.7,
          stagger: 0.12,
          scrollTrigger: {
            trigger: sec,
            start: 'top 75%'
          }
        });

        gsap.from(diagram, {
          opacity: 0,
          scale: 0.95,
          y: 35,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 75%'
          }
        });
      });

      // Comparison table fade-up
      gsap.from('.comparison-table-wrap', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        scrollTrigger: {
          trigger: '.services-comparison',
          start: 'top 80%'
        }
      });
    }
  }

  // 5. Page-ending Canvas: Flowing White Particle Fabric
  function initServicesCanvas() {
    const canvas = document.getElementById('cursor-play-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.clientWidth;
    let height = canvas.height = canvas.clientHeight;
    
    window.addEventListener('resize', () => {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    });

    const cols = 28;
    const rows = 16;
    const spacingX = 45;
    const spacingZ = 35;
    
    let time = 0;
    
    function draw() {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x3d = (c - cols / 2) * spacingX;
          const z3d = r * spacingZ + 120;
          
          const d = Math.sqrt(x3d * x3d + (z3d - 300) * (z3d - 300));
          const y3d = Math.sin(c * 0.2 + time) * Math.cos(r * 0.24 + time) * 38 + 
                      Math.sin(time * 0.8 + d * 0.007) * 14;
          
          const scale = 320 / z3d;
          const x2d = width / 2 + x3d * scale;
          const y2d = height / 2 + (y3d - 40) * scale;
          
          if (x2d >= 0 && x2d <= width && y2d >= 0 && y2d <= height) {
            const alpha = (1 - z3d / (rows * spacingZ + 120)) * 0.28;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            const size = Math.max(1.2, 4.5 * scale);
            ctx.fillRect(x2d - size / 2, y2d - size / 2, size, size);
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }
  initServicesCanvas();

  // 6. Hero Three.js Visual: Glass Workflow Engine
  function initHeroThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!window.THREE) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 5.7; // moved closer so the diagram reads a bit bigger
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    const group = new THREE.Group();
    scene.add(group);
    
    // Create 3 connected Glass Modules representing the 3 paths
    const moduleCount = 3;
    const modules = [];
    const modulePositions = [
      { x: -1.4, y: -0.6, z: 0 }, // readiness
      { x: 0,    y: 0.6,  z: 0 }, // strategy
      { x: 1.4,  y: -0.6, z: 0 }  // custom build
    ];
    
    const moduleGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    
    modulePositions.forEach((pos, idx) => {
      const edges = new THREE.EdgesGeometry(moduleGeometry);
      const color = idx === 2 ? 0x3b82f6 : 0x93c5fd; // custom build gets primary blue
      const mat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: idx === 2 ? 0.75 : 0.4
      });
      const box = new THREE.LineSegments(edges, mat);
      box.position.set(pos.x, pos.y, pos.z);
      group.add(box);
      modules.push(box);
    });
    
    // Connection pathways (glowing line routes)
    const curvePoints1 = [
      new THREE.Vector3(-1.4, -0.6, 0),
      new THREE.Vector3(-0.7, 0, 0),
      new THREE.Vector3(0, 0.6, 0)
    ];
    const curve1 = new THREE.CatmullRomCurve3(curvePoints1);
    
    const curvePoints2 = [
      new THREE.Vector3(0, 0.6, 0),
      new THREE.Vector3(0.7, 0, 0),
      new THREE.Vector3(1.4, -0.6, 0)
    ];
    const curve2 = new THREE.CatmullRomCurve3(curvePoints2);
    
    const points1 = curve1.getPoints(50);
    const points2 = curve2.getPoints(50);
    
    const lineMat = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.15 });
    
    const lineGeo1 = new THREE.BufferGeometry().setFromPoints(points1);
    const line1 = new THREE.Line(lineGeo1, lineMat);
    group.add(line1);
    
    const lineGeo2 = new THREE.BufferGeometry().setFromPoints(points2);
    const line2 = new THREE.Line(lineGeo2, lineMat);
    group.add(line2);
    
    // Glowing pipeline data flow particles
    const particleCount = 18;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const pointsMat = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.15,
      transparent: true,
      opacity: 0.8
    });
    
    const flowPoints = new THREE.Points(particleGeometry, pointsMat);
    group.add(flowPoints);
    
    // Store particle progress along curves
    const particleData = [];
    for (let i = 0; i < particleCount; i++) {
      particleData.push({
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.003,
        path: Math.random() > 0.5 ? curve1 : curve2
      });
    }
    
    // Mouse Parallax Interaction
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX - window.innerWidth / 2) * 0.0008;
      targetY = (e.clientY - window.innerHeight / 2) * 0.0008;
    });
    
    function animate() {
      requestAnimationFrame(animate);
      
      // Floating motion
      group.position.y = Math.sin(Date.now() * 0.001) * 0.15;
      
      // Rotate module blocks
      modules.forEach((mod, idx) => {
        mod.rotation.y += 0.005 + (idx * 0.002);
        mod.rotation.x += 0.003;
      });
      
      // Animate flowing data packets
      const positions = flowPoints.geometry.attributes.position.array;
      particleData.forEach((p, idx) => {
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.path = Math.random() > 0.5 ? curve1 : curve2;
        }
        
        const pt = p.path.getPointAt(p.t);
        positions[idx * 3] = pt.x;
        positions[idx * 3 + 1] = pt.y;
        positions[idx * 3 + 2] = pt.z;
      });
      flowPoints.geometry.attributes.position.needsUpdate = true;
      
      // Interpolate mouse movements
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      
      group.rotation.y = currentX * 1.5;
      group.rotation.x = currentY * 1.5;
      
      renderer.render(scene, camera);
    }
    animate();
  }
  initHeroThreeJS();
})();
