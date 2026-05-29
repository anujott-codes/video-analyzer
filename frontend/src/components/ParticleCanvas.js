/**
 * ParticleCanvas — Ambient floating particles with connecting lines
 * @param {HTMLElement} container
 * @returns {Function} cleanup
 */
export function initParticleCanvas(container) {
  const canvas = document.createElement('canvas');
  canvas.classList.add('particle-canvas');
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let animId = 0;
  let lastTime = 0;
  let mouse = { x: -9999, y: -9999 };

  const PARTICLE_COUNT = 100;
  const LINE_DIST = 150;
  const MOUSE_RADIUS = 120;
  const particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4 + (Math.random() > 0.5 ? 0.1 : -0.1),
      vy: (Math.random() - 0.5) * 0.4 + (Math.random() > 0.5 ? 0.1 : -0.1),
      radius: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.4,
    };
  }

  function init() {
    resize();
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function update(delta) {
    const factor = delta / 16.667; // normalize to ~60fps

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_RADIUS) * 0.8;
        p.vx += (dx / dist) * force * factor;
        p.vy += (dy / dist) * force * factor;
      }

      // Dampen velocity
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Clamp speed
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed < 0.1) {
        const angle = Math.atan2(p.vy, p.vx);
        p.vx = Math.cos(angle) * 0.1;
        p.vy = Math.sin(angle) * 0.1;
      } else if (speed > 0.3) {
        p.vx = (p.vx / speed) * 0.3;
        p.vy = (p.vy / speed) * 0.3;
      }

      p.x += p.vx * factor;
      p.y += p.vy * factor;

      // Wrap around edges
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LINE_DIST) {
          const lineAlpha = (1 - dist / LINE_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255, 106, 0, ${lineAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 106, 0, ${p.opacity})`;
      ctx.fill();
    }
  }

  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = Math.min(timestamp - lastTime, 50); // cap at 50ms
    lastTime = timestamp;

    update(delta);
    draw();
    animId = requestAnimationFrame(loop);
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function onMouseLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  // Initialize
  init();
  animId = requestAnimationFrame(loop);
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseleave', onMouseLeave);

  // Return cleanup function
  return function cleanup() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseleave', onMouseLeave);
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };
}
