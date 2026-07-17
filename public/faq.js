/* FAQ Page Controller */
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

  // 3. FAQ Accordion Accordion Toggle
  const items = document.querySelectorAll('.faq-card-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-head-btn');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-head-btn').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 4. Filters & Search Handlers
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('faq-search-input');
  let currentFilter = 'all';

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFilters();
    });
  }

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    items.forEach(item => {
      const category = item.getAttribute('data-category');
      const question = item.querySelector('.faq-head-btn span:first-child').textContent.toLowerCase();
      const answer = item.querySelector('.faq-body-panel p').textContent.toLowerCase();

      const matchesFilter = (currentFilter === 'all' || category === currentFilter);
      const matchesSearch = (!query || question.includes(query) || answer.includes(query));

      if (matchesFilter && matchesSearch) {
        item.style.display = 'block';
        if (window.gsap && !prefersReducedMotion) {
          gsap.fromTo(item, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.4 });
        }
      } else {
        item.style.display = 'none';
      }
    });
  }

  // HEADER NAVIGATION: Scroll state manager
  if (window.ScrollTrigger) {
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

      // Nav link elements color will default to black on white background.
      // Transition to dark-mode (white text) only when overlapping the footer #contact.
      const darkSections = ['#contact'];
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
  }

  // 5. Page-ending Canvas: Flowing White Particle Fabric (Variation: Denser row pattern)
  function initFAQCanvas() {
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
    const rows = 20;
    const spacingX = 45;
    const spacingZ = 28;
    
    let time = 0;
    
    function draw() {
      ctx.clearRect(0, 0, width, height);
      time += 0.012;
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x3d = (c - cols / 2) * spacingX;
          const z3d = r * spacingZ + 120;
          
          const d = Math.sqrt(x3d * x3d + (z3d - 300) * (z3d - 300));
          const y3d = Math.sin(c * 0.18 + time) * Math.cos(r * 0.2 + time) * 28 + 
                      Math.sin(time * 0.75 + d * 0.007) * 10;
          
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
  initFAQCanvas();
})();
