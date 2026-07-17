/* Adaptive nav + cursor — reproduces the home page behaviour on every sub-page.
   - Nav gets `.scrolled` (frosted blur) once the page is scrolled.
   - Nav gets `.dark-mode` (white text / dark frosted bg) while a dark section
     sits behind it.
   - <body> gets `.in-dark-section` while the cursor is over a dark background,
     which flips the custom cursor to its high-contrast (white) style.
   Dark vs light is read from the actual background colour under the point, so
   this works on any page without hard-coding section names. */
(() => {
  const nav = document.getElementById('main-nav');

  // Walk up from a node until we hit an element with a solid-enough background,
  // then decide dark vs light from its perceived luminance.
  function isDarkAt(node) {
    while (node && node.nodeType === 1 && node !== document.documentElement) {
      const bg = getComputedStyle(node).backgroundColor;
      const m = bg && bg.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/);
      if (m) {
        const alpha = m[4] === undefined ? 1 : parseFloat(m[4]);
        if (alpha >= 0.5) {
          const lum = 0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3];
          return lum < 140;
        }
      }
      node = node.parentElement;
    }
    return false; // page background is light
  }

  // Cursor: flip contrast based on what's under the pointer.
  window.addEventListener('pointermove', (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    document.body.classList.toggle('in-dark-section', el ? isDarkAt(el) : false);
  }, { passive: true });

  // Nav: frosted blur when scrolled + dark-mode over dark sections.
  if (nav) {
    const updateNav = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
      const probeY = (nav.getBoundingClientRect().height || 90) / 2;
      const pe = nav.style.pointerEvents;
      nav.style.pointerEvents = 'none';                 // see through the nav
      const behind = document.elementFromPoint(window.innerWidth / 2, probeY);
      nav.style.pointerEvents = pe;
      nav.classList.toggle('dark-mode', behind ? isDarkAt(behind) : false);
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav, { passive: true });
    updateNav();
  }
})();
