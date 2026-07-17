/* How It Works Page Controller */
(() => {
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let lenisInstance;
  // 1. Lenis Smooth Scroll
  if (window.Lenis) {
    lenisInstance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    
    // Connect Lenis events to GSAP ScrollTrigger updates
    if (window.ScrollTrigger) {
      lenisInstance.on('scroll', ScrollTrigger.update);
    }
    
    function raf(time) {
      lenisInstance.raf(time);
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

  // 3. GSAP Entry & ScrollTrigger linking
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

      const darkSections = ['.how-hero', '#contact'];
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
      // Hero Entry
      gsap.from('.hero-copy-side *', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out'
      });

      const navItems = document.querySelectorAll('.s-nav-item');
      const cards = document.querySelectorAll('.step-scroll-card');
      let currentActiveIndex = -1;

      function updateActiveStep(index) {
        if (index === currentActiveIndex) return; // Prevent layout reflows if index is already highlighted
        currentActiveIndex = index;

        navItems.forEach((item, idx) => {
          item.classList.toggle('active', idx === index);
        });

        // Scroll active item into view on mobile horizontal steps tab-bar
        const activeItem = navItems[index];
        if (activeItem && window.innerWidth <= 900) {
          activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        // Update vertical timeline line height and dot positions
        const progressBar = document.getElementById('steps-progress-bar');
        const progressDot = document.getElementById('steps-progress-dot');
        if (progressBar && progressDot) {
          const totalSteps = navItems.length;
          const percentage = (index / (totalSteps - 1)) * 100;
          progressBar.style.height = `${percentage}%`;
          progressDot.style.top = `${percentage}%`;
        }
      }

      // Configure active highlights trigger for each step card
      cards.forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top 55%',
          onEnter: () => updateActiveStep(index),
          onLeaveBack: () => updateActiveStep(Math.max(0, index - 1))
        });
      });

      // Quick-jump click navigation
      navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          const targetCard = cards[index];
          if (targetCard) {
            // Smoothly scroll the card into view
            if (lenisInstance) {
              lenisInstance.scrollTo(targetCard, { offset: -100, duration: 1.2 });
            } else {
              targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            updateActiveStep(index);
          }
        });
      });

      // Find and set initial active step based on scroll viewport intersection
      function initActiveStep() {
        const viewportCenter = window.scrollY + window.innerHeight / 2;
        let activeIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = window.scrollY + rect.top + rect.height / 2;
          const distance = Math.abs(viewportCenter - cardCenter);
          if (distance < minDistance) {
            minDistance = distance;
            activeIndex = index;
          }
        });
        updateActiveStep(activeIndex);
      }

      function refreshTriggers() {
        ScrollTrigger.refresh();
        initActiveStep();
      }

      window.addEventListener('resize', () => {
        initActiveStep();
      });

      if (document.readyState === 'complete') {
        setTimeout(refreshTriggers, 400); // short delay to ensure full load
      } else {
        window.addEventListener('load', () => {
          setTimeout(refreshTriggers, 400);
        });
      }
    }
  }

  // 4. Page-ending Canvas: Flowing White Particle Fabric
  function initHowItWorksCanvas() {
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
      time += 0.008;
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x3d = (c - cols / 2) * spacingX;
          const z3d = r * spacingZ + 120;
          
          const d = Math.sqrt(x3d * x3d + (z3d - 300) * (z3d - 300));
          const y3d = Math.sin(c * 0.16 + time) * Math.cos(r * 0.2 + time) * 30 + 
                      Math.sin(time * 0.6 + d * 0.007) * 10;
          
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
  initHowItWorksCanvas();

  // 5. How It Works Hero: Parallax Roadmap SVG Tilt
  function initHeroParallax() {
    const visual = document.querySelector('.hero-visual-side');
    if (!visual) return;
    
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX - window.innerWidth / 2) * 0.04;
      targetY = (e.clientY - window.innerHeight / 2) * 0.04;
    });
    
    function animate() {
      requestAnimationFrame(animate);
      
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      
      visual.style.transform = `translate(${currentX}px, ${currentY}px) rotateY(${currentX * 0.15}deg) rotateX(${currentY * -0.15}deg)`;
    }
    animate();
  }
  initHeroParallax();
})();
