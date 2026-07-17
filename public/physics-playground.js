/* Interactive physics playground (Matter.js) — shove the shapes with your cursor.
   Identical behaviour to the home page: attaches to a <canvas id="cursor-play-canvas">
   inside a `.final-cta` section. Requires window.Matter (matter.min.js). */
(function () {
  var canvas = document.getElementById('cursor-play-canvas');
  if (!canvas || !window.Matter) return;
  var section = canvas.closest('.final-cta');
  if (!section) return;

  var Engine = Matter.Engine, Render = Matter.Render, Runner = Matter.Runner,
      Bodies = Matter.Bodies, Composite = Matter.Composite, Body = Matter.Body;

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = matchMedia('(max-width: 700px)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var engine = Engine.create();
  engine.world.gravity.y = 1;
  engine.positionIterations = 6;   // balanced: stable stacking without over-taxing many bodies
  engine.velocityIterations = 6;

  var render = null, runner = null, pointer = null;
  var walls = [], shapes = [];
  var W = 0, H = 0, booted = false, running = false;

  // Mostly on-brand neutrals with a few bright accents that pop on the blue.
  var palette = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#DBEAFE', '#93C5FD', '#93C5FD',
                 '#1C2128', '#1C2128', '#FBBF24', '#34D399', '#F87171', '#A78BFA'];
  function color() { return palette[(Math.random() * palette.length) | 0]; }

  function makeWalls() {
    walls.forEach(function (w) { Composite.remove(engine.world, w); });
    var t = 220;
    walls = [
      Bodies.rectangle(W / 2, H + t / 2, W + 600, t, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(-t / 2, H / 2, t, H * 3, { isStatic: true, render: { visible: false } }),
      Bodies.rectangle(W + t / 2, H / 2, t, H * 3, { isStatic: true, render: { visible: false } })
    ];
    Composite.add(engine.world, walls);
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  // Convex half-disc outline for semicircle bodies.
  function semiVerts(r) {
    var v = [], seg = 12;
    for (var i = 0; i <= seg; i++) { var a = Math.PI * (i / seg); v.push({ x: r * Math.cos(a), y: -r * Math.sin(a) }); }
    return v;
  }

  // Every shape gets its own render style; ~1 in 5 is a hollow outline (like the reference rings).
  function styleFor() {
    var c = color();
    if (Math.random() < 0.20) return { fillStyle: 'transparent', strokeStyle: c, lineWidth: 2 };
    return { fillStyle: c, strokeStyle: c, lineWidth: 0 };
  }

  function makeShape(x, y) {
    var base = isMobile ? 8 : 11;
    var s = base + Math.random() * (isMobile ? 14 : 27);
    var common = { restitution: 0.32, friction: 0.5, frictionAir: 0.012, render: styleFor() };
    var t = Math.random(), b;
    if (t < 0.26) b = Bodies.circle(x, y, s * 0.5, common);                                        // circle / ring
    else if (t < 0.40) b = Bodies.rectangle(x, y, s, s, { chamfer: { radius: s * 0.18 }, restitution: common.restitution, friction: common.friction, frictionAir: common.frictionAir, render: common.render }); // rounded square
    else if (t < 0.52) b = Bodies.rectangle(x, y, s * rnd(1.5, 2.3), s * 0.5, { chamfer: { radius: s * 0.24 }, restitution: common.restitution, friction: common.friction, frictionAir: common.frictionAir, render: common.render }); // pill
    else if (t < 0.68) b = Bodies.polygon(x, y, 3, s * 0.62, common);                               // triangle
    else if (t < 0.78) b = Bodies.polygon(x, y, 5, s * 0.55, common);                               // pentagon
    else if (t < 0.86) b = Bodies.polygon(x, y, 6, s * 0.55, common);                               // hexagon
    else if (t < 0.93) b = Bodies.polygon(x, y, 4, s * 0.5, common);                                // diamond
    else b = Bodies.fromVertices(x, y, [semiVerts(s * 0.62)], common);                              // semicircle
    if (!b) b = Bodies.circle(x, y, s * 0.5, common);                                               // fromVertices safety net
    Body.setAngle(b, Math.random() * Math.PI * 2);
    return b;
  }

  function populate() {
    var count = isMobile ? 80 : Math.min(470, Math.round(W * H / 1750));
    for (var i = 0; i < count; i++) {
      shapes.push(makeShape(16 + Math.random() * (W - 32), H * 0.05 + Math.random() * (H * 0.9)));
    }
    Composite.add(engine.world, shapes);
  }

  function sizeCanvas() {
    render.options.width = W; render.options.height = H;
    render.bounds.max.x = W; render.bounds.max.y = H;
    render.canvas.width = W * DPR; render.canvas.height = H * DPR;
    render.canvas.style.width = W + 'px'; render.canvas.style.height = H + 'px';
  }

  // A hidden body pinned to the cursor that shoves the shapes around,
  // carrying its movement as velocity so fast sweeps fling shapes smoothly.
  var prevPointer = null;
  function movePointer(cx, cy) {
    if (!pointer) return;
    var r = section.getBoundingClientRect();
    var nx = cx - r.left, ny = cy - r.top;
    if (prevPointer) Body.setVelocity(pointer, { x: nx - prevPointer.x, y: ny - prevPointer.y });
    Body.setPosition(pointer, { x: nx, y: ny });
    prevPointer = { x: nx, y: ny };
  }
  window.addEventListener('pointermove', function (e) { movePointer(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (e.touches[0]) movePointer(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  window.addEventListener('pointerleave', function () { if (pointer) Body.setPosition(pointer, { x: -800, y: -800 }); });

  function boot() {
    if (booted) return;
    W = section.clientWidth; H = section.clientHeight;
    if (W < 40 || H < 40) return; // wait until the section has real dimensions
    booted = true;

    render = Render.create({
      canvas: canvas, engine: engine,
      options: { width: W, height: H, background: 'transparent', wireframes: false, pixelRatio: DPR }
    });

    pointer = Bodies.circle(-800, -800, isMobile ? 30 : 46, { isStatic: true, render: { visible: false } });
    Composite.add(engine.world, pointer);

    makeWalls();
    populate();
    Render.run(render);
    runner = Runner.create();
    if (!reduce) { Runner.run(runner, engine); running = true; }
    else { Engine.update(engine, 2000); Render.world(render); } // settle once, no live sim

    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !running) { Runner.run(runner, engine); Render.run(render); running = true; }
          else if (!en.isIntersecting && running) { Runner.stop(runner); Render.stop(render); running = false; }
        });
      }, { threshold: 0 }).observe(section);
    }
  }

  function relayout() {
    var nw = section.clientWidth, nh = section.clientHeight;
    if (nw < 40 || nh < 40) return;
    if (!booted) { boot(); return; }
    W = nw; H = nh;
    sizeCanvas();
    makeWalls();
    shapes.forEach(function (b) {
      if (b.position.x > W || b.position.x < 0) {
        Body.setPosition(b, { x: Math.min(Math.max(b.position.x, 20), W - 20), y: b.position.y });
      }
    });
  }

  var rt;
  function relayoutDebounced() { clearTimeout(rt); rt = setTimeout(relayout, 200); }

  // Boot as soon as the section actually has a size (handles late layout / font load / hidden panes).
  if ('ResizeObserver' in window) {
    new ResizeObserver(function () { booted ? relayoutDebounced() : boot(); }).observe(section);
  }
  window.addEventListener('resize', relayoutDebounced);
  boot();                       // try now
  requestAnimationFrame(boot);  // and next frame
  window.addEventListener('load', boot);
})();
