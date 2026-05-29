/**
 * MouseGlow — Radial gradient overlay that follows the cursor
 * @param {HTMLElement} container
 * @returns {Function} cleanup
 */
export function initMouseGlow(container) {
  const glow = document.createElement('div');
  glow.classList.add('mouse-glow');
  container.appendChild(glow);

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let animId = 0;
  let active = false;

  const LERP_FACTOR = 0.1;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function loop() {
    currentX = lerp(currentX, targetX, LERP_FACTOR);
    currentY = lerp(currentY, targetY, LERP_FACTOR);

    glow.style.background = `radial-gradient(600px circle at ${currentX}px ${currentY}px, rgba(255,106,0,0.06), transparent 60%)`;

    animId = requestAnimationFrame(loop);
  }

  function onMouseMove(e) {
    targetX = e.clientX;
    targetY = e.clientY;

    if (!active) {
      active = true;
      // Small delay before showing to avoid flash on page load
      setTimeout(() => {
        glow.classList.add('active');
      }, 100);
    }
  }

  // Start loop and listeners
  animId = requestAnimationFrame(loop);
  window.addEventListener('mousemove', onMouseMove);

  return function cleanup() {
    cancelAnimationFrame(animId);
    window.removeEventListener('mousemove', onMouseMove);
    if (glow.parentNode) glow.parentNode.removeChild(glow);
  };
}
