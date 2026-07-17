/* Coming Soon Page Controller */
(() => {
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

  // 3. Waitlist Form Handler
  const form = document.getElementById('teaser-waitlist');
  const status = document.getElementById('teaser-status');
  // Where waitlist signups are delivered (client-side: WhatsApp + email)
  const WA_NUMBER = '919322984428';          // +91 93229 84428
  const CONTACT_EMAIL = 'contact@adapt2ai.in';
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        const email = emailInput.value.trim();
        localStorage.setItem('waitlist_email', email);
        const msg = "Hi Adapt2AI, I'd like to join the waitlist for your self-serve AI product. My email: " + email;
        const wa = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
        const mail = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Waitlist signup') + '&body=' + encodeURIComponent(msg);
        if (status) {
          status.innerHTML = "You're on the list! Confirm your spot via " +
            "<a href='" + wa + "' target='_blank' rel='noopener' style='color:var(--blue);text-decoration:underline;'>WhatsApp</a> or " +
            "<a href='" + mail + "' style='color:var(--blue);text-decoration:underline;'>Email</a>.";
        }
        emailInput.value = '';
      }
    });
  }

  // 4. Coming Soon Hero Three.js Visual: Glass Ledger Cube Stack
  function initComingSoonThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!window.THREE) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 6.2;
    
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
    
    // Glass Ledger Stack: Three stacked flat wireframe boxes
    const sheetsCount = 3;
    const sheets = [];
    const geo = new THREE.BoxGeometry(2.2, 0.12, 1.6);
    
    for (let i = 0; i < sheetsCount; i++) {
      const edges = new THREE.EdgesGeometry(geo);
      const mat = new THREE.LineBasicMaterial({
        color: i === 1 ? 0x3b82f6 : 0x93c5fd,
        transparent: true,
        opacity: i === 1 ? 0.65 : 0.25
      });
      const sheet = new THREE.LineSegments(edges, mat);
      sheet.position.y = (i - 1) * 0.7;
      group.add(sheet);
      sheets.push(sheet);
    }
    
    // Glowing ascending particles representing matching records
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 35;
    const posArray = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 2.0;
      posArray[i+1] = (Math.random() - 0.5) * 1.8;
      posArray[i+2] = (Math.random() - 0.5) * 1.4;
    }
    
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const pointsMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.08,
      transparent: true,
      opacity: 0.7
    });
    
    const particles = new THREE.Points(particleGeo, pointsMat);
    group.add(particles);
    
    // Mouse parallax
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX - window.innerWidth / 2) * 0.001;
      targetY = (e.clientY - window.innerHeight / 2) * 0.001;
    });
    
    function animate() {
      requestAnimationFrame(animate);
      
      // Floating
      group.position.y = Math.sin(Date.now() * 0.0012) * 0.12;
      
      // Rotate sheets at slightly offset speeds
      sheets.forEach((sheet, idx) => {
        sheet.rotation.y += 0.004 + (idx * 0.001);
      });
      
      particles.rotation.y -= 0.002;
      
      // Ascending animation for particle buffer geometry
      const positions = particles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.005;
        if (positions[i] > 1.2) {
          positions[i] = -1.2; // recycle particle
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      
      group.rotation.y += currentX * 0.3;
      group.rotation.x += currentY * 0.3;
      
      renderer.render(scene, camera);
    }
    animate();
  }
  initComingSoonThreeJS();
})();
