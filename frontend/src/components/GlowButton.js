/**
 * GlowButton — Button with magnetic effect, ripple, and glow
 * @param {Object} options
 * @param {string} options.text
 * @param {Function} [options.onClick]
 * @param {string} [options.variant] — 'ghost' for secondary style
 * @param {string} [options.size] — 'sm' for small
 * @param {string} [options.icon] — optional icon text/emoji
 * @returns {HTMLButtonElement}
 */
export function createGlowButton({ text, onClick, variant, size, icon }) {
  const btn = document.createElement('button');
  btn.classList.add('glow-btn');

  if (variant === 'ghost') btn.classList.add('glow-btn--ghost');
  if (size === 'sm') btn.classList.add('glow-btn--sm');

  // Icon
  if (icon) {
    const iconSpan = document.createElement('span');
    iconSpan.classList.add('glow-btn__icon');
    iconSpan.textContent = icon;
    btn.appendChild(iconSpan);
  }

  // Text
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  btn.appendChild(textSpan);

  // Magnetic effect
  const MAGNETIC_RANGE = 100;
  const MAGNETIC_STRENGTH = 6;

  function onMouseMove(e) {
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MAGNETIC_RANGE) {
      const ratio = 1 - dist / MAGNETIC_RANGE;
      const tx = (dx / MAGNETIC_RANGE) * MAGNETIC_STRENGTH * ratio;
      const ty = (dy / MAGNETIC_RANGE) * MAGNETIC_STRENGTH * ratio;
      btn.style.transform = `translate(${tx}px, ${ty}px)`;
    } else {
      btn.style.transform = '';
    }
  }

  function onMouseLeave() {
    btn.style.transform = '';
  }

  btn.addEventListener('mousemove', onMouseMove);
  btn.addEventListener('mouseleave', onMouseLeave);

  // Ripple effect on click
  btn.addEventListener('click', (e) => {
    // Create ripple
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);

    // Remove after animation
    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });

    // Call handler
    if (typeof onClick === 'function') {
      onClick(e);
    }
  });

  return btn;
}
