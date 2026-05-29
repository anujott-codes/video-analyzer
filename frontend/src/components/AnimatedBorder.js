/**
 * AnimatedBorder — Wraps an element with a rotating gradient border on hover
 * Uses the rotateBorder keyframe and --border-angle custom property from animations.css
 * @param {HTMLElement} element
 * @returns {HTMLElement} wrapper
 */
export function wrapWithAnimatedBorder(element) {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.borderRadius = 'var(--radius-lg)';
  wrapper.style.padding = '2px';
  wrapper.style.background = 'transparent';
  wrapper.style.transition = 'background 0.3s ease';

  const inner = document.createElement('div');
  inner.style.position = 'relative';
  inner.style.background = 'var(--black-card)';
  inner.style.borderRadius = 'calc(var(--radius-lg) - 2px)';
  inner.style.overflow = 'hidden';

  // Move the element inside the inner container
  inner.appendChild(element);
  wrapper.appendChild(inner);

  // Hover: enable rotating conic-gradient border
  wrapper.addEventListener('mouseenter', () => {
    wrapper.style.background =
      'conic-gradient(from var(--border-angle), var(--neon), transparent 30%, transparent 70%, var(--neon))';
    wrapper.style.animation = 'rotateBorder 3s linear infinite';
  });

  wrapper.addEventListener('mouseleave', () => {
    wrapper.style.background = 'transparent';
    wrapper.style.animation = 'none';
  });

  return wrapper;
}
