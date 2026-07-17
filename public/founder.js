/* Founder Page Animation Controller */
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

  // 3. GSAP Entry & ScrollTrigger animations
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

      const darkSections = ['.founder-hero', '.founder-stats', '#contact'];
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
      gsap.from('.hero-text-side > *', {
        opacity: 0,
        y: 35,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out'
      });

      gsap.from('.portrait-container', {
        opacity: 0,
        scale: 0.95,
        duration: 1.0,
        ease: 'power2.out',
        delay: 0.3
      });

      // Bio elements fade-up on scroll
      gsap.from('.bio-intro > *, .bio-details > *', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.12,
        scrollTrigger: {
          trigger: '.founder-bio-section',
          start: 'top 80%'
        }
      });

      // Stats boxes counter entry
      gsap.from('.stat-box', {
        opacity: 0,
        y: 25,
        duration: 0.6,
        stagger: 0.18,
        scrollTrigger: {
          trigger: '.founder-stats',
          start: 'top 85%'
        }
      });

      // Timeline events slide-in
      const events = document.querySelectorAll('.timeline-event');
      events.forEach(ev => {
        const card = ev.querySelector('.event-card');
        const dot = ev.querySelector('.event-dot');
        const isLeft = ev.classList.contains('left');

        gsap.from(card, {
          opacity: 0,
          x: isLeft ? -40 : 40,
          scale: 0.96,
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ev,
            start: 'top 82%'
          }
        });

        gsap.from(dot, {
          scale: 0,
          duration: 0.4,
          scrollTrigger: {
            trigger: ev,
            start: 'top 82%'
          }
        });
      });
    }
  }

  // 4. Page-ending Canvas: Flowing White Particle Fabric
  function initFounderCanvas() {
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
      time += 0.012;
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x3d = (c - cols / 2) * spacingX;
          const z3d = r * spacingZ + 120;
          
          const d = Math.sqrt(x3d * x3d + (z3d - 300) * (z3d - 300));
          const y3d = Math.sin(c * 0.18 + time) * Math.cos(r * 0.22 + time) * 32 + 
                      Math.sin(time * 0.7 + d * 0.007) * 12;
          
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
  initFounderCanvas();
})();
